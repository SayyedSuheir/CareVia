// File: app/api/admin/donations/route.js
// ==========================================
// API: /api/admin/reports - Reports & Analytics
// ==========================================
// File: app/api/admin/reports/route.js

/**
 * @swagger
 * tags:
 *   name: AdminReports
 *   description: Admin analytics & reporting endpoints
 */

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get admin reports and analytics
 *     description: >
 *       Returns analytics data such as total users, total donations,
 *       donation distribution, growth statistics, and top donors.
 *       Accessible only to admin users (emails ending with @carevia.com).
 *     tags: [AdminReports]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [overview]
 *           default: overview
 *         description: Type of report to generate
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 reportType:
 *                   type: string
 *                   example: overview
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 150
 *                     totalDonations:
 *                       type: integer
 *                       example: 320
 *                     donationsByType:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: clothes
 *                           count:
 *                             type: integer
 *                             example: 42
 *                     userGrowth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                             properties:
 *                               year:
 *                                 type: integer
 *                                 example: 2025
 *                               month:
 *                                 type: integer
 *                                 example: 6
 *                           count:
 *                             type: integer
 *                             example: 12
 *                     donationGrowth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                             properties:
 *                               year:
 *                                 type: integer
 *                               month:
 *                                 type: integer
 *                           count:
 *                             type: integer
 *                     topDonors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: john@carevia.com
 *                           donationCount:
 *                             type: integer
 *                             example: 15
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – admin access required
 *       500:
 *         description: Failed to generate report
 */

import Goods from '@/app/_models/Goods';
import connectDB from '@/app/_lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Helper to check if user is admin
function isAdmin(email) {
  return email && email.endsWith("@carevia.com");
}

export async function GET(request) {
  try {
    console.log("🔵 Admin: Fetching all donations");

    await connectDB();

    // Get user from session token
    const cookieStore = await cookies();
    const token = cookieStore.get("sessionToken")?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!isAdmin(decoded.email)) {
      return NextResponse.json(
        { success: false, error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    // Get optional status filter and pagination
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status'); // pending, approved, rejected
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 50;

    // Build query - NO status filter by default (show ALL)
    const query = {};
    
    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      query.status = statusFilter;
    }

    console.log("🔍 Admin query:", query);

    // Fetch donations with user details populated
    const posts = await Goods.find(query)
      .populate('userId', 'name email') // Populate user info
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    console.log(`✅ Found ${posts.length} total donations`);

    // Count by status
    const statusCounts = await Promise.all([
      Goods.countDocuments({ status: 'pending' }),
      Goods.countDocuments({ status: 'approved' }),
      Goods.countDocuments({ status: 'rejected' }),
    ]);

    const formattedPosts = posts.map((post) => ({
      _id: post._id.toString(),
      userId: {
        _id: post.userId?._id?.toString(),
        name: post.userId?.name || 'Unknown',
        email: post.userId?.email || 'N/A'
      },
      name: post.name,
      image: post.image,
      description: post.description,
      Type: post.Type,
      address: post.address,
      city: post.city,
      area: post.area,
      village: post.village,
      status: post.status || 'approved', // Default to approved if missing
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return NextResponse.json(
      { 
        success: true, 
        donations: formattedPosts, // Changed from 'posts' to 'donations'
        count: formattedPosts.length,
        statusCounts: {
          pending: statusCounts[0],
          approved: statusCounts[1],
          rejected: statusCounts[2]
        }
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("❌ Admin fetch donations error:", err);
    console.error("Stack:", err.stack);

    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch donations" },
      { status: 500 }
    );
  }
}