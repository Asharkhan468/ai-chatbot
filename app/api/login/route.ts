import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET 

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ JWT generate karo
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET as string,
      { expiresIn: "1d" } 
    );

    const res = NextResponse.json({
      message: "Login successful",
      userId: user._id,
      name: user.name,
      email: user.email,
    });

    // ✅ Cookie set karo
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, 
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}