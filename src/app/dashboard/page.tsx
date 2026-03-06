"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, FileText, Euro, Users, Loader2 } from "lucide-react";
import { api, type Digest } from "@/lib/api";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="bg-card border border-theme rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-muted ">{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: accent ? "var(--accent-bg)" : "var(--bg-input)",
            color: accent ? "var(--accent)" : "var(--txt-muted)",
          }}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="text-theme  font-bold">{value}</p>
      {sub && <p className="text-faint text-xs mt-1">{sub}</p>}
    </div>
  );
}

function TrendBadge({ trend }: { trend: string }) {
  if (trend === "up")
    return (
      <span
        className="inline-flex items-center gap-1.5  font-medium"
        style={{ color: "var(--lime)" }}
      >
        <TrendingUp size={15} /> Up this week
      </span>
    );
  if (trend === "down")
    return (
      <span className="inline-flex items-center gap-1.5  font-medium" style={{ color: "var(--red)" }}>
        <TrendingDown size={15} /> Down this week
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5  font-medium text-muted">
      <Minus size={15} /> Stable
    </span>
  );
}

export default function OverviewPage() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    // Load metrics without triggering an OpenAI call
    api
      .getDigest(4, "default", true)
      .then((r) => setDigest(r.digest))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function generateAiSummary() {
    if (!digest) return;
    setAiLoading(true);
    setAiError("");
    try {
      const r = await api.getDigest(digest.period_weeks, "default", false);
      setDigest(r.digest);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "Failed to generate summary");
    } finally {
      setAiLoading(false);
    }
  }

  const chartData = digest
    ? Object.entries(digest.weekly_breakdown).map(([week, data]) => ({
        week: week.replace(/\d{4}-/, ""),
        estimates: data.count,
        value: data.total_value,
      }))
    : [];

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-theme  font-bold tracking-tight">Overview</h1>
        <p className="text-muted  mt-1">Performance metrics from your estimate pipeline</p>
      </div>

      {loading && (
        <div className="text-faint ">Loading metrics…</div>
      )}

      {error && (
        <div
          className="rounded-xl p-4  border"
          style={{ color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }}
        >
          {error}
        </div>
      )}

      {digest && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total estimates"
              value={String(digest.total_estimates)}
              sub={`Last ${digest.period_weeks} weeks`}
              icon={FileText}
              accent
            />
            <StatCard
              label="Pipeline value"
              value={`€${digest.total_value_eur.toLocaleString("en", { minimumFractionDigits: 0 })}`}
              sub="Potential revenue"
              icon={Euro}
            />
            <StatCard
              label="Avg estimate"
              value={`€${digest.avg_estimate_eur.toLocaleString("en", { minimumFractionDigits: 0 })}`}
              sub="Per request"
              icon={Users}
            />
            <div className="bg-card border border-theme rounded-2xl p-5 flex flex-col justify-between">
              <span className="text-muted ">Trend</span>
              <div className="mt-3">
                <TrendBadge trend={digest.trend} />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
            <div className="bg-card border border-theme rounded-2xl p-5">
              <h2 className="text-theme font-semibold  mb-4">Estimate requests per week</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fill: "var(--txt-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--txt-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--txt)",
                    }}
                  />
                  <Bar dataKey="estimates" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-theme rounded-2xl p-5">
              <h2 className="text-theme font-semibold  mb-4">Pipeline value per week (€)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fill: "var(--txt-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--txt-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--txt)",
                    }}
                    formatter={(v: number) => [`€${v.toFixed(2)}`, "Value"]}
                  />
                  <Bar dataKey="value" fill="var(--lime)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-card border border-theme rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ backgroundColor: "var(--accent-bg)", color: "var(--accent)" }}
                >
                  ✦
                </div>
                <h2 className="text-theme font-semibold ">AI Analysis</h2>
              </div>
              {!digest.ai_summary && (
                <button
                  onClick={generateAiSummary}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 disabled:opacity-50"
                  style={{ backgroundColor: "var(--accent)", color: "#000" }}
                  onMouseEnter={(e) => { if (!aiLoading) e.currentTarget.style.backgroundColor = "var(--accent-h)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--accent)"; }}
                >
                  {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <span>✦</span>}
                  Generate
                </button>
              )}
              {digest.ai_summary && (
                <span className="text-faint text-xs">{digest.generated_at}</span>
              )}
            </div>

            {aiError && (
              <p className="text-xs mb-3" style={{ color: "var(--red)" }}>{aiError}</p>
            )}

            {digest.ai_summary ? (
              <p className="text-muted  leading-7">{digest.ai_summary}</p>
            ) : (
              !aiLoading && (
                <p className="text-faint  italic">
                  Click Generate to get an AI-written summary with recommendations.
                </p>
              )
            )}

            {aiLoading && (
              <p className="text-muted  italic">Generating summary…</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
