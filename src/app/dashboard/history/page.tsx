"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronRight, Filter, RefreshCw } from "lucide-react";
import { api, type AgentRun, type AgentRunDetail } from "@/lib/api";

const AGENT_LABELS: Record<string, string> = {
  performance_digest: "Performance Digest",
  seo_brief: "SEO Brief",
  ad_copy: "Ad Copy",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    success: { color: "var(--lime)", backgroundColor: "var(--lime-bg)", borderColor: "var(--lime-bg)" },
    preview: { color: "var(--accent)", backgroundColor: "var(--accent-bg)", borderColor: "var(--accent-bd)" },
    error: { color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" },
  };
  const style = styles[status] ?? { color: "var(--txt-muted)", backgroundColor: "var(--bg-input)", borderColor: "var(--border)" };
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full border text-xs font-medium"
      style={style}
    >
      {status}
    </span>
  );
}

function RunDrawer({ run, onClose }: { run: AgentRunDetail; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/60" />
      <div
        className="w-full max-w-xl bg-card border-l border-theme overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-faint text-xs font-mono">{run.run_id}</p>
            <h2 className="text-theme font-bold mt-0.5">
              {AGENT_LABELS[run.agent_type] ?? run.agent_type}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-theme text-xl leading-none transition-colors duration-150"
          >
            ×
          </button>
        </div>

        <div className="flex gap-2 items-center text-xs mb-5">
          <StatusBadge status={run.status} />
          <span className="text-faint py-1">{formatDate(run.created_at)}</span>
        </div>

        <div className="bg-input rounded-xl p-4">
          <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">Result payload</p>
          <pre className="text-xs leading-5 overflow-x-auto whitespace-pre-wrap break-words" style={{ color: "var(--lime)" }}>
            {JSON.stringify(run.result, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const clientId = session?.user?.clientId; // undefined for admin = all clients

  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [detail, setDetail] = useState<AgentRunDetail | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.getRuns(clientId, agentFilter || undefined);
      setRuns(res.runs);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentFilter, clientId, session]);

  async function openDetail(runId: string) {
    try {
      const res = await api.getRun(runId);
      setDetail(res.run);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-theme  font-bold tracking-tight">Run History</h1>
          <p className="text-muted  mt-1">Every agent execution logged automatically</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-input border border-theme  text-muted transition-all duration-150"
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5">
        <Filter size={15} className="text-faint" />
        <span className="text-muted ">Agent:</span>
        <div className="flex gap-2">
          {["", "performance_digest", "seo_brief", "ad_copy"].map((type) => (
            <button
              key={type}
              onClick={() => setAgentFilter(type)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border"
              style={
                agentFilter === type
                  ? { backgroundColor: "var(--accent-bg)", borderColor: "var(--accent-bd)", color: "var(--accent)" }
                  : { backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--txt-muted)" }
              }
            >
              {type ? (AGENT_LABELS[type] ?? type) : "All"}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-faint ">Loading…</p>}
      {error && (
        <div
          className="rounded-xl p-4  border mb-5"
          style={{ color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }}
        >
          {error}
        </div>
      )}

      {!loading && runs.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🤖</p>
          <p className="text-faint ">No runs yet. Trigger an agent to see history here.</p>
        </div>
      )}

      {runs.length > 0 && (
        <div className="bg-card border border-theme rounded-2xl overflow-hidden">
          <table className="w-full ">
            <thead>
              <tr className="border-b border-theme">
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Agent</th>
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Client</th>
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Status</th>
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Run at</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.run_id}
                  onClick={() => openDetail(run.run_id)}
                  className="border-b border-theme cursor-pointer transition-colors duration-150"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-input)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  <td className="px-5 py-3.5 text-theme font-medium">
                    {AGENT_LABELS[run.agent_type] ?? run.agent_type}
                  </td>
                  <td className="px-5 py-3.5 text-muted">{run.client_id}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-5 py-3.5 text-faint text-xs">{formatDate(run.created_at)}</td>
                  <td className="px-5 py-3.5 text-faint">
                    <ChevronRight size={15} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && <RunDrawer run={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
