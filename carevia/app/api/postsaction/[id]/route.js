import Goods from '@/app/_models/Goods';
import connectDB from '@/app/_lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

/**
 * GET /api/posts/[id]
 * Get a single post by ID
 */
export async function GET(request, context) {
  try {
    console.log('🔵 Get post started');
    
    await connectDB();
    
    const params = await context.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Get and verify user
    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    let userId;
    
    try {
      const decoded = jwt.verify(token, jwtSecret);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    const post = await Goods.findById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (post.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to view this post" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        post: {
          id: post._id.toString(),
          name: post.name,
          image: post.image,
          description: post.description,
          Type: post.Type,
          address: post.address,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        }
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("❌ Get post error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts/[id]
 * Update a post (only if user owns it)
 */
export async function PUT(request, context) {
  try {
    console.log('🔵 Update post started');
    
    await connectDB();
    console.log('✅ MongoDB connected');

    const params = await context.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Get and verify user
    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    let userId;
    
    try {
      const decoded = jwt.verify(token, jwtSecret);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    // Find existing post
    const existingPost = await Goods.findById(id);

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingPost.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to edit this post" },
        { status: 403 }
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
        { success: false, error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Description must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (!Type || !['food', 'clothes', 'electronics', 'furniture', 'other'].includes(Type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Valid Type is required" },
        { status: 400 }
      );
    }

    if (!address || address.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Valid address is required" },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');

    // Prepare update data
    const updateData = {
      name: name.toLowerCase().trim(),
      description: description.trim(),
      Type: Type.trim(),
      address: address.trim()
    };

    // Handle new image if provided
    if (imageFile && imageFile.size > 0) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { success: false, error: "Invalid image type" },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        return NextResponse.json(
          { success: false, error: "Image size must be less than 5MB" },
          { status: 400 }
        );
      }

      // Delete old image
      if (existingPost.image && existingPost.image.startsWith('/uploads/')) {
        try {
          const oldImagePath = path.join(process.cwd(), 'public', existingPost.image);
          await unlink(oldImagePath);
          console.log('✅ Old image deleted');
        } catch (err) {
          console.log('⚠️ Could not delete old image:', err.message);
        }
      }

      // Save new image
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const originalName = imageFile.name.replace(/\s+/g, '-');
      const filename = `${timestamp}-${originalName}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      console.log('✅ New image saved:', filename);

      updateData.image = `/uploads/${filename}`;
    }

    // Update post in database
    const updatedPost = await Goods.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return updated document
    );

    console.log('✅ Post updated:', updatedPost._id);

    return NextResponse.json(
      {
        success: true,
        message: "Post updated successfully",
        post: {
          id: updatedPost._id.toString(),
          name: updatedPost.name,
          image: updatedPost.image,
          description: updatedPost.description,
          Type: updatedPost.Type,
          address: updatedPost.address,
          createdAt: updatedPost.createdAt,
          updatedAt: updatedPost.updatedAt
        }
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("❌ Update post error:", err);
    console.error("Error stack:", err.stack);
    
    return NextResponse.json(
      { success: false, error: "Failed to update post" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * Delete a specific post (only if user owns it)
 */
export async function DELETE(request, context) {
  try {
    console.log('🔵 Delete post started');
    
    await connectDB();
    console.log('✅ MongoDB connected');

    const params = await context.params;
    const { id } = params;
    
    console.log('🔵 Post ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    let userId;
    
    try {
      const decoded = jwt.verify(token, jwtSecret);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    const post = await Goods.findById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to delete this post" },
        { status: 403 }
      );
    }

    // Delete image file
    if (post.image && post.image.startsWith('/uploads/')) {
      try {
        const imagePath = path.join(process.cwd(), 'public', post.image);
        await unlink(imagePath);
        console.log('✅ Image deleted:', post.image);
      } catch (err) {
        console.log('⚠️ Could not delete image file:', err.message);
      }
    }

    await Goods.findByIdAndDelete(id);
    console.log('✅ Post deleted:', id);

    return NextResponse.json(
      { success: true, message: "Post deleted successfully" },
      { status: 200 }
    );

  } catch (err) {
    console.error("❌ Delete post error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete post" },
      { status: 500 }
    );
  }
}