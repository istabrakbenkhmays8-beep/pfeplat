/**
 * GET /api/courses/[code]/handbook
 *
 * Returns the printable course handbook PDF for an authenticated user.
 * Requires an active or completed enrollment in the course — we don't let
 * anonymous visitors download the syllabus, so it stays a perk for enrolled learners.
 */
import { createElement } from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Types } from "mongoose";
import { getSession } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { Course, Enrollment, Session, User } from "@/src/models";
import { CourseHandbookDocument } from "@/lib/pdf/CourseHandbookDocument";
import { sessionRange } from "@/lib/dates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = Promise<{ code: string }>;

export async function GET(_req: Request, { params }: { params: RouteParams }) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode).toUpperCase();

  await connectDb();
  const course = await Course.findOne({ code, isPublished: true })
    .populate("category")
    .lean<any>();
  if (!course) return Response.json({ error: "CourseNotFound" }, { status: 404 });

  // Must own an enrollment for this course to grab the handbook.
  const uid = new Types.ObjectId(session.user.id);
  const enrollment = await Enrollment.findOne({ user: uid, course: course._id }).select("_id").lean();
  if (!enrollment) return Response.json({ error: "NotEnrolled" }, { status: 403 });

  // Compute "next session" label (if there's one scheduled in the future).
  const nextSession = await Session.findOne({ course: course._id, endsAt: { $gte: new Date() } })
    .sort({ startsAt: 1 })
    .select("startsAt endsAt mode")
    .lean<{ startsAt: Date; endsAt: Date; mode: string } | null>();
  const nextSessionLabel = nextSession
    ? sessionRange(nextSession.startsAt.toISOString(), nextSession.endsAt.toISOString())
    : "";
  const modeLabel = nextSession
    ? nextSession.mode === "live_online"
      ? "Live online"
      : "On-site"
    : "Live online or on-site";

  const u = await User.findById(uid).select("firstName surname").lean<{ firstName: string; surname: string } | null>();
  const learnerName = u ? `${u.firstName} ${u.surname}`.trim() : "Advancia learner";

  const buf = await renderToBuffer(
    createElement(CourseHandbookDocument, {
      learnerName,
      courseCode: course.code,
      courseTitle: course.title,
      vendor: course.category?.vendor ?? "",
      group: course.category?.group ?? "",
      durationDays: course.durationDays ?? 0,
      modeLabel,
      nextSessionLabel,
      generatedOn: new Date(),
    }) as unknown as Parameters<typeof renderToBuffer>[0],
  );

  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  const blob = new Blob([ab], { type: "application/pdf" });

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="advancia-handbook-${course.code}.pdf"`,
      "content-length": String(blob.size),
    },
  });
}
