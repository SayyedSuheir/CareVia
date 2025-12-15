// File: app/api/admin/donations/[id]/status/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/_lib/mongodb";
import Goods from "@/app/_models/Goods";

// Helper to check if email is admin
function isAdmin(email) {
  return email && email.endsWith("@carevia.com");
}

export async function PATCH(request, { params }) {
  try {
    const donationId = params.id;

    if (!donationId) {
      return NextResponse.json({ success: false, error: "Donation ID required" }, { status: 400 });
    }

    // Get session token from cookies
    const cookieStore = await request.cookies;
    const token = cookieStore.get("sessionToken")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    // Only admin can update status
    if (!isAdmin(decoded.email)) {
      return NextResponse.json({ success: false, error: "Access denied. Admin only." }, { status: 403 });
    }

    // Connect to DB
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { status } = body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }

    // Update donation
    const updatedDonation = await Goods.findByIdAndUpdate(
      donationId,
      { status },
      { new: true }
    );

    if (!updatedDonation) {
      return NextResponse.json({ success: false, error: "Donation not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Donation status updated to ${status}`,
      donation: updatedDonation
    });

  } catch (err) {
    console.error("Update donation status error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
