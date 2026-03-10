"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "marketing-strategy-todos";

export interface StrategyItem {
  id: string;
  step: number;
  label: string;
  detail?: string;
}

const initialItems: StrategyItem[] = [
  {
    id: "s1-1",
    step: 1,
    label: "Switch to new website (complete version)",
    detail: "One clean website. Assume the switch ASAP. Take risks: we die in 6 months anyway.",
  },
  {
    id: "s1-2",
    step: 1,
    label: "Ship new onboarding process at https://app.request.finance to capture leads",
  },
  {
    id: "s1-3",
    step: 1,
    label: "After onboarding: require users to book a demo before they can access the product",
    detail: "Sales take over from there",
  },
  {
    id: "s2-1",
    step: 2,
    label: "Define a process for inbound leads",
    detail: "Stop relying only on automated campaigns for inbound leads. It is not working. Sales must take over manually.",
  },
  {
    id: "s2-2",
    step: 2,
    label: "Make sure the process is understood and followed by the sales team",
  },
  {
    id: "s3-1",
    step: 3,
    label: "Reorganize outreach",
    detail: "Lots of initiative right now, low results. Need to restructure.",
  },
  {
    id: "s3-2",
    step: 3,
    label: "Create the right infra",
    detail: "We are at risk of being labelled as a spammy company. We need to create the right infra to avoid this.",
  },
  {
    id: "s3-3",
    step: 3,
    label: "Launch campaign 1",
    detail: "report, analyze, iterate",
  },
  {
    id: "s4-1",
    step: 4,
    label: "Open a resources center with a blog for SEO in the new market",
  },
  {
    id: "s4-2",
    step: 4,
    label: "SEO strategy (incoming soon)",
  },
  {
    id: "s5-1",
    step: 5,
    label: "Google AdWords",
  },
  {
    id: "s5-2",
    step: 5,
    label: "Influence marketing",
  },
  {
    id: "s5-3",
    step: 5,
    label: "LinkedIn Ads? Reddit Ads? (evaluate)",
  },
  {
    id: "s6-1",
    step: 6,
    label: "Define experiment #1",
  },
  {
    id: "s6-2",
    step: 6,
    label: "Define experiment #2",
  },
  {
    id: "s6-3",
    step: 6,
    label: "Define experiment #3",
  },
];

function loadChecked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveChecked(checked: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
  } catch {}
}

export default function StrategyPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(next);
      return next;
    });
  };

  const steps = [1, 2, 3, 4, 5, 6];
  const stepTitles: Record<number, string> = {
    1: "New website + new onboarding",
    2: "Deal with inbound leads",
    3: "Pillar 1: Outreach",
    4: "Pillar 2: SEO",
    5: "Pillar 3: Drive short-term traffic",
    6: "Pillar 4: Bold experiments",
  };

  return (
    <div style={{ maxWidth: "640px" }}>
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 600,
          marginBottom: "0.25rem",
          letterSpacing: "-0.02em",
        }}
      >
        Strategy
      </h1>
      <p
        style={{
          color: "#6b7280",
          fontSize: "0.9375rem",
          marginBottom: "1.5rem",
        }}
      >
        Marketing strategy to-do list. Progress is saved in your browser.
      </p>

      {steps.map((step) => {
        const items = initialItems.filter((i) => i.step === step);
        if (items.length === 0) return null;
        const doneCount = items.filter((i) => checked.has(i.id)).length;

        return (
          <section
            key={step}
            style={{
              marginBottom: "1.75rem",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {stepTitles[step]}
              </h2>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                {doneCount}/{items.length}
              </span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {items.map((item) => {
                const isChecked = checked.has(item.id);
                return (
                  <li
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
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
                        {item.label}
                      </span>
                      {item.detail ? (
                        <p
                          style={{
                            margin: "0.25rem 0 0 0",
                            fontSize: "0.8125rem",
                            color: "#6b7280",
                            lineHeight: 1.45,
                          }}
                        >
                          {item.detail}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
