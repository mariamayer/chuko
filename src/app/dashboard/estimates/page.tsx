"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { RefreshCw, Search, X } from "lucide-react";
import { api, type EstimateSummary, type EstimateDetail } from "@/lib/api";

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

function formatCurrency(amount: number | null | undefined, currency = "USD") {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function Badge({ label }: { label: string }) {
  if (!label) return null;
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: "var(--accent-bg)", color: "var(--accent)" }}
    >
      {label}
    </span>
  );
}

function BreakdownRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: "var(--border)" }}>
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs text-theme font-medium">{value}</span>
    </div>
  );
}

function EstimateDrawer({ estimateId, onClose }: { estimateId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<EstimateDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEstimate(estimateId)
      .then((res) => setDetail(res.estimate))
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, [estimateId]);

  const bd = detail?.breakdown;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/50" />
      <div
        className="w-full max-w-md bg-card border-l border-theme overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-theme px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-faint text-xs font-mono">{estimateId}</p>
            <h2 className="text-theme font-bold mt-0.5">Estimate Detail</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-theme transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {loading && <p className="text-faint text-sm p-6">Loading…</p>}

        {detail && (
          <div className="p-6 space-y-6">

            {/* Customer info */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">Customer</p>
              <div className="bg-input rounded-xl p-4 space-y-1.5">
                {detail.client_name && (
                  <p className="text-theme text-sm font-semibold">{detail.client_name}</p>
                )}
                {detail.client_company && (
                  <p className="text-muted text-xs">{detail.client_company}</p>
                )}
                {detail.client_email && (
                  <p className="text-faint text-xs">{detail.client_email}</p>
                )}
                {!detail.client_name && !detail.client_email && (
                  <p className="text-faint text-xs italic">No customer info</p>
                )}
                <p className="text-faint text-xs pt-1">{formatDate(detail.created_at)}</p>
              </div>
            </div>

            {/* Total */}
            <div
              className="rounded-xl p-4 flex items-center justify-between"
              style={{ backgroundColor: "var(--accent-bg)", border: "1px solid var(--accent-bd)" }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                  Total estimate
                </p>
                <p className="text-2xl font-black mt-0.5" style={{ color: "var(--accent)" }}>
                  {formatCurrency(detail.estimate, detail.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Qty: <span className="text-theme font-semibold">{bd?.quantity ?? "—"}</span></p>
                <p className="text-xs text-muted mt-1">
                  Unit: <span className="text-theme font-semibold">{formatCurrency((bd?.unit_price_cents ?? 0) / 100, detail.currency)}</span>
                </p>
              </div>
            </div>

            {/* Product info */}
            {bd && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">Product</p>
                <div className="bg-input rounded-xl p-4">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {bd.product_type && <Badge label={bd.product_type} />}
                    {bd.product_variant && <Badge label={bd.product_variant} />}
                    {bd.technique && <Badge label={bd.technique} />}
                    {bd.logo_size && <Badge label={`logo: ${bd.logo_size}`} />}
                  </div>
                  <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                    <BreakdownRow label="Base price / unit" value={formatCurrency(bd.base_price_per_unit_cents / 100, detail.currency)} />
                    <BreakdownRow label="Product multiplier" value={`×${bd.product_multiplier.toFixed(2)}`} />
                    {bd.variant_multiplier !== 1 && (
                      <BreakdownRow label="Variant multiplier" value={`×${bd.variant_multiplier.toFixed(2)}`} />
                    )}
                    <BreakdownRow label="Technique multiplier" value={`×${bd.technique_multiplier.toFixed(2)}`} />
                    <BreakdownRow label="Logo multiplier" value={`×${bd.logo_multiplier.toFixed(2)}`} />
                    {bd.color_surcharge_cents > 0 && (
                      <BreakdownRow
                        label={`Color surcharge (${bd.color_count} colors)`}
                        value={`+${formatCurrency(bd.color_surcharge_cents / 100, detail.currency)}`}
                      />
                    )}
                    {bd.double_sided && (
                      <BreakdownRow
                        label="Double-sided fee"
                        value={`+${formatCurrency(bd.double_sided_surcharge_cents / 100, detail.currency)}`}
                      />
                    )}
                    <BreakdownRow label="Quantity discount" value={`×${bd.quantity_multiplier.toFixed(2)}`} />
                    <BreakdownRow
                      label={<span className="font-semibold text-theme">Unit price (after discount)</span>}
                      value={<span className="font-bold text-theme">{formatCurrency(bd.unit_price_cents / 100, detail.currency)}</span>}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Size / color from order */}
            {(bd?.size || bd?.color) && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">Order details</p>
                <div className="bg-input rounded-xl p-4 space-y-1.5">
                  {bd.size && <p className="text-xs text-muted">Size: <span className="text-theme">{bd.size}</span></p>}
                  {bd.color && <p className="text-xs text-muted">Color: <span className="text-theme">{bd.color}</span></p>}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default function EstimatesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "admin";
  const clientId = session?.user?.clientId;

  const [estimates, setEstimates] = useState<EstimateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      // admin sees all, client sees only their own
      const res = await api.getEstimates(role === "client" ? clientId : undefined);
      setEstimates(res.estimates);
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

  const filtered = estimates.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.client_name.toLowerCase().includes(q) ||
      e.client_email.toLowerCase().includes(q) ||
      e.client_company.toLowerCase().includes(q) ||
      e.estimate_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-theme font-bold tracking-tight">Estimates</h1>
          <p className="text-muted mt-1">All price quotes submitted by customers</p>
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

      {/* Search */}
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
        <div className="rounded-xl p-4 border mb-5 text-sm"
          style={{ color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }}>
          {error}
        </div>
      )}

      {loading && <p className="text-faint">Loading…</p>}

      {!loading && filtered.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-faint">
            {search ? "No estimates match your search." : "No estimates yet."}
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="bg-card border border-theme rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-theme">
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Date</th>
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Customer</th>
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Product</th>
                <th className="text-left text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Qty</th>
                <th className="text-right text-muted font-medium text-xs uppercase tracking-wider px-5 py-3.5">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((est) => (
                <tr
                  key={est.estimate_id}
                  onClick={() => setSelectedId(est.estimate_id)}
                  className="border-b border-theme cursor-pointer transition-colors duration-150 last:border-0"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-input)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  <td className="px-5 py-3.5 text-faint text-xs whitespace-nowrap">
                    {formatDate(est.created_at)}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-theme text-sm font-medium leading-tight">
                      {est.client_name || <span className="text-faint italic">Anonymous</span>}
                    </p>
                    {est.client_company && (
                      <p className="text-faint text-xs mt-0.5">{est.client_company}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {est.product_type && <Badge label={est.product_type} />}
                      {est.product_variant && <Badge label={est.product_variant} />}
                      {est.technique && <Badge label={est.technique} />}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted text-sm">
                    {est.quantity ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-theme font-semibold text-sm">
                      {formatCurrency(est.estimate, est.currency)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        <p className="text-faint text-xs mt-3">
          {filtered.length} estimate{filtered.length !== 1 ? "s" : ""}
          {search && estimates.length !== filtered.length ? ` of ${estimates.length}` : ""}
        </p>
      )}

      {selectedId && (
        <EstimateDrawer estimateId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
