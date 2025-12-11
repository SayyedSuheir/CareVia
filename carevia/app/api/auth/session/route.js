import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * GET /api/session
 */
export async function GET(request) {
  try {
    // ✅ Read cookie safely from request
    const token = request.cookies.get("sessionToken")?.value;

    if (!token) {
      return NextResponse.json(
        { isLoggedIn: false, user: null, message: "No session token found" },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { isLoggedIn: false, user: null, message: "JWT secret missing" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        phoneNumber: decoded.phoneNumber,
        role: decoded.role,
      },
    });

  } catch (err) {
    console.error("Session route error:", err);

    // ✅ Delete cookie safely via response object
    const res = NextResponse.json(
      {
        isLoggedIn: false,
        user: null,
        message:
          err.name === "TokenExpiredError"
            ? "Session expired"
            : err.name === "JsonWebTokenError"
              ? "Invalid session"
              : "Authentication failed",
      },
      { status: 401 }
    );

    res.cookies.set("sessionToken", "", {
      maxAge: 0,
      path: "/",
    });

    return res;
  }
}