"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, X, Save, Loader2, BookOpen } from "lucide-react";
import { api, type KBEntry } from "@/lib/api";

type Mode = "list" | "add" | "edit";

export default function KnowledgePage() {
  const { data: session } = useSession();
  const clientId = session?.user?.clientId ?? "default";

  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<KBEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.getKB(clientId);
      setEntries(res.entries);
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
  }, [clientId, session]);

  function openAdd() {
    setTopic("");
    setContent("");
    setFormError("");
    setEditing(null);
    setMode("add");
  }

  function openEdit(entry: KBEntry) {
    setTopic(entry.topic);
    setContent(entry.content);
    setFormError("");
    setEditing(entry);
    setMode("edit");
  }

  function cancel() {
    setMode("list");
    setEditing(null);
    setFormError("");
  }

  async function save() {
    if (!topic.trim() || !content.trim()) {
      setFormError("Both topic and content are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (mode === "add") {
        await api.createKBEntry(clientId, topic.trim(), content.trim());
      } else if (mode === "edit" && editing) {
        await api.updateKBEntry(clientId, editing.id, topic.trim(), content.trim());
      }
      await load();
      cancel();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function remove(entry: KBEntry) {
    if (!confirm(`Delete "${entry.topic}"?`)) return;
    try {
      await api.deleteKBEntry(clientId, entry.id);
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    } catch {
      /* ignore */
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-input border border-theme text-theme placeholder:text-faint focus:outline-none transition-colors duration-150";

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-theme font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted mt-1">
            Content injected into the chatbot — FAQs, policies, product info.
          </p>
        </div>
        {mode === "list" && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-150"
            style={{ backgroundColor: "var(--accent)", color: "#000" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-h)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
          >
            <Plus size={15} />
            Add entry
          </button>
        )}
      </div>

      {/* ── Form (add / edit) ───────────────────────────────────────────── */}
      {mode !== "list" && (
        <div className="bg-card border border-theme rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-theme font-semibold">
              {mode === "add" ? "New entry" : "Edit entry"}
            </h2>
            <button onClick={cancel} className="text-muted hover:text-theme transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Return Policy, Minimum order, Delivery times…"
                className={inputClass}
                style={{ fontFamily: "inherit" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "")}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the answer, policy text, product details… The chatbot will use this verbatim."
                rows={6}
                className={inputClass}
                style={{ fontFamily: "inherit", resize: "vertical" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "")}
              />
              <p className="text-faint text-xs mt-1.5">{content.length} / 4000 characters</p>
            </div>

            {formError && (
              <p
                className="text-xs px-4 py-3 rounded-xl border"
                style={{ color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }}
              >
                {formError}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "#000" }}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "var(--accent-h)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--accent)"; }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={cancel}
                className="px-5 py-2.5 rounded-xl font-semibold bg-input border border-theme text-muted hover:text-theme transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-xl p-4 border mb-5"
          style={{ color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }}
        >
          {error}
        </div>
      )}

      {/* ── List ────────────────────────────────────────────────────────── */}
      {loading && <p className="text-faint">Loading…</p>}

      {!loading && entries.length === 0 && !error && (
        <div className="text-center py-20 bg-card border border-theme rounded-2xl">
          <div
            className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4"
            style={{ backgroundColor: "var(--accent-bg)", color: "var(--accent)" }}
          >
            <BookOpen size={24} />
          </div>
          <p className="text-theme font-semibold mb-1">No entries yet</p>
          <p className="text-faint text-sm">
            Add FAQs, policies, or product info — the chatbot will use them to answer questions.
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-card border border-theme rounded-2xl p-5 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                    <h3 className="text-theme font-semibold truncate">{entry.topic}</h3>
                  </div>
                  <p className="text-muted text-sm leading-6 whitespace-pre-wrap line-clamp-3">
                    {entry.content}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={() => openEdit(entry)}
                    className="p-2 rounded-lg hover:bg-input transition-colors duration-150 text-muted hover:text-theme"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(entry)}
                    className="p-2 rounded-lg hover:bg-input transition-colors duration-150"
                    style={{ color: "var(--txt-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--txt-muted)")}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
