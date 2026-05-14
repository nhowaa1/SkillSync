export type AssessmentRecord = {
  respondent_code: string;
  responses: Record<string, number>;
  competency_scores: Record<string, number>;
  top_results: unknown[];
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function createRespondentCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RESP-${datePart}-${randomPart}`;
}

export async function saveAssessmentRecord(record: AssessmentRecord) {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase is not configured. Assessment result was not saved.");
    return { saved: false, reason: "Supabase environment variables are missing." };
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/student_assessments`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY as string,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to save assessment record: ${response.status} ${errorText}`);
  }

  return { saved: true };
}
