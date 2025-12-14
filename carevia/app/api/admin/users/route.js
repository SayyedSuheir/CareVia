/**
 * @swagger
 * tags:
 *   name: AdminUsers
 *   description: Admin user management
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get paginated list of users
 *     description: >
 *       Returns a paginated list of non-deleted users.
 *       Supports searching by name, email, or phone number.
 *       Admin access only.
 *     tags: [AdminUsers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name, email, or phone number
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64e9c8b7a12f3a9c12345678
 *                       name:
 *                         type: string
 *                         example: Jane Doe
 *                       email:
 *                         type: string
 *                         example: jane@example.com
 *                       phoneNumber:
 *                         type: string
 *                         example: "+96170123456"
 *                       createdAt:
 *                         type: string
 *                         example: 2025-01-15T10:22:00.000Z
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     total:
 *                       type: integer
 *                       example: 120
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized – missing or invalid session token
 *       403:
 *         description: Forbidden – admin access required
 *       500:
 *         description: Failed to fetch users
 */


import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/_lib/mongodb";
import Users from "@/app/_models/Users";

// Helper function to check admin
function isAdmin(email) {
  return email && email.endsWith("@carevia.com");
}

export async function GET(request) {
  try {
    // ✅ Verify token
    const token = request.cookies.get("sessionToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isAdmin(decoded.email)) {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    // ✅ Connect DB
    await connectDB();

    // ✅ Pagination & search params
    const { searchParams } = new URL(request.url);

    const page   = parseInt(searchParams.get("page")) || 1;
    const limit  = parseInt(searchParams.get("limit")) || 50;
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // ✅ Build filter query show only non-deleted users
    let query = {
      deleted: {$ne: true} 
    };

    if (search) {
      query = {
        $or: [
          { name:        { $regex: search, $options: "i" } },
          { email:       { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } }
        ],
      };
    }

    // ✅ Fetch users
    const users = await Users.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Users.countDocuments(query);

    // ✅ Response
    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}


