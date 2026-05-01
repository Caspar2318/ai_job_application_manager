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

export async function GET() {
  const userId = await getUserIdFromCookie();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await db.job.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  const userId = await getUserIdFromCookie();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.company || !body.role) {
    return NextResponse.json(
      { error: "Company and role are required" },
      { status: 400 },
    );
  }

  const job = await db.job.create({
    data: {
      company: body.company,
      role: body.role,
      status: body.status || "Applied",
      location: body.location || null,
      jobUrl: body.jobUrl || null,
      notes: body.notes || null,
      userId,
    },
  });

  return NextResponse.json(job, { status: 201 });
}
