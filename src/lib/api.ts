/**
 * Typed wrappers around the FastAPI backend.
 * All calls go through the /backend rewrite in next.config.ts.
 */

const BASE = "/backend";
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN ?? "";

function qs(params: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}${qs({ token: TOKEN, ...params })}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

async function post<T>(path: string, body: unknown, params: Record<string, string> = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}${qs({ token: TOKEN, ...params })}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}${qs({ token: TOKEN })}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}${qs({ token: TOKEN })}`, {
    method: "DELETE",
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface WeeklyMetric {
  count: number;
  total_value: number;
  avg_value: number;
  avg_quantity: number;
  unique_clients: number;
  unique_companies: number;
  unique_products: number;
}

export interface Digest {
  period_weeks: number;
  total_estimates: number;
  total_value_eur: number;
  avg_estimate_eur: number;
  trend: "up" | "down" | "stable";
  weekly_breakdown: Record<string, WeeklyMetric>;
  ai_summary: string | null;
  generated_at: string;
}

export interface AgentRun {
  run_id: string;
  client_id: string;
  agent_type: string;
  status: string;
  created_at: string;
}

export interface AgentRunDetail extends AgentRun {
  result: Record<string, unknown>;
}

export interface Client {
  client_id: string;
  name: string;
  shopify_store_domain: string;
  shopify_storefront_token: string;
  shopify_store_url: string;
  digest_email: string;
  enabled_modules: string[];
  created_at: string;
  updated_at?: string;
}

// ── API calls ────────────────────────────────────────────────────────────────

export const api = {
  // Digest
  getDigest: (weeks = 4, clientId = "default", noAi = false) =>
    get<{ ok: boolean; digest: Digest }>("/api/agents/performance-digest/preview", {
      weeks,
      client_id: clientId,
      ...(noAi ? { no_ai: 1 } : {}),
    }),

  runDigest: (clientId = "default") =>
    get<{ ok: boolean; message: string }>("/api/agents/performance-digest/run", {
      client_id: clientId,
    }),

  // SEO Brief
  generateSeoBrief: (handle: string, clientId = "default") =>
    post<{ ok: boolean; brief: Record<string, unknown> }>("/api/agents/seo-brief", {
      handle,
      client_id: clientId,
    }),

  generateAllSeoBriefs: (clientId = "default") =>
    get<{ ok: boolean; count: number; briefs: unknown[] }>("/api/agents/seo-brief/all", {
      client_id: clientId,
    }),

  // Ad Copy
  generateAdCopy: (handle: string, performanceNotes = "", clientId = "default") =>
    post<{ ok: boolean; ad_copy: Record<string, unknown> }>("/api/agents/ad-copy", {
      handle,
      performance_notes: performanceNotes,
      client_id: clientId,
    }),

  refreshAllAdCopy: (clientId = "default") =>
    get<{ ok: boolean; count: number; ad_copy: unknown[] }>("/api/agents/ad-copy/refresh", {
      client_id: clientId,
    }),

  // Agent runs
  getRuns: (clientId?: string, agentType?: string, limit = 50) =>
    get<{ ok: boolean; count: number; runs: AgentRun[] }>("/api/agent-runs", {
      ...(clientId ? { client_id: clientId } : {}),
      ...(agentType ? { agent_type: agentType } : {}),
      limit,
    }),

  getRun: (runId: string) =>
    get<{ ok: boolean; run: AgentRunDetail }>(`/api/agent-runs/${runId}`),

  // Clients
  getClients: () => get<{ ok: boolean; clients: Client[] }>("/api/clients"),

  createClient: (payload: Omit<Client, "client_id" | "created_at" | "updated_at">) =>
    post<{ ok: boolean; client: Client }>("/api/clients", payload),

  updateClient: (clientId: string, payload: Omit<Client, "client_id" | "created_at" | "updated_at">) =>
    put<{ ok: boolean; client: Client }>(`/api/clients/${clientId}`, payload),

  deleteClient: (clientId: string) =>
    del<{ ok: boolean; message: string }>(`/api/clients/${clientId}`),
};
