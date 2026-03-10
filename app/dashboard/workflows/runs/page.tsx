"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getWorkflowById, type WorkflowId, getCategoryBadgeStyles } from "@/lib/workflows/data";

type Run = {
  id: string;
  workflowId: string;
  input: {
    url?: string;
    conversionGoal?: string;
    personaId?: string;
    personaName?: string;
    personaRole?: string;
  };
  result: string;
  createdAt: string;
};

export default function WorkflowRunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WorkflowId | "">("");

  useEffect(() => {
    const qs = filter ? `?workflow=${encodeURIComponent(filter)}` : "";
    fetch(`/api/workflows/runs${qs}`)
      .then((res) => res.json())
      .then((data) => {
        setRuns(data.runs ?? []);
      })
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div>
      <Link
        href="/dashboard/workflows"
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: "1rem",
          cursor: "pointer",
        }}
      >
        ← Back to Workflows
      </Link>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          marginBottom: "0.5rem",
        }}
      >
        Previous runs
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
        View and open past CRO and SEO audit results.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="filter"
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#374151",
            marginRight: "0.5rem",
          }}
        >
          Filter:
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as WorkflowId | "")}
          style={{
            padding: "0.35rem 0.6rem",
            fontSize: "0.875rem",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            backgroundColor: "#fff",
          }}
        >
          <option value="">All workflows</option>
          <option value="conversion-rate-optimizer">Conversion Rate Optimizer</option>
          <option value="seo-audit">SEO Audit</option>
          <option value="cold-outreach-sequence">Cold Outreach Sequence Writer</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading…</p>
      ) : runs.length === 0 ? (
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          No runs yet. Run a workflow to see results here.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {runs.map((run) => {
            const workflow = getWorkflowById(run.workflowId as WorkflowId);
            const label = workflow?.name ?? run.workflowId;
            const subtitle =
              run.workflowId === "cold-outreach-sequence"
                ? run.input?.personaName
                  ? [run.input.personaName, run.input.personaRole].filter(Boolean).join(" — ")
                  : "—"
                : run.input?.url ?? "—";
            return (
              <li key={run.id}>
                <Link
                  href={`/dashboard/workflows/runs/${run.id}`}
                  style={{
                    display: "block",
                    padding: "0.75rem 1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    textDecoration: "none",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "0.15rem 0.4rem",
                      borderRadius: "9999px",
                      marginRight: "0.5rem",
                      ...getCategoryBadgeStyles(workflow?.category ?? run.workflowId),
                    }}
                  >
                    {workflow?.category ?? run.workflowId}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                    {label}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      color: "#6b7280",
                      marginTop: "0.25rem",
                    }}
                  >
                    {subtitle}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                      marginTop: "0.2rem",
                    }}
                  >
                    {formatDate(run.createdAt)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
