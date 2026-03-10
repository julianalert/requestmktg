"use client";

import Link from "next/link";
import { WORKFLOWS, getCategoryBadgeStyles } from "@/lib/workflows/data";

export default function WorkflowsPage() {
  return (
    <div>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          marginBottom: "0.5rem",
        }}
      >
        Workflows
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "0.5rem" }}>
        Small agents that accomplish repetitive tasks. Pick one to run.
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/dashboard/workflows/runs"
          style={{
            fontSize: "0.875rem",
            color: "#0369a1",
            textDecoration: "none",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Previous runs →
        </Link>
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
        }}
      >
        {WORKFLOWS.map((workflow) => (
          <Link
            key={workflow.id}
            href={`/dashboard/workflows/${workflow.slug}`}
            style={{
              display: "block",
              padding: "1.25rem",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              backgroundColor: "#fff",
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
              transition: "box-shadow 0.15s ease, border-color 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "0.2rem 0.5rem",
                borderRadius: "9999px",
                marginBottom: "0.5rem",
                ...getCategoryBadgeStyles(workflow.category),
              }}
            >
              {workflow.category}
            </span>
            <h2
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                margin: "0 0 0.5rem 0",
                color: "#111827",
              }}
            >
              {workflow.name}
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {workflow.description}
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.35rem",
                marginTop: "0.75rem",
              }}
            >
              {workflow.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.7rem",
                    padding: "0.2rem 0.5rem",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "9999px",
                    color: "#6b7280",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
