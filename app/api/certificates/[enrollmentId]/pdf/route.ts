import { createElement } from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Types } from "mongoose";
import { getSession } from "@/lib/session";
import { getCertificateData } from "@/src/services/certificateService";
import { CertificateDocument } from "@/lib/pdf/CertificateDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = Promise<{ enrollmentId: string }>;

export async function GET(_req: Request, { params }: { params: RouteParams }) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const { enrollmentId } = await params;
  if (!Types.ObjectId.isValid(enrollmentId)) {
    return Response.json({ error: "InvalidId" }, { status: 400 });
  }

  const data = await getCertificateData(session.user.id, enrollmentId);
  if (!data) {
    return Response.json({ error: "NotCompleted" }, { status: 404 });
  }

  // CertificateDocument returns <Document>, but TS can't narrow that across the wrapper.
  // The runtime contract is correct; cast through unknown to satisfy renderToBuffer's strict typing.
  const buf = await renderToBuffer(createElement(CertificateDocument, data) as unknown as Parameters<typeof renderToBuffer>[0]);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  const blob = new Blob([ab], { type: "application/pdf" });

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="advancia-certificate-${data.courseCode}.pdf"`,
      "content-length": String(blob.size),
    },
  });
}
