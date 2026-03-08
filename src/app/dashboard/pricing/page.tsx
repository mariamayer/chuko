"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, RotateCcw, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { api, type PricingRules } from "@/lib/api";

const SECTION = "text-theme font-semibold mb-4 mt-6 first:mt-0";
const LABEL = "block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted mb-1.5";
const INPUT = "w-full px-3 py-2.5 rounded-xl bg-input border border-theme text-theme placeholder:text-faint focus:outline-none transition-colors duration-150 text-sm";

function cents(v: number) { return (v / 100).toFixed(2); }
function fromEur(s: string) { return Math.round(parseFloat(s) * 100) || 0; }

function NumberInput({
  label, value, onChange, prefix = "€", step = "0.01",
}: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; step?: string;
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">{prefix}</span>
        <input
          type="number"
          min="0"
          step={step}
          value={cents(value)}
          onChange={(e) => onChange(fromEur(e.target.value))}
          className={INPUT + " pl-7"}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "")}
        />
      </div>
    </div>
  );
}

function MultiplierGrid({
  title, hint, data, onChange, onAdd, onRemove, addable = false,
}: {
  title: string; hint?: string; data: Record<string, number>;
  onChange: (key: string, val: number) => void;
  onAdd?: (key: string) => void;
  onRemove?: (key: string) => void;
  addable?: boolean;
}) {
  const [newKey, setNewKey] = useState("");

  return (
    <div>
      <p className={LABEL}>{title}</p>
      {hint && <p className="text-faint text-xs mb-3">{hint}</p>}
      <div className="space-y-2">
        {Object.entries(data).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-28 text-sm text-muted font-mono shrink-0">{key}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={val}
              onChange={(e) => onChange(key, parseFloat(e.target.value) || 0)}
              className={INPUT}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "")}
            />
            {onRemove && (
              <button
                onClick={() => onRemove(key)}
                className="p-1.5 rounded-lg text-muted hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
        {addable && onAdd && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="new key…"
              className={INPUT + " w-28 shrink-0"}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "")}
            />
            <button
              onClick={() => { if (newKey.trim()) { onAdd(newKey.trim()); setNewKey(""); } }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ backgroundColor: "var(--accent-bg)", color: "var(--accent)" }}
            >
              <Plus size={13} /> Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TierGrid({
  data, onChange, onAdd, onRemove,
}: {
  data: Record<string, number>;
  onChange: (key: string, val: number) => void;
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
}) {
  const [newQty, setNewQty] = useState("");

  return (
    <div>
      <p className={LABEL}>Quantity tiers</p>
      <p className="text-faint text-xs mb-3">Min quantity → price multiplier (e.g. 0.9 = 10% discount)</p>
      <div className="space-y-2">
        {Object.entries(data).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([qty, mult]) => (
          <div key={qty} className="flex items-center gap-2">
            <span className="text-faint text-xs shrink-0 w-6">≥</span>
            <input
              type="number"
              min="1"
              step="1"
              value={qty}
              readOnly
              className={INPUT + " w-24 shrink-0 opacity-60"}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              max="1"
              value={mult}
              onChange={(e) => onChange(qty, parseFloat(e.target.value) || 0)}
              className={INPUT}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "")}
            />
            <button
              onClick={() => onRemove(qty)}
              className="p-1.5 rounded-lg text-muted hover:text-red-400 transition-colors shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-faint text-xs shrink-0 w-6">≥</span>
          <input
            type="number"
            min="1"
            step="1"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            placeholder="qty…"
            className={INPUT + " w-24 shrink-0"}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "")}
          />
          <button
            onClick={() => { if (newQty) { onAdd(newQty); setNewQty(""); } }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "var(--accent-bg)", color: "var(--accent)" }}
          >
            <Plus size={13} /> Add tier
          </button>
        </div>
      </div>
    </div>
  );
}

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
      setRules(res.rules);
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
      setRules(res.rules);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function patch(partial: Partial<PricingRules>) {
    setRules((r) => r ? { ...r, ...partial } : r);
  }

  function patchDict(field: keyof PricingRules, key: string, val: number | string) {
    setRules((r) => {
      if (!r) return r;
      return { ...r, [field]: { ...(r[field] as Record<string, unknown>), [key]: val } };
    });
  }

  function removeFromDict(field: keyof PricingRules, key: string) {
    setRules((r) => {
      if (!r) return r;
      const next = { ...(r[field] as Record<string, unknown>) };
      delete next[key];
      return { ...r, [field]: next };
    });
  }

  function addToDict(field: keyof PricingRules, key: string, defaultVal: number | string) {
    setRules((r) => {
      if (!r || (r[field] as Record<string, unknown>)[key] !== undefined) return r;
      return { ...r, [field]: { ...(r[field] as Record<string, unknown>), [key]: defaultVal } };
    });
  }

  if (loading) return <div className="p-8 text-faint">Loading…</div>;

  if (!rules) return (
    <div className="p-8">
      <p className="text-sm" style={{ color: "var(--red)" }}>{error || "Failed to load rules."}</p>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-theme font-bold tracking-tight">Pricing Rules</h1>
          <p className="text-muted mt-1">Configure how estimates are calculated.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2.5 rounded-xl bg-input border border-theme text-muted hover:text-theme transition-all"
            title="Reset to saved"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50"
            style={{ backgroundColor: saved ? "var(--lime)" : "var(--accent)", color: "#000" }}
            onMouseEnter={(e) => { if (!saving && !saved) e.currentTarget.style.backgroundColor = "var(--accent-h)"; }}
            onMouseLeave={(e) => { if (!saved) e.currentTarget.style.backgroundColor = "var(--accent)"; }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? "Saved ✓" : saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl border text-sm"
          style={{ color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }}>
          {error}
        </div>
      )}

      <div className="bg-card border border-theme rounded-2xl p-6 space-y-6">

        {/* Base prices */}
        <div>
          <h2 className={SECTION}>Base prices</h2>
          <div className="grid grid-cols-3 gap-4">
            <NumberInput
              label="Base unit price"
              value={rules.base_price_cents}
              onChange={(v) => patch({ base_price_cents: v })}
            />
            <NumberInput
              label="Color surcharge"
              value={rules.per_color_surcharge_cents}
              onChange={(v) => patch({ per_color_surcharge_cents: v })}
            />
            <NumberInput
              label="Double-sided fee"
              value={rules.double_sided_surcharge_cents}
              onChange={(v) => patch({ double_sided_surcharge_cents: v })}
            />
          </div>
          <p className="text-faint text-xs mt-2">
            Color surcharge applies per extra color (screen print only). Double-sided fee added when front + back designs are uploaded.
          </p>
        </div>

        <hr style={{ borderColor: "var(--border)" }} />

        {/* Logo size multipliers */}
        <div>
          <h2 className={SECTION}>Logo size multipliers</h2>
          <div className="grid grid-cols-4 gap-4">
            {(["small", "medium", "large", "full"] as const).map((s) => (
              <div key={s}>
                <label className={LABEL}>{s}</label>
                <input
                  type="number" min="0" step="0.05"
                  value={rules.logo_size_multipliers[s] ?? 1}
                  onChange={(e) => patchDict("logo_size_multipliers", s, parseFloat(e.target.value) || 0)}
                  className={INPUT}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                />
              </div>
            ))}
          </div>
          <p className="text-faint text-xs mt-2">
            Applied to the base price. small &lt;15%, medium 15–40%, large 40–70%, full &gt;70% of print area.
          </p>
        </div>

        <hr style={{ borderColor: "var(--border)" }} />

        {/* Product types */}
        <div>
          <h2 className={SECTION}>Product type multipliers</h2>
          <MultiplierGrid
            title="Product → multiplier"
            hint="1.0 = same as base price. Add new product types as needed."
            data={rules.product_type_multipliers}
            onChange={(k, v) => patchDict("product_type_multipliers", k, v)}
            onAdd={(k) => addToDict("product_type_multipliers", k, 1.0)}
            onRemove={(k) => removeFromDict("product_type_multipliers", k)}
            addable
          />
        </div>

        <hr style={{ borderColor: "var(--border)" }} />

        {/* Product variant multipliers */}
        <div>
          <h2 className={SECTION}>Product variant multipliers</h2>
          <MultiplierGrid
            title="Variant → multiplier"
            hint="Applied on top of the product multiplier. Black garments cost more to print on (e.g. requires white underbase for DTG/DTF)."
            data={rules.product_variant_multipliers ?? {}}
            onChange={(k, v) => patchDict("product_variant_multipliers", k, v)}
            onAdd={(k) => addToDict("product_variant_multipliers", k, 1.0)}
            onRemove={(k) => removeFromDict("product_variant_multipliers", k)}
            addable
          />
        </div>

        <hr style={{ borderColor: "var(--border)" }} />

        {/* Technique multipliers */}
        <div>
          <h2 className={SECTION}>Print technique multipliers</h2>
          <div className="grid grid-cols-2 gap-6">
            <MultiplierGrid
              title="Technique → multiplier"
              hint="dtg = digital, dtf = direct to film, serigrafia = screen print, bordado = embroidery, grabado = engraving"
              data={rules.technique_multipliers}
              onChange={(k, v) => patchDict("technique_multipliers", k, v)}
              onAdd={(k) => addToDict("technique_multipliers", k, 1.0)}
              onRemove={(k) => removeFromDict("technique_multipliers", k)}
              addable
            />
            <div>
              <p className={LABEL}>Color logic by technique</p>
              <p className="text-faint text-xs mb-3">
                <code className="text-xs">charge_per_color</code> adds the color surcharge. <code className="text-xs">ignore_colors</code> skips it (DTG doesn't charge per color).
              </p>
              <div className="space-y-2">
                {Object.entries(rules.technique_color_logic).map(([tech, logic]) => (
                  <div key={tech} className="flex items-center gap-2">
                    <span className="w-28 text-sm text-muted font-mono shrink-0">{tech}</span>
                    <select
                      value={logic}
                      onChange={(e) => patchDict("technique_color_logic", tech, e.target.value)}
                      className={INPUT}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                    >
                      <option value="charge_per_color">charge per color</option>
                      <option value="ignore_colors">ignore colors</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: "var(--border)" }} />

        {/* Quantity tiers */}
        <div>
          <h2 className={SECTION}>Quantity discount tiers</h2>
          <TierGrid
            data={rules.quantity_tiers}
            onChange={(k, v) => patchDict("quantity_tiers", k, v)}
            onAdd={(k) => addToDict("quantity_tiers", k, 1.0)}
            onRemove={(k) => removeFromDict("quantity_tiers", k)}
          />
        </div>
      </div>
    </div>
  );
}
