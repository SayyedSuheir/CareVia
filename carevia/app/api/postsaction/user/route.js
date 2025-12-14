/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Operations related to user posts
 */

/**
 * @swagger
 * /api/posts/user:
 *   get:
 *     summary: Fetch all posts for the logged-in user
 *     description: Returns all posts created by the authenticated user, sorted by creation date (most recent first).
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: User posts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       image:
 *                         type: string
 *                       description:
 *                         type: string
 *                       Type:
 *                         type: string
 *                       address:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized or invalid session
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
 *       500:
 *         description: Internal server error
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
 */

import Goods from '@/app/_models/Goods';
import connectDB from '@/app/_lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

/**
 * GET /api/posts/user
 * Fetch all posts for the logged-in user
 */
export async function GET() {
  try {
    console.log('🔵 Fetching user posts');
    
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

    // Fetch user's posts from database
    const userPosts = await Goods.find({ userId })
      .sort({ createdAt: -1 }) // Most recent first
      .lean(); // Convert to plain JavaScript objects

    console.log(`✅ Found ${userPosts.length} posts for user`);

    // Format posts for response
    const formattedPosts = userPosts.map(post => ({
      id: post._id.toString(),
      userId: post.userId.toString(),
      name: post.name,
      image: post.image,
      description: post.description,
      Type: post.Type,
      address: post.address,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    return NextResponse.json(
      {
        success: true,
        posts: formattedPosts,
        count: formattedPosts.length
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("❌ Fetch user posts error:", err);
    console.error("Error stack:", err.stack);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch posts. Please try again." 
      },
      { status: 500 }
    );
  }
}