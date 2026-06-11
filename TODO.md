- [ ] Create branch: blackboxai/remove-groq-prompt-enhancement-generate-route
- [x] Edit `app/api/generate/route.ts` to remove all prompt enhancement/modification logic (no Groq, no aspectRatio guidance)
- [x] Ensure `/api/generate` sends only the frontend prompt (trimmed) to Hugging Face
- [ ] Run typecheck/lint or `npm run build` to verify Next.js build
- [ ] Smoke test endpoints: `/api/enhance` uses Groq; `/api/generate` does not call Groq


