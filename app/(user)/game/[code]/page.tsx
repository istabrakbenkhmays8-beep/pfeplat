import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getGame } from "@/src/data/games";
import { GameRunner } from "./GameRunner";

export const metadata = { title: "Game challenge" };

type RouteParams = Promise<{ code: string }>;

export default async function GamePage({ params }: { params: RouteParams }) {
  await requireRole("user");
  const { code } = await params;
  const game = getGame(decodeURIComponent(code));
  if (!game) notFound();

  // Public-safe payload: strip isCorrect flags before sending to the client.
  const safe = {
    code: game.code,
    title: game.title,
    intro: game.intro,
    challenges: game.challenges.map((c, idx) => ({
      idx,
      prompt: c.prompt,
      options: c.options.map((o, oi) => ({ idx: oi, text: o.text })),
      // We DON'T leak isCorrect — scoring happens in the runner via the same data via a separate
      // map. For game-courses (low stakes, learning-focused) we accept this trade-off; if anti-cheat
      // ever matters, move scoring server-side like the Assessment engine.
      correctIdx: c.options.findIndex((o) => o.isCorrect),
      reveal: c.reveal,
    })),
  };

  return (
    <div className="mx-auto max-w-2xl">
      <GameRunner game={safe} />
    </div>
  );
}
