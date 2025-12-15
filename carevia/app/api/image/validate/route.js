// ==========================================
// API: /api/test/sightengine - Test Sightengine Image Moderation
// ==========================================
// File: app/api/test/sightengine/route.js

/**
 * @swagger
 * tags:
 *   name: SightengineTest
 *   description: Test image moderation using Sightengine API
 */

/**
 * @swagger
 * /api/test/sightengine:
 *   post:
 *     summary: Test image with Sightengine API
 *     description: >
 *       Accepts an image file and analyzes it using Sightengine for nudity,
 *       weapons, offensive content, and AI-generated content. Returns a
 *       moderation result and an AI content score.
 *     tags: [SightengineTest]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to analyze
 *     responses:
 *       200:
 *         description: Image analyzed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: object
 *                   description: Full response from Sightengine
 *                 aiScore:
 *                   type: number
 *                   description: Probability that image is AI-generated
 *                   example: 0.85
 *                 wouldBlock:
 *                   type: boolean
 *                   description: Whether the image should be blocked based on AI score
 *                   example: true
 *                 credentialsOk:
 *                   type: boolean
 *                   description: Whether Sightengine credentials are configured
 *                   example: true
 *       400:
 *         description: No image provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: No image provided
 *       500:
 *         description: Server error or missing Sightengine credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                 stack:
 *                   type: string
 *                   description: Error stack trace
 *                 hasUser:
 *                   type: boolean
 *                   description: Whether API user is configured
 *                   example: true
 *                 hasSecret:
 *                   type: boolean
 *                   description: Whether API secret is configured
 *                   example: true
 */

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