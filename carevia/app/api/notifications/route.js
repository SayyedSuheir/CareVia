import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/_lib/mongodb";
import Notification from "@/app/_models/Notification";

/**
 * GET /api/notifications?userId=xxx
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const notifications = await Notification.find({
      recipient_id: userObjectId,
    })
      .populate("sender_id", "name email profileImage")
      .populate("goodsId", "name image description Type address")
      .populate("requestedItemId")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient_id: userObjectId,
      read: false,
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}