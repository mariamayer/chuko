"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "@/lib/theme";
import {
  LayoutDashboard,
  Bot,
  History,
  Users,
  BookOpen,
  Tag,
  FileText,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

const AGENT_MODULES = ["performance_digest", "seo_brief", "ad_copy"];

export default function Sidebar() {
  const path = usePathname();
  const { theme, toggle } = useTheme();
  const { data: session } = useSession();

  const role = session?.user?.role ?? "admin";
  const enabledModules = session?.user?.enabledModules ?? [];
  const clientName = session?.user?.name ?? "merch7am";

  const hasAgents =
    role === "admin" ||
    AGENT_MODULES.some((m) => enabledModules.includes(m));

  const nav = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: "/dashboard/agents",
      label: "Agents",
      icon: Bot,
      show: hasAgents,
    },
    {
      href: "/dashboard/knowledge",
      label: "Knowledge Base",
      icon: BookOpen,
      show: role === "admin" || enabledModules.includes("chat"),
    },
    {
      href: "/dashboard/pricing",
      label: "Pricing",
      icon: Tag,
      show: role === "admin" || enabledModules.includes("price_estimator"),
    },
    {
      href: "/dashboard/estimates",
      label: "Estimates",
      icon: FileText,
      show: role === "admin" || enabledModules.includes("price_estimator"),
    },
    {
      href: "/dashboard/history",
      label: "Run History",
      icon: History,
      show: true,
    },
    {
      href: "/dashboard/clients",
      label: "Clients",
      icon: Users,
      show: role === "admin",
    },
  ].filter((item) => item.show);

  return (
    <aside className="w-56 min-h-screen flex flex-col border-r border-theme bg-card">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-theme">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 shadow-pink-glow"
            style={{ backgroundColor: "var(--accent)", color: "#000" }}
          >
            ✦
          </div>
          <div>
            <p className="font-bold tracking-tight text-theme leading-none">
              {role === "client" ? clientName : "merch7am"}
            </p>
            <p className="text-[10px] mt-0.5 uppercase tracking-widest text-faint">
              {role === "admin" ? "Admin" : "Dashboard"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? path === "/dashboard"
              : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 border ${
                active
                  ? "bg-accent-soft border-accent"
                  : "border-transparent hover:bg-input"
              }`}
            >
              <Icon
                size={15}
                style={{ color: active ? "var(--accent)" : "var(--txt-muted)" }}
              />
              <span
                style={{ color: active ? "var(--accent)" : "var(--txt-muted)" }}
                className="group-hover:!text-theme transition-colors duration-150"
              >
                {label}
              </span>
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "var(--accent)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: theme toggle + sign out */}
      <div className="px-3 pb-5 pt-3 border-t border-theme space-y-0.5">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium border border-transparent hover:bg-input transition-all duration-150 text-muted"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/admin" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium border border-transparent hover:bg-input transition-all duration-150 text-muted"
        >
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
