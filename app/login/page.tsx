"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
  try {
    setLoading(true)

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await res.json()

    console.log(data)

    if (!res.ok) {
      toast.success(data.error || "Login failed")
      return
    }

    toast.success("Login Successful");
   
    localStorage.setItem("userId", data.userId)
    localStorage.setItem("userName", data.name)
    localStorage.setItem("userEmail", data.email)

    router.push("/") // redirect to main chat

  } catch (error) {
    console.error("Login Error:", error)
    toast.error("Something went wrong")
  } finally {
    setLoading(false)
  }
}
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome Back!</h1>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded-xl bg-white/10 border border-white/10 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 rounded-xl bg-white/10 border border-white/10 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-3 rounded-xl text-white font-semibold hover:scale-105 active:scale-95 transition shadow-md"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-400 hover:underline">
            Register
          </a>
        </p>
      </div>
    </main>
  )
}