// app/api/requests/requestedItem/route.js
/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Manage "Need It" item requests
 */

/**
 * @swagger
 * /api/requests/requestedItem:
 *   post:
 *     summary: Create a new requested item
 *     description: Allows a user to request an item. Each request expires in 24 hours.
 *     tags: [Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - goodsId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 64a1234567890abcdef12345
 *               goodsId:
 *                 type: string
 *                 example: 64a1234567890abcdef67890
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RequestedItem'
 *                 message:
 *                   type: string
 *                   example: Item requested successfully. You have 24 hours to pick it up.
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       409:
 *         description: Request already exists and is active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Fetch all requested items for a user
 *     description: Returns active requests (not expired) for a specific user.
 *     tags: [Requests]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch requests for
 *     responses:
 *       200:
 *         description: List of requested items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       image:
 *                         type: string
 *                       type:
 *                         type: string
 *                       address:
 *                         type: string
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *       400:
 *         description: Missing userId query parameter
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RequestedItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         goodsId:
 *           type: string
 *         requestedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           example: pending
 */

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/_lib/mongodb";
import RequestedItem from "@/app/_models/requesteditems";

/**
 * POST /api/requests/requestedItem
 * Create a new requested item (Need It)
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, goodsId } = body;

    if (!userId || !goodsId) {
      return NextResponse.json(
        { error: "userId and goodsId are required" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const goodsObjectId = new mongoose.Types.ObjectId(goodsId);

    // Check if already requested and still active
    const existingRequest = await RequestedItem.findOne({
      userId: userObjectId,
      goodsId: goodsObjectId,
      expiresAt: { $gt: new Date() },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have an active request for this item" },
        { status: 409 }
      );
    }

    // Create request with 24h expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const requestedItem = await RequestedItem.create({
      userId: userObjectId,
      goodsId: goodsObjectId,
      requestedAt: new Date(),
      expiresAt,
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        data: requestedItem,
        message: "Item requested successfully. You have 24 hours to pick it up.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/requests/requestedItem error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/requests/requestedItem?userId=xxx
 * Fetch all requested items for a specific user
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch active requests by user
    const requestedItems = await RequestedItem.find({
      userId: userObjectId,
      expiresAt: { $gt: new Date() },
    })
      .populate({
        path: "goodsId",
        select: "name description image Type address createdAt",
      })
      .sort({ requestedAt: -1 })
      .lean();

    const formattedItems = requestedItems
  .filter(item => item.goodsId) // 🔥 prevents null crash
  .map(item => ({
    id: item.goodsId?._id?.toString() ?? null,
  name: item.goodsId?.name ?? "Item no longer available",
  description: item.goodsId?.description ?? "",
  image: item.goodsId?.image ?? "",
  type: item.goodsId?.Type ?? "",
  address: item.goodsId?.address ?? "",
  requestedAt: item.requestedAt,
  expiresAt: item.expiresAt,
  status: item.status,
  }));


    return NextResponse.json({
      success: true,
      posts: formattedItems,
      count: formattedItems.length,
    });
  } catch (error) {
    console.error("GET /api/requests/requestedItem error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
