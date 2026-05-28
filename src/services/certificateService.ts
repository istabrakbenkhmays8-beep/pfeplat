import { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import { Enrollment } from "@/src/models";

export async function getCertificateData(userId: string, enrollmentId: string) {
  await connectDb();
  const e = await Enrollment.findOne({
    _id: new Types.ObjectId(enrollmentId),
    user: new Types.ObjectId(userId),
    status: "completed",
  })
    .populate({ path: "course", populate: "category" })
    .populate("user", "firstName surname")
    .lean<any>();
  if (!e) return null;

  return {
    learnerName: `${e.user?.firstName ?? ""} ${e.user?.surname ?? ""}`.trim() || "Learner",
    courseCode: e.course?.code ?? "—",
    courseTitle: e.course?.title ?? "—",
    vendor: e.course?.category?.vendor ?? "",
    durationDays: e.course?.durationDays ?? 0,
    completedAt: e.completedAt ? new Date(e.completedAt) : new Date(),
    serial: serialFor(String(e._id)),
  };
}

function serialFor(id: string): string {
  // Stable 12-char uppercase serial from the enrollment id.
  return `ADV-${id.slice(-8).toUpperCase()}-${id.slice(-12, -8).toUpperCase()}`;
}
