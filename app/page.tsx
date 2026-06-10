"use client";

import React, { useMemo, useState } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);


  const canGenerate = useMemo(() => {
    return !loading && prompt.trim().length > 0;
  }, [loading, prompt]);

  async function onGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please type a prompt.");
      setImageUrl(null);
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        imageUrl?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error || "Failed to generate image.");
        return;
      }

      if (!data.imageUrl) {
        setError("No image URL returned from the server.");
        return;
      }

      setImageUrl(data.imageUrl);
    } catch {
      setError("Something went wrong while generating the image.");
    } finally {
      setLoading(false);
    }
  }

  function onDownload() {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "ai-generated-image.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#050617] via-[#050617] to-[#02030a] text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-14">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
              AI Image Generator
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/70 sm:text-base">
            Describe your idea and generate a brand new image.
          </p>
        </header>

        <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_80px_-20px_rgba(236,72,153,0.25)] backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-white/80">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A futuristic city at sunset, cinematic lighting"
                className="mt-2 min-h-[140px] w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/25"
              />
            </div>

            <button
              onClick={onGenerate}
              disabled={!canGenerate}
              className={`mt-1 inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-bold transition sm:text-base ${
                canGenerate
                  ? "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:brightness-110"
                  : "cursor-not-allowed bg-white/10 text-white/50"
              }`}
            >
              {loading ? "Generating..." : "Generate Image"}
            </button>

            <button
              onClick={async () => {
                if (!prompt.trim()) return;
                setEnhancing(true);
                setError(null);

                try {
                  const res = await fetch("/api/enhance", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ prompt: prompt.trim() }),
                  });

                  const data = (await res.json().catch(() => ({}))) as {
                    enhancedPrompt?: string;
                    error?: string;
                  };

                  if (!res.ok) {
                    setError(data.error || "Failed to enhance prompt.");
                    return;
                  }

                  if (data.enhancedPrompt) {
                    setPrompt(data.enhancedPrompt);
                  } else {
                    setError("No enhanced prompt returned from the server.");
                  }
                } catch {
                  setError("Something went wrong while enhancing the prompt.");
                } finally {
                  setEnhancing(false);
                }
              }}
              disabled={enhancing || !prompt.trim()}
              className={`inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto ${
                enhancing || !prompt.trim()
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              {enhancing ? "Enhancing..." : "Enhance Prompt"}
            </button>


            {error ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                <div className="font-semibold">Error</div>
                <div className="mt-1 break-words">{error}</div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-white/80">Preview</h2>
                <div className="text-xs text-white/60">
                  {loading ? "Rendering image..." : imageUrl ? "Ready" : "Waiting..."}
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center gap-4">
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt="Generated"
                      className="max-h-[420px] w-full rounded-2xl border border-white/10 object-contain"
                    />

                    <button
                      onClick={onDownload}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
                    >
                      Download
                    </button>
                  </>
                ) : (
                  <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-10 text-center">
                    <div className="text-sm font-semibold text-white/75">
                      Your generated image will show up here
                    </div>
                    <div className="text-xs text-white/50">
                      Type a prompt above and click Generate.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-7 text-center text-xs text-white/50">
          Uses <span className="text-white/70">/api/generate</span> to create images.
        </footer>
      </div>
    </main>
  );
}

