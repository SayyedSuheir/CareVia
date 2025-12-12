import Users from '../../_models/Users';
import connectDB from '@/app/_lib/mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
      jwtSecret,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    // ✅ cookies() is sync
    // const cookieStore = cookies();

    // cookieStore.set("sessionToken", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   maxAge: 60 * 60 * 24 * 7,
    //   path: "/",
    // });

    // return NextResponse.json(
    //   {
    //     success: true,
    //     message: "Login successful",
    //     user: {
    //       id: user._id.toString(),
    //       name: user.name,
    //       email: user.email,
    //       phoneNumber: user.phoneNumber,
    //     }
    //   },
    //   { status: 200 }
    // );
    const res = NextResponse.json({
    success: true,
    message: "Login successful",
    user: {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  }
});

  res.cookies.set("sessionToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;


  } catch (err) {
    console.error("Login error:", err);

    if (err.name === "MongoNetworkError") {
      return NextResponse.json(
        { success: false, error: "Database connection failed. Try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}