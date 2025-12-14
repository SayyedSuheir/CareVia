/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate or register user with Google
 *     description: >
 *       Authenticates a user using Google OAuth data.
 *       If the user already exists, it logs them in.
 *       If not, it creates a new user account with verified status.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - googleId
 *               - email
 *               - name
 *             properties:
 *               googleId:
 *                 type: string
 *                 example: "103948573920485739204"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@gmail.com"
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               avatar:
 *                 type: string
 *                 example: "https://lh3.googleusercontent.com/a/avatar.jpg"
 *     responses:
 *       200:
 *         description: Login successful (existing user)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64e9c8b7a12f3a9c12345678
 *                     name:
 *                       type: string
 *                       example: jane doe
 *                     email:
 *                       type: string
 *                       example: user@gmail.com
 *                     avatar:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *       201:
 *         description: Registration successful (new user)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Registration successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *       400:
 *         description: Missing required Google account information
 *       500:
 *         description: Authentication failed
 */

import Users from '../../../_models/Users';
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