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

  // Filter Jobs
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = filterStatus === "All" || job.status === filterStatus;

    const matchesSearch =
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const appliedCount = jobs.filter((job) => job.status === "Applied").length;
  const interviewingCount = jobs.filter(
    (job) => job.status === "Interviewing",
  ).length;
  const rejectedCount = jobs.filter((job) => job.status === "Rejected").length;
  const offerCount = jobs.filter((job) => job.status === "Offer").length;

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <h1 className="text-3xl font-semibold">
            AI Job Applications Tracker
          </h1>
          <p className="mt-2 text-sky-500">
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

        <section className="mt-6 mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border p-4 shadow-md">
            <p className="text-md font-semibold text-purple-500">Applied</p>
            <p className="mt-2 text-2xl font-semibold">{appliedCount}</p>
          </div>

          <div className="rounded-2xl border p-4 shadow-md">
            <p className="text-md text-blue-500 font-semibold">Interviewing</p>
            <p className="mt-2 text-2xl font-semibold">{interviewingCount}</p>
          </div>

          <div className="rounded-2xl border p-4 shadow-md">
            <p className="text-md text-red-500 font-semibold">Rejected</p>
            <p className="mt-2 text-2xl font-semibold">{rejectedCount}</p>
          </div>

          <div className="rounded-2xl border p-4 shadow-md">
            <p className="text-md text-green-500 font-semibold">Offer</p>
            <p className="mt-2 text-2xl font-semibold">{offerCount}</p>
          </div>
        </section>

        <MyApplications
          filteredJobs={filteredJobs}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          setJobs={setJobs}
          showError={showError}
          setError={setError}
          error={error}
        />
      </div>
    </main>
  );
}
