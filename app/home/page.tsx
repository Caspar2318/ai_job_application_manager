import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = token ? verifyToken(token) : null;

  if (!userId) {
    redirect("/login");
  }

  const jobs = await db.job.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return <HomeClient initialJobs={jobs} />;
}
