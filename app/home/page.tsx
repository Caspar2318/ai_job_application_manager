"use client";

import { useEffect, useState } from "react";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jobs, setJobs] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");

  async function fetchJobs() {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data);
  }

  async function addJob() {
    await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, company, status: "applied" }),
    });
    await fetchJobs();
  }

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (!ignore) {
        setJobs(data);
      }
    };

    run();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      <input onChange={(e) => setTitle(e.target.value)} />
      <input onChange={(e) => setCompany(e.target.value)} />

      <button onClick={addJob}>Add</button>

      <ul>
        {jobs.map((j) => (
          <li key={j.id}>
            {j.title} - {j.company}
          </li>
        ))}
      </ul>
    </div>
  );
}
