"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { RefreshCw, Search, Trash2, X } from "lucide-react";
import { api, type BriefDetail, type BriefSummary } from "@/lib/api";

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function fullName(brief: Pick<BriefSummary, "nombre" | "apellido">) {
  return [brief.nombre, brief.apellido].filter(Boolean).join(" ").trim();
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-2 border-b border-theme last:border-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">{label}</p>
      <div className="text-sm text-theme mt-1">{value || <span className="text-faint">—</span>}</div>
    </div>
  );
}

function BriefDrawer({
  briefId,
  onClose,
  onDelete,
}: {
  briefId: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [brief, setBrief] = useState<BriefDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.getBrief(briefId)
      .then((res) => setBrief(res.brief))
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, [briefId]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deleteBrief(briefId);
      onDelete(briefId);
      onClose();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/50" />
      <div
        className="w-full max-w-md bg-card border-l border-theme overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-theme px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-faint text-xs font-mono">{briefId}</p>
            <h2 className="text-theme font-bold mt-0.5">Brief Detail</h2>
          </div>
          <div className="flex items-center gap-1">
            {confirmDelete ? (
              <>
                <span className="text-xs text-muted mr-2">Delete this brief?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ backgroundColor: "var(--red-bg)", color: "var(--red)" }}
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted hover:text-theme transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg text-muted hover:text-theme transition-colors"
                title="Delete brief"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-theme transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {loading && <p className="text-faint text-sm p-6">Loading…</p>}

        {brief && (
          <div className="p-6 space-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">Contact</p>
              <div className="bg-input rounded-xl p-4">
                <Field label="Name" value={fullName(brief)} />
                <Field label="Company" value={brief.empresa} />
                <Field label="Role" value={brief.puesto} />
                <Field label="Email" value={brief.email} />
                <Field label="WhatsApp / phone" value={brief.tel} />
                <Field label="Contact preference" value={brief.preferencia_contacto} />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">Project</p>
              <div className="bg-input rounded-xl p-4">
                <Field label="Type" value={brief.tipo} />
                <Field label="Logo / design" value={brief.logo} />
                <Field label="Quantity" value={brief.cantidad} />
                <Field label="Date" value={brief.fecha} />
                <Field label="How they found us" value={brief.como} />
                <Field
                  label="Details"
                  value={<p className="whitespace-pre-wrap leading-relaxed">{brief.contexto}</p>}
                />
                {brief.source_url ? (
                  <Field
                    label="Source"
                    value={
                      <a className="text-accent break-all" href={brief.source_url} target="_blank" rel="noreferrer">
                        {brief.source_url}
                      </a>
                    }
                  />
                ) : null}
              </div>
            </div>

            <p className="text-faint text-xs">Submitted {formatDate(brief.created_at)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BriefsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "admin";
  const clientId = session?.user?.clientId;

  const [briefs, setBriefs] = useState<BriefSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleDeletedBrief(deletedId: string) {
    setBriefs((prev) => prev.filter((b) => b.brief_id !== deletedId));
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.getBriefs(role === "client" ? clientId : undefined);
      setBriefs(res.briefs);
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
  }, [session]);

  const filtered = briefs.filter((brief) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      fullName(brief).toLowerCase().includes(q) ||
      brief.email.toLowerCase().includes(q) ||
      brief.empresa.toLowerCase().includes(q) ||
      brief.brief_id.toLowerCase().includes(q) ||
      brief.contexto.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-theme font-bold tracking-tight">Briefs</h1>
          <p className="text-muted mt-1">Corporate brief form submissions from the website</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-input border border-theme text-muted transition-all duration-150"
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          type="text"
          placeholder="Search by name, email, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-input border border-theme text-theme placeholder:text-faint focus:outline-none text-sm transition-colors"
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "")}
        />
      </div>

      {error && (
        <div
          className="rounded-xl p-4 border mb-5 text-sm"
          style={{ color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }}
        >
          {error}
        </div>
      )}

      {loading && <p className="text-faint">Loading…</p>}

      {!loading && filtered.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📨</p>
          <p className="text-faint">{search ? "No briefs match your search." : "No briefs yet."}</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="bg-card border border-theme rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-theme">
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Date</th>
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Contact</th>
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Project</th>
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((brief) => (
                <tr
                  key={brief.brief_id}
                  onClick={() => setSelectedId(brief.brief_id)}
                  className="border-b border-theme cursor-pointer transition-colors duration-150 last:border-0"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-input)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  <td className="px-5 py-3.5 text-faint text-xs whitespace-nowrap">{formatDate(brief.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-theme text-sm font-medium leading-tight">
                      {fullName(brief) || <span className="text-faint italic">Anonymous</span>}
                    </p>
                    <p className="text-faint text-xs mt-0.5">{brief.email}</p>
                    {brief.empresa && <p className="text-faint text-xs mt-0.5">{brief.empresa}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {brief.tipo && <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-accent-soft text-accent">{brief.tipo}</span>}
                      {brief.logo && <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-accent-soft text-accent">{brief.logo}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted text-sm max-w-md">
                    <p className="truncate">{brief.contexto || "—"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        <p className="text-faint text-xs mt-3">
          {filtered.length} brief{filtered.length !== 1 ? "s" : ""}
          {search && briefs.length !== filtered.length ? ` of ${briefs.length}` : ""}
        </p>
      )}

      {selectedId && (
        <BriefDrawer
          briefId={selectedId}
          onClose={() => setSelectedId(null)}
          onDelete={handleDeletedBrief}
        />
      )}
    </div>
  );
}
