// ==========================================
// API: /api/admin/donations - Donations Management
// ==========================================
// File: app/api/admin/donations/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/_lib/mongodb";
import Goods from "@/app/models/Goods";

// Helper function to check if user is admin
function isAdmin(email) {
  return email && email.endsWith('@carevia.com');
}
export async function GET(request) {
  try {
    // Verify admin authentication
    const token = request.cookies.get("sessionToken")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
     // Check if user has @carevia.com email
    if (!isAdmin(decoded.email)) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const type = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";
    
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (type) {
      query.Type = type;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Fetch donations with user info
    const donations = await Goods.find(query)
      .populate("userId", "name email phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalDonations = await Goods.countDocuments(query);

    return NextResponse.json({
      success: true,
      donations,
      pagination: {
        page,
        limit,
        total: totalDonations,
        pages: Math.ceil(totalDonations / limit)
      }
    });

  } catch (error) {
    console.error("Donations API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

// DELETE specific donation
export async function DELETE(request) {
  try {
    const token = request.cookies.get("sessionToken")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if user has @carevia.com email
    if (!isAdmin(decoded.email)) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const donationId = searchParams.get("id");

    if (!donationId) {
      return NextResponse.json(
        { error: "Donation ID required" },
        { status: 400 }
      );
    }

    const deletedDonation = await Goods.findByIdAndDelete(donationId);

    if (!deletedDonation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Donation deleted successfully"
    });

  } catch (error) {
    console.error("Delete donation error:", error);
    return NextResponse.json(
      { error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}

