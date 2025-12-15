/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Public posts for homepage
 */

/**
 * @swagger
 * /api/postsaction/all:
 *   get:
 *     summary: Fetch all public posts
 *     description: Retrieves all public posts with optional filters for city and type. Excludes posts requested by the current user.
 *     tags: [Posts]
 *     parameters:
 *       - name: city
 *         in: query
 *         required: false
 *         description: Filter posts by city
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         required: false
 *         description: Filter posts by type
 *         schema:
 *           type: string
 *       - name: sessionToken
 *         in: cookie
 *         required: false
 *         description: Optional JWT session token for identifying user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
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
 *                   example: 10
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
 *                       city:
 *                         type: string
 *                       area:
 *                         type: string
 *                       village:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Failed to fetch posts
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
 *                   example: Failed to fetch posts
 */

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
      status: "approved",
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
