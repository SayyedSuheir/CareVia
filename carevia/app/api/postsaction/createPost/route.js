// ==========================================
// API: /api/postsaction/createPost - Create a Public Post
// ==========================================
// File: app/api/postsaction/createPost/route.js

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Public posts management
 */

/**
 * @swagger
 * /api/postsaction/createPost:
 *   post:
 *     summary: Create a new public post
 *     description: >
 *       Allows a logged-in user to create a public post with name, description,
 *       type, address, and an image. Uses AI validation to check the image.
 *       Certain keywords may automatically set the post status to "pending" for review.
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the post
 *                 example: Winter Clothes Donation
 *               description:
 *                 type: string
 *                 description: Detailed description of the post
 *                 example: Gently used winter clothes for families in need
 *               Type:
 *                 type: string
 *                 enum: [food, clothes, electronics, furniture, other]
 *                 description: Category of the post
 *                 example: clothes
 *               address:
 *                 type: string
 *                 description: Street or exact address
 *                 example: 123 Main Street
 *               area:
 *                 type: string
 *                 description: Area of the city
 *                 example: Downtown
 *               city:
 *                 type: string
 *                 description: City name
 *                 example: Tyre
 *               village:
 *                 type: string
 *                 description: Village or neighborhood
 *                 example: Old Town
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file of the post
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Post created successfully
 *                 post:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     Type:
 *                       type: string
 *                     address:
 *                       type: string
 *                     city:
 *                       type: string
 *                     area:
 *                       type: string
 *                     village:
 *                       type: string
 *                     image:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, approved]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation failed or missing required fields
 *       401:
 *         description: Authentication required or invalid session
 *       409:
 *         description: Duplicate post
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import path from "path";
import { writeFile } from "fs/promises";
import connectDB from "@/app/_lib/mongodb";
import Goods from "@/app/_models/Goods";
import { validateImage } from "@/app/_lib/validateImage";

function shouldBePending(name, description) {
  const pendingKeywords = [
    "villa",
    "mansion", 
    "apartment",
    "expensive",
    "luxury",
    "penthouse",
    "estate",
    "mercedes",
    "bmw",
    "rolex",
    "gucci",
    "louis vuitton",
    "designer",
    "car",
    "vehicle",
    "jewelry",
    "gold",
    "diamond"
  ];

  // Words that should NOT trigger pending (whitelist)
  const whitelistWords = [
    "village",
    "homework",
    "homeless",
    "apartment building toy",
  ];

  const combinedText = `${name || ""} ${description || ""}`.toLowerCase().trim();

  // First check whitelist - if any whitelist word is found, don't flag
  for (const whiteWord of whitelistWords) {
    if (combinedText.includes(whiteWord)) {
      console.log(`✅ Whitelisted: Contains "${whiteWord}"`);
      return false; // Don't flag as pending
    }
  }

  // Check for pending keywords
  for (const keyword of pendingKeywords) {
    // Use word boundaries to avoid false positives
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    
    if (regex.test(combinedText)) {
      console.log(`⚠️ Flagged for review: Found keyword "${keyword}"`);
      return true;
    }
  }

  return false; // Approved by default
}

export async function POST(req) {
  try {
    await connectDB();

    // ✅ Authenticate User
    const token = req.cookies.get("sessionToken")?.value; // correct usage in route handlers
    if (!token)
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET not configured");

    let userId;
    try {
      userId = jwt.verify(token, jwtSecret).userId;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // ✅ Parse FormData
    const formData = await req.formData();
    const name = formData.get("name")?.trim();
    const description = formData.get("description")?.trim();
    const Type = formData.get("Type")?.trim();
    const address = formData.get("address")?.trim();
    const area = formData.get("area")?.trim();
    const city = formData.get("city")?.trim();
    const village = formData.get("village")?.trim();
    const imageFile = formData.get("image");

    if (!imageFile)
      return NextResponse.json(
        { success: false, error: "Image is required" },
        { status: 400 }
      );

    // ✅ Validate Image via AI
    const validation = await validateImage(imageFile);
    if (!validation.valid)
      return NextResponse.json(
        { success: false, error: validation.reason },
        { status: 400 }
      );

    // ✅ Validate Fields
    if (!name || name.length < 2)
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters" },
        { status: 400 }
      );

    if (!description || description.length < 10)
      return NextResponse.json(
        { success: false, error: "Description must be at least 10 characters" },
        { status: 400 }
      );

    if (!Type || !["food", "clothes", "electronics", "furniture", "other"].includes(Type.toLowerCase()))
      return NextResponse.json(
        { success: false, error: "Invalid Type" },
        { status: 400 }
      );

    if (!city || !area || !village || !address)
      return NextResponse.json(
        { success: false, error: "Address is required" },
        { status: 400 }
      );

    // ✅ Save Image
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const timestamp = Date.now();
    const safeName = imageFile.name.replace(/\s+/g, "-");
    const filename = `${timestamp}-${safeName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    const imageUrl = `/uploads/${filename}`;
 // ✅ Determine Status using helper function
    const status = shouldBePending(name, description) ? "pending" : "approved";

    console.log(`📋 Post status: ${status} | Name: "${name}"`);

    // ✅ Create Post
    const newPost = await Goods.create({
      userId,
      name: name.toLowerCase(),
      description,
      Type,
      address: `${area}, ${city}, ${village}`,
      city,
      area,
      village,
      image: imageUrl,
      status
    });

    return NextResponse.json(
      {
        success: true,
        message: "Post created successfully",
        post: {
          id: newPost._id,
          userId: newPost.userId,
          name: newPost.name,
          description: newPost.description,
          Type: newPost.Type,
          address: newPost.address,
          image: newPost.image,
          status: newPost.status,
          createdAt: newPost.createdAt,
          updatedAt: newPost.updatedAt
        }
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("❌ /api/postsaction/createPost error:", err);
    if (err.code === 11000)
      return NextResponse.json({ success: false, error: "Duplicate post" }, { status: 409 });
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
