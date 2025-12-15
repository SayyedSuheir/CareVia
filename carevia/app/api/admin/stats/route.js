// ==========================================
// API: /api/admin/stats - Dashboard Statistics
// ==========================================
// File: app/api/admin/stats/route.js
/**
 * @swagger
 * tags:
 *   name: AdminStats
 *   description: Admin dashboard statistics
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: >
 *       Returns key metrics for the admin dashboard including
 *       total users, total donations, and activity from the last 30 days.
 *       Accessible only by admin users.
 *     tags: [AdminStats]
 *     responses:
 *       200:
 *         description: Statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 245
 *                     totalDonations:
 *                       type: integer
 *                       example: 520
 *                     newUsersThisMonth:
 *                       type: integer
 *                       example: 18
 *                     newDonationsThisMonth:
 *                       type: integer
 *                       example: 34
 *       401:
 *         description: Unauthorized – missing or invalid session token
 *       403:
 *         description: Forbidden – admin access required
 *       500:
 *         description: Failed to fetch statistics
 */

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
    const totalUsers = await Users.countDocuments({
     email: { $not: /@carevia\.com$/i },
     deleted: { $ne: true }   
    });
    const totalDonations = await Goods.countDocuments({deleted: { $ne: true }, status: { $nin: ["rejected", "pending"] }  });
    
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
