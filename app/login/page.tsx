"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function validatePassword(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const rules = validatePassword(password);
  const isValidPassword = Object.values(rules).every(Boolean);
  const isValidEmail = validateEmail(email);

  function showError(message: string) {
    setError(message);

    setTimeout(() => {
      setError("");
    }, 5000);
  }

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    setLoading(false);
  }

  async function handle(type: "login" | "register") {
    setError("");
    setSuccess("");

    if (!isValidEmail) {
      showError("Please enter a valid email address.");
      return;
    }

    if (type === "register" && !isValidPassword) {
      showError("Password does not meet the requirements.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, type }),
      });

      const data = await res.json();

      if (res.ok) {
        if (type === "register") {
          setSuccess(
            "Account created successfully. Redirecting to your dashboard...",
          );
        }

        router.push("/home");
        router.refresh();
        return;
      }

      showError(data.error || "Login or register failed.");
      setLoading(false);
    } catch {
      showError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center flex-col pt-32">
      <h1 className="text-[28px] font-semibold text-sky-500">
        Track your job applications with ease.
      </h1>

      <div className="m-3 flex flex-col gap-4 w-80 h-[360px]">
        <p className="text-center text-sm text-slate-400">
          {mode === "login" ? "Login to continue" : "Create a new account"}
        </p>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-md p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          className="border rounded-md p-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        {mode === "login" ? (
          <>
            <button
              disabled={loading}
              className="bg-sky-600 text-white px-3 py-2 rounded-md cursor-pointer active:translate-y-0.5 disabled:bg-slate-500"
              onClick={() => handle("login")}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              onClick={() => switchMode("register")}
              className="text-sm text-sky-500 underline underline-offset-4 cursor-pointer"
            >
              Create a new account
            </button>
          </>
        ) : (
          <>
            <button
              disabled={loading}
              className="bg-yellow-500 text-black px-3 py-2 rounded-md cursor-pointer active:translate-y-0.5 disabled:bg-slate-500"
              onClick={() => handle("register")}
            >
              {loading ? "Creating account..." : "Register"}
            </button>

            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-sm text-sky-500 underline underline-offset-4 cursor-pointer"
            >
              Back to login
            </button>
          </>
        )}

        <div className="h-[118px]">
          {email && !isValidEmail && (
            <p className="text-sm text-red-500">Please enter a valid email.</p>
          )}

          {mode === "register" && password && (
            <div className="text-sm mt-2">
              <p className="text-slate-400">Password required with: </p>
              <p className={rules.length ? "text-green-600" : "text-red-500"}>
                • At least 8 characters
              </p>
              <p
                className={rules.uppercase ? "text-green-600" : "text-red-500"}
              >
                • One uppercase letter
              </p>
              <p
                className={rules.lowercase ? "text-green-600" : "text-red-500"}
              >
                • One lowercase letter
              </p>
              <p className={rules.number ? "text-green-600" : "text-red-500"}>
                • One number
              </p>
            </div>
          )}
        </div>

        <div className="min-h-[24px]">
          {success && <p className="text-sm text-green-500">{success}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
