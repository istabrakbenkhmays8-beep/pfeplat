import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { AuditLog, Session, Trainer } from "@/src/models";
import { renderEmail, sendMail } from "./emailService";

export type TrainerInput = {
  firstName: string;
  surname: string;
  email: string;
  specialty?: string;
  bio?: string;
  country?: string;
  isActive?: boolean;
};

export async function listTrainers() {
  await connectDb();
  return Trainer.find({}).sort({ surname: 1, firstName: 1 }).lean<any[]>();
}

export async function createTrainer(input: TrainerInput) {
  await connectDb();
  const exists = await Trainer.findOne({ email: input.email.toLowerCase() }).select("_id");
  if (exists) return { ok: false as const, error: "EmailInUse" as const };
  const t = await Trainer.create({ ...input, email: input.email.toLowerCase() });
  return { ok: true as const, id: String(t._id) };
}

export async function updateTrainer(id: string, input: Partial<TrainerInput>) {
  await connectDb();
  if (input.email) {
    const dup = await Trainer.findOne({
      email: input.email.toLowerCase(),
      _id: { $ne: new Types.ObjectId(id) },
    }).select("_id");
    if (dup) return { ok: false as const, error: "EmailInUse" as const };
  }
  const t = await Trainer.findByIdAndUpdate(
    id,
    { $set: { ...input, email: input.email?.toLowerCase() } },
    { new: true },
  );
  if (!t) return { ok: false as const, error: "NotFound" as const };
  return { ok: true as const };
}

/** Assign a trainer to a session. Sends the trainer an email (or console-logs in dev). */
export async function assignTrainer(opts: {
  sessionId: string;
  trainerId: string | null; // pass null to clear
  actorId: string;
}) {
  await connectDb();
  const session = await Session.findById(opts.sessionId).populate("course", "code title");
  if (!session) return { ok: false as const, error: "SessionNotFound" as const };

  const previousTrainer = session.trainer ? String(session.trainer) : null;
  let newTrainerDoc = null;
  if (opts.trainerId) {
    newTrainerDoc = await Trainer.findById(opts.trainerId);
    if (!newTrainerDoc) return { ok: false as const, error: "TrainerNotFound" as const };
    session.trainer = newTrainerDoc._id as any;
  } else {
    session.trainer = undefined as any;
  }
  await session.save();

  await AuditLog.create({
    actor: new Types.ObjectId(opts.actorId),
    actorRole: "super_admin",
    action: "trainer.assigned",
    targetType: "Session",
    targetId: session._id,
    before: { trainer: previousTrainer },
    after: { trainer: opts.trainerId },
    metadata: { sessionStartsAt: session.startsAt },
  });

  if (newTrainerDoc) {
    const c = session.course as unknown as { code: string; title: string } | undefined;
    const start = new Date(session.startsAt).toLocaleString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    await sendMail({
      to: newTrainerDoc.email,
      subject: `You've been assigned to ${c?.code ?? "a session"} at Advancia`,
      html: renderEmail({
        title: `New session assignment`,
        bodyHtml: `<p>Hi ${newTrainerDoc.firstName},</p>
          <p>You've been assigned to lead the upcoming session:</p>
          <table cellpadding="6" style="border-collapse:collapse;margin-top:8px">
            <tr><td style="color:#666">Course</td><td><strong>${c?.code ?? "—"} · ${c?.title ?? ""}</strong></td></tr>
            <tr><td style="color:#666">Starts</td><td>${start}</td></tr>
            <tr><td style="color:#666">Mode</td><td>${session.mode}</td></tr>
            <tr><td style="color:#666">Location / link</td><td>${session.location ?? session.meetingLink ?? "TBD"}</td></tr>
            <tr><td style="color:#666">Enrolled so far</td><td>${session.enrolledCount} / ${session.capacity}</td></tr>
          </table>
          <p style="margin-top:18px">Please confirm by replying to this email.</p>`,
        ctaHref: undefined,
      }),
      text: `You've been assigned to ${c?.code ?? "a session"} at Advancia. Starts ${start}.`,
    });
  }

  return { ok: true as const };
}
