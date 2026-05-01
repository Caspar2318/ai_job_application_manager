import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { parseJobUrl } from "@/lib/parseJobUrl";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const userId = token ? verifyToken(token) : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobUrl } = await req.json();

    if (!jobUrl) {
      return NextResponse.json(
        { error: "Job URL is required" },
        { status: 400 },
      );
    }

    const preview = await parseJobUrl(jobUrl);

    return NextResponse.json(preview);
  } catch (error) {
    console.error("JOB_PREVIEW_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to parse job URL. Please check the link." },
      { status: 500 },
    );
  }
}
