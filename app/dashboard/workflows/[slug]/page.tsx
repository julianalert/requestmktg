"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getWorkflowBySlug, isRunnable, getCategoryBadgeStyles } from "@/lib/workflows/data";

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

const LoadingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{
      width: "1.125rem",
      height: "1.125rem",
      animation: "workflow-spin 0.8s linear infinite",
      flexShrink: 0,
    }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const workflow = getWorkflowBySlug(slug);

  const initialValues = useMemo(() => {
    if (!workflow) return {};
    return Object.fromEntries(workflow.inputs.map((i) => [i.key, ""]));
  }, [workflow]);

  const [inputValues, setInputValues] = useState<Record<string, string>>(initialValues);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<{ id: string; name: string; role: string; headline: string }[]>([]);

  const hasPersonaInput = workflow?.inputs?.some((i) => i.type === "persona") ?? false;
  useEffect(() => {
    if (hasPersonaInput) {
      fetch("/api/personas")
        .then((res) => res.json())
        .then((data) => setPersonas(data.personas ?? []))
        .catch(() => setPersonas([]));
    }
  }, [hasPersonaInput]);

  useEffect(() => {
    setInputValues(initialValues);
    setAnalysis(null);
    setError(null);
  }, [slug]);

  if (!workflow) {
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
        <p style={{ color: "#6b7280" }}>Workflow not found.</p>
      </div>
    );
  }

  const runnable = isRunnable(workflow);

  const buildBody = () => {
    const body: Record<string, string | undefined> = {};
    for (const input of workflow.inputs) {
      const v = (inputValues[input.key] ?? "").trim();
      if (input.required || v) body[input.key] = v || undefined;
    }
    return body;
  };

  const canSubmit = () => {
    for (const input of workflow.inputs) {
      if (input.required && !(inputValues[input.key] ?? "").trim()) return false;
    }
    return true;
  };

  const handleRun = async () => {
    if (!runnable || !workflow.analyzeEndpoint) return;
    setError(null);
    setAnalysis(null);
    setLoading(true);
    try {
      const res = await fetch(workflow.analyzeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Run failed");
      if (data.runId) {
        router.push(`/dashboard/workflows/runs/${data.runId}`);
        return;
      }
      setAnalysis(data.analysis ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: "@keyframes workflow-spin { to { transform: rotate(360deg); } }",
        }}
      />
      <Link
        href="/dashboard/workflows"
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          textDecoration: "none",
          display: "inline-block",
          cursor: "pointer",
        }}
      >
        ← Back to Workflows
      </Link>

      <div style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.2rem 0.5rem",
            borderRadius: "9999px",
            ...getCategoryBadgeStyles(workflow.category),
          }}
        >
          {workflow.category}
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
        {workflow.name}
      </h1>
      <p
        style={{
          fontSize: "0.9375rem",
          color: "#6b7280",
          lineHeight: 1.5,
          marginBottom: "1.5rem",
        }}
      >
        {workflow.description}
      </p>

      {runnable ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {workflow.inputs.map((input) => (
              <div key={input.key}>
                <label
                  htmlFor={`input-${input.key}`}
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "0.35rem",
                  }}
                >
                  {input.label}
                  {input.required ? " *" : ""}
                </label>
                {input.type === "persona" ? (
                  <select
                    id={`input-${input.key}`}
                    value={inputValues[input.key] ?? ""}
                    onChange={(e) =>
                      setInputValues((prev) => ({ ...prev, [input.key]: e.target.value }))
                    }
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.9375rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      boxSizing: "border-box",
                      backgroundColor: "#fff",
                    }}
                  >
                    <option value="">{input.placeholder}</option>
                    {personas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.headline || p.role || "Persona"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`input-${input.key}`}
                    type={input.type === "url" ? "url" : "text"}
                    value={inputValues[input.key] ?? ""}
                    onChange={(e) =>
                      setInputValues((prev) => ({ ...prev, [input.key]: e.target.value }))
                    }
                    placeholder={input.placeholder}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.9375rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      boxSizing: "border-box",
                    }}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleRun}
              disabled={loading || !canSubmit()}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#fff",
                backgroundColor: loading ? "#9ca3af" : "#374151",
                border: "none",
                borderRadius: "8px",
                cursor: loading || !canSubmit() ? "not-allowed" : "pointer",
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {loading && <LoadingIcon />}
              {loading ? "Running…" : workflow.runButtonLabel ?? "Run"}
            </button>
            {error && (
              <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: 0 }}>
                {error}
              </p>
            )}
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              backgroundColor: "#fafafa",
              minHeight: "200px",
              padding: analysis ? "1.25rem" : "2rem",
            }}
          >
            {analysis ? (
              <div
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  color: "#374151",
                }}
              >
                <ReactMarkdown components={markdownComponents}>
                  {analysis}
                </ReactMarkdown>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</span>
                <span>{workflow.resultPlaceholder ?? "Your results will appear here."}</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <h3
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
              }}
            >
              Tags
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {workflow.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.75rem",
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
          </div>
        </>
      ) : (
        <p style={{ color: "#6b7280" }}>
          This workflow is not yet implemented. Check back later.
        </p>
      )}
    </div>
  );
}
