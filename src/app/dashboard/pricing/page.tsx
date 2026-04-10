"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, RotateCcw, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { api, type PricingRules } from "@/lib/api";

const LABEL = "block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted mb-1.5";
const INPUT = "w-full px-3 py-2 rounded-xl bg-input border border-theme text-theme placeholder:text-faint focus:outline-none transition-colors duration-150 text-sm";
const SECTION = "rounded-2xl border border-theme bg-card p-5 mb-4";
const SECTION_TITLE = "font-semibold text-theme text-sm mb-4";

const TECHNIQUE_KEYS = ["serigrafia", "dtf", "dtg", "bordado", "grabado", "grabado laser", "tampo"];
const COLOR_LOGIC_OPTIONS = [
  { value: "charge_per_color", label: "Cobrar por color" },
  { value: "ignore_colors",    label: "Precio fijo (ignorar colores)" },
];

function focusAccent(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "var(--accent-bd)";
}
function blurAccent(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "";
}

function NumInput({
  label,
  value,
  onChange,
  step = 0.01,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={INPUT}
        onFocus={focusAccent}
        onBlur={blurAccent}
      />
    </div>
  );
}

function normalizeRules(raw: Partial<PricingRules>): PricingRules {
  return {
    mode: raw.mode || "multiplier",
    currency: raw.currency || "ARS",
    per_color_surcharge_cents: raw.per_color_surcharge_cents ?? 0,
    double_sided_surcharge_cents: raw.double_sided_surcharge_cents ?? 0,
    logo_size_multipliers: raw.logo_size_multipliers ?? { small: 0.95, medium: 1.2, large: 1.3, full: 2.0 },
    quantity_tiers: raw.quantity_tiers ?? { "15": 1.0, "30": 0.97, "50": 0.93, "100": 0.88, "250": 0.83, "500": 0.78 },
    product_type_multipliers: raw.product_type_multipliers ?? {},
    product_variant_multipliers: raw.product_variant_multipliers ?? {},
    technique_multipliers: raw.technique_multipliers ?? {},
    technique_color_logic: raw.technique_color_logic ?? {},
  };
}

// ── Multiplier table row ───────────────────────────────────────────────────────

function MultRow({
  label,
  value,
  onChange,
  onRemove,
  labelEditable,
  onLabelChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  onRemove?: () => void;
  labelEditable?: boolean;
  onLabelChange?: (l: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {labelEditable ? (
        <input
          type="text"
          value={label}
          onChange={(e) => onLabelChange?.(e.target.value)}
          className={INPUT + " flex-1"}
          placeholder="nombre"
          onFocus={focusAccent}
          onBlur={blurAccent}
        />
      ) : (
        <span className="flex-1 text-sm text-theme capitalize">{label}</span>
      )}
      <input
        type="number"
        min={0}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={INPUT + " w-28 text-center"}
        onFocus={focusAccent}
        onBlur={blurAccent}
      />
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-muted hover:text-red-400 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={14} />
        </button>
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

  function setMult(section: keyof PricingRules, key: string, value: number) {
    setRules((r) => {
      if (!r) return r;
      return { ...r, [section]: { ...(r[section] as Record<string, number>), [key]: value } };
    });
  }

  function removeKey(section: keyof PricingRules, key: string) {
    setRules((r) => {
      if (!r) return r;
      const next = { ...(r[section] as Record<string, unknown>) };
      delete next[key];
      return { ...r, [section]: next };
    });
  }

  function renameKey(section: keyof PricingRules, oldKey: string, newKey: string) {
    setRules((r) => {
      if (!r) return r;
      const src = r[section] as Record<string, unknown>;
      const next: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(src)) {
        next[k === oldKey ? newKey : k] = v;
      }
      return { ...r, [section]: next };
    });
  }

  function addKey(section: keyof PricingRules, key: string, defaultVal: number) {
    setRules((r) => {
      if (!r) return r;
      return { ...r, [section]: { ...(r[section] as Record<string, number>), [key]: defaultVal } };
    });
  }

  if (loading) return <div className="p-8 text-faint flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Cargando…</div>;
  if (!rules) return <div className="p-8 text-sm" style={{ color: "var(--red)" }}>{error || "No se pudieron cargar las reglas."}</div>;

  const logoSizeKeys = ["small", "medium", "large", "full"];

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-theme font-bold tracking-tight">Precios y multiplicadores</h1>
          <p className="text-muted mt-1 text-sm">
            El precio base viene de Shopify. Los multiplicadores ajustan el total final.
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

      {/* Formula info */}
      <div className="mb-5 px-4 py-3 rounded-xl border text-xs text-muted font-mono"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-input)" }}>
        total = (precio_shopify × logo × técnica × variante × tipo_producto + recargo_color + recargo_doble_cara) × descuento_cantidad × cantidad
      </div>

      {/* Surcharges */}
      <div className={SECTION}>
        <p className={SECTION_TITLE}>Recargos adicionales</p>
        <div className="grid grid-cols-2 gap-4">
          <NumInput
            label="Recargo por color extra (centavos ARS)"
            value={rules.per_color_surcharge_cents}
            onChange={(v) => setRules((r) => r ? { ...r, per_color_surcharge_cents: v } : r)}
            step={100}
          />
          <NumInput
            label="Recargo doble cara (centavos ARS)"
            value={rules.double_sided_surcharge_cents}
            onChange={(v) => setRules((r) => r ? { ...r, double_sided_surcharge_cents: v } : r)}
            step={100}
          />
        </div>
        <p className="mt-2 text-xs text-faint">
          Los recargos se dividen por 100 para convertir a pesos. Ej: 20000 centavos = $200 ARS por color extra.
        </p>
      </div>

      {/* Logo size multipliers */}
      <div className={SECTION}>
        <p className={SECTION_TITLE}>Multiplicadores por tamaño de logo</p>
        <div className="space-y-2">
          {logoSizeKeys.map((k) => (
            <MultRow
              key={k}
              label={k}
              value={(rules.logo_size_multipliers[k] as number) ?? 1.0}
              onChange={(v) => setMult("logo_size_multipliers", k, v)}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-faint">
          Pequeño &lt;15% cobertura · Mediano 15–40% · Grande 40–70% · Full &gt;70%
        </p>
      </div>

      {/* Technique multipliers + color logic */}
      <div className={SECTION}>
        <p className={SECTION_TITLE}>Técnicas de personalización</p>
        <div className="grid gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted mb-2"
          style={{ gridTemplateColumns: "1fr 100px 1fr" }}>
          <span>Técnica</span>
          <span className="text-center">Multiplicador</span>
          <span>Lógica de colores</span>
        </div>
        <div className="space-y-2">
          {TECHNIQUE_KEYS.map((tech) => (
            <div key={tech} className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr 100px 1fr" }}>
              <span className="text-sm text-theme capitalize">{tech}</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={(rules.technique_multipliers[tech] as number) ?? 1.0}
                onChange={(e) => setMult("technique_multipliers", tech, parseFloat(e.target.value) || 0)}
                className={INPUT + " text-center"}
                onFocus={focusAccent}
                onBlur={blurAccent}
              />
              <select
                value={(rules.technique_color_logic[tech] as string) ?? "charge_per_color"}
                onChange={(e) => setRules((r) => r ? {
                  ...r,
                  technique_color_logic: { ...r.technique_color_logic, [tech]: e.target.value }
                } : r)}
                className={INPUT}
                onFocus={focusAccent}
                onBlur={blurAccent}
              >
                {COLOR_LOGIC_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Product variant multipliers */}
      <div className={SECTION}>
        <div className="flex items-center justify-between mb-4">
          <p className={SECTION_TITLE + " mb-0"}>Multiplicadores por variante de producto</p>
          <button
            onClick={() => addKey("product_variant_multipliers", "nueva_variante", 1.0)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed transition-all hover:border-solid"
            style={{ borderColor: "var(--accent-bd)", color: "var(--accent)" }}
          >
            <Plus size={12} /> Agregar
          </button>
        </div>
        {Object.keys(rules.product_variant_multipliers).length === 0 ? (
          <p className="text-xs text-faint">Sin variantes configuradas. Ej: "black" → 1.2</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(rules.product_variant_multipliers).map(([k, v]) => (
              <MultRow
                key={k}
                label={k}
                value={v as number}
                onChange={(val) => setMult("product_variant_multipliers", k, val)}
                onRemove={() => removeKey("product_variant_multipliers", k)}
                labelEditable
                onLabelChange={(newLabel) => renameKey("product_variant_multipliers", k, newLabel)}
              />
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-faint">
          Se aplica según el color/variante enviado desde Shopify. Ej: prendas negras cuestan más.
        </p>
      </div>

      {/* Product type multipliers */}
      <div className={SECTION}>
        <div className="flex items-center justify-between mb-4">
          <p className={SECTION_TITLE + " mb-0"}>Multiplicadores por tipo de producto</p>
          <button
            onClick={() => addKey("product_type_multipliers", "nuevo_producto", 1.0)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed transition-all hover:border-solid"
            style={{ borderColor: "var(--accent-bd)", color: "var(--accent)" }}
          >
            <Plus size={12} /> Agregar
          </button>
        </div>
        {Object.keys(rules.product_type_multipliers).length === 0 ? (
          <p className="text-xs text-faint">Sin tipos configurados. Ej: "remera" → 1.0, "mochila" → 1.3</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(rules.product_type_multipliers).map(([k, v]) => (
              <MultRow
                key={k}
                label={k}
                value={v as number}
                onChange={(val) => setMult("product_type_multipliers", k, val)}
                onRemove={() => removeKey("product_type_multipliers", k)}
                labelEditable
                onLabelChange={(newLabel) => renameKey("product_type_multipliers", k, newLabel)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quantity tiers */}
      <div className={SECTION}>
        <div className="flex items-center justify-between mb-4">
          <p className={SECTION_TITLE + " mb-0"}>Descuentos por cantidad</p>
          <button
            onClick={() => addKey("quantity_tiers", "100", 0.9)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed transition-all hover:border-solid"
            style={{ borderColor: "var(--accent-bd)", color: "var(--accent)" }}
          >
            <Plus size={12} /> Agregar tier
          </button>
        </div>
        <div className="grid gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted mb-2"
          style={{ gridTemplateColumns: "120px 1fr 32px" }}>
          <span>Cantidad mínima</span>
          <span>Multiplicador (ej. 0.9 = 10% dto)</span>
          <span />
        </div>
        <div className="space-y-2">
          {Object.entries(rules.quantity_tiers)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([qty, mult]) => (
              <div key={qty} className="grid items-center gap-2" style={{ gridTemplateColumns: "120px 1fr 32px" }}>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={qty}
                  onChange={(e) => {
                    const newQty = e.target.value;
                    setRules((r) => {
                      if (!r) return r;
                      const next: Record<string, number> = {};
                      for (const [k, v] of Object.entries(r.quantity_tiers)) {
                        next[k === qty ? newQty : k] = v as number;
                      }
                      return { ...r, quantity_tiers: next };
                    });
                  }}
                  className={INPUT + " text-center"}
                  onFocus={focusAccent}
                  onBlur={blurAccent}
                />
                <input
                  type="number"
                  min={0}
                  max={2}
                  step={0.01}
                  value={mult as number}
                  onChange={(e) => setMult("quantity_tiers", qty, parseFloat(e.target.value) || 0)}
                  className={INPUT + " text-center"}
                  onFocus={focusAccent}
                  onBlur={blurAccent}
                />
                <button
                  onClick={() => removeKey("quantity_tiers", qty)}
                  className="p-1.5 rounded-lg text-muted hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
        </div>
        <p className="mt-3 text-xs text-faint">
          El tier se aplica si la cantidad pedida ≥ la cantidad mínima. Se usa el tier más alto que aplique.
        </p>
      </div>

      <p className="mt-2 text-xs text-faint">Moneda: {rules.currency}</p>
    </div>
  );
}
