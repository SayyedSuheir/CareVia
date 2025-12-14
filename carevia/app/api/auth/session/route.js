/**
 * @swagger
 * tags:
 *   name: Session
 *   description: User session and authentication state
 */

/**
 * @swagger
 * /api/session:
 *   get:
 *     summary: Get current user session
 *     description: >
 *       Validates the session JWT stored in cookies and returns
 *       the authenticated user's information.
 *     tags: [Session]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isLoggedIn:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64fa3c0b9f1c2a001234abcd"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+96170123456"
 *                     role:
 *                       type: string
 *                       example: "user"
 *       401:
 *         description: Not authenticated or session expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isLoggedIn:
 *                   type: boolean
 *                   example: false
 *                 user:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: Session expired
 *       500:
 *         description: Server configuration error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isLoggedIn:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: JWT secret missing
 */


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