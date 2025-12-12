// ==========================================
// API: /api/admin/reports - Reports & Analytics
// ==========================================
// File: app/api/admin/reports/route.js

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
    
      // Check if user has @carevia.com email
    if (!isAdmin(decoded.email)) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "overview";

    let reportData = {};

    if (reportType === "overview") {
      // Overall statistics
      const totalUsers = await Users.countDocuments();
      const totalDonations = await Goods.countDocuments();
      
      // Donations by type
      const donationsByType = await Goods.aggregate([
        {
          $group: {
            _id: "$Type",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // User growth (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const userGrowth = await Users.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ]);

      // Donation growth (last 6 months)
      const donationGrowth = await Goods.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ]);

      // Top donors
      const topDonors = await Goods.aggregate([
        {
          $group: {
            _id: "$userId",
            donationCount: { $sum: 1 }
          }
        },
        {
          $sort: { donationCount: -1 }
        },
        {
          $limit: 10
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        {
          $unwind: "$userInfo"
        },
        {
          $project: {
            name: "$userInfo.name",
            email: "$userInfo.email",
            donationCount: 1
          }
        }
      ]);

      reportData = {
        totalUsers,
        totalDonations,
        donationsByType,
        userGrowth,
        donationGrowth,
        topDonors
      };
    }

    return NextResponse.json({
      success: true,
      reportType,
      data: reportData
    });

  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}