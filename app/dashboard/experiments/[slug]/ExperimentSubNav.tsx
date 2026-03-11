"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ExperimentMeta } from "@/lib/experiments/data";

export function ExperimentSubNav({
  experiment,
}: {
  experiment: ExperimentMeta;
}) {
  const pathname = usePathname();
  const base = `/dashboard/experiments/${experiment.slug}`;

  const tabs: { href: string; label: string }[] = [
    { href: base, label: "Overview" },
  ];
  if (experiment.steps?.length) {
    experiment.steps.forEach((s) => {
      tabs.push({ href: `${base}/step/${s.number}`, label: `Step ${s.number}` });
    });
  }

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
      {tabs.map(({ href, label }) => {
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
              cursor: "pointer",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
