export type SupabaseAuthSession = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: {
    id: string;
    email?: string;
  };
};

export type StoredAssessment = {
  id: string;
  respondent_code: string;
  responses: Record<string, number>;
  competency_scores: Record<string, number>;
  top_results: unknown[];
  created_at: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SESSION_KEY = "skillsync_admin_session";

export function isSupabaseReady() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function requireSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment variables are missing.");
  }

  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  };
}

export function getStoredSession(): SupabaseAuthSession | null {
  if (typeof window === "undefined") return null;

  const rawSession = window.localStorage.getItem(SESSION_KEY);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as SupabaseAuthSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveStoredSession(session: SupabaseAuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export async function signInAdmin(email: string, password: string) {
  const { url, anonKey } = requireSupabaseConfig();

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.msg || data?.error_description || "Invalid login credentials.");
  }

  saveStoredSession(data as SupabaseAuthSession);
  return data as SupabaseAuthSession;
}

export async function fetchAssessmentRecords() {
  const { url, anonKey } = requireSupabaseConfig();
  const session = getStoredSession();

  if (!session?.access_token) {
    throw new Error("Admin session not found. Please log in again.");
  }

  const response = await fetch(
    `${url}/rest/v1/student_assessments?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || data?.hint || "Unable to load assessment records.");
  }

  return data as StoredAssessment[];
}
