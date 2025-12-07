import Goods from '@/app/models/Goods';
import connectDB from '@/app/_lib/mongodb';
import { NextResponse } from 'next/server';

/**
 * GET /api/postsaction/all
 * Fetch ALL public posts (homepage)
 */
export async function GET() {
  try {
    console.log("🔵 Fetching ALL posts");

    // Connect to MongoDB
    await connectDB();
    console.log("✅ MongoDB connected");

    // Fetch all posts
    const allPosts = await Goods.find()
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${allPosts.length} total posts`);

    const formattedPosts = allPosts.map(post => ({
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
    console.error("❌ Fetch ALL posts error:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch posts"
      },
      { status: 500 }
    );
  }
}
