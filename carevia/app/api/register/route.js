// app/api/register/route.js
import Users from '../../models/Users';
import connectDB from '@/app/_lib/mongodb';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, phoneNumber, email, password, terms } = body;

    // Basic validation
    if (!name || name.trim().length < 2) 
      return NextResponse.json({ error: "Name is required and must be at least 2 characters" }, { status: 400 });

    if (!phoneNumber || !/^\d+$/.test(phoneNumber)) 
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) 
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });

    if (!password || password.length < 8) 
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });

    if (!terms) 
      return NextResponse.json({ error: "You must accept terms and conditions" }, { status: 400 });

    // Check if user exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const newUser = new Users({
      name: name.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      terms
    });

    await newUser.save();

    return NextResponse.json({
      message: "Registration successful!",
      user: {
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber
      }
    }, { status: 201 });

  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({
      error: "Registration failed. Please try again.",
      details: err.message
    }, { status: 500 });
  }
}
