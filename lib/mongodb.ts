import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGO_URI || ""

if (!MONGODB_URI) {
  throw new Error("Please define the MONGO_URI environment variable")
}

let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectMongo() {
  if (cached.conn) {
    console.log("🟢 Using cached MongoDB connection")
    return cached.conn
  }

  if (!cached.promise) {
    console.log("🟡 Connecting to MongoDB...")

    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB Connected Successfully")
        return mongooseInstance.connection
      })
      .catch((error) => {
        console.error("❌ MongoDB Connection Failed:", error)
        throw error
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectMongo