import connectMongo from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    await connectMongo()

    const existing = await User.findOne({ email })
    if (existing) {
      return Response.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashed,
    })

    return Response.json({
      message: "User registered successfully",
      userId: user._id,
    })

  } catch (error) {
    console.error(error)
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}