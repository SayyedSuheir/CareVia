// ==========================================
// API: /api/admin/stats - Dashboard Statistics
// ==========================================
// File: app/api/admin/stats/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/_lib/mongodb";
import Users from "@/app/_models/Users";
import Goods from "@/app/_models/Goods";

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
    
    // Check if user is admin
    if (!isAdmin(decoded.email)) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    await connectDB();

    // Get statistics
    const totalUsers = await Users.countDocuments({ email: { $not: /@carevia\.com$/i } });
    const totalDonations = await Goods.countDocuments();
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersThisMonth = await Users.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const newDonationsThisMonth = await Goods.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalDonations,
        newUsersThisMonth,
        newDonationsThisMonth
      }
    });

  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
