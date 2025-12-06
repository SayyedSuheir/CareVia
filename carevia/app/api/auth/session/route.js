import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const token = cookies().get("sessionToken")?.value;
    
    if (!token) {
      return NextResponse.json({
        isLoggedIn: false,
        user: null
      });
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ User session exists (no JWT decoding here)
    return NextResponse.json({
      isLoggedIn: true,
      user
    });
  } catch (err) {
    console.error("Session route error:", err);
    return NextResponse.json({
      isLoggedIn: false,
      user: null
    });
  }
}
