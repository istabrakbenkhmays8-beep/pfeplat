import { z } from "zod";

const schema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  NEXTAUTH_SECRET: z.string().min(16).default("dev-nextauth-secret-change-me-32+chars-please"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // --- AI (unified) ---
  // AI_API_KEY works for both providers (Groq uses gsk_..., Anthropic uses sk-ant-...).
  // AI_MODEL is optional; aiService.ts picks a sensible default per provider.
  AI_PROVIDER: z.enum(["groq", "anthropic"]).default("groq"),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),

  // Legacy / agent-only: the super-admin agent still uses the Anthropic SDK directly
  // because its tool-calling logic is Anthropic-specific. The user-facing chatbot
  // uses AI_PROVIDER / AI_API_KEY above and doesn't need these.
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-3-5-haiku-20241022"),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default("Advancia Training <no-reply@advancia-training.com>"),
});

let cached: z.infer<typeof schema> | null = null;

export function env() {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
