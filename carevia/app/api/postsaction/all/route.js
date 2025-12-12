import Goods from '@/app/_models/Goods';
import connectDB from '@/app/_lib/mongodb';
import { NextResponse } from 'next/server';
import RequestedItem from '@/app/_models/requesteditems';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * GET /api/postsaction/all?city=Tyre&type=clothes
 * Fetch ALL public posts (homepage) with optional filters
 */
export async function GET(request) {
  try {
    console.log("🔵 Fetching ALL posts");

    await connectDB();
    console.log("✅ MongoDB connected");

    const url = new URL(request.url);
    const city = url.searchParams.get('city')?.trim();
    const type = url.searchParams.get('type')?.trim();

    const token = request.cookies.get('sessionToken')?.value;
    const decoded = token
      ? jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
      : null;
    const userId = decoded?.userId;

    const requested = userId
      ? await RequestedItem.find({
          userId: new mongoose.Types.ObjectId(userId),
          expiresAt: { $gt: new Date() },
        }).select('goodsId')
      : [];

    const requestedIds = requested.map((r) => r.goodsId.toString());

    // Build filter query
    const query = {
      _id: { $nin: requestedIds },
      ...(userId ? { userId: { $ne: userId } } : {}),
    };

    if (city) query.city = city;
    if (type) query.Type = type;

    const posts = await Goods.find(query).sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => ({
      id: post._id.toString(),
      userId: post.userId.toString(),
      name: post.name,
      image: post.image,
      description: post.description,
      Type: post.Type,
      address: post.address,
      city: post.city,
      area: post.area,
      village: post.village,
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
