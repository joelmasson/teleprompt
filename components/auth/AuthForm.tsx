"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ensureDemoUser, getUsers, saveUser, setCurrentUser } from "@/lib/storage";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("demo@teleprompt.local");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || password.length < 6) {
        throw new Error("Enter a valid email and password with at least six characters.");
      }

      const existingUsers = getUsers();
      const foundUser = existingUsers.find((user) => user.email === trimmedEmail);

      if (mode === "signup") {
        if (foundUser) {
          throw new Error("An account with that email already exists.");
        }

        const user = { id: crypto.randomUUID(), email: trimmedEmail };
        saveUser(user);
        setCurrentUser(user);
      } else {
        const user = foundUser ?? ensureDemoUser();
        if (user.email !== trimmedEmail && user.email !== "demo@teleprompt.local") {
          throw new Error("No account found for that email.");
        }

        setCurrentUser(user);
      }

      router.push("/app");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl shadow-neutral-200/60">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-xl font-bold text-white">
            T
          </div>
          <h1 className="text-2xl font-semibold text-neutral-950">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-neutral-600">
            {mode === "login" ? "Access your private script library." : "Sign up to save scripts and launch the teleprompter."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-neutral-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-3 text-base outline-none ring-0 transition focus:border-neutral-900"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-3 text-base outline-none ring-0 transition focus:border-neutral-900"
              placeholder="At least 6 characters"
            />
          </label>

          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-neutral-950 px-4 py-3 text-base font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-neutral-600">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <a href={mode === "login" ? "/signup" : "/login"} className="font-semibold text-neutral-900">
            {mode === "login" ? "Create an account" : "Log in"}
          </a>
        </p>
      </div>
    </main>
  );
}
