import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
        Select a section from the sidebar.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link
          href="/dashboard/marketing"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "6px",
            textDecoration: "none",
            color: "#111827",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Marketing
        </Link>
        <Link
          href="/dashboard/workflows"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "6px",
            textDecoration: "none",
            color: "#111827",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Workflows
        </Link>
        <Link
          href="/dashboard/agents"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "6px",
            textDecoration: "none",
            color: "#111827",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Agents
        </Link>
      </div>
    </div>
  );
}
