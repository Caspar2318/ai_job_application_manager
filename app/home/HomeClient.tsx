"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AddJob from "./components/PreviewJob";
import MyApplications from "./components/MyApplications";

export type Job = {
  id: string;
  company: string;
  role: string;
  status: string;
  location?: string | null;
  jobUrl?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  companySize?: string | null;
  industry?: string | null;
  workMode?: string | null;
};

export const statuses = ["Applied", "Interviewing", "Rejected", "Offer"];

export default function HomeClient({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  function showError(message: string) {
    setError(message);

    setTimeout(() => {
      setError("");
    }, 3000);
  }

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  async function addJob() {
    setError("");

    if (!company || !role) {
      showError("Company and role are required.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company,
        role,
        status,
        location,
        jobUrl,
        notes,
      }),
    });

    setLoading(false);

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Failed to add job.");
      return;
    }

    setJobs((prev) => [data, ...prev]);

    setCompany("");
    setRole("");
    setStatus("Applied");
    setLocation("");
    setJobUrl("");
    setNotes("");
  }

  async function updateJobStatus(jobId: string, newStatus: string) {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Failed to update job status.");
      return;
    }

    setJobs((prev) => prev.map((job) => (job.id === jobId ? data : job)));
  }

  // Filter Jobs

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <h1 className="text-3xl font-semibold text-sky-500">
            AI Job Applications Tracker
          </h1>
          <p className="mt-2 ">
            Track your applications, interview stages, notes, and job links.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-stone-500 text-white px-4 py-1 rounded-md mb-4 cursor-pointer active:translate-y-0.5 font-semibold"
        >
          Logout
        </button>

        <AddJob
          addJob={addJob}
          loading={loading}
          setError={setError}
          setJobs={setJobs}
          showError={showError}
        />

        <MyApplications
          jobs={jobs}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setJobs={setJobs}
          showError={showError}
          setError={setError}
          error={error}
          updateJobStatus={updateJobStatus}
        />
      </div>
    </main>
  );
}
