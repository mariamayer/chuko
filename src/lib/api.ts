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

export interface EstimateSummary {
  estimate_id: string;
  created_at: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_company: string;
  estimate: number;
  currency: string;
  quantity: number | null;
  product_type: string;
  product_variant: string;
  technique: string;
  logo_size: string;
}

export interface EstimateBreakdown {
  base_price_per_unit_cents: number;
  logo_size: string;
  logo_multiplier: number;
  product_type: string;
  product_multiplier: number;
  product_variant: string;
  variant_multiplier: number;
  technique: string;
  technique_multiplier: number;
  color_count: number;
  color_surcharge_cents: number;
  double_sided: boolean;
  double_sided_surcharge_cents: number;
  quantity_multiplier: number;
  unit_price_cents: number;
  quantity: number;
  total_cents: number;
  size: string | null;
  color: string | null;
}

export interface EstimateDetail {
  estimate_id: string;
  created_at: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_company: string;
  estimate: number;
  total_cents: number;
  currency: string;
  breakdown: EstimateBreakdown;
  meta: Record<string, unknown>;
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

export interface PricingRules {
  base_price_cents: number;
  per_color_surcharge_cents: number;
  double_sided_surcharge_cents: number;
  logo_size_multipliers: Record<string, number>;
  quantity_tiers: Record<string, number>;
  product_type_multipliers: Record<string, number>;
  product_variant_multipliers: Record<string, number>;
  technique_multipliers: Record<string, number>;
  technique_color_logic: Record<string, string>;
}

export interface KBEntry {
  id: string;
  topic: string;
  content: string;
  created_at: string;
  updated_at: string;
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

  // Estimates
  getEstimates: (clientId?: string, limit = 100) =>
    get<{ ok: boolean; count: number; estimates: EstimateSummary[] }>("/api/estimates", {
      ...(clientId ? { client_id: clientId } : {}),
      limit,
    }),

  getEstimate: (estimateId: string) =>
    get<{ ok: boolean; estimate: EstimateDetail }>(`/api/estimates/${estimateId}`),

  // Pricing Rules
  getPricingRules: (clientId = "default") =>
    get<{ ok: boolean; rules: PricingRules }>("/api/pricing-rules", { client_id: clientId }),

  savePricingRules: (clientId = "default", rules: PricingRules) =>
    put<{ ok: boolean; rules: PricingRules }>(`/api/pricing-rules?client_id=${clientId}`, rules),

  // Knowledge Base
  getKB: (clientId = "default") =>
    get<{ ok: boolean; entries: KBEntry[] }>("/api/knowledge", { client_id: clientId }),

  createKBEntry: (clientId = "default", topic: string, content: string) =>
    post<{ ok: boolean; entry: KBEntry }>("/api/knowledge", { topic, content }, { client_id: clientId }),

  updateKBEntry: (clientId = "default", entryId: string, topic: string, content: string) =>
    put<{ ok: boolean; entry: KBEntry }>(`/api/knowledge/${entryId}?client_id=${clientId}`, { topic, content }),

  deleteKBEntry: (clientId = "default", entryId: string) =>
    del<{ ok: boolean }>(`/api/knowledge/${entryId}?client_id=${clientId}`),

  // Clients
  getClients: () => get<{ ok: boolean; clients: Client[] }>("/api/clients"),

  createClient: (payload: Omit<Client, "client_id" | "created_at" | "updated_at">) =>
    post<{ ok: boolean; client: Client }>("/api/clients", payload),

  updateClient: (clientId: string, payload: Omit<Client, "client_id" | "created_at" | "updated_at">) =>
    put<{ ok: boolean; client: Client }>(`/api/clients/${clientId}`, payload),

  deleteClient: (clientId: string) =>
    del<{ ok: boolean; message: string }>(`/api/clients/${clientId}`),
};
