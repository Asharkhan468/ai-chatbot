import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = NextResponse.json({ message: "Logged out successfully" });

    res.cookies.set({
      name: "token",
      value: "",
      path: "/",
      maxAge: 0, 
      httpOnly: true,
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}