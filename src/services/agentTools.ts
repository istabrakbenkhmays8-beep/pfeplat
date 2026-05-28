/**
 * Tool registry for the super-admin AI agent ("Avi").
 *
 * Each tool exposes:
 *   - name      (snake_case identifier the model uses in `tool_use` blocks)
 *   - description  (helps the model choose)
 *   - input_schema (JSON Schema, sent to Anthropic so it generates valid args)
 *   - mutating  (true → goes through Approve/Reject UI before executing)
 *   - execute(args) → returns a JSON-serialisable result that's either fed back
 *                     to the model (read-only) or returned to the user (mutating).
 *
 * Mutating tools call our existing services so RBAC + business rules stay in one place.
 */

import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import {
  AuditLog,
  Course,
  Enrollment,
  Reservation,
  Session,
  Trainer,
  User,
} from "@/src/models";
import { createCourse } from "./courseService";
import { assignTrainer } from "./trainerService";
import { decideReservation } from "./reservationService";
import { COURSE_LEVELS, COURSE_MODES } from "@/src/models";

export type ToolDef = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  mutating: boolean;
  execute: (
    args: Record<string, unknown>,
    ctx: { actorId: string },
  ) => Promise<unknown>;
};

/* -------- Read-only tools (executed inline) -------- */

const getOverviewStats: ToolDef = {
  name: "get_overview_stats",
  description: "Return platform KPIs: active learners, published courses, sessions this month, completion rate, pending reservations, sessions needing a trainer.",
  input_schema: { type: "object", properties: {}, additionalProperties: false },
  mutating: false,
  async execute() {
    await connectDb();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [
      activeLearners,
      coursesCount,
      sessionsThisMonth,
      completed,
      totalEnrollments,
      pendingReservations,
      sessionsNoTrainer,
    ] = await Promise.all([
      User.countDocuments({ role: "user", status: "active" }),
      Course.countDocuments({ isPublished: true }),
      Session.countDocuments({ startsAt: { $gte: startOfMonth } }),
      Enrollment.countDocuments({ status: "completed" }),
      Enrollment.countDocuments({}),
      Reservation.countDocuments({ status: "pending" }),
      Session.countDocuments({ trainer: { $exists: false }, startsAt: { $gte: now } }),
    ]);
    const completionRate = totalEnrollments === 0 ? 0 : Math.round((completed / totalEnrollments) * 100);
    return {
      activeLearners,
      publishedCourses: coursesCount,
      sessionsThisMonth,
      completionRatePct: completionRate,
      totalEnrollments,
      pendingReservations,
      upcomingSessionsWithoutTrainer: sessionsNoTrainer,
    };
  },
};

const listPendingReservations: ToolDef = {
  name: "list_pending_reservations",
  description: "List reservations waiting for super-admin approval, with user, course code, and session date.",
  input_schema: {
    type: "object",
    properties: {
      limit: { type: "integer", minimum: 1, maximum: 50, default: 10 },
    },
  },
  mutating: false,
  async execute(args) {
    await connectDb();
    const limit = (args.limit as number | undefined) ?? 10;
    const rows = await Reservation.find({ status: "pending" })
      .populate("user", "firstName surname email")
      .populate({ path: "session", populate: { path: "course", select: "code title" } })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean<any[]>();
    return rows.map((r) => ({
      id: String(r._id),
      user: r.user ? `${r.user.firstName} ${r.user.surname} <${r.user.email}>` : null,
      course: r.session?.course ? `${r.session.course.code} ${r.session.course.title}` : null,
      sessionStartsAt: r.session?.startsAt,
    }));
  },
};

const listSessionsNeedingTrainer: ToolDef = {
  name: "list_sessions_needing_trainer",
  description: "Upcoming sessions that have no trainer assigned yet.",
  input_schema: {
    type: "object",
    properties: { limit: { type: "integer", minimum: 1, maximum: 50, default: 10 } },
  },
  mutating: false,
  async execute(args) {
    await connectDb();
    const limit = (args.limit as number | undefined) ?? 10;
    const rows = await Session.find({ trainer: { $exists: false }, startsAt: { $gte: new Date() } })
      .populate("course", "code title")
      .sort({ startsAt: 1 })
      .limit(limit)
      .lean<any[]>();
    return rows.map((s) => ({
      id: String(s._id),
      course: s.course ? `${s.course.code} ${s.course.title}` : null,
      startsAt: s.startsAt,
      mode: s.mode,
      enrolledCount: s.enrolledCount ?? 0,
    }));
  },
};

const searchCoursesTool: ToolDef = {
  name: "search_courses",
  description: "Find courses by title or code.",
  input_schema: {
    type: "object",
    properties: {
      q: { type: "string", description: "Search keyword (matches title or code, case-insensitive)." },
    },
    required: ["q"],
  },
  mutating: false,
  async execute(args) {
    await connectDb();
    const q = String(args.q ?? "");
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const rows = await Course.find({ $or: [{ title: rx }, { code: rx }] })
      .populate("category", "vendor name group")
      .sort({ code: 1 })
      .limit(15)
      .lean<any[]>();
    return rows.map((c) => ({
      id: String(c._id),
      code: c.code,
      title: c.title,
      vendor: c.category?.vendor,
      group: c.category?.group,
      durationDays: c.durationDays,
      isPublished: c.isPublished,
    }));
  },
};

const listTrainers: ToolDef = {
  name: "list_trainers",
  description: "List trainers on file with their specialty. Used before assigning a trainer to a session.",
  input_schema: { type: "object", properties: {} },
  mutating: false,
  async execute() {
    await connectDb();
    const rows = await Trainer.find({ isActive: true })
      .select("firstName surname email specialty country")
      .sort({ surname: 1 })
      .lean<any[]>();
    return rows.map((t) => ({
      id: String(t._id),
      name: `${t.firstName} ${t.surname}`,
      email: t.email,
      specialty: t.specialty ?? "",
      country: t.country ?? "",
    }));
  },
};

/* -------- Mutating tools (gated by Approve/Reject) -------- */

const createCourseTool: ToolDef = {
  name: "create_course",
  description: "Create a new course in the catalog. Use `categorySlug` from existing categories — call get_overview_stats or search_courses first if unsure.",
  input_schema: {
    type: "object",
    properties: {
      code: { type: "string", description: "Short course code (e.g. AZ-104)." },
      title: { type: "string" },
      summary: { type: "string" },
      categorySlug: { type: "string", description: "Slug of an existing Category." },
      durationDays: { type: "number", minimum: 0.5, maximum: 60 },
      modes: {
        type: "array",
        items: { type: "string", enum: [...COURSE_MODES] },
        minItems: 1,
      },
      level: { type: "string", enum: [...COURSE_LEVELS] },
      priceTnd: { type: "number", minimum: 0 },
      coinReward: { type: "number", minimum: 0 },
      isFeatured: { type: "boolean" },
      isPublished: { type: "boolean" },
    },
    required: ["code", "title", "categorySlug", "durationDays"],
  },
  mutating: true,
  async execute(args, ctx) {
    const r = await createCourse({
      code: String(args.code).toUpperCase(),
      title: String(args.title),
      summary: (args.summary as string | undefined) ?? "",
      categorySlug: String(args.categorySlug),
      durationDays: Number(args.durationDays),
      modes: (args.modes as any) ?? ["live_online", "on_site"],
      level: (args.level as any) ?? "intermediate",
      priceTnd: Number(args.priceTnd ?? 0),
      coinReward: Number(args.coinReward ?? 50),
      isFeatured: Boolean(args.isFeatured ?? false),
      isPublished: Boolean(args.isPublished ?? true),
    });
    if (r.ok) {
      await AuditLog.create({
        actor: new Types.ObjectId(ctx.actorId),
        actorRole: "super_admin",
        action: "course.created",
        targetType: "Course",
        targetId: r.id,
        metadata: { source: "ai_agent", code: r.code },
      });
    }
    return r;
  },
};

const assignTrainerTool: ToolDef = {
  name: "assign_trainer_to_session",
  description: "Assign a trainer to a session. This sends the trainer an automatic confirmation email.",
  input_schema: {
    type: "object",
    properties: {
      sessionId: { type: "string", description: "Mongo _id of the Session." },
      trainerId: { type: "string", description: "Mongo _id of the Trainer." },
    },
    required: ["sessionId", "trainerId"],
  },
  mutating: true,
  async execute(args, ctx) {
    return assignTrainer({
      sessionId: String(args.sessionId),
      trainerId: String(args.trainerId),
      actorId: ctx.actorId,
    });
  },
};

const approveReservationTool: ToolDef = {
  name: "approve_reservation",
  description: "Approve a pending reservation, locking the seat for the learner.",
  input_schema: {
    type: "object",
    properties: {
      reservationId: { type: "string" },
      note: { type: "string", description: "Optional reviewer note shown to the learner." },
    },
    required: ["reservationId"],
  },
  mutating: true,
  async execute(args, ctx) {
    return decideReservation({
      reservationId: String(args.reservationId),
      decision: "approved",
      reviewerId: ctx.actorId,
      note: args.note as string | undefined,
    });
  },
};

const rejectReservationTool: ToolDef = {
  name: "reject_reservation",
  description: "Reject a pending reservation. Always include a polite note explaining why.",
  input_schema: {
    type: "object",
    properties: {
      reservationId: { type: "string" },
      note: { type: "string" },
    },
    required: ["reservationId", "note"],
  },
  mutating: true,
  async execute(args, ctx) {
    return decideReservation({
      reservationId: String(args.reservationId),
      decision: "rejected",
      reviewerId: ctx.actorId,
      note: String(args.note),
    });
  },
};

export const AGENT_TOOLS: ToolDef[] = [
  getOverviewStats,
  listPendingReservations,
  listSessionsNeedingTrainer,
  searchCoursesTool,
  listTrainers,
  createCourseTool,
  assignTrainerTool,
  approveReservationTool,
  rejectReservationTool,
];

export function findTool(name: string): ToolDef | undefined {
  return AGENT_TOOLS.find((t) => t.name === name);
}

/** What we send to Anthropic in the `tools` field — strip the local-only props. */
export function toolsForAnthropic() {
  return AGENT_TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }));
}
