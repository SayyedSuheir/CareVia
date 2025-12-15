// Install: npm install sightengine
import sightengine from 'sightengine';

export async function validateImage(file) {
  if (!file) {
    return { valid: false, reason: "No image provided" };
  }

  try {
    console.log("🔍 Starting image validation...");
    console.log("📁 File:", file.name, file.type, file.size, "bytes");

    if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
      console.error("❌ Missing credentials");
      return { valid: false, reason: "Image validation not configured" };
    }

    // Initialize Sightengine client
    const client = sightengine(
      process.env.SIGHTENGINE_API_USER, 
      process.env.SIGHTENGINE_API_SECRET
    );

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString('base64');
    
    console.log("✅ Converted to base64, calling Sightengine...");

    // Use the official SDK's set_bytes method
    const result = await client
      .check(['nudity', 'wad', 'offensive', 'genai'])
      .set_bytes(base64Image, file.name || 'image.jpg');

    console.log("🔍 Full result:", JSON.stringify(result, null, 2));

    if (result.status === "failure") {
      console.error("❌ API failure:", result.error);
      return { 
        valid: false, 
        reason: result.error?.message || "Validation failed" 
      };
    }

    // AI-generated detection
    const aiScore = result?.type?.ai_generated || 0;
    console.log("🤖 AI confidence score:", aiScore);

    if (aiScore > 0.7) {
      console.log("❌ BLOCKING: AI-generated image detected");
      return { 
        valid: false, 
        reason: `AI-generated image detected (${Math.round(aiScore * 100)}% confidence)` 
      };
    }

    // Content moderation checks
    if (result?.nudity?.sexual_activity > 0.5 || result?.nudity?.sexual_display > 0.5) {
      console.log("❌ BLOCKING: Inappropriate content");
      return { valid: false, reason: "Inappropriate content detected" };
    }

    if (result?.weapon > 0.5) {
      console.log("❌ BLOCKING: Weapon detected");
      return { valid: false, reason: "Weapon detected in image" };
    }

    if (result?.alcohol > 0.5) {
      console.log("❌ BLOCKING: Alcohol detected");
      return { valid: false, reason: "Alcohol detected in image" };
    }

    if (result?.drugs > 0.5) {
      console.log("❌ BLOCKING: Drugs detected");
      return { valid: false, reason: "Drug-related content detected" };
    }

    if (result?.offensive?.prob > 0.5) {
      console.log("❌ BLOCKING: Offensive content");
      return { valid: false, reason: "Offensive content detected" };
    }

    console.log("✅ Image validation PASSED - image is safe");
    return { valid: true };

  } catch (err) {
    console.error("⚠️ Validation exception:", err.message);
    console.error("⚠️ Stack:", err.stack);
    
    return { 
      valid: false, 
      reason: "Unable to verify image safety. Please try again." 
    };
  }
}