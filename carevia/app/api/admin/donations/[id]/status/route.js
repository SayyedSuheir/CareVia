// File: app/api/admin/donations/[id]/status/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/app/_lib/mongodb";
import Goods from "@/app/_models/Goods";

// Helper to check if email is admin
function isAdmin(email) {
  return email && email.endsWith("@carevia.com");
}

export async function PATCH(request, context) {
  try {
    console.log("🔵 PATCH /api/admin/donations/[id]/status");
    
    // IMPORTANT: In Next.js 15+, params must be awaited
    const params = await context.params;
    const donationId = params.id;
    
    console.log("📋 Donation ID:", donationId);

    if (!donationId) {
      return NextResponse.json({ success: false, error: "Donation ID required" }, { status: 400 });
    }

    // Get session token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value;

    console.log("🔑 Token exists:", !!token);

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ JWT verified, user:", decoded.email);
    } catch (err) {
      console.error("❌ JWT verification failed:", err);
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    // Only admin can update status
    if (!isAdmin(decoded.email)) {
      console.error("❌ Not admin:", decoded.email);
      return NextResponse.json({ success: false, error: "Access denied. Admin only." }, { status: 403 });
    }

    // Connect to DB
    await connectDB();
    console.log("✅ DB connected");

    // Parse request body
    const body = await request.json();
    const { status } = body;

    console.log("📊 New status:", status);

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
      console.error("❌ Donation not found:", donationId);
      return NextResponse.json({ success: false, error: "Donation not found" }, { status: 404 });
    }

    console.log("✅ Donation updated:", updatedDonation._id, "status:", updatedDonation.status);

    return NextResponse.json({
      success: true,
      message: `Donation status updated to ${status}`,
      donation: {
        id: updatedDonation._id.toString(),
        status: updatedDonation.status,
        name: updatedDonation.name
      }
    });

  } catch (err) {
    console.error("❌ Update donation status error:", err);
    console.error("Stack:", err.stack);
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}