
import Users from '../../../models/Users';
import connectDB from '@/app/_lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();

    const { googleId, email, name, avatar } = await request.json();

    if (!googleId || !email || !name) {
      return NextResponse.json({ 
        error: "Missing required Google account information" 
      }, { status: 400 });
    }

    // Check if user already exists
    let user = await Users.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // User exists - log them in
      if (!user.googleId) {
        // Link Google account to existing email account
        user.googleId = googleId;
        user.provider = 'google';
        user.avatar = avatar;
        user.isVerified = true; // Google emails are pre-verified
        await user.save();
      }

      return NextResponse.json({ 
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isVerified: user.isVerified
        }
      }, { status: 200 });
    }

    // Create new user with Google account
    const newUser = new Users({
      name: name.toLowerCase(),
      email: email.toLowerCase(),
      googleId,
      provider: 'google',
      avatar,
      isVerified: true, // Google emails are pre-verified
      terms: true // Assuming acceptance via Google signup
    });

    await newUser.save();

    console.log('✅ New user registered via Google:', email);

    return NextResponse.json({ 
      message: "Registration successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        isVerified: newUser.isVerified
      }
    }, { status: 201 });

  } catch (err) {
    console.error("Google auth error:", err);
    return NextResponse.json({ 
      error: "Authentication failed. Please try again.",
      details: err.message 
    }, { status: 500 });
  }
}