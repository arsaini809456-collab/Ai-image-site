import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = body?.prompt;

    console.log("Received prompt:", prompt);


    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Hugging Face API key. Check .env.local and restart server." },
        { status: 500 }
      );
    }

    console.log("Original prompt:", prompt);

    const finalPrompt = prompt.trim();

    console.log("Final prompt sent to HF:", finalPrompt);



    const response = await fetch(

      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        body: JSON.stringify({
          inputs: finalPrompt,
          options: {
            wait_for_model: true,
          },
        }),

      }
    );

    const contentType = response.headers.get("content-type") || "";


    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", errorText);

      return NextResponse.json(
        { error: errorText || "Hugging Face API failed." },
        { status: response.status }
      );
    }

    if (!contentType.includes("image")) {
      const text = await response.text();
      console.error("Expected image but got:", text);

      return NextResponse.json(
        { error: text || "Hugging Face did not return an image." },
        { status: 500 }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${base64Image}`,
    });
  } catch (error) {
    console.error("Generate route error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";
    const name = error instanceof Error ? error.name : "";
    const combined = `${name} ${message}`.toLowerCase();


    const isConnectTimeout =
      combined.includes("und_err_connect_timeout") ||
      combined.includes("fetch failed") ||
      combined.includes("timeout") ||
      combined.includes("connect timeout") ||
      combined.includes("etimedout");

    if (isConnectTimeout) {
      return NextResponse.json(
        {
          error:
            "Image server is taking too long or network connection failed. Please try again.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong while generating image." },
      { status: 500 }
    );
  }
}
