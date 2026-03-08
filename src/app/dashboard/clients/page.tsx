"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";
import { api, type Client } from "@/lib/api";

const ALL_MODULES = [
  "price_estimator",
  "chat",
  "performance_digest",
  "seo_brief",
  "ad_copy",
];

const MODULE_LABELS: Record<string, string> = {
  price_estimator: "Price Estimator",
  chat: "Chatbot",
  performance_digest: "Performance Digest",
  seo_brief: "SEO Brief",
  ad_copy: "Ad Copy",
};

type FormData = {
  name: string;
  shopify_store_domain: string;
  shopify_storefront_token: string;
  shopify_store_url: string;
  digest_email: string;
  enabled_modules: string[];
};

const EMPTY_FORM: FormData = {
  name: "",
  shopify_store_domain: "",
  shopify_storefront_token: "",
  shopify_store_url: "",
  digest_email: "",
  enabled_modules: [...ALL_MODULES],
};

function ClientForm({
  initial,
  onSave,
  onCancel,
  isNew,
}: {
  initial: FormData;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof FormData, value: string | string[]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleModule(mod: string) {
    set(
      "enabled_modules",
      form.enabled_modules.includes(mod)
        ? form.enabled_modules.filter((m) => m !== mod)
        : [...form.enabled_modules, mod]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-input border border-theme text-theme  placeholder:text-faint focus:outline-none transition-colors duration-150";

  const field = (label: string, key: keyof FormData, props?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-1.5">
        {label}
      </label>
      <input
        value={form[key] as string}
        onChange={(e) => set(key, e.target.value)}
        className={inputClass}
        style={{ fontFamily: "inherit" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "")}
        {...props}
      />
    </div>
  );

  return (
    <form onSubmit={submit} className="bg-card border border-theme rounded-2xl p-6 space-y-5">
      <h3 className="text-theme font-bold">{isNew ? "Add client" : "Edit client"}</h3>

      {field("Client name *", "name", { required: true, placeholder: "Acme Corp" })}
      {field("Shopify store domain", "shopify_store_domain", { placeholder: "mystore.myshopify.com" })}
      {field(
        isNew ? "Shopify storefront token" : "Shopify storefront token (leave blank to keep existing)",
        "shopify_storefront_token",
        { type: "password", placeholder: isNew ? "shpat_..." : "••••••••" }
      )}
      {field("Shopify store URL", "shopify_store_url", { placeholder: "https://mystore.com" })}
      {field("Digest email", "digest_email", { type: "email", placeholder: "reports@mystore.com" })}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-2">
          Enabled modules
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_MODULES.map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => toggleModule(mod)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150"
              style={
                form.enabled_modules.includes(mod)
                  ? { backgroundColor: "var(--accent-bg)", borderColor: "var(--accent-bd)", color: "var(--accent)" }
                  : { backgroundColor: "var(--bg-input)", borderColor: "var(--border)", color: "var(--txt-muted)" }
              }
            >
              {MODULE_LABELS[mod] ?? mod}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p
          className=" rounded-lg px-3 py-2 border"
          style={{ color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }}
        >
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl  font-bold transition-all duration-150 disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)", color: "#000" }}
          onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "var(--accent-h)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--accent)"; }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-input border border-theme text-muted  font-medium transition-all duration-150"
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
        >
          <X size={14} />
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ClientsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect non-admin users
  useEffect(() => {
    if (session && session.user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [session, router]);

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.getClients();
      setClients(res.clients);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(data: FormData) {
    await api.createClient(data);
    setAdding(false);
    load();
  }

  async function handleUpdate(clientId: string, data: FormData) {
    await api.updateClient(clientId, data);
    setEditing(null);
    load();
  }

  async function handleDelete(clientId: string) {
    if (!confirm(`Delete client "${clientId}"? This cannot be undone.`)) return;
    try {
      await api.deleteClient(clientId);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-theme  font-bold tracking-tight">Clients</h1>
          <p className="text-muted  mt-1">Manage Shopify credentials and enabled modules per client</p>
        </div>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setEditing(null); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl  font-bold transition-all duration-150"
            style={{ backgroundColor: "var(--accent)", color: "#000" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-h)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
          >
            <Plus size={15} />
            Add client
          </button>
        )}
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

      {adding && (
        <div className="mb-6">
          <ClientForm
            initial={EMPTY_FORM}
            isNew
            onSave={handleCreate}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {clients.map((client) => (
          <div key={client.client_id}>
            {editing?.client_id === client.client_id ? (
              <ClientForm
                initial={{
                  name: client.name,
                  shopify_store_domain: client.shopify_store_domain,
                  shopify_storefront_token: "",
                  shopify_store_url: client.shopify_store_url,
                  digest_email: client.digest_email,
                  enabled_modules: client.enabled_modules,
                }}
                isNew={false}
                onSave={(data) => handleUpdate(client.client_id, data)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="bg-card border border-theme rounded-2xl p-5 flex items-start justify-between gap-4 transition-colors duration-150">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-theme font-semibold">{client.name}</h3>
                    <span className="text-faint text-xs font-mono">{client.client_id}</span>
                    {client.client_id === "default" && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full border font-medium"
                        style={{
                          backgroundColor: "var(--accent-bg)",
                          borderColor: "var(--accent-bd)",
                          color: "var(--accent)",
                        }}
                      >
                        default
                      </span>
                    )}
                  </div>
                  <p className="text-muted  truncate">
                    {client.shopify_store_domain || (
                      <span className="text-faint italic">No Shopify domain</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {client.enabled_modules.map((mod) => (
                      <span
                        key={mod}
                        className="text-xs px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: "var(--bg-input)",
                          borderColor: "var(--border)",
                          color: "var(--txt-muted)",
                        }}
                      >
                        {MODULE_LABELS[mod] ?? mod}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setEditing(client); setAdding(false); }}
                    className="p-2 rounded-xl bg-input text-muted transition-all duration-150"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--accent-bg)";
                      e.currentTarget.style.color = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color = "";
                    }}
                  >
                    <Pencil size={15} />
                  </button>
                  {client.client_id !== "default" && (
                    <button
                      onClick={() => handleDelete(client.client_id)}
                      className="p-2 rounded-xl bg-input text-muted transition-all duration-150"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--red-bg)";
                        e.currentTarget.style.color = "var(--red)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.color = "";
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
