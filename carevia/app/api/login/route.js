// /app/login/route.js
import Users from '../../models/Users';
import connectDB from '@/app/_lib/mongodb';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Parse request body
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await Users.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Return user data
    const userData = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
