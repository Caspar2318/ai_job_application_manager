import { NextResponse } from "next/server";
import OpenAI from "openai";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchJobDescription } from "@/lib/fetchJobDescription";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const userId = token ? verifyToken(token) : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await req.json();

    const job = await db.job.findFirst({
      where: { id: jobId, userId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!job.jobUrl) {
      return NextResponse.json(
        { error: "Job URL is required for cover letter generation" },
        { status: 400 },
      );
    }

    const jobDescription = await fetchJobDescription(job.jobUrl);

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Could not read job posting from URL" },
        { status: 400 },
      );
    }

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: `
        Write a professional cover letter for this job.

        Company: ${job.company}
        Role: ${job.role}
        Location: ${job.location || "N/A"}
        Job Description from URL:${jobDescription}

        Requirements:
        - Keep it concise (150-250 words)
        - Make it sound natural, not robotic
        - Highlight motivation and relevant skills
        - End with a strong closing

        Output only the cover letter.
      `,
    });

    const coverLetter = response.output_text;

    await db.job.update({
      where: { id: job.id },
      data: {
        coverLetter,
      },
    });

    return NextResponse.json({
      coverLetter,
    });
  } catch (error) {
    console.error("AI_COVER_LETTER_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 },
    );
  }
}
