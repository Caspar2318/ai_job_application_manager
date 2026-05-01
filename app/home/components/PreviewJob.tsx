"use client";
import { useState } from "react";
import { Job } from "../HomeClient";

interface AddJobProps {
  addJob: () => void;
  loading: boolean;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  showError: (message: string) => void;
}

type JobPreview = {
  jobUrl: string;
  company: string;
  role: string;
  location: string;
  workMode: string;
  companySize: string;
  industry: string;
};

const AddJob = ({ setError, setJobs, showError }: AddJobProps) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [jobPreview, setJobPreview] = useState<JobPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  async function previewJobUrl() {
    setError("");
    setPreviewLoading(true);

    const res = await fetch("/api/jobs/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobUrl: previewUrl }),
    });

    const data = await res.json();
    setPreviewLoading(false);

    if (!res.ok) {
      showError(data.error || "Failed to preview job.");
      return;
    }

    setJobPreview(data);
  }

  async function confirmApplyFromPreview() {
    if (!jobPreview) return;

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...jobPreview,
        status: "Applied",
        notes: "",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Failed to save application.");
      return;
    }

    setJobs((prev) => [data, ...prev]);
    setPreviewUrl("");
    setJobPreview(null);
  }

  return (
    <section className="rounded-2xl p-6 shadow-sm border">
      <h2 className="text-xl font-semibold">Add New Application</h2>

      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <input
          className="flex-1 rounded-md border p-2"
          placeholder="Paste job URL..."
          value={previewUrl}
          onChange={(e) => setPreviewUrl(e.target.value)}
        />

        <button
          onClick={previewJobUrl}
          disabled={previewLoading || !previewUrl}
          className="rounded-md bg-sky-600 px-4 py-2 text-black disabled:bg-slate-400 font-semibold active:translate-y-0.5 cursor-pointer disabled:cursor-not-allowed"
        >
          {previewLoading ? "Parsing..." : "Preview Job"}
        </button>
      </div>

      {jobPreview && (
        <div className="mt-5 rounded-2xl border p-5">
          <h3 className="text-lg font-semibold">
            {jobPreview.role} @ {jobPreview.company}
          </h3>

          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-400 md:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-300">Location:</span>{" "}
              {jobPreview.location}
            </p>
            <p>
              <span className="font-semibold text-slate-300">Work Mode:</span>{" "}
              {jobPreview.workMode}
            </p>
            <p>
              <span className="font-semibold text-slate-300">
                Company Size:
              </span>{" "}
              {jobPreview.companySize}
            </p>
            <p>
              <span className="font-semibold text-slate-300">Industry:</span>{" "}
              {jobPreview.industry}
            </p>
          </div>

          <a
            href={jobPreview.jobUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-sky-500 underline"
          >
            View original job post
          </a>

          <div className="mt-5 flex gap-2">
            <button
              onClick={confirmApplyFromPreview}
              className="rounded-md bg-sky-600 px-4 py-2 text-white active:translate-y-0.5 cursor-pointer font-semibold"
            >
              Mark as Applied
            </button>

            <button
              onClick={() => setJobPreview(null)}
              className="rounded-md bg-slate-500 px-4 py-2 active:translate-y-0.5 cursor-pointer font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AddJob;
