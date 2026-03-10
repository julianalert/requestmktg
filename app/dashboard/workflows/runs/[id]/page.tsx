"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
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

const markdownComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2
      style={{
        fontSize: "1.125rem",
        fontWeight: 600,
        marginTop: "1.25rem",
        marginBottom: "0.5rem",
        color: "#111827",
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3
      style={{
        fontSize: "1rem",
        fontWeight: 600,
        marginTop: "0.75rem",
        marginBottom: "0.35rem",
        color: "#111827",
      }}
    >
      {children}
    </h3>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li style={{ marginBottom: "0.25rem" }}>{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong style={{ fontWeight: 600 }}>{children}</strong>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p style={{ margin: "0.5rem 0" }}>{children}</p>
  ),
};

export default function WorkflowRunDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/workflows/runs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRun(data.run);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <Link
          href="/dashboard/workflows/runs"
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "1rem",
            cursor: "pointer",
          }}
        >
          ← Previous runs
        </Link>
        <p style={{ color: "#6b7280" }}>Loading…</p>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div>
        <Link
          href="/dashboard/workflows/runs"
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "1rem",
            cursor: "pointer",
          }}
        >
          ← Previous runs
        </Link>
        <p style={{ color: "#dc2626" }}>{error ?? "Run not found."}</p>
      </div>
    );
  }

  const workflow = getWorkflowById(run.workflowId as WorkflowId);
  const workflowName = workflow?.name ?? run.workflowId;
  const category = workflow?.category ?? run.workflowId;
  const isColdOutreach = run.workflowId === "cold-outreach-sequence";
  const inputLabel = isColdOutreach ? "Persona" : "URL";
  const inputValue = isColdOutreach
    ? [run.input?.personaName, run.input?.personaRole].filter(Boolean).join(" — ") || "—"
    : run.input?.url ?? "—";
  const date = (() => {
    try {
      return new Date(run.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return run.createdAt;
    }
  })();

  return (
    <div style={{ maxWidth: "900px" }}>
      <Link
        href="/dashboard/workflows/runs"
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          textDecoration: "none",
          display: "inline-block",
          cursor: "pointer",
        }}
      >
        ← Previous runs
      </Link>

      <div style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.2rem 0.5rem",
            borderRadius: "9999px",
            ...getCategoryBadgeStyles(category),
          }}
        >
          {category}
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
        {workflowName}
      </h1>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0 0 0.25rem 0" }}>
        <strong>{inputLabel}:</strong> {inputValue}
      </p>
      <p style={{ fontSize: "0.8125rem", color: "#9ca3af", margin: "0 0 1rem 0" }}>
        {date}
      </p>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          backgroundColor: "#fafafa",
          padding: "1.25rem",
        }}
      >
        <div
          style={{
            fontSize: "0.9375rem",
            lineHeight: 1.6,
            color: "#374151",
          }}
        >
          <ReactMarkdown components={markdownComponents}>
            {run.result}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
