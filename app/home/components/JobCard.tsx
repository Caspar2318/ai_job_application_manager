"use client";
import React, { useState } from "react";
import { Job } from "../HomeClient";
import { getStatusColor } from "./MyApplications";

interface JobCardProps {
  job: Job;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  showError: (message: string) => void;
  setError: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  updateStatus: (id: string, status: string) => void;
}

const JobCard = ({ job, setJobs, showError, setError }: JobCardProps) => {
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editJobUrl, setEditJobUrl] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editCompanySize, setEditCompanySize] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editWorkMode, setEditWorkMode] = useState("");

  const [aiLoadingJobId, setAiLoadingJobId] = useState<string | null>(null);
  const [aiAdviceByJobId, setAiAdviceByJobId] = useState<
    Record<string, string>
  >({});
  const [aiOpenByJobId, setAiOpenByJobId] = useState<Record<string, boolean>>(
    {},
  );

  const [coverLoadingJobId, setCoverLoadingJobId] = useState<string | null>(
    null,
  );
  const [coverLetterByJobId, setCoverLetterByJobId] = useState<
    Record<string, string>
  >({});
  const [coverOpenByJobId, setCoverOpenByJobId] = useState<
    Record<string, boolean>
  >({});

  function startEdit(job: Job) {
    setEditingJobId(job.id);
    setEditCompany(job.company);
    setEditRole(job.role);
    setEditLocation(job.location || "");
    setEditJobUrl(job.jobUrl || "");
    setEditNotes(job.notes || "");
    setEditCompanySize(job.companySize || "");
    setEditIndustry(job.industry || "");
    setEditWorkMode(job.workMode || "");
  }

  async function saveEdit(id: string) {
    if (!editCompany || !editRole) {
      showError("Company and role are required.");
      return;
    }

    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company: editCompany,
        role: editRole,
        location: editLocation,
        jobUrl: editJobUrl,
        notes: editNotes,
        companySize: editCompanySize,
        industry: editIndustry,
        workMode: editWorkMode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Failed to update job.");
      return;
    }

    setJobs((prev) => prev.map((job) => (job.id === id ? data : job)));
    setEditingJobId(null);
  }

  async function deleteJob(id: string) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setJobs((prev) => prev.filter((job) => job.id !== id));
    }
  }

  async function generateAIAdvice(jobId: string) {
    setError("");
    setAiLoadingJobId(jobId);

    const res = await fetch("/api/ai/job-advice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobId }),
    });

    const data = await res.json();
    setAiLoadingJobId(null);

    if (!res.ok) {
      showError(data.error || "Failed to generate AI advice.");
      return;
    }

    setAiAdviceByJobId((prev) => ({
      ...prev,
      [jobId]: data.advice,
    }));

    setAiOpenByJobId((prev) => ({
      ...prev,
      [jobId]: true,
    }));
  }

  async function generateCoverLetter(jobId: string) {
    setCoverLoadingJobId(jobId);

    const res = await fetch("/api/ai/cover-letter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobId }),
    });

    const data = await res.json();
    setCoverLoadingJobId(null);

    if (!res.ok) {
      showError(data.error || "Failed to generate cover letter.");
      return;
    }

    setCoverLetterByJobId((prev) => ({
      ...prev,
      [jobId]: data.coverLetter,
    }));

    setCoverOpenByJobId((prev) => ({
      ...prev,
      [jobId]: true,
    }));
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    showError("Copied to clipboard.");
  }

  return (
    <div
      className="rounded-2xl border border-slate-600 bg-slate-900 p-4 shadow-sm hover:bg-slate-800"
      title="Drag and drop to update status."
    >
      {editingJobId === job.id ? (
        <div className="rounded-xl border border-slate-700 p-3">
          <div className="grid grid-cols-1 gap-3">
            <input
              className="rounded-md border p-2 text-sm"
              value={editCompany}
              onChange={(e) => setEditCompany(e.target.value)}
              placeholder="Company"
            />

            <input
              className="rounded-md border p-2 text-sm"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              placeholder="Role"
            />

            <input
              className="rounded-md border p-2 text-sm"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              placeholder="Location"
            />

            <select
              className="rounded-md border p-2 text-sm"
              value={editWorkMode}
              onChange={(e) => setEditWorkMode(e.target.value)}
            >
              <option value="">Work Mode</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>

            <input
              className="rounded-md border p-2 text-sm"
              value={editCompanySize}
              onChange={(e) => setEditCompanySize(e.target.value)}
              placeholder="Company Size"
            />

            <input
              className="rounded-md border p-2 text-sm"
              value={editIndustry}
              onChange={(e) => setEditIndustry(e.target.value)}
              placeholder="Industry"
            />

            <input
              className="rounded-md border p-2 text-sm"
              value={editJobUrl}
              onChange={(e) => setEditJobUrl(e.target.value)}
              placeholder="Job URL"
            />

            <textarea
              className="min-h-[80px] rounded-md border p-2 text-sm"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Notes"
            />
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => saveEdit(job.id)}
              className="rounded-md bg-green-600 px-3 py-1 text-xs text-white"
            >
              Save
            </button>

            <button
              onClick={() => setEditingJobId(null)}
              className="rounded-md bg-slate-500 px-3 py-1 text-xs text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-300">
                {job.company}
              </p>

              <h3 className="mt-1 text-sm font-semibold capitalize leading-snug text-slate-100">
                {job.role}
              </h3>
            </div>

            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold text-black border ${
                job.status === "Applied"
                  ? "bg-purple-400"
                  : job.status === "Interviewing"
                    ? "bg-blue-400"
                    : job.status === "Offer"
                      ? "bg-green-400"
                      : "bg-red-400"
              } ${getStatusColor(job.status).text} ${getStatusColor(job.status).bg} ${getStatusColor(job.status).border}`}
            >
              {job.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
            {job.location && (
              <span className="rounded-full border border-slate-600 px-2 py-0.5">
                📍 {job.location}
              </span>
            )}

            {job.workMode && (
              <span className="rounded-full border border-slate-600 px-2 py-0.5">
                {job.workMode}
              </span>
            )}

            {job.industry && (
              <span className="rounded-full border border-slate-600 px-2 py-0.5">
                {job.industry}
              </span>
            )}

            {job.companySize && (
              <span className="rounded-full border border-slate-600 px-2 py-0.5">
                {job.companySize}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Added {new Date(job.createdAt).toLocaleDateString()}
          </p>

          {job.notes && (
            <p className="line-clamp-3 text-xs text-slate-300">{job.notes}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-slate-600 px-2 py-1 text-xs hover:bg-slate-800"
              >
                View
              </a>
            )}

            {job.jobUrl ? (
              <>
                <button
                  onClick={() => {
                    if (aiAdviceByJobId[job.id]) {
                      setAiOpenByJobId((prev) => ({
                        ...prev,
                        [job.id]: !prev[job.id],
                      }));
                    } else {
                      generateAIAdvice(job.id);
                    }
                  }}
                  className="rounded-md bg-purple-600 px-2 py-1 text-xs text-white"
                >
                  {aiLoadingJobId === job.id ? "..." : "Analyze"}
                </button>

                <button
                  onClick={() => {
                    if (coverLetterByJobId[job.id]) {
                      setCoverOpenByJobId((prev) => ({
                        ...prev,
                        [job.id]: !prev[job.id],
                      }));
                    } else {
                      generateCoverLetter(job.id);
                    }
                  }}
                  className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white"
                >
                  {coverLoadingJobId === job.id ? "..." : "CL"}
                </button>
              </>
            ) : (
              <p className="text-[11px] text-slate-500">Add URL to enable AI</p>
            )}

            <button
              onClick={() => startEdit(job)}
              className="rounded-md bg-yellow-500 px-2 py-1 text-xs text-black"
            >
              Edit
            </button>

            <button
              onClick={() => deleteJob(job.id)}
              className="rounded-md bg-red-500 px-2 py-1 text-xs text-white"
            >
              Delete
            </button>
          </div>

          {aiAdviceByJobId[job.id] && aiOpenByJobId[job.id] && (
            <div className="mt-2 max-h-[220px] overflow-y-auto rounded-lg border border-slate-700 p-3 text-xs text-blue-300">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-white">AI Analysis</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(aiAdviceByJobId[job.id])}
                    className="text-green-400 underline"
                  >
                    Copy
                  </button>

                  <button
                    onClick={() =>
                      setAiOpenByJobId((prev) => ({
                        ...prev,
                        [job.id]: false,
                      }))
                    }
                    className="font-semibold text-red-400"
                  >
                    X
                  </button>
                </div>
              </div>

              <div className="whitespace-pre-wrap">
                {aiAdviceByJobId[job.id]}
              </div>
            </div>
          )}

          {coverLetterByJobId[job.id] && coverOpenByJobId[job.id] && (
            <div className="mt-2 max-h-[260px] overflow-y-auto rounded-lg border border-slate-700 p-3 text-xs text-green-300">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-white">Cover Letter</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(coverLetterByJobId[job.id])}
                    className="text-green-400 underline"
                  >
                    Copy
                  </button>

                  <button
                    onClick={() =>
                      setCoverOpenByJobId((prev) => ({
                        ...prev,
                        [job.id]: false,
                      }))
                    }
                    className="font-semibold text-red-400"
                  >
                    X
                  </button>
                </div>
              </div>

              <div className="whitespace-pre-wrap">
                {coverLetterByJobId[job.id]}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCard;
