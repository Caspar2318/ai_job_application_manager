import React from "react";
import JobCard from "./JobCard";
import { Job, statuses } from "../HomeClient";

interface MyApplicationsProps {
  jobs: Job[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  showError: (message: string) => void;
  setError: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  updateJobStatus: (id: string, status: string) => void;
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Applied":
      return {
        text: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        dot: "bg-purple-400",
      };
    case "Interviewing":
      return {
        text: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        dot: "bg-blue-400",
      };
    case "Offer":
      return {
        text: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        dot: "bg-green-400",
      };
    case "Rejected":
      return {
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        dot: "bg-red-400",
      };
    default:
      return {
        text: "text-slate-400",
        bg: "bg-slate-500/10",
        border: "border-slate-500/30",
        dot: "bg-slate-400",
      };
  }
}

const MyApplications = ({
  jobs,
  searchTerm,
  setSearchTerm,
  setJobs,
  showError,
  setError,
  error,
  updateJobStatus,
}: MyApplicationsProps) => {
  return (
    <section className="mt-8 mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-6 items-center md:text-xl">
          <h2 className="font-semibold">My Applications</h2>
          <p>{jobs.length} shown</p>
        </div>

        <div className="flex gap-4">
          <input
            className="rounded-md border p-1 text-xs placeholder:text-slate-300"
            placeholder="Search company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />{" "}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {statuses.map((status) => {
          const jobsInColumn = jobs.filter((job) => job.status === status);

          return (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const jobId = e.dataTransfer.getData("jobId");

                if (!jobId) return;

                updateJobStatus(jobId, status);
              }}
              className={`min-h-[420px] rounded-2xl border p-3 shadow-sm transition ${getStatusColor(status).bg} ${getStatusColor(status).border}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${getStatusColor(status).dot}`}
                  />
                  <h3
                    className={`font-semibold text-lg ${getStatusColor(status).text}`}
                  >
                    {status}
                  </h3>
                </div>
                <span
                  className={`text-lg font-semibold mr-2 ${getStatusColor(status).text}`}
                >
                  {jobsInColumn.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {jobsInColumn.map((job) => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("jobId", job.id);
                    }}
                    className="cursor-grab transition duration-200 hover:-translate-y-1 active:cursor-grabbing"
                  >
                    <JobCard
                      job={job}
                      setJobs={setJobs}
                      showError={showError}
                      setError={setError}
                      error={error}
                      updateStatus={updateJobStatus}
                    />
                  </div>
                ))}

                {jobsInColumn.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500 flex gap-1 items-center justify-center">
                    <p className="text-lg">＋</p>
                    <p>Drop to update</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MyApplications;
