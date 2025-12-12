import Users from '@/app/_models/Users';
import connectDB from '@/app/_lib/mongodb';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();

    // 2️⃣ Parse request body
    const { name, phoneNumber, email, password, terms } = await request.json();

    // 3️⃣ Validation
    if (!name || name.trim().length < 2)
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });

    if (!phoneNumber || !/^\d+$/.test(phoneNumber))
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });

    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });

    if (!password || password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });

    if (!terms)
      return NextResponse.json({ error: "You must accept terms and conditions" }, { status: 400 });

    // 4️⃣ Check if email already exists
    const existingUser = await Users.findOne({ email });
    if (existingUser)
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Create new user
    const newUser = await Users.create({
      name: name.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      terms,
    });

    // 7️⃣ Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET not defined");

    const sessionToken = jwt.sign(
      {
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: "user",
      },
      jwtSecret,
      { algorithm: "HS256", expiresIn: "7d" }
    );

    // 8️⃣ Set cookie with token
    const res = NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
      },
    }, { status: 201 });

    res.cookies.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;

  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
