import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getUserIdFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  return verifyToken(token);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserIdFromCookie();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const existingJob = await db.job.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existingJob) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const updatedJob = await db.job.update({
    where: { id },
    data: {
      company: body.company,
      role: body.role,
      status: body.status,
      location: body.location,
      jobUrl: body.jobUrl,
      notes: body.notes,
      companySize: body.companySize,
      industry: body.industry,
      workMode: body.workMode,
    },
  });

  return NextResponse.json(updatedJob);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserIdFromCookie();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existingJob = await db.job.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existingJob) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  await db.job.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
