"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearStoredSession,
  fetchAssessmentRecords,
  getStoredSession,
  StoredAssessment,
} from "@/lib/supabaseBrowser";

type ResultPreview = {
  name?: string;
  score?: number;
  matchedStrengths?: string[];
  programs?: string[];
  occupations?: string[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getTopResult(record: StoredAssessment): ResultPreview | null {
  const firstResult = Array.isArray(record.top_results) ? record.top_results[0] : null;
  if (!firstResult || typeof firstResult !== "object") return null;
  return firstResult as ResultPreview;
}

export default function AdminPage() {
  const router = useRouter();
  const [records, setRecords] = useState<StoredAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getStoredSession();

    if (!session?.access_token) {
      router.replace("/login");
      return;
    }

    async function loadRecords() {
      try {
        const data = await fetchAssessmentRecords();
        setRecords(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load records.");
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [router]);

  const totalAssessments = records.length;
  const latestDate = useMemo(() => {
    if (records.length === 0) return "No records yet";
    return formatDate(records[0].created_at);
  }, [records]);

  function handleLogout() {
    clearStoredSession();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">SkillSync Admin</p>
            <h1 className="font-jakarta text-2xl font-extrabold text-navy-900">Assessment Records Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <a href="/" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-700 transition hover:bg-slate-100">
              Home
            </a>
            <button onClick={handleLogout} className="rounded-xl bg-navy-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-500">Total Assessments</p>
            <p className="mt-2 text-4xl font-extrabold text-navy-900">{totalAssessments}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:col-span-2">
            <p className="text-sm font-semibold text-slate-500">Latest Submission</p>
            <p className="mt-2 text-xl font-bold text-navy-900">{latestDate}</p>
            <p className="mt-2 text-sm text-slate-500">Records are loaded directly from the Supabase student_assessments table.</p>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <p className="font-semibold text-navy-700">Loading assessment records...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-bold">Unable to load records</p>
            <p className="mt-2 text-sm">{error}</p>
            <p className="mt-3 text-sm">Please check the Supabase environment variables and SELECT policy for authenticated users.</p>
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <p className="font-semibold text-navy-700">No assessment records yet.</p>
            <p className="mt-2 text-sm text-slate-500">Once students submit the assessment, their records will appear here.</p>
          </div>
        )}

        {!loading && !error && records.length > 0 && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-5 py-4">Respondent Code</th>
                    <th className="px-5 py-4">Submitted</th>
                    <th className="px-5 py-4">Top Pathway</th>
                    <th className="px-5 py-4">Match</th>
                    <th className="px-5 py-4">Matched Strengths</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((record) => {
                    const topResult = getTopResult(record);
                    return (
                      <tr key={record.id} className="align-top hover:bg-slate-50">
                        <td className="px-5 py-4 font-semibold text-navy-900">{record.respondent_code}</td>
                        <td className="px-5 py-4 text-slate-600">{formatDate(record.created_at)}</td>
                        <td className="px-5 py-4 text-slate-800">{topResult?.name ?? "No result"}</td>
                        <td className="px-5 py-4 font-bold text-teal-600">{typeof topResult?.score === "number" ? `${topResult.score}%` : "—"}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {topResult?.matchedStrengths?.length ? topResult.matchedStrengths.join(", ") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
