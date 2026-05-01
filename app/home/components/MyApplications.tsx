import React from "react";
import JobCard from "./JobCard";
import { Job, statuses } from "../HomeClient";

interface MyApplicationsProps {
  filteredJobs: Job[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterStatus: string;
  setFilterStatus: React.Dispatch<React.SetStateAction<string>>;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  showError: (message: string) => void;
  setError: React.Dispatch<React.SetStateAction<string>>;
  error: string;
}

const MyApplications = ({
  filteredJobs,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  setJobs,
  showError,
  setError,
  error,
}: MyApplicationsProps) => {
  return (
    <section className="mt-8 mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-6 items-center">
          <h2 className="text-xl font-semibold">My Applications</h2>
          <p className="text-md">{filteredJobs.length} shown</p>
        </div>

        <div className="flex gap-4">
          <input
            className="rounded-md border p-1 text-sm w-[200px] placeholder:text-slate-300"
            placeholder="Search company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />{" "}
          <select
            className="rounded-md border p-1 text-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4 min-h-[200px] max-[400px] overflow-y-auto">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            setJobs={setJobs}
            showError={showError}
            setError={setError}
            error={error}
          />
        ))}

        {filteredJobs.length === 0 && (
          <div className="rounded-2xl border p-8 text-center">
            No applications yet. Add your first one above.
          </div>
        )}
      </div>
    </section>
  );
};

export default MyApplications;
