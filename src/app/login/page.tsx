"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Wrong password. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-theme flex items-center justify-center p-6 relative overflow-hidden">
      {/* Mathical-style ambient blobs */}
      <div
        className="fixed -top-32 -right-20 w-96 h-96 rounded-full opacity-[0.15] blur-[80px] pointer-events-none"
        style={{ backgroundColor: "var(--accent)" }}
      />
      <div
        className="fixed -bottom-24 -left-16 w-72 h-72 rounded-full opacity-[0.08] blur-[60px] pointer-events-none"
        style={{ backgroundColor: "#5B4FE8" }}
      />

      <div className="w-full max-w-[360px] relative z-10">
        {/* Logo mark */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full text-xl font-black mb-5"
            style={{ backgroundColor: "var(--accent)", color: "#000", boxShadow: "0 0 40px var(--accent-bd)" }}
          >
            ✦
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-theme">merch7am</h1>
          <p className="text-[11px] mt-1.5 uppercase tracking-[0.2em] text-muted">Agent Dashboard</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-theme rounded-3xl p-8 space-y-5"
        >
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted mb-2.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3.5 rounded-2xl bg-input border border-theme text-theme  placeholder:text-faint focus:outline-none transition-colors duration-150"
              style={{ fontFamily: "inherit" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-bd)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "")}
            />
          </div>

          {error && (
            <p
              className="text-xs px-4 py-3 rounded-2xl border font-medium"
              style={{ color: "var(--red)", backgroundColor: "var(--red-bg)", borderColor: "var(--red-bg)" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl  font-bold tracking-wide transition-all duration-150 disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "#000" }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "var(--accent-h)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--accent)"; }}
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  );
}
