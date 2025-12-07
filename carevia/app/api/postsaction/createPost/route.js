import Goods from '@/app/models/Goods';
import connectDB from '@/app/_lib/mongodb';
import { NextResponse } from 'next/server';
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
        { 
          success: false,
          error: "Authentication required. Please login." 
        },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("❌ JWT_SECRET not configured");
      return NextResponse.json(
        { 
          success: false,
          error: "Server configuration error" 
        },
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
        { 
          success: false,
          error: "Invalid or expired session. Please login again." 
        },
        { status: 401 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const Type = formData.get('Type');
    const address = formData.get('address');
    const imageFile = formData.get('image');

    console.log('✅ FormData parsed');
        
    // Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { 
          success: false,
          error: "Name must be at least 2 characters" 
        },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { 
          success: false,
          error: "Description must be at least 10 characters" 
        },
        { status: 400 }
      );
    }

    if (!Type || !['food', 'clothes', 'electronics', 'furniture', 'other'].includes(Type.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false,
          error: "Valid Type is required (food, clothes, electronics, furniture, other)" 
        },
        { status: 400 }
      );
    }

    if (!address || address.trim().length < 5) {
      return NextResponse.json(
        { 
          success: false,
          error: "Valid address is required (minimum 5 characters)" 
        },
        { status: 400 }
      );
    }

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "Image is required" 
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid image type. Only JPG, PNG, GIF, and WebP are allowed" 
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { 
          success: false,
          error: "Image size must be less than 5MB" 
        },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');

    // Save image file
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = imageFile.name.replace(/\s+/g, '-');
    const filename = `${timestamp}-${originalName}`;
    
    // Save to public/uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    console.log('✅ Image saved:', filename);

    // Create image URL for database
    const imageUrl = `/uploads/${filename}`;

    // Create new post
    const newPost = await Goods.create({
      userId,
      name: name.toLowerCase().trim(),
      image: imageUrl,
      description: description.trim(),
      Type: Type.trim(),
      address: address.trim()
    });

    console.log('✅ Post created:', newPost._id);

    // Return success response
    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("❌ Create post error:", err);
    console.error("Error stack:", err.stack);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return NextResponse.json(
        { 
          success: false,
          error: "A post with this information already exists" 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: err.message || "Failed to create post. Please try again." 
      },
      { status: 500 }
    );
  }
}