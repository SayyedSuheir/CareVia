import Goods from '@/app/models/Goods';
import connectDB from '@/app/_lib/mongodb';
import { NextResponse } from 'next/server';
import RequestedItem from '@/app/models/requesteditems';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * GET /api/postsaction/all
 * Fetch ALL public posts (homepage)
 */
export async function GET(request) {
  try {
    console.log("🔵 Fetching ALL posts");

    // Connect to MongoDB
    await connectDB();
    console.log("✅ MongoDB connected");

    // Get logged-in user from JWT cookie
    const token = request.cookies.get('sessionToken')?.value;
    const decoded = token
      ? jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
      : null;
    const userId = decoded?.userId;

    // Find posts the user has already requested
    const requested = userId
      ? await RequestedItem.find({
          userId: new mongoose.Types.ObjectId(userId),
          expiresAt: { $gt: new Date() },
        }).select('goodsId')
      : [];

    const requestedIds = requested.map((r) => r.goodsId.toString());

    // Fetch posts for homePage
    const posts = await Goods.find({
      _id: { $nin: requestedIds },   // Exclude requested
      ...(userId ? { userId: { $ne: userId } } : {}), // Exclude user's own posts
    }).sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => ({
      id: post._id.toString(),
      userId: post.userId.toString(),
      name: post.name,
      image: post.image,
      description: post.description,
      Type: post.Type,
      address: post.address,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return NextResponse.json(
      { success: true, posts: formattedPosts, count: formattedPosts.length },
      { status: 200 }
    );

  } catch (err) {
    console.error("❌ Fetch ALL posts error:", err);

    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
