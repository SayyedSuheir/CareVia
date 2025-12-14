export async function validateImage(file) {
  if (!file) return { valid: false, reason: "No image provided" };

  try {
    const apiUser = process.env.SIGHTENGINE_API_USER;
    const apiSecret = process.env.SIGHTENGINE_API_SECRET;

    const forwardForm = new FormData();
    forwardForm.append("media", file);

    const params = new URLSearchParams({
      models: "genai,nudity,wad,offensive",
      api_user: apiUser,
      api_secret: apiSecret,
    });

    const res = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`, {
      method: "POST",
      body: forwardForm,
    });

    if (!res.ok) throw new Error("Sightengine request failed");

    const result = await res.json();

    if (!result || result.status !== "success") {
      return { valid: false, reason: result?.error?.message || "Sightengine API failed" };
    }

    if (result?.genai?.confidence > 0.7) {
      return { valid: false, reason: "AI-generated image detected" };
    }

    const nudity = result?.nudity?.sexual_activity || 0;
    const weapon = result?.weapon || 0;
    const alcohol = result?.alcohol || 0;
    const drugs = result?.drugs || 0;

    if (nudity > 0.5 || weapon > 0.5 || alcohol > 0.5 || drugs > 0.5) {
      return { valid: false, reason: "Inappropriate content detected" };
    }

    return { valid: true };
  } catch (err) {
    console.error("❌ validateImage error:", err);
    return { valid: false, reason: err.message || "Image validation failed" };
  }
}
