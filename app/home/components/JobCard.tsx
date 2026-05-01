import React, { useState } from "react";
import { Job, statuses } from "../HomeClient";

interface JobCardProps {
  job: Job;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  showError: (message: string) => void;
  setError: React.Dispatch<React.SetStateAction<string>>;
  error: string;
}

const JobCard = ({
  job,
  setJobs,
  showError,
  setError,
  error,
}: JobCardProps) => {
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editJobUrl, setEditJobUrl] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editCompanySize, setEditCompanySize] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editWorkMode, setEditWorkMode] = useState("");

  async function updateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();

    if (res.ok) {
      setJobs((prev) => prev.map((job) => (job.id === id ? data : job)));
    }
  }

  async function deleteJob(id: string) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setJobs((prev) => prev.filter((job) => job.id !== id));
    }
  }

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

  const [aiLoadingJobId, setAiLoadingJobId] = useState<string | null>(null);
  const [aiAdviceByJobId, setAiAdviceByJobId] = useState<
    Record<string, string>
  >({});
  const [coverLetterByJobId, setCoverLetterByJobId] = useState<
    Record<string, string>
  >({});
  const [coverLoadingJobId, setCoverLoadingJobId] = useState<string | null>(
    null,
  );

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
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    showError("Copied to clipboard.");
  }

  const [aiOpenByJobId, setAiOpenByJobId] = useState<Record<string, boolean>>(
    {},
  );
  const [coverOpenByJobId, setCoverOpenByJobId] = useState<
    Record<string, boolean>
  >({});

  return (
    <div key={job.id} className="rounded-2xl border p-5 shadow-sm">
      {editingJobId === job.id ? (
        <div className="rounded-xl border border-slate-300 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">
                Company
              </label>
              <input
                className="w-full rounded-md border p-2"
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                placeholder="Company"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">Role</label>
              <input
                className="w-full rounded-md border p-2 capitalize"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                placeholder="Role"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400 capitalize">
                Location
              </label>
              <input
                className="w-full rounded-md border p-2"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Location"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">
                Work Mode
              </label>
              <select
                className="w-full rounded-md border p-2"
                value={editWorkMode}
                onChange={(e) => setEditWorkMode(e.target.value)}
              >
                <option value="">Unknown</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">
                Company Size
              </label>
              <input
                className="w-full rounded-md border p-2"
                value={editCompanySize}
                onChange={(e) => setEditCompanySize(e.target.value)}
                placeholder="e.g. 51-200 employees"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">
                Company Category
              </label>
              <input
                className="w-full rounded-md border p-2"
                value={editIndustry}
                onChange={(e) => setEditIndustry(e.target.value)}
                placeholder="e.g. Software, Finance, Healthcare"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-slate-400">
                Job URL
              </label>
              <input
                className="w-full rounded-md border p-2"
                value={editJobUrl}
                onChange={(e) => setEditJobUrl(e.target.value)}
                placeholder="Job URL"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-slate-400">
                Notes
              </label>
              <textarea
                className="min-h-[100px] w-full rounded-md border p-2"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notes"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => saveEdit(job.id)}
              className="rounded-md bg-green-600 px-4 py-2 text-sm text-white cursor-pointer active:translate-y-0.5"
            >
              Save
            </button>

            <button
              onClick={() => setEditingJobId(null)}
              className="rounded-md bg-slate-500 px-4 py-2 text-sm text-white cursor-pointer active:translate-y-0.5"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 md:items-start md:justify-between">
          <div className="flex flex-col md:flex-row items-center justify-between w-full">
            <div>
              <h3 className="text-lg font-semibold text-slate-300 capitalize">
                {job.role} @ {job.company}{" "}
                <span
                  className={`ml-2 rounded-sm px-2 py-0.5 text-[11px] text-black ${
                    job.status === "Applied"
                      ? "bg-purple-500"
                      : job.status === "Interviewing"
                        ? "bg-blue-500"
                        : job.status === "Offer"
                          ? "bg-green-500"
                          : "bg-red-500"
                  }`}
                >
                  {job.status}
                </span>
              </h3>

              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                {job.location && (
                  <span className="rounded-md border border-slate-500 px-2 py-0.5 capitalize">
                    📍 {job.location}
                  </span>
                )}

                {job.workMode && (
                  <span className="rounded-md border border-slate-500 px-2 py-0.5">
                    🏠 {job.workMode}
                  </span>
                )}

                {job.industry && (
                  <span className="rounded-md border border-slate-500 px-2 py-0.5">
                    🏢 {job.industry}
                  </span>
                )}

                {job.companySize && (
                  <span className="rounded-md border border-slate-500 px-2 py-0.5">
                    👥 {job.companySize}
                  </span>
                )}

                <span className="rounded-md border border-slate-500 px-2 py-0.5">
                  📅 {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>

              {job.jobUrl && (
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-slate-300 underline"
                >
                  View job posting
                </a>
              )}

              {job.notes && (
                <p className="mt-3 text-sm text-slate-300 capitalize">
                  {job.notes}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <select
                className="rounded-md border p-2 text-sm"
                value={job.status}
                onChange={(e) => updateStatus(job.id, e.target.value)}
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {job.jobUrl && (
                <button
                  onClick={() => {
                    if (aiAdviceByJobId[job.id]) {
                      setAiOpenByJobId((prev) => ({
                        ...prev,
                        [job.id]: !prev[job.id],
                      }));
                    } else {
                      generateAIAdvice(job.id);
                      setAiOpenByJobId((prev) => ({
                        ...prev,
                        [job.id]: true,
                      }));
                    }
                  }}
                  className="rounded-md bg-purple-600 px-2 text-sm text-white active:translate-y-0.5 whitespace-nowrap cursor-pointer"
                >
                  {aiLoadingJobId === job.id ? "Thinking..." : "AI Analyze"}
                </button>
              )}

              {job.jobUrl && (
                <button
                  onClick={() => {
                    if (coverLetterByJobId[job.id]) {
                      setCoverOpenByJobId((prev) => ({
                        ...prev,
                        [job.id]: !prev[job.id],
                      }));
                    } else {
                      generateCoverLetter(job.id);

                      setCoverOpenByJobId((prev) => ({
                        ...prev,
                        [job.id]: true,
                      }));
                    }
                  }}
                  className="rounded-md bg-indigo-600 px-2 text-sm text-white whitespace-nowrap active:translate-y-0.5 cursor-pointer"
                >
                  {coverLoadingJobId === job.id
                    ? "Generating..."
                    : "Cover Letter"}
                </button>
              )}

              <button
                onClick={() => startEdit(job)}
                className="rounded-md bg-yellow-500 px-2 text-sm text-black active:translate-y-0.5 cursor-pointer"
              >
                Edit
              </button>

              <button
                onClick={() => deleteJob(job.id)}
                className="rounded-md bg-red-500 px-2 text-sm text-white active:translate-y-0.5 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>

          {aiAdviceByJobId[job.id] && aiOpenByJobId[job.id] && (
            <div className="mt-2 whitespace-pre-wrap rounded-xl border p-4 text-md text-blue-300 border-slate-300 w-full h-[200px] overflow-y-auto">
              <div className="mb-2 items-center justify-between w-full flex">
                <p className="font-semibold text-white">AI Analysis:</p>
                <div className="flex gap-2">
                  {error && (
                    <p className="mt-3 text-sm text-red-500">{error}</p>
                  )}
                  <button
                    onClick={() => copyToClipboard(aiAdviceByJobId[job.id])}
                    className="rounded-md text-md cursor-pointer text-green-500 active:translate-y-0.5 italic font-semibold underline underline-offset-4"
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
                    className="rounded-md px-2 py-1 text-lg cursor-pointer text-red-500 active:translate-y-0.5 font-semibold"
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
            <div className="mt-2 whitespace-pre-wrap rounded-xl border p-4 text-md text-green-300 border-slate-300 w-full h-[300px] overflow-y-auto">
              <div className="mb-2 items-center justify-between w-full flex">
                <p className="font-semibold text-white">Cover Letter:</p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => copyToClipboard(coverLetterByJobId[job.id])}
                    className="rounded-md text-md cursor-pointer text-green-500 active:translate-y-0.5 italic font-semibold underline underline-offset-4"
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
                    className="rounded-md px-2 py-1 text-lg cursor-pointer text-red-500 active:translate-y-0.5 font-semibold"
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
