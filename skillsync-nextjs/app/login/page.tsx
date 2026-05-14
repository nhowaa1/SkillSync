"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseReady, signInAdmin } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!isSupabaseReady()) {
      setMessage("Supabase environment variables are missing. Please configure the project first.");
      return;
    }

    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      await signInAdmin(email, password);
      router.push("/admin");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gradient-bg flex min-h-screen items-center justify-center px-6 py-10">
      <section className="glass-card w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <a href="/" className="mb-8 inline-flex items-center text-sm font-medium text-navy-500 transition-colors hover:text-teal-600">
          ← Back to SkillSync
        </a>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-2xl font-bold text-white shadow-lg">
            SS
          </div>
          <h1 className="font-jakarta text-3xl font-extrabold text-navy-900">Admin Login</h1>
          <p className="mt-2 text-sm leading-relaxed text-navy-500">
            Authorized guidance staff and researchers can view stored student assessment records here.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-700" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-navy-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-navy-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-navy-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="Enter password"
            />
          </div>

          {message && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:from-teal-400 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
