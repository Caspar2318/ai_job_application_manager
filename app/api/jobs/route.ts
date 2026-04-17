import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const jobs = db.getJobsByUser(user);
  return Response.json(jobs);
}

export async function POST(req: Request) {
  const token = (await cookies()).get("token")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const job = db.addJob({
    id: crypto.randomUUID(),
    userId: user,
    ...body,
  });
  return Response.json(job);
}
