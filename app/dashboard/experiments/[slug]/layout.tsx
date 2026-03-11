"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getExperimentBySlug, getExperimentCategoryStyles } from "@/lib/experiments/data";
import { ExperimentSubNav } from "./ExperimentSubNav";

export default function ExperimentSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const experiment = getExperimentBySlug(slug);

  return (
    <div style={{ maxWidth: "900px" }}>
      <Link
        href="/dashboard/experiments"
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          textDecoration: "none",
          display: "inline-block",
          cursor: "pointer",
        }}
      >
        ← Back to Experiments
      </Link>

      {experiment && (
        <>
          <div style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
            <span
              style={{
                display: "inline-block",
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "0.2rem 0.5rem",
                borderRadius: "9999px",
                ...getExperimentCategoryStyles(experiment.category),
              }}
            >
              {experiment.category}
            </span>
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              margin: "0 0 0.5rem 0",
              color: "#111827",
            }}
          >
            {experiment.name}
          </h1>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "#6b7280",
              lineHeight: 1.5,
              marginBottom: "1rem",
            }}
          >
            {experiment.description}
          </p>
          <ExperimentSubNav experiment={experiment} />
        </>
      )}

      {children}
    </div>
  );
}
