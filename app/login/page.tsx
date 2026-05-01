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
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const rules = validatePassword(password);
  const isValidPassword = Object.values(rules).every(Boolean);
  const isValidEmail = validateEmail(email);

  async function handle(type: "login" | "register") {
    setError("");

    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword) {
      setError("Password does not meet the requirements.");
      return;
    }

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, type }),
    });

    if (res.ok) {
      router.push("/home");
    } else {
      setError("Login or register failed. Please check your details.");
    }
  }

  return (
    <div className="w-full h-full m-auto flex justify-center items-center flex-col">
      <h1 className="text-[28px] font-semibold">
        Track your job applications with ease.
      </h1>

      <div className="m-9 flex flex-col gap-4 w-80">
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
        {email && !isValidEmail && (
          <p className="text-sm text-red-500">Please enter a valid email.</p>
        )}

        {(isRegister || password) && (
          <div className="text-sm">
            <p className={rules.length ? "text-green-600" : "text-red-500"}>
              • At least 8 characters
            </p>
            <p className={rules.uppercase ? "text-green-600" : "text-red-500"}>
              • One uppercase letter
            </p>
            <p className={rules.lowercase ? "text-green-600" : "text-red-500"}>
              • One lowercase letter
            </p>
            <p className={rules.number ? "text-green-600" : "text-red-500"}>
              • One number
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-between mt-1">
          <button
            className="bg-sky-600 text-white px-3 py-1 rounded-md cursor-pointer active:translate-y-0.5"
            onClick={() => {
              setIsRegister(false);
              handle("login");
            }}
          >
            Login
          </button>

          <button
            className="px-3 py-1 rounded-md text-black bg-yellow-500 cursor-pointer active:translate-y-0.5"
            onClick={() => {
              setIsRegister(true);
              handle("register");
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
