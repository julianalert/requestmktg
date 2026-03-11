"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getExperimentBySlug } from "@/lib/experiments/data";

function loadChecked(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveChecked(key: string, checked: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify([...checked]));
  } catch {}
}

export default function ExperimentOverviewPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const experiment = getExperimentBySlug(slug);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const storageKey = experiment ? `experiment-${experiment.slug}-todos` : "";
  const steps = experiment?.steps ?? [];

  useEffect(() => {
    if (storageKey) setChecked(loadChecked(storageKey));
  }, [storageKey]);

  const toggle = (id: string) => {
    if (!storageKey) return;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(storageKey, next);
      return next;
    });
  };

  if (!experiment) {
    return <p style={{ color: "#6b7280" }}>Experiment not found.</p>;
  }

  return (
    <>
      {steps.length > 0 && (
        <>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#9ca3af",
              marginBottom: "1rem",
            }}
          >
            Progress is saved in your browser.
          </p>
          <div style={{ marginBottom: "1.5rem" }}>
            {steps.map((step) => {
              const id = `${experiment.id}-${step.number}`;
              const isChecked = checked.has(id);
              return (
                <section
                  key={step.number}
                  style={{
                    marginBottom: "1.5rem",
                    paddingBottom: "1.25rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      aria-checked={isChecked}
                      role="checkbox"
                      title={isChecked ? "Mark as not done" : "Mark as done"}
                      style={{
                        flexShrink: 0,
                        width: "20px",
                        height: "20px",
                        marginTop: "2px",
                        borderRadius: "4px",
                        border: `2px solid ${isChecked ? "#10b981" : "#d1d5db"}`,
                        backgroundColor: isChecked ? "#10b981" : "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isChecked ? (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
                          <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </button>
                    <div>
                      <span
                        style={{
                          fontSize: "0.9375rem",
                          color: isChecked ? "#6b7280" : "#111827",
                          textDecoration: isChecked ? "line-through" : "none",
                          lineHeight: 1.5,
                        }}
                      >
                        Step {step.number}: {step.title}
                      </span>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}

      <div style={{ marginTop: "1rem" }}>
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
          {experiment.tags.map((tag) => (
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
  );
}
