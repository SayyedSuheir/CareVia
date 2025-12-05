// app/api/verify-email/route.js
import Users from '../../models/Users';
import PendingUsers from '../../models/PendingUsers';
import connectDB from '@/app/_lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();

    // Get token from URL query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    // Find pending user with this token
    const pendingUser = await PendingUsers.findOne({
      verificationToken: token
    });

    if (!pendingUser) {
      return NextResponse.json({ 
        error: "Invalid or expired verification token. The link may have expired after 24 hours." 
      }, { status: 400 });
    }

    // Check if user already exists (shouldn't happen, but just in case)
    const existingUser = await Users.findOne({ email: pendingUser.email });
    if (existingUser) {
      // Clean up pending user
      await PendingUsers.deleteOne({ _id: pendingUser._id });
      return NextResponse.json({ 
        error: "Email already verified. Please log in." 
      }, { status: 400 });
    }

    // Move user from PendingUsers to Users
    const newUser = new Users({
      name: pendingUser.name,
      phoneNumber: pendingUser.phoneNumber,
      email: pendingUser.email,
      password: pendingUser.password, // Already hashed
      terms: pendingUser.terms,
      isVerified: true,
      provider: 'local'
    });

    await newUser.save();

    // Delete from pending users
    await PendingUsers.deleteOne({ _id: pendingUser._id });

    console.log('✅ Email verified and user created:', newUser.email);

    return NextResponse.json({ 
      message: "Email verified successfully! You can now log in.",
      success: true,
      user: {
        name: newUser.name,
        email: newUser.email
      }
    }, { status: 200 });

  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ 
      error: "Verification failed. Please try again.",
      details: err.message 
    }, { status: 500 });
  }
}