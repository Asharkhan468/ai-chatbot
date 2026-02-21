export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.message) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: body.message,
        stream: false,
      }),
    })

    const data = await response.json()

    return Response.json({ reply: data.response })

  } catch (error) {
    console.error("Chat API Error:", error)
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}