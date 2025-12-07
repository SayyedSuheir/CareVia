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