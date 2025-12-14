/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and session management
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clears the session cookie and logs the user out.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       500:
 *         description: Logout failed
 *
 *   get:
 *     summary: Logout user via redirect
 *     description: >
 *       Logs out the user by clearing the session cookie and redirects
 *       to the home or login page.
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect after logout
 *       500:
 *         description: Logout failed
 */


import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout
 * Logout user and clear session
 */
export async function POST() {
  try {
    // Delete the session cookie
    const cookieStore = await cookies();
    cookieStore.delete("sessionToken");

    return NextResponse.json(
      {
        success: true,
        message: "Logout successful"
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during logout"
      },
      { status: 500 }
    );
  }
}

/**
 * Optional: GET method for logout via link
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("sessionToken");

    // Redirect to home or login page after logout
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));

  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during logout"
      },
      { status: 500 }
    );
  }
}