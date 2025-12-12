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

    // ✅ Build filter query
    let query = {};

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
