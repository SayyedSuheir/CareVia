import Users from '@/app/models/Users';
import connectDB from '@/app/_lib/mongodb';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    const { name, phoneNumber, email, password, terms } = await request.json();

    // Validation
    if (!name || name.trim().length < 2) return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    if (!phoneNumber || !/^\d+$/.test(phoneNumber)) return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    if (!terms) return NextResponse.json({ error: "You must accept terms and conditions" }, { status: 400 });

    const existingUser = await Users.findOne({ email });
    if (existingUser) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      name: name.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      terms
    });

    // ✅ Create session token
    const sessionToken = `session_${Date.now()}_${newUser._id}`;

    // ✅ Attach cookie to response
    const res = NextResponse.json({
      success: true,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, phoneNumber: newUser.phoneNumber }
    }, { status: 201 });

    res.cookies.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return res;

  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
