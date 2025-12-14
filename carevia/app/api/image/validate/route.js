import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiUser = process.env.SIGHTENGINE_API_USER;
    const apiSecret = process.env.SIGHTENGINE_API_SECRET;

    if (!apiUser || !apiSecret) {
      return NextResponse.json({ success: false, error: "Missing credentials" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    const forwardForm = new FormData();
    forwardForm.append("media", file);

    const params = new URLSearchParams({
      models: "genai,nudity,wad,offensive",
      api_user: apiUser,
      api_secret: apiSecret,
    });

    const response = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`, {
      method: "POST",
      body: forwardForm,
    });

    const result = await response.json();

    if (!result || result.status !== "success") {
      return NextResponse.json({
        success: false,
        valid: false,
        reason: result?.error?.message || "Sightengine API failed",
        result,
      }, { status: 400 });
    }

    if (result?.genai?.confidence > 0.7) {
      return NextResponse.json({ success: false, valid: false, reason: "AI-generated image detected", result }, { status: 400 });
    }

    const nudityScore = result?.nudity?.sexual_activity || 0;
    const weaponScore = result?.weapon || 0;
    const alcoholScore = result?.alcohol || 0;
    const drugsScore = result?.drugs || 0;

    if (nudityScore > 0.5 || weaponScore > 0.5 || alcoholScore > 0.5 || drugsScore > 0.5) {
      return NextResponse.json({ success: false, valid: false, reason: "Inappropriate content detected", result }, { status: 400 });
    }

    return NextResponse.json({ success: true, valid: true, reason: "Image approved", result });

  } catch (err) {
    console.error("❌ Sightengine error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
