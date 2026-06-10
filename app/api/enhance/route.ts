import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json(
        { error: "Missing GROQ API key. Check .env.local and restart server." },
        { status: 500 }
      );
    }

    const originalPrompt = prompt.trim();

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are an expert AI image prompt engineer. Convert short user ideas into detailed image generation prompts. Return only the final prompt, no explanation.",
            },
            {
              role: "user",
              content: originalPrompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 200,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text().catch(() => "");
      return NextResponse.json(
        {
          error: errorText || "Groq prompt enhancement failed.",
        },
        { status: groqResponse.status }
      );
    }

    const groqData = (await groqResponse.json().catch(() => null)) as any;

    const enhancedPrompt =
      groqData?.choices?.[0]?.message?.content;

    if (!enhancedPrompt || typeof enhancedPrompt !== "string") {
      return NextResponse.json(
        { error: "Groq did not return an enhanced prompt." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      enhancedPrompt: enhancedPrompt.trim(),
    });
  } catch (error) {
    console.error("Enhance route error:", error);

    return NextResponse.json(
      { error: "Something went wrong while enhancing the prompt." },
      { status: 500 }
    );
  }
}

