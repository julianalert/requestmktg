"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subLinks = [
  { href: "/dashboard/marketing/strategy", label: "Strategy" },
  { href: "/dashboard/marketing/brand-profile", label: "Brand Profile" },
  { href: "/dashboard/marketing/personas", label: "Personas" },
  { href: "/dashboard/marketing/market", label: "Market" },
] as const;

export function MarketingSubNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        gap: "0.25rem",
        marginBottom: "1.5rem",
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: "0.75rem",
      }}
    >
      {subLinks.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              padding: "0.375rem 0.75rem",
              textDecoration: "none",
              fontSize: "0.875rem",
              color: isActive ? "#111827" : "#6b7280",
              fontWeight: isActive ? 600 : 400,
              backgroundColor: isActive ? "#f3f4f6" : "transparent",
              borderRadius: "4px",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
