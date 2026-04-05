"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FunnelRow {
  id: string;
  date: string;
  visitors: number;
  application_page_views: number;
  applications: number;
  people_invited_to_call: number;
  onboarding_calls: number;
  people_invited: number;
  people_joined: number;
  request_finance_demos: number;
}

const FUNNEL_FIELDS: { key: keyof Omit<FunnelRow, "id" | "date">; label: string; color: string }[] = [
  { key: "visitors", label: "Visitors", color: "#6366f1" },
  { key: "application_page_views", label: "Application page views", color: "#8b5cf6" },
  { key: "applications", label: "Applications", color: "#ec4899" },
  { key: "people_invited_to_call", label: "Invited to call", color: "#a855f7" },
  { key: "onboarding_calls", label: "Onboarding calls", color: "#f59e0b" },
  { key: "people_invited", label: "People invited", color: "#10b981" },
  { key: "people_joined", label: "People joined", color: "#06b6d4" },
  { key: "request_finance_demos", label: "RF demos", color: "#f97316" },
];

const EMPTY_FORM = {
  date: new Date().toISOString().split("T")[0],
  visitors: "",
  application_page_views: "",
  applications: "",
  people_invited_to_call: "",
  onboarding_calls: "",
  people_invited: "",
  people_joined: "",
  request_finance_demos: "",
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export default function ClubDashboardPage() {
  const [rows, setRows] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/club/funnel");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data: FunnelRow[] = await res.json();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRows = rows.filter((r) => {
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    return true;
  });

  const totals = filteredRows.reduce(
    (acc, r) => {
      acc.visitors += r.visitors;
      acc.application_page_views += r.application_page_views;
      acc.applications += r.applications;
      acc.people_invited_to_call += r.people_invited_to_call;
      acc.onboarding_calls += r.onboarding_calls;
      acc.people_invited += r.people_invited;
      acc.people_joined += r.people_joined;
      acc.request_finance_demos += r.request_finance_demos;
      return acc;
    },
    {
      visitors: 0,
      application_page_views: 0,
      applications: 0,
      people_invited_to_call: 0,
      onboarding_calls: 0,
      people_invited: 0,
      people_joined: 0,
      request_finance_demos: 0,
    }
  );

  const chartData = [
    { step: "Visitors", value: totals.visitors, color: "#6366f1" },
    { step: "App page views", value: totals.application_page_views, color: "#8b5cf6" },
    { step: "Applications", value: totals.applications, color: "#ec4899" },
    { step: "Invited to call", value: totals.people_invited_to_call, color: "#a855f7" },
    { step: "Onboarding calls", value: totals.onboarding_calls, color: "#f59e0b" },
    { step: "People invited", value: totals.people_invited, color: "#10b981" },
    { step: "People joined", value: totals.people_joined, color: "#06b6d4" },
    { step: "RF demos", value: totals.request_finance_demos, color: "#f97316" },
  ];

  const handleFormChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const body = {
        date: form.date,
        visitors: form.visitors === "" ? 0 : parseInt(form.visitors, 10),
        application_page_views: form.application_page_views === "" ? 0 : parseInt(form.application_page_views, 10),
        applications: form.applications === "" ? 0 : parseInt(form.applications, 10),
        people_invited_to_call: form.people_invited_to_call === "" ? 0 : parseInt(form.people_invited_to_call, 10),
        onboarding_calls: form.onboarding_calls === "" ? 0 : parseInt(form.onboarding_calls, 10),
        people_invited: form.people_invited === "" ? 0 : parseInt(form.people_invited, 10),
        people_joined: form.people_joined === "" ? 0 : parseInt(form.people_joined, 10),
        request_finance_demos: form.request_finance_demos === "" ? 0 : parseInt(form.request_finance_demos, 10),
      };

      const res = await fetch("/api/club/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }

      setSubmitSuccess(true);
      setForm(EMPTY_FORM);
      await fetchData();
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
      }, 1200);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  const conversionRate = (num: number, denom: number) => {
    if (!denom) return "—";
    return `${Math.round((num / denom) * 100)}%`;
  };

  return (
    <div style={{ maxWidth: "960px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 600,
              marginBottom: "0.25rem",
              letterSpacing: "-0.02em",
            }}
          >
            Club Dashboard
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.9375rem", margin: 0 }}>
            Track the full membership funnel over time.
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setForm(EMPTY_FORM); setSubmitError(null); setSubmitSuccess(false); }}
          style={{
            padding: "0.5rem 1.125rem",
            backgroundColor: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          + Add data
        </button>
      </div>

      {/* Date filters */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <label style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>
          From
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              marginLeft: "0.5rem",
              padding: "0.3rem 0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "0.875rem",
              color: "#111827",
            }}
          />
        </label>
        <label style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>
          To
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              marginLeft: "0.5rem",
              padding: "0.3rem 0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "0.875rem",
              color: "#111827",
            }}
          />
        </label>
        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(""); setEndDate(""); }}
            style={{
              fontSize: "0.8125rem",
              color: "#6b7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading / error */}
      {loading && (
        <p style={{ color: "#6b7280", fontSize: "0.9375rem" }}>Loading…</p>
      )}
      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.9375rem" }}>{error}</p>
      )}

      {!loading && !error && (
        <>
          {/* Summary cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "0.75rem",
              marginBottom: "2rem",
            }}
          >
            {FUNNEL_FIELDS.map(({ key, label, color }) => (
              <div
                key={key}
                style={{
                  padding: "0.875rem 1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  borderTop: `3px solid ${color}`,
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    margin: "0 0 0.25rem 0",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {totals[key].toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Conversion rates */}
          <div
            style={{
              padding: "1rem 1.25rem",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              marginBottom: "2rem",
              backgroundColor: "#f9fafb",
            }}
          >
            <h2
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#374151",
                margin: "0 0 0.75rem 0",
              }}
            >
              Conversion rates (period total)
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
              {[
                { label: "Visitors → App page", num: totals.application_page_views, denom: totals.visitors },
                { label: "App page → Application", num: totals.applications, denom: totals.application_page_views },
                { label: "Application → Invited to call", num: totals.people_invited_to_call, denom: totals.applications },
                { label: "Invited to call → Onboarding call", num: totals.onboarding_calls, denom: totals.people_invited_to_call },
                { label: "Onboarding call → Invited", num: totals.people_invited, denom: totals.onboarding_calls },
                { label: "Invited → Joined", num: totals.people_joined, denom: totals.people_invited },
                { label: "Joined → RF demo", num: totals.request_finance_demos, denom: totals.people_joined },
              ].map(({ label, num, denom }) => (
                <div key={label}>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0 0 0.125rem 0" }}>{label}</p>
                  <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                    {conversionRate(num, denom)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          {filteredRows.length === 0 ? (
            <div
              style={{
                padding: "3rem 1rem",
                textAlign: "center",
                border: "1px dashed #d1d5db",
                borderRadius: "8px",
                color: "#6b7280",
                fontSize: "0.9375rem",
              }}
            >
              No data for this period. Click &ldquo;+ Add data&rdquo; to get started.
            </div>
          ) : (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "1.25rem",
                marginBottom: "2rem",
              }}
            >
              <h2
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#111827",
                  margin: "0 0 1.25rem 0",
                }}
              >
                Funnel over time
              </h2>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="step" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "0.8125rem",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [value != null ? Number(value).toLocaleString() : "0", "Total"]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.step} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Club funnel (from Applications) */}
          {filteredRows.length > 0 && (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "1.5rem 1.25rem",
                marginBottom: "2rem",
              }}
            >
              <h2
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#111827",
                  margin: "0 0 1.5rem 0",
                }}
              >
                Club funnel
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[
                  { label: "Applications", value: totals.applications, color: "#ec4899" },
                  { label: "Invited to call", value: totals.people_invited_to_call, color: "#a855f7" },
                  { label: "Onboarding calls", value: totals.onboarding_calls, color: "#f59e0b" },
                  { label: "People invited", value: totals.people_invited, color: "#10b981" },
                  { label: "People joined", value: totals.people_joined, color: "#06b6d4" },
                  { label: "RF demos", value: totals.request_finance_demos, color: "#f97316" },
                ].map(({ label, value, color }, i, arr) => {
                  const prev = i === 0 ? null : arr[i - 1].value;
                  const pct = prev && prev > 0 ? Math.round((value / prev) * 100) : null;
                  const widthPct = arr[0].value > 0 ? (value / arr[0].value) * 100 : 0;

                  return (
                    <div key={label}>
                      {/* Drop arrow between steps */}
                      {i > 0 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.375rem",
                            padding: "0.3rem 0",
                            color: "#9ca3af",
                            fontSize: "0.75rem",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 1v10M2 7l4 4 4-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {pct !== null && (
                            <span style={{ fontWeight: 600, color: pct >= 50 ? "#10b981" : pct >= 25 ? "#f59e0b" : "#ef4444" }}>
                              {pct}%
                            </span>
                          )}
                        </div>
                      )}

                      {/* Funnel bar row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(widthPct, 8)}%`,
                            minWidth: "160px",
                            backgroundColor: color,
                            borderRadius: "6px",
                            padding: "0.625rem 1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "1rem",
                            transition: "width 0.4s ease",
                          }}
                        >
                          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
                            {label}
                          </span>
                          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                            {value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Raw data table */}
          {filteredRows.length > 0 && (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb" }}>
                      <th style={thStyle}>Date</th>
                      {FUNNEL_FIELDS.map(({ label }) => (
                        <th key={label} style={thStyle}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r, i) => (
                      <tr
                        key={r.id}
                        style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                      >
                        <td style={tdStyle}>{formatDate(r.date)}</td>
                        {FUNNEL_FIELDS.map(({ key }) => (
                          <td key={key} style={{ ...tdStyle, textAlign: "right" }}>
                            {r[key].toLocaleString()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Per-date funnel cards */}
          {filteredRows.length > 0 && (
            <div style={{ marginTop: "2.5rem" }}>
              <h2
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#111827",
                  margin: "0 0 1rem 0",
                }}
              >
                Funnel by date
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1rem",
                }}
              >
                {filteredRows.map((r) => {
                    const steps = [
                    { label: "Visitors", value: r.visitors, color: "#6366f1" },
                    { label: "App page views", value: r.application_page_views, color: "#8b5cf6" },
                    { label: "Applications", value: r.applications, color: "#ec4899" },
                    { label: "Invited to call", value: r.people_invited_to_call, color: "#a855f7" },
                    { label: "Onboarding calls", value: r.onboarding_calls, color: "#f59e0b" },
                    { label: "People invited", value: r.people_invited, color: "#10b981" },
                    { label: "People joined", value: r.people_joined, color: "#06b6d4" },
                    { label: "RF demos", value: r.request_finance_demos, color: "#f97316" },
                  ];
                  const maxVal = Math.max(...steps.map((s) => s.value), 1);

                  return (
                    <div
                      key={r.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "1.125rem 1.25rem",
                        backgroundColor: "#fff",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                          color: "#111827",
                          margin: "0 0 1rem 0",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {formatDate(r.date)}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {steps.map(({ label, value, color }) => (
                          <div key={label}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "baseline",
                                marginBottom: "0.2rem",
                              }}
                            >
                              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{label}</span>
                              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827" }}>
                                {value.toLocaleString()}
                              </span>
                            </div>
                            <div
                              style={{
                                height: "5px",
                                borderRadius: "99px",
                                backgroundColor: "#f3f4f6",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${(value / maxVal) * 100}%`,
                                  backgroundColor: color,
                                  borderRadius: "99px",
                                  transition: "width 0.3s ease",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "2rem",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                Add funnel data
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.25rem",
                  color: "#6b7280",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {/* Date */}
                <label style={labelStyle}>
                  Date
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                    required
                    style={inputStyle}
                  />
                </label>

                {/* Funnel fields */}
                {FUNNEL_FIELDS.map(({ key, label }) => (
                  <label key={key} style={labelStyle}>
                    {label}
                    <input
                      type="number"
                      min={0}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => handleFormChange(key, e.target.value)}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </label>
                ))}
              </div>

              {submitError && (
                <p style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "0.75rem" }}>
                  {submitError}
                </p>
              )}
              {submitSuccess && (
                <p style={{ color: "#10b981", fontSize: "0.8125rem", marginTop: "0.75rem" }}>
                  Saved successfully!
                </p>
              )}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "0.625rem 0",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#374151",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "0.625rem 0",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#fff",
                    backgroundColor: submitting ? "#9ca3af" : "#111827",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.625rem 0.875rem",
  textAlign: "left",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#374151",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem 0.875rem",
  color: "#374151",
  borderBottom: "1px solid #f3f4f6",
  whiteSpace: "nowrap",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  padding: "0.4375rem 0.625rem",
  border: "1px solid #d1d5db",
  borderRadius: "5px",
  fontSize: "0.875rem",
  color: "#111827",
  outline: "none",
};
