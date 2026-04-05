"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard/marketing", label: "Marketing", emoji: "💻" },
  { href: "/dashboard/club", label: "Club", emoji: "🏆" },
  { href: "/dashboard/workflows", label: "Workflows", emoji: "🤖" },
  { href: "/dashboard/experiments", label: "Experiments", emoji: "🧪" },
  { href: "/dashboard/agents", label: "Agents", emoji: "🧠" },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "220px",
        flexShrink: 0,
        borderRight: "1px solid #e5e7eb",
        padding: "1.5rem 0",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {links.map(({ href, label, emoji }) => {
          // Active when exact match or on any sub-route (e.g. Marketing on /dashboard/marketing/brand-profile)
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding: "0.5rem 1.5rem",
                textDecoration: "none",
                color: isActive ? "#111827" : "#6b7280",
                fontWeight: isActive ? 600 : 400,
                backgroundColor: isActive ? "#f3f4f6" : "transparent",
                borderRight: isActive ? "3px solid #111827" : "3px solid transparent",
                marginRight: "-1px",
                cursor: "pointer",
              }}
            >
              <span style={{ marginRight: "0.5rem" }}>{emoji}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
