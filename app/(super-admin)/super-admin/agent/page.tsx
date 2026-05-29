import { Sparkles } from "lucide-react";
import { isAiConfigured } from "@/src/services/aiService";
import { AgentChat } from "./AgentChat";

export const metadata = { title: "Avi — Operations agent" };

export default function AgentPage() {
  const configured = isAiConfigured();
  return (
    <div className="space-y-6">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          AI operations agent
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Ask Avi to run the platform</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Avi can look up KPIs, surface pending reservations + unstaffed sessions, and propose concrete actions.
          <strong className="text-fg"> Anything that changes data goes through an Approve / Reject card</strong> —
          nothing runs until you click.
        </p>
      </header>

      {!configured && (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          <strong>Heads up:</strong> the agent isn&apos;t configured yet. Add{" "}
          <code className="rounded bg-warning/10 px-1">ANTHROPIC_API_KEY</code> to <code className="rounded bg-warning/10 px-1">.env</code>{" "}
          and restart. The UI still works — you&apos;ll just get a placeholder response.
        </div>
      )}

      <AgentChat />
    </div>
  );
}
