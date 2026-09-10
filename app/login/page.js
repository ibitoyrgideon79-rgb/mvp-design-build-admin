"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "submitting", message: "" });

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus({ state: "error", message: data.error ?? "Could not log in." });
      return;
    }

    router.replace(searchParams.get("next") || "/onboard");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <header>
          <h1 className="text-xl font-semibold">MVP Design Build Admin</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in to continue.</p>
        </header>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Username</span>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            autoFocus
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>

        <button
          type="submit"
          disabled={status.state === "submitting"}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {status.state === "submitting" ? "Signing in..." : "Sign in"}
        </button>
        {status.state === "error" && <p className="text-sm text-red-600">{status.message}</p>}
      </form>
    </main>
  );
}
