"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAgentBySlug, getAgentCategoryStyles } from "@/lib/agents/data";

type TabId = "primary-keywords" | "master-variations";

type PrimaryKeywordEntry = {
  keyword: string;
  location: string;
  language: string;
  limit: number;
  depth: number;
};

export default function AgentDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const agent = getAgentBySlug(slug);

  const [activeTab, setActiveTab] = useState<TabId>("primary-keywords");
  const [keywords, setKeywords] = useState<PrimaryKeywordEntry[]>([]);
  const [keywordsLoading, setKeywordsLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const isSeoAgent = slug === "seo-agent";

  const defaultLocation = "United States";
  const defaultLanguage = "English";
  const defaultLimit = 200;
  const defaultDepth = 2;

  useEffect(() => {
    if (!isSeoAgent) return;
    setKeywordsLoading(true);
    fetch("/api/agents/seo/primary-keywords")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data.keywords) ? data.keywords : [];
        setKeywords(
          list.map((k: PrimaryKeywordEntry | string) =>
            typeof k === "string"
              ? { keyword: k, location: defaultLocation, language: defaultLanguage, limit: defaultLimit, depth: defaultDepth }
              : k
          )
        );
      })
      .catch(() => setKeywords([]))
      .finally(() => setKeywordsLoading(false));
  }, [isSeoAgent]);

  const handleGeneratePrimaryKeywords = async () => {
    if (!isSeoAgent) return;
    setGenerateError(null);
    setGenerateLoading(true);
    try {
      const res = await fetch("/api/agents/seo/primary-keywords", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      const list = Array.isArray(data.keywords) ? data.keywords : [];
      setKeywords(
        list.map((k: PrimaryKeywordEntry | string) =>
          typeof k === "string"
            ? { keyword: k, location: defaultLocation, language: defaultLanguage, limit: defaultLimit, depth: defaultDepth }
            : k
        )
      );
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    const trimmed = newKeyword.trim();
    if (!trimmed || !isSeoAgent) return;
    setAddError(null);
    setAddLoading(true);
    try {
      const res = await fetch("/api/agents/seo/primary-keywords/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: trimmed,
          location: defaultLocation,
          language: defaultLanguage,
          limit: defaultLimit,
          depth: defaultDepth,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Add failed");
      const list = Array.isArray(data.keywords) ? data.keywords : [];
      setKeywords(
        list.map((k: PrimaryKeywordEntry | string) =>
          typeof k === "string"
            ? { keyword: k, location: defaultLocation, language: defaultLanguage, limit: defaultLimit, depth: defaultDepth }
            : k
        )
      );
      setNewKeyword("");
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Failed to add keyword");
    } finally {
      setAddLoading(false);
    }
  };

  if (!agent) {
    return (
      <div>
        <Link
          href="/dashboard/agents"
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "1rem",
            cursor: "pointer",
          }}
        >
          ← Back to Agents
        </Link>
        <p style={{ color: "#6b7280" }}>Agent not found.</p>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "primary-keywords", label: "Primary keywords" },
    { id: "master-variations", label: "Master All KW Variations" },
  ];

  return (
    <div style={{ maxWidth: "960px" }}>
      <Link
        href="/dashboard/agents"
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          textDecoration: "none",
          display: "inline-block",
          cursor: "pointer",
        }}
      >
        ← Back to Agents
      </Link>

      <div style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.2rem 0.5rem",
            borderRadius: "9999px",
            ...getAgentCategoryStyles(agent.category),
          }}
        >
          {agent.category}
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
        {agent.name}
      </h1>
      <p
        style={{
          fontSize: "0.9375rem",
          color: "#6b7280",
          lineHeight: 1.5,
          marginBottom: "1.5rem",
        }}
      >
        {agent.description}
      </p>

      {isSeoAgent && (
        <>
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              marginBottom: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "0.75rem",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? "#111827" : "#6b7280",
                  backgroundColor: activeTab === tab.id ? "#f3f4f6" : "transparent",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleGeneratePrimaryKeywords}
              disabled={generateLoading}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#fff",
                backgroundColor: generateLoading ? "#9ca3af" : "#374151",
                border: "none",
                borderRadius: "8px",
                cursor: generateLoading ? "not-allowed" : "pointer",
              }}
            >
              {generateLoading ? "Generating…" : "Generate primary keywords"}
            </button>
            <button
              type="button"
              disabled
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#9ca3af",
                backgroundColor: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "not-allowed",
              }}
            >
              Find Keyword Opportunities
            </button>
          </div>
          {generateError && (
            <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
              {generateError}
            </p>
          )}

          {activeTab === "primary-keywords" && (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151", width: "48px" }}>#</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151" }}>Keyword</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151" }}>Location</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151" }}>Language</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151", width: "72px" }}>Limit</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151", width: "64px" }}>Depth</th>
                  </tr>
                </thead>
                <tbody>
                  {keywordsLoading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "1.5rem", color: "#6b7280" }}>Loading…</td>
                    </tr>
                  ) : keywords.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "1rem 1rem", color: "#6b7280", fontSize: "0.8125rem" }}>
                        No primary keywords yet. Add one below or use “Generate primary keywords”.
                      </td>
                    </tr>
                  ) : (
                    keywords.map((kw, i) => (
                      <tr key={`${i}-${kw.keyword}`} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>{i + 1}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#111827" }}>{kw.keyword}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#374151" }}>{kw.location}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#374151" }}>{kw.language}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#374151" }}>{kw.limit}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#374151" }}>{kw.depth}</td>
                      </tr>
                    ))
                  )}
                  {!keywordsLoading && (
                    <tr style={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#fafafa" }}>
                      <td style={{ padding: "0.5rem 1rem", color: "#9ca3af", fontSize: "0.8125rem" }}>—</td>
                      <td style={{ padding: "0.5rem 1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            placeholder="Enter primary keyword…"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddKeyword();
                              }
                            }}
                            disabled={addLoading}
                            style={{
                              padding: "0.5rem 0.75rem",
                              fontSize: "0.875rem",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              minWidth: "200px",
                              flex: "1 1 200px",
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddKeyword}
                            disabled={addLoading || !newKeyword.trim()}
                            style={{
                              padding: "0.5rem 0.75rem",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: addLoading || !newKeyword.trim() ? "#9ca3af" : "#fff",
                              backgroundColor: addLoading || !newKeyword.trim() ? "#f3f4f6" : "#374151",
                              border: "none",
                              borderRadius: "6px",
                              cursor: addLoading || !newKeyword.trim() ? "not-allowed" : "pointer",
                            }}
                          >
                            {addLoading ? "Adding…" : "Add"}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "0.5rem 1rem", color: "#6b7280", fontSize: "0.8125rem" }}>{defaultLocation}</td>
                      <td style={{ padding: "0.5rem 1rem", color: "#6b7280", fontSize: "0.8125rem" }}>{defaultLanguage}</td>
                      <td style={{ padding: "0.5rem 1rem", color: "#6b7280", fontSize: "0.8125rem" }}>{defaultLimit}</td>
                      <td style={{ padding: "0.5rem 1rem", color: "#6b7280", fontSize: "0.8125rem" }}>{defaultDepth}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {addError && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: "0.5rem 1rem 0", padding: "0 0 0.5rem" }}>
                  {addError}
                </p>
              )}
            </div>
          )}

          {activeTab === "master-variations" && (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "2rem",
                backgroundColor: "#fafafa",
                color: "#6b7280",
                fontSize: "0.875rem",
              }}
            >
              Master All KW Variations — coming soon. This tab will show keyword variations and expansion.
            </div>
          )}
        </>
      )}

      {!isSeoAgent && (
        <p style={{ color: "#6b7280" }}>This agent does not have a custom interface yet.</p>
      )}
    </div>
  );
}
