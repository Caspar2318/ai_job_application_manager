"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handle(type: "login" | "register") {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, type }),
    });

    if (res.ok) {
      router.push("/home");
    }
  }

  return (
    <div className="m-9 gap-6 flex">
      <input
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded-md"
      />
      <input
        type="password"
        className="border rounded-md"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={() => handle("login")}>Login</button>
      <button onClick={() => handle("register")}>Register</button>
    </div>
  );
}
