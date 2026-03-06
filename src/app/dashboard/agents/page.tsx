"use client";

import { useState } from "react";
import { BarChart2, Search, Megaphone, Mail, RefreshCw, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

interface RunResult {
  status: Status;
  message?: string;
  data?: unknown;
}

function AgentCard({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  actions: { label: string; run: () => Promise<unknown>; icon?: React.ElementType }[];
}) {
  const [results, setResults] = useState<Record<string, RunResult>>({});

  async function trigger(label: string, run: () => Promise<unknown>) {
    setResults((prev) => ({ ...prev, [label]: { status: "loading" } }));
    try {
      const data = await run();
      setResults((prev) => ({
        ...prev,
        [label]: { status: "success", message: "Completed successfully", data },
      }));
    } catch (e: unknown) {
      setResults((prev) => ({
        ...prev,
        [label]: { status: "error", message: e instanceof Error ? e.message : "Unknown error" },
      }));
    }
  }

  return (
    <div className="bg-card border border-theme rounded-2xl p-6">
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--accent-bg)", color: "var(--accent)" }}
        >
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-theme font-semibold">{title}</h3>
          <p className="text-muted  mt-0.5">{description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map(({ label, run, icon: ActionIcon }) => {
          const r = results[label];
          const isLoading = r?.status === "loading";
          return (
            <div key={label}>
              <button
                onClick={() => trigger(label, run)}
                disabled={isLoading}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-input border border-theme  font-medium text-theme transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.borderColor = "var(--accent-bd)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; }}
              >
                <span className="flex items-center gap-2 text-muted">
                  {ActionIcon && <ActionIcon size={15} />}
                  {label}
                </span>
                {isLoading && <Loader2 size={15} className="animate-spin text-muted" />}
              </button>

              {r && r.status !== "loading" && r.status !== "idle" && (
                <div
                  className="mt-2 px-3 py-2 rounded-lg text-xs flex items-start gap-2 border"
                  style={
                    r.status === "success"
                      ? { color: "var(--lime)", backgroundColor: "var(--lime-bg)", borderColor: "var(--lime-bg)" }
                      : { color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }
                  }
                >
                  {r.status === "success"
                    ? <CheckCircle size={13} className="mt-0.5 flex-shrink-0" />
                    : <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />}
                  <span>{r.message}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [handle, setHandle] = useState("");

  const agents = [
    {
      title: "Weekly Performance Digest",
      description: "Analyses your estimate pipeline and emails a plain-English summary with AI recommendations.",
      icon: BarChart2,
      actions: [
        {
          label: "Send digest email",
          icon: Mail,
          run: () => api.runDigest(),
        },
      ],
    },
    {
      title: "SEO Content Brief",
      description: "Generates keyword targets, meta tags, H1 options, content sections and FAQs for each product.",
      icon: Search,
      actions: [
        {
          label: "Generate briefs for all products",
          icon: RefreshCw,
          run: () => api.generateAllSeoBriefs(),
        },
      ],
    },
    {
      title: "Ad Copy Refresh",
      description: "Creates 3 Meta + 2 Google ad variations per product using demand data from your estimate history.",
      icon: Megaphone,
      actions: [
        {
          label: "Refresh copy for all products",
          icon: RefreshCw,
          run: () => api.refreshAllAdCopy(),
        },
      ],
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-theme  font-bold tracking-tight">Agents</h1>
        <p className="text-muted  mt-1">Run AI agents manually or target a specific product</p>
      </div>

      {/* Per-product handle input */}
      <div className="bg-card border border-theme rounded-2xl p-5 mb-6">
        <h2 className="text-theme font-semibold  mb-3">Target a specific product</h2>
        <div className="flex gap-3">
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="Shopify product handle (e.g. camiseta-personalizada)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-input border border-theme text-theme  placeholder:text-faint focus:outline-none transition-colors duration-150"
            style={{ fontFamily: "inherit" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "")}
          />
        </div>
        {handle && (
          <div className="mt-3 flex flex-wrap gap-2">
            <SingleProductButton
              label="SEO Brief"
              run={() => api.generateSeoBrief(handle)}
              icon={Search}
            />
            <SingleProductButton
              label="Ad Copy"
              run={() => api.generateAdCopy(handle)}
              icon={Megaphone}
            />
          </div>
        )}
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.title} {...agent} />
        ))}
      </div>
    </div>
  );
}

function SingleProductButton({
  label,
  run,
  icon: Icon,
}: {
  label: string;
  run: () => Promise<unknown>;
  icon: React.ElementType;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");

  async function trigger() {
    setStatus("loading");
    try {
      await run();
      setStatus("success");
      setMsg("Done!");
    } catch (e: unknown) {
      setStatus("error");
      setMsg(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={trigger}
        disabled={status === "loading"}
        className="flex items-center gap-2 px-4 py-2 rounded-xl  font-medium transition-all duration-150 disabled:opacity-50"
        style={{ backgroundColor: "var(--accent)", color: "#000" }}
        onMouseEnter={(e) => { if (status !== "loading") e.currentTarget.style.backgroundColor = "var(--accent-h)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--accent)"; }}
      >
        {status === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
        {label}
      </button>
      {msg && (
        <span
          className="text-xs"
          style={{ color: status === "success" ? "var(--lime)" : "var(--red)" }}
        >
          {msg}
        </span>
      )}
    </div>
  );
}
