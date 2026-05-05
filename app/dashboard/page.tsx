"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface KpiRow {
  id: string;
  date: string;
  traffic: number;
  signups: number;
  demo_bookings: number;
  demo_completed: number;
  paid_users: number;
  club_members_onboarded: number;
}

const KPI_FIELDS: {
  key: keyof Omit<KpiRow, "id" | "date">;
  label: string;
  color: string;
}[] = [
  { key: "traffic", label: "Traffic", color: "#6366f1" },
  { key: "signups", label: "Signups", color: "#8b5cf6" },
  { key: "demo_bookings", label: "Demo bookings", color: "#ec4899" },
  { key: "demo_completed", label: "Demos completed", color: "#f59e0b" },
  { key: "paid_users", label: "Paid users", color: "#10b981" },
  { key: "club_members_onboarded", label: "Club members", color: "#06b6d4" },
];

const EMPTY_FORM = {
  date: new Date().toISOString().split("T")[0],
  traffic: "",
  signups: "",
  demo_bookings: "",
  demo_completed: "",
  paid_users: "",
  club_members_onboarded: "",
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function wowDelta(latest: number, prev: number | undefined): { pct: number | null; abs: number | null } {
  if (prev === undefined || prev === 0) return { pct: null, abs: null };
  return {
    pct: Math.round(((latest - prev) / prev) * 100),
    abs: latest - prev,
  };
}

export default function DashboardPage() {
  const [rows, setRows] = useState<KpiRow[]>([]);
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
      const res = await fetch("/api/marketing/kpi");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data: KpiRow[] = await res.json();
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

  const latestRow = filteredRows[filteredRows.length - 1];
  const prevRow = filteredRows[filteredRows.length - 2];

  const trendChartData = filteredRows.map((r) => ({
    date: formatDate(r.date),
    traffic: r.traffic,
    signups: r.signups,
    demo_bookings: r.demo_bookings,
    demo_completed: r.demo_completed,
    paid_users: r.paid_users,
    club_members_onboarded: r.club_members_onboarded,
  }));

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
        traffic: form.traffic === "" ? 0 : parseInt(form.traffic, 10),
        signups: form.signups === "" ? 0 : parseInt(form.signups, 10),
        demo_bookings: form.demo_bookings === "" ? 0 : parseInt(form.demo_bookings, 10),
        demo_completed: form.demo_completed === "" ? 0 : parseInt(form.demo_completed, 10),
        paid_users: form.paid_users === "" ? 0 : parseInt(form.paid_users, 10),
        club_members_onboarded: form.club_members_onboarded === "" ? 0 : parseInt(form.club_members_onboarded, 10),
      };

      const res = await fetch("/api/marketing/kpi", {
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

  return (
    <div style={{ maxWidth: "960px" }}>
      {/* Section links */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {[
          { href: "/dashboard/marketing", label: "Marketing" },
          { href: "/dashboard/workflows", label: "Workflows" },
          { href: "/dashboard/experiments", label: "Experiments" },
          { href: "/dashboard/agents", label: "Agents" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              padding: "0.375rem 0.875rem",
              backgroundColor: "#f3f4f6",
              borderRadius: "6px",
              textDecoration: "none",
              color: "#374151",
              fontSize: "0.8125rem",
              fontWeight: 500,
            }}
          >
            {label}
          </Link>
        ))}
      </div>

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
            Marketing KPI Dashboard
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.9375rem", margin: 0 }}>
            Week-over-week evolution across all key metrics.
          </p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setForm(EMPTY_FORM);
            setSubmitError(null);
            setSubmitSuccess(false);
          }}
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
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
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

      {loading && <p style={{ color: "#6b7280", fontSize: "0.9375rem" }}>Loading…</p>}
      {error && <p style={{ color: "#ef4444", fontSize: "0.9375rem" }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* KPI Summary cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "0.75rem",
              marginBottom: "2rem",
            }}
          >
            {KPI_FIELDS.map(({ key, label, color }) => {
              const latest = latestRow?.[key] ?? 0;
              const delta = wowDelta(latest, prevRow?.[key]);
              const isUp = delta.pct !== null && delta.pct > 0;
              const isDown = delta.pct !== null && delta.pct < 0;

              return (
                <div
                  key={key}
                  style={{
                    padding: "0.875rem 1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    borderTop: `3px solid ${color}`,
                  }}
                >
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0 0 0.375rem 0", fontWeight: 500 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: "0 0 0.375rem 0", letterSpacing: "-0.02em" }}>
                    {latest.toLocaleString()}
                  </p>
                  {delta.pct === null ? (
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>—</span>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: isUp ? "#10b981" : isDown ? "#ef4444" : "#6b7280",
                        backgroundColor: isUp ? "#f0fdf4" : isDown ? "#fef2f2" : "#f9fafb",
                        borderRadius: "4px",
                        padding: "0.125rem 0.375rem",
                      }}
                    >
                      {isUp ? "▲" : isDown ? "▼" : ""}
                      {isUp ? "+" : ""}{delta.pct}%
                    </span>
                  )}
                  <p style={{ fontSize: "0.6875rem", color: "#9ca3af", margin: "0.25rem 0 0 0" }}>
                    vs prev week
                  </p>
                </div>
              );
            })}
          </div>

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
            <>
              {/* Per-KPI trend charts */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                {KPI_FIELDS.map(({ key, label, color }) => (
                  <div
                    key={key}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "1rem 1rem 0.5rem",
                    }}
                  >
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#111827", margin: "0 0 0.875rem 0" }}>
                      {label}
                    </p>
                    <ResponsiveContainer width="100%" height={140}>
                      <AreaChart data={trendChartData} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          tickLine={false}
                          axisLine={false}
                          width={36}
                          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                        />
                        <Tooltip
                          contentStyle={{ border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "0.75rem" }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => [Number(value).toLocaleString(), label]}
                        />
                        <Area
                          type="monotone"
                          dataKey={key}
                          stroke={color}
                          strokeWidth={2}
                          fill={`url(#grad-${key})`}
                          dot={{ r: 3, fill: color, strokeWidth: 0 }}
                          activeDot={{ r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>

              {/* Raw data table */}
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
                        <th style={thStyle}>Week</th>
                        {KPI_FIELDS.map(({ label }) => (
                          <th key={label} style={thStyle}>{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredRows].reverse().map((r, i, arr) => {
                        const prev = arr[i + 1];
                        return (
                          <tr key={r.id} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                            <td style={tdStyle}>{formatDate(r.date)}</td>
                            {KPI_FIELDS.map(({ key }) => {
                              const val = r[key];
                              const d = wowDelta(val, prev?.[key]);
                              return (
                                <td key={key} style={{ ...tdStyle, textAlign: "right" }}>
                                  <span style={{ fontWeight: 500 }}>{val.toLocaleString()}</span>
                                  {d.pct !== null && (
                                    <span
                                      style={{
                                        marginLeft: "0.375rem",
                                        fontSize: "0.6875rem",
                                        fontWeight: 600,
                                        color: d.pct > 0 ? "#10b981" : d.pct < 0 ? "#ef4444" : "#9ca3af",
                                      }}
                                    >
                                      {d.pct > 0 ? "+" : ""}{d.pct}%
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
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
              maxHeight: "90vh",
              overflowY: "auto",
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
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>Add KPI data</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.25rem", color: "#6b7280", cursor: "pointer", lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <label style={labelStyle}>
                  Week of (date)
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                    required
                    style={inputStyle}
                  />
                </label>

                {KPI_FIELDS.map(({ key, label }) => (
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
                <p style={{ color: "#ef4444", fontSize: "0.8125rem", marginTop: "0.75rem" }}>{submitError}</p>
              )}
              {submitSuccess && (
                <p style={{ color: "#10b981", fontSize: "0.8125rem", marginTop: "0.75rem" }}>Saved successfully!</p>
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
