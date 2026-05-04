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

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 },
      );
    }

    const job = await db.job.findFirst({
      where: {
        id: jobId,
        userId,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!job.jobUrl) {
      return NextResponse.json(
        { error: "Job URL is required for AI analysis" },
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
      model: "gpt-5.5",
      input: `
        You are an AI career assistant.

        Analyze this job application and give practical advice for the candidate.

        Job Description from URL: ${jobDescription}
        Company: ${job.company}
        Role: ${job.role}
        Status: ${job.status}
        Location: ${job.location || "Not provided"}
        Job URL: ${job.jobUrl || "Not provided"}
        Notes: ${job.notes || "Not provided"}

        Return the answer in this format:

        1. Application Strategy
        - ...

        2. Resume Optimization
        - ...

        3. Interview Preparation
        - ...

        4. Follow-up Message
        Write a short professional follow-up message.
      `,
    });

    const advice = response.output_text;

    await db.job.update({
      where: { id: job.id },
      data: {
        aiAnalysis: advice,
      },
    });

    return NextResponse.json({
      advice,
    });
  } catch (error) {
    console.error("AI_JOB_ADVICE_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate AI advice" },
      { status: 500 },
    );
  }
}
