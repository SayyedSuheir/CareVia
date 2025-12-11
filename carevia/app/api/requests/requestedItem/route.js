// app/api/requests/requestedItem/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/_lib/mongodb";
import RequestedItem from "@/app/models/requesteditems";

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

    const formattedItems = requestedItems.map((item) => ({
      id: item.goodsId._id.toString(),
      name: item.goodsId.name,
      description: item.goodsId.description,
      image: item.goodsId.image,
      type: item.goodsId.Type,
      address: item.goodsId.address,
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
