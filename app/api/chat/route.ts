import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_BASE_URL,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.message) {
      return Response.json({ error: "Message required" }, { status: 400 });
    }

    const response = await client.responses.create({
      model: "openai/gpt-oss-20b",
      input: body.message,
    });

    return Response.json({
      reply: response.output_text,
    });

  } catch (error: any) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
