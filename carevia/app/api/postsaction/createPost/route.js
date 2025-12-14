import Goods from '@/app/_models/Goods';
import connectDB from '@/app/_lib/mongodb';
import { NextResponse } from 'next/server';
import { validateImage } from "@/app/_lib/validateImage";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    console.log('🔵 Create post started');

    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected');

    // Get and verify user from session token
    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required. Please login." },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("❌ JWT_SECRET not configured");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify token and get userId
    let userId;
    try {
      const decoded = jwt.verify(token, jwtSecret);
      userId = decoded.userId;
      console.log('✅ User authenticated:', userId);
    } catch (err) {
      console.error("❌ Invalid token:", err);
      return NextResponse.json(
        { success: false, error: "Invalid or expired session. Please login again." },
        { status: 401 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const name = formData.get('name')?.trim();
    const description = formData.get('description')?.trim();
    const Type = formData.get('Type')?.trim();
    const address = formData.get('address')?.trim();
    const imageFile = formData.get('image');
    const city = formData.get('city')?.trim();
    const area = formData.get('area')?.trim();
    const village = formData.get('village')?.trim();

    console.log('✅ FormData parsed');

    // -------------------------
    // 1️⃣ AI Image Validation
    // -------------------------
    if (!imageFile) {
      return NextResponse.json({ success: false, error: "Image is required" }, { status: 400 });
    }

    const validation = await validateImage(imageFile);
    console.log("🔹 AI validation result:", validation);

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.reason }, { status: 400 });
    }

    // -------------------------
    // 2️⃣ Field Validation
    // -------------------------
    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, error: "Name must be at least 2 characters" }, { status: 400 });
    }
    if (!city || !area || !village) {
      return NextResponse.json({ success: false, error: "City, area, and village are required" }, { status: 400 });
    }
    if (!description || description.length < 10) {
      return NextResponse.json({ success: false, error: "Description must be at least 10 characters" }, { status: 400 });
    }
    if (!Type || !['food', 'clothes', 'electronics', 'furniture', 'other'].includes(Type.toLowerCase())) {
      return NextResponse.json({ success: false, error: "Valid Type is required (food, clothes, electronics, furniture, other)" }, { status: 400 });
    }
    if (!address || address.length < 5) {
      return NextResponse.json({ success: false, error: "Valid address is required (minimum 5 characters)" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json({ success: false, error: "Invalid image type. Only JPG, PNG, GIF, and WebP are allowed" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      return NextResponse.json({ success: false, error: "Image size must be less than 5MB" }, { status: 400 });
    }

    console.log('✅ Validation passed');

    // -------------------------
    // 3️⃣ Save image
    // -------------------------
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const timestamp = Date.now();
    const originalName = imageFile.name.replace(/\s+/g, '-');
    const filename = `${timestamp}-${originalName}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);
    console.log('✅ Image saved:', filename);

    const imageUrl = `/uploads/${filename}`;

    // -------------------------
    // 4️⃣ Create post
    // -------------------------
    const newPost = await Goods.create({
      userId,
      name: name.toLowerCase(),
      image: imageUrl,
      description,
      Type,
      address: `${area}, ${city}, ${village}`,
      city,
      area,
      village
    });

    console.log('✅ Post created:', newPost._id);

    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      post: {
        id: newPost._id,
        userId: newPost.userId,
        name: newPost.name,
        image: newPost.image,
        description: newPost.description,
        Type: newPost.Type,
        address: newPost.address,
        createdAt: newPost.createdAt,
        updatedAt: newPost.updatedAt
      }
    }, { status: 201 });

  } catch (err) {
    console.error("❌ Create post error:", err);
    if (err.code === 11000) {
      return NextResponse.json({ success: false, error: "A post with this information already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: err.message || "Failed to create post. Please try again." }, { status: 500 });
  }
}
