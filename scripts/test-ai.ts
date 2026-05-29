#!/usr/bin/env tsx
/**
 * One-shot AI smoke test. Reads .env, calls the configured AI provider (Groq or
 * Anthropic), and prints the streaming response token-by-token.
 *
 * Run:  npx tsx scripts/test-ai.ts
 *       npx tsx scripts/test-ai.ts "Translate 'Hello' to Arabic"
 *
 * Tells you exactly whether the key + model + provider combo works, without
 * needing to log in via the UI.
 */
import "dotenv/config";
import Groq from "groq-sdk";
import Anthropic from "@anthropic-ai/sdk";

const PROMPT = process.argv[2] ?? "In one short sentence, recommend a beginner Cisco networking course.";

async function main() {
  const provider = (process.env.AI_PROVIDER ?? "groq") as "groq" | "anthropic";
  const apiKey = process.env.AI_API_KEY || (provider === "anthropic" ? process.env.ANTHROPIC_API_KEY : "");
  const model =
    process.env.AI_MODEL?.trim() ||
    (provider === "groq" ? "llama-3.3-70b-versatile" : "claude-3-5-haiku-20241022");

  console.log("--- AI config from .env ---");
  console.log(`  provider:  ${provider}`);
  console.log(`  model:     ${model}`);
  console.log(`  key:       ${apiKey ? `${apiKey.slice(0, 8)}... (${apiKey.length} chars)` : "(EMPTY!)"}`);
  console.log(`  prompt:    ${PROMPT}`);
  console.log("");

  if (!apiKey) {
    console.error("❌ AI_API_KEY is empty in .env — aborting.");
    process.exit(1);
  }

  const t = Date.now();
  process.stdout.write("→ Reply: ");

  try {
    if (provider === "groq") {
      const groq = new Groq({ apiKey });
      const stream = await groq.chat.completions.create({
        model,
        messages: [{ role: "user", content: PROMPT }],
        stream: true,
        max_tokens: 256,
      });
      for await (const chunk of stream) {
        const text = chunk.choices?.[0]?.delta?.content;
        if (text) process.stdout.write(text);
      }
    } else {
      const anthropic = new Anthropic({ apiKey });
      const stream = anthropic.messages.stream({
        model,
        max_tokens: 256,
        messages: [{ role: "user", content: PROMPT }],
      });
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          process.stdout.write(chunk.delta.text);
        }
      }
    }
    console.log(`\n\n✅ Stream finished in ${Date.now() - t}ms.`);
  } catch (err: any) {
    console.error(`\n\n❌ AI call failed:`);
    console.error(`   ${err?.message ?? err}`);
    if (err?.status) console.error(`   status: ${err.status}`);
    if (err?.error) console.error(`   error: ${JSON.stringify(err.error, null, 2)}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
