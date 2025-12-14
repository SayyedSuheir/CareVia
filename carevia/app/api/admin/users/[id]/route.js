// app/api/admin/users/[id]/route.js

import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/app/_lib/adminAuth";
import connectDB from "@/app/_lib/mongodb";
import Users from "@/app/_models/Users";
import Goods from "@/app/_models/Goods";

export const runtime = "nodejs";

/**
 * DELETE /api/admin/users/[id]
 * Soft-deletes a user and their goods (mark deleted=true)
 */
export async function DELETE(request, context) {
  console.log("🟥 [BACKEND] DELETE endpoint hit");

  try {
    const params = await context.params;
    console.log("🟥 [BACKEND] Params:", params);
    
    const auth = verifyAdminToken(request);
    console.log("🟥 [BACKEND] Auth result:", auth);

    if (!auth.authorized) {
      console.log("🟥 [BACKEND] Auth FAILED:", auth.error);
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    console.log("🟥 [BACKEND] Auth SUCCESS");

    await connectDB();
    const userId = params?.id;
    console.log("🟥 [BACKEND] Deleting user ID:", userId);

    const user = await Users.findByIdAndUpdate(
      userId,
      { deleted: true },
      { new: true }
    );

    console.log("🟥 [BACKEND] Update result:", user ? 'Found and updated' : 'Not found');

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await Goods.updateMany({ userId: user._id }, { deleted: true });

    console.log("🟥 [BACKEND] SUCCESS - returning response");
    return NextResponse.json({
      success: true,
      message: "User marked as deleted",
      userId: user._id
    });

  } catch (error) {
    console.error("🟥 [BACKEND] ERROR:", error.message);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}