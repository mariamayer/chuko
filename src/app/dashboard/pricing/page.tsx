"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Save, Loader2, RotateCcw, Plus, Trash2, Filter } from "lucide-react";
import { useSession } from "next-auth/react";
import { api, type PricingRules, type PersonalizationRow } from "@/lib/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const PRODUCTS   = ["remera", "buzo", "campera", "gorra", "piluso", "totebag", "botella", "bolígrafo", "llavero", "otro"];
const TECHNIQUES = ["serigrafia", "dtf", "dtg", "bordado", "grabado", "grabado laser", "tampo"];
const VARIANTS   = ["standard", "negra", "plástico", "metal/vidrio", "otro"];
const PLACEMENTS = [
  "1 logo",
  "2 logos",
  "2 logos frente+espalda",
  "diseño 25x35",
  "diseño 30x40",
  "diseño grande",
  "360°",
  "otro",
];
const COLORS = ["1", "2", "3+", "full"];
const QTY_COLS: Array<{ key: keyof PersonalizationRow; label: string }> = [
  { key: "qty_50",  label: "50 u" },
  { key: "qty_100", label: "100 u" },
  { key: "qty_200", label: "200 u" },
  { key: "qty_500", label: "500 u" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function newRow(): PersonalizationRow {
  return {
    id: `new_${Date.now()}`,
    product: "remera",
    technique: "serigrafia",
    variant: "standard",
    placement: "1 logo",
    colors: "1",
    qty_50: null,
    qty_100: null,
    qty_200: null,
    qty_500: null,
  };
}

function normalizeRules(raw: Partial<PricingRules>): PricingRules {
  return {
    mode: raw.mode || "additive",
    currency: raw.currency || "ARS",
    quantity_tiers: raw.quantity_tiers ?? [50, 100, 200, 500],
    personalization_prices: (raw.personalization_prices ?? []).map((r, i) => ({
      ...r,
      id: r.id || `row_${i}`,
    })),
  };
}

// ── CSS shortcuts ─────────────────────────────────────────────────────────────
const INPUT =
  "w-full px-2 py-1.5 rounded-lg bg-input border border-theme text-theme placeholder:text-faint focus:outline-none text-xs transition-colors";
const PRICE_INPUT =
  "w-full px-1.5 py-1.5 rounded-lg bg-input border border-theme text-theme text-center placeholder:text-faint focus:outline-none text-xs transition-colors";

function focusAccent(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "var(--accent-bd)";
}
function blurAccent(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "";
}

// ── SelectOrCustom — dropdown with "otro" that reveals a text input ───────────
function SelectOrCustom({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const isKnown = options.includes(value);
  const [custom, setCustom] = useState(!isKnown);

  if (custom) {
    return (
      <div className="flex gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT + " flex-1"}
          autoFocus
          onFocus={focusAccent}
          onBlur={blurAccent}
        />
        <button
          onClick={() => { setCustom(false); onChange(options[0]); }}
          className="text-faint hover:text-muted px-1"
          title="Volver a lista"
        >↩</button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === "otro") { setCustom(true); onChange(""); }
        else onChange(e.target.value);
      }}
      className={INPUT}
      onFocus={focusAccent}
      onBlur={blurAccent}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o === "otro" ? "✏ otro…" : o}
        </option>
      ))}
      {/* show current value even if not in the list */}
      {!options.includes(value) && <option value={value}>{value}</option>}
    </select>
  );
}

// ── Editable cell ─────────────────────────────────────────────────────────────
function PriceCell({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      step={50}
      value={value ?? ""}
      placeholder="—"
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? null : Math.round(parseFloat(v)));
      }}
      className={PRICE_INPUT}
      onFocus={focusAccent}
      onBlur={blurAccent}
    />
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const { data: session } = useSession();
  const clientId = session?.user?.clientId ?? "default";

  const [rules, setRules] = useState<PricingRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [filterTech, setFilterTech] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const tableRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getPricingRules(clientId);
      setRules(normalizeRules(res.rules));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!rules) return;
    setSaving(true);
    setError("");
    try {
      const res = await api.savePricingRules(clientId, rules);
      setRules(normalizeRules(res.rules));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function updateRow(id: string, field: keyof PersonalizationRow, value: unknown) {
    setRules((r) => {
      if (!r) return r;
      return {
        ...r,
        personalization_prices: r.personalization_prices.map((row) =>
          row.id === id ? { ...row, [field]: value } : row
        ),
      };
    });
  }

  function removeRow(id: string) {
    setRules((r) => {
      if (!r) return r;
      return {
        ...r,
        personalization_prices: r.personalization_prices.filter((row) => row.id !== id),
      };
    });
  }

  function addRow() {
    const row = newRow();
    setRules((r) => {
      if (!r) return r;
      return { ...r, personalization_prices: [...r.personalization_prices, row] };
    });
    setTimeout(() => {
      tableRef.current?.scrollTo({ top: tableRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }

  if (loading)
    return (
      <div className="p-8 text-faint flex items-center gap-2">
        <Loader2 size={16} className="animate-spin" /> Cargando precios…
      </div>
    );
  if (!rules)
    return (
      <div className="p-8 text-sm" style={{ color: "var(--red)" }}>
        {error || "No se pudieron cargar las reglas."}
      </div>
    );

  const products = ["all", ...Array.from(new Set(rules.personalization_prices.map((r) => r.product))).sort()];
  const techniques = ["all", ...Array.from(new Set(rules.personalization_prices.map((r) => r.technique))).sort()];

  const filtered = rules.personalization_prices.filter((r) => {
    if (filterTech !== "all" && r.technique !== filterTech) return false;
    if (filterProduct !== "all" && r.product !== filterProduct) return false;
    return true;
  });

  return (
    <div className="p-6 flex flex-col h-full" style={{ maxHeight: "calc(100vh - 56px)" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-theme font-bold tracking-tight">Precios de personalización</h1>
          <p className="text-muted mt-0.5 text-sm">
            Costo adicional por unidad según técnica, producto y cantidad. Se suma al precio base de Shopify.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2.5 rounded-xl bg-input border border-theme text-muted hover:text-theme transition-all"
            title="Recargar"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border border-dashed transition-all hover:border-solid"
            style={{ borderColor: "var(--accent-bd)", color: "var(--accent)" }}
          >
            <Plus size={14} /> Agregar fila
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50"
            style={{ backgroundColor: saved ? "var(--lime)" : "var(--accent)", color: "#000" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? "Guardado ✓" : saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="mb-3 px-4 py-3 rounded-xl border text-sm flex-shrink-0"
          style={{ color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }}
        >
          {error}
        </div>
      )}

      {/* Formula callout */}
      <div
        className="mb-3 px-4 py-2.5 rounded-xl border text-xs text-muted font-mono flex-shrink-0"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-input)" }}
      >
        total = (precio_shopify + personalización_por_unidad) × cantidad
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <Filter size={12} className="text-muted" />
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="px-2 py-1.5 rounded-lg bg-input border border-theme text-xs text-theme focus:outline-none"
          onFocus={focusAccent}
          onBlur={blurAccent}
        >
          {products.map((p) => (
            <option key={p} value={p}>{p === "all" ? "Todos los productos" : p}</option>
          ))}
        </select>
        <select
          value={filterTech}
          onChange={(e) => setFilterTech(e.target.value)}
          className="px-2 py-1.5 rounded-lg bg-input border border-theme text-xs text-theme focus:outline-none"
          onFocus={focusAccent}
          onBlur={blurAccent}
        >
          {techniques.map((t) => (
            <option key={t} value={t}>{t === "all" ? "Todas las técnicas" : t}</option>
          ))}
        </select>
        <span className="text-xs text-faint ml-1">
          {filtered.length} de {rules.personalization_prices.length} filas
        </span>
      </div>

      {/* Table */}
      <div ref={tableRef} className="flex-1 overflow-auto rounded-2xl border border-theme">
        <table className="w-full border-collapse text-xs" style={{ minWidth: 900 }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-input)" }}>
              {[
                ["Producto",   "w-24"],
                ["Técnica",    "w-28"],
                ["Variante",   "w-24"],
                ["Ubicación",  "w-36"],
                ["Colores",    "w-20"],
                ["50 u",       "w-20 text-center"],
                ["100 u",      "w-20 text-center"],
                ["200 u",      "w-20 text-center"],
                ["500 u",      "w-20 text-center"],
                ["",           "w-8"],
              ].map(([label, cls], i) => (
                <th
                  key={i}
                  className={`px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted border-b border-theme sticky top-0 ${cls}`}
                  style={{ backgroundColor: "var(--bg-input)" }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr
                key={row.id}
                className="transition-colors"
                style={{ backgroundColor: idx % 2 === 0 ? "var(--card)" : "var(--bg-input)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--hover)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    idx % 2 === 0 ? "var(--card)" : "var(--bg-input)")
                }
              >
                {/* Product */}
                <td className="px-2 py-1.5 border-b border-theme">
                  <SelectOrCustom
                    value={row.product}
                    options={PRODUCTS}
                    onChange={(v) => updateRow(row.id!, "product", v)}
                  />
                </td>
                {/* Technique */}
                <td className="px-2 py-1.5 border-b border-theme">
                  <select
                    value={row.technique}
                    onChange={(e) => updateRow(row.id!, "technique", e.target.value)}
                    className={INPUT}
                    onFocus={focusAccent}
                    onBlur={blurAccent}
                  >
                    {TECHNIQUES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                {/* Variant */}
                <td className="px-2 py-1.5 border-b border-theme">
                  <SelectOrCustom
                    value={row.variant}
                    options={VARIANTS}
                    onChange={(v) => updateRow(row.id!, "variant", v)}
                  />
                </td>
                {/* Placement */}
                <td className="px-2 py-1.5 border-b border-theme">
                  <SelectOrCustom
                    value={row.placement}
                    options={PLACEMENTS}
                    onChange={(v) => updateRow(row.id!, "placement", v)}
                  />
                </td>
                {/* Colors */}
                <td className="px-2 py-1.5 border-b border-theme">
                  <select
                    value={row.colors}
                    onChange={(e) => updateRow(row.id!, "colors", e.target.value)}
                    className={INPUT}
                    onFocus={focusAccent}
                    onBlur={blurAccent}
                  >
                    {COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c === "full" ? "full color" : `${c} color${c === "1" ? "" : "es"}`}
                      </option>
                    ))}
                  </select>
                </td>
                {/* Qty price cells */}
                {QTY_COLS.map(({ key }) => (
                  <td key={key} className="px-1.5 py-1.5 border-b border-theme">
                    <PriceCell
                      value={row[key] as number | null}
                      onChange={(v) => updateRow(row.id!, key, v)}
                    />
                  </td>
                ))}
                {/* Delete */}
                <td className="px-2 py-1.5 border-b border-theme text-center">
                  <button
                    onClick={() => removeRow(row.id!)}
                    className="p-1 rounded text-muted hover:text-red-400 transition-colors"
                    title="Eliminar fila"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-faint text-sm">
                  Sin filas para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p className="mt-2 text-[11px] text-faint flex-shrink-0">
        <strong>Variante:</strong>{" "}
        <code className="text-muted">standard</code> = todos los colores claros ·{" "}
        <code className="text-muted">negra</code> = prendas oscuras · Dejá vacío (—) si no ofrecés ese
        precio para esa cantidad.
        <span className="ml-2">Moneda: {rules.currency}</span>
      </p>
    </div>
  );
}
