import { NextResponse } from "next/server";
import sightengine from 'sightengine';

export async function POST(req) {
  try {
    console.log("🧪 Testing Sightengine API...");
    
    const apiUser = process.env.SIGHTENGINE_API_USER;
    const apiSecret = process.env.SIGHTENGINE_API_SECRET;
    
    if (!apiUser || !apiSecret) {
      return NextResponse.json({
        success: false,
        error: "Missing credentials",
        hasUser: !!apiUser,
        hasSecret: !!apiSecret
      }, { status: 500 });
    }

    const formData = await req.formData();
    const image = formData.get("image");
    
    if (!image) {
      return NextResponse.json({
        success: false,
        error: "No image provided"
      }, { status: 400 });
    }

    console.log("📁 Image type:", image.type);
    console.log("📏 Image size:", image.size);

    // Convert to base64
    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = buffer.toString('base64');

    console.log("🌐 Calling Sightengine with official SDK...");

    // Initialize Sightengine client
    const client = sightengine(apiUser, apiSecret);

    // Use the official SDK
    const result = await client
      .check(['nudity', 'wad', 'offensive', 'genai'])
      .set_bytes(base64Image, image.name || 'image.jpg');

    console.log("📡 Full response:", JSON.stringify(result, null, 2));

    // Extract AI score
    const aiScore = result?.type?.ai_generated || 0;

    return NextResponse.json({
      success: result.status === "success",
      result: result,
      aiScore: aiScore,
      wouldBlock: aiScore > 0.7,
      credentialsOk: true
    });

  } catch (err) {
    console.error("❌ Test error:", err);
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}