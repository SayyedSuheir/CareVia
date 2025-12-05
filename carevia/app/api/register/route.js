// app/api/register/route.js
import Users from '../../models/Users';
import connectDB from '@/app/_lib/mongodb';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, phoneNumber, email, password, terms } = body;

    // Basic validation
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!phoneNumber) return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    if (!password) return NextResponse.json({ error: "Password is required" }, { status: 400 });
    if (!terms) return NextResponse.json({ error: "You must accept terms and conditions" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });

    // Check if user exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user object (not saved yet)
    const newUser = new Users({
      name,
      phoneNumber,
      email,
      password: hashedPassword,
      terms,
      isVerified: false,
      verificationToken,
      verificationExpires
    });

    // Prepare verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - CareVia',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2BB0A8 0%, #1a7f77 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #2BB0A8; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CareVia!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for signing up! Please verify your email address to activate your account.</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2BB0A8;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} CareVia. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // ✅ Send verification email and save user only if successful
    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent to:', email);

      // Save user after email is sent
      await newUser.save();

      return NextResponse.json({
        message: "Registration successful! Please check your email to verify your account.",
        user: {
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber
        }
      }, { status: 201 });

    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);
      return NextResponse.json(
        { error: "Invalid or unreachable email address. Verification email failed." },
        { status: 400 }
      );
    }

  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({
      error: "Registration failed. Please try again.",
      details: err.message
    }, { status: 500 });
  }
}
