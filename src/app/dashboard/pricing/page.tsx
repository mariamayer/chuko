"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, RotateCcw, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { api, type PricingRules, type PersonalizationRow } from "@/lib/api";

const LABEL = "block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted mb-1.5";
const INPUT = "w-full px-3 py-2 rounded-xl bg-input border border-theme text-theme placeholder:text-faint focus:outline-none transition-colors duration-150 text-sm";
const TIERS = ["qty_50", "qty_100", "qty_200", "qty_500"] as const;
const TIER_LABELS: Record<string, string> = { qty_50: "50+", qty_100: "100+", qty_200: "200+", qty_500: "500+" };

const TECHNIQUE_LABELS: Record<string, string> = {
  serigrafia: "Serigrafía",
  dtf: "DTF",
  bordado: "Bordado",
  grabado: "Grabado",
  "grabado laser": "Grabado Láser",
  tampo: "Tampo",
};

function focusAccent(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--accent-bd)";
}
function blurAccent(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "";
}

function normalizeRules(raw: PricingRules): PricingRules {
  return {
    mode: raw.mode || "shopify_base",
    currency: raw.currency || "ARS",
    min_quantity: raw.min_quantity || 50,
    quantity_tiers: Array.isArray(raw.quantity_tiers) ? raw.quantity_tiers : [50, 100, 200, 500],
    personalization_prices: Array.isArray(raw.personalization_prices) ? raw.personalization_prices : [],
  };
}

// ── Row editor ────────────────────────────────────────────────────────────────

function PriceRow({
  row,
  onChange,
  onRemove,
}: {
  row: PersonalizationRow;
  onChange: (updated: PersonalizationRow) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 1fr 1fr repeat(4, 80px) 32px" }}>
      {/* Technique */}
      <select
        value={row.technique}
        onChange={(e) => onChange({ ...row, technique: e.target.value })}
        className={INPUT}
        onFocus={focusAccent}
        onBlur={blurAccent}
      >
        <option value="">— Técnica —</option>
        <option value="serigrafia">Serigrafía</option>
        <option value="dtf">DTF</option>
        <option value="bordado">Bordado</option>
        <option value="grabado">Grabado</option>
        <option value="grabado laser">Grabado Láser</option>
        <option value="tampo">Tampo</option>
      </select>

      {/* Placement */}
      <input
        type="text"
        value={row.logo_placement}
        onChange={(e) => onChange({ ...row, logo_placement: e.target.value })}
        placeholder="ej. 1 logo"
        className={INPUT}
        onFocus={focusAccent}
        onBlur={blurAccent}
      />

      {/* Colors */}
      <select
        value={row.colors}
        onChange={(e) => onChange({ ...row, colors: e.target.value })}
        className={INPUT}
        onFocus={focusAccent}
        onBlur={blurAccent}
      >
        <option value="">— Colores —</option>
        <option value="1 color">1 color</option>
        <option value="2 colores">2 colores</option>
        <option value="3 colores">3 colores</option>
        <option value="3 colores o más">3 colores o más</option>
        <option value="full color">Full color</option>
        <option value="sin color (grabado)">Sin color (grabado)</option>
      </select>

      {/* Price per tier */}
      {TIERS.map((tier) => (
        <input
          key={tier}
          type="number"
          min="0"
          step="10"
          value={row[tier]}
          onChange={(e) => onChange({ ...row, [tier]: parseInt(e.target.value) || 0 })}
          className={INPUT + " text-center px-1"}
          onFocus={focusAccent}
          onBlur={blurAccent}
        />
      ))}

      {/* Remove */}
      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg text-muted hover:text-red-400 transition-colors"
        title="Eliminar fila"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ── Technique section (collapsible) ──────────────────────────────────────────

function TechniqueSection({
  technique,
  rows,
  allRows,
  onChangeRow,
  onRemoveRow,
}: {
  technique: string;
  rows: PersonalizationRow[];
  allRows: PersonalizationRow[];
  onChangeRow: (idx: number, updated: PersonalizationRow) => void;
  onRemoveRow: (idx: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const label = TECHNIQUE_LABELS[technique] || technique || "Sin técnica";

  return (
    <div className="border border-theme rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-input transition-colors"
      >
        <span className="font-semibold text-theme text-sm">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{rows.length} {rows.length === 1 ? "fila" : "filas"}</span>
          {open ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-2 bg-card">
          {/* Column headers */}
          <div className="grid gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted pt-1"
            style={{ gridTemplateColumns: "1fr 1fr 1fr repeat(4, 80px) 32px" }}>
            <span>Técnica</span>
            <span>Ubicación del logo</span>
            <span>Colores</span>
            {TIERS.map((t) => <span key={t} className="text-center">{TIER_LABELS[t]}</span>)}
            <span />
          </div>

          {rows.map((row) => {
            const globalIdx = allRows.indexOf(row);
            return (
              <PriceRow
                key={globalIdx}
                row={row}
                onChange={(updated) => onChangeRow(globalIdx, updated)}
                onRemove={() => onRemoveRow(globalIdx)}
              />
            );
          })}
        </div>
      )}
    </div>
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

  async function load() {
    setLoading(true);
    try {
      const res = await api.getPricingRules(clientId);
      setRules(normalizeRules(res.rules));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [clientId]);

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
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function updateRow(idx: number, updated: PersonalizationRow) {
    setRules((r) => {
      if (!r) return r;
      const next = [...r.personalization_prices];
      next[idx] = updated;
      return { ...r, personalization_prices: next };
    });
  }

  function removeRow(idx: number) {
    setRules((r) => {
      if (!r) return r;
      const next = r.personalization_prices.filter((_, i) => i !== idx);
      return { ...r, personalization_prices: next };
    });
  }

  function addRow() {
    setRules((r) => {
      if (!r) return r;
      const newRow: PersonalizationRow = {
        technique: "serigrafia",
        logo_placement: "1 logo",
        colors: "1 color",
        qty_50: 0,
        qty_100: 0,
        qty_200: 0,
        qty_500: 0,
      };
      return { ...r, personalization_prices: [...r.personalization_prices, newRow] };
    });
  }

  if (loading) return <div className="p-8 text-faint flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Cargando…</div>;
  if (!rules) return <div className="p-8 text-sm" style={{ color: "var(--red)" }}>{error || "No se pudieron cargar las reglas."}</div>;

  // Group rows by technique for display
  const techniques = Array.from(new Set(rules.personalization_prices.map((r) => r.technique)));
  // Sort: known techniques first, then alphabetical
  const knownOrder = ["serigrafia", "dtf", "bordado", "grabado", "grabado laser", "tampo"];
  techniques.sort((a, b) => {
    const ai = knownOrder.indexOf(a);
    const bi = knownOrder.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-theme font-bold tracking-tight">Precios de personalización</h1>
          <p className="text-muted mt-1 text-sm">
            Costo de personalización por unidad (ARS). El precio base viene de Shopify.
            Total = (precio Shopify + personalización) × cantidad.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2.5 rounded-xl bg-input border border-theme text-muted hover:text-theme transition-all"
            title="Resetear"
          >
            <RotateCcw size={14} />
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
        <div className="mb-5 px-4 py-3 rounded-xl border text-sm"
          style={{ color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }}>
          {error}
        </div>
      )}

      {/* Info banner */}
      <div className="mb-5 px-4 py-3 rounded-xl border text-xs text-muted"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-input)" }}>
        <strong className="text-theme">¿Cómo funciona?</strong>{" "}
        El precio base de cada producto viene directamente de Shopify (precio del variante).
        Acá configurás el costo de personalización por técnica, ubicación y colores para cada rango de cantidad.
        Si no hay fila para una combinación, la estimación muestra <em>Consultar precio</em>.
      </div>

      {/* Technique sections */}
      <div className="space-y-3">
        {techniques.map((tech) => {
          const techRows = rules.personalization_prices.filter((r) => r.technique === tech);
          return (
            <TechniqueSection
              key={tech}
              technique={tech}
              rows={techRows}
              allRows={rules.personalization_prices}
              onChangeRow={updateRow}
              onRemoveRow={removeRow}
            />
          );
        })}

        {/* Uncategorised rows (no technique) */}
        {rules.personalization_prices.some((r) => !r.technique) && (
          <TechniqueSection
            technique=""
            rows={rules.personalization_prices.filter((r) => !r.technique)}
            allRows={rules.personalization_prices}
            onChangeRow={updateRow}
            onRemoveRow={removeRow}
          />
        )}
      </div>

      {/* Add row */}
      <button
        onClick={addRow}
        className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-dashed transition-all hover:border-solid"
        style={{ borderColor: "var(--accent-bd)", color: "var(--accent)" }}
      >
        <Plus size={14} /> Agregar fila
      </button>

      {/* Summary */}
      <p className="mt-6 text-xs text-faint">
        {rules.personalization_prices.length} filas · Moneda: {rules.currency} · Mínimo: {rules.min_quantity} unidades
      </p>
    </div>
  );
}
