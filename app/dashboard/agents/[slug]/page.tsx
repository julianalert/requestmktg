"use client";

import { useState, useEffect, useMemo } from "react";
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

type KeywordOpportunity = {
  id?: string;
  keyword: string;
  primary_keyword: string;
  type: string;
  msv: number | null;
  search_intent: string | null;
  kw_difficulty: number | null;
  competition: number | null;
  cpc: number | null;
  created_at?: string;
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
  const [opportunities, setOpportunities] = useState<KeywordOpportunity[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [findOpportunitiesLoading, setFindOpportunitiesLoading] = useState<string | null>(null);
  const [findOpportunitiesError, setFindOpportunitiesError] = useState<string | null>(null);
  const [primaryKeywordFilter, setPrimaryKeywordFilter] = useState<string>("");
  const [masterSortKey, setMasterSortKey] = useState<keyof KeywordOpportunity | "">("");
  const [masterSortDir, setMasterSortDir] = useState<"asc" | "desc">("asc");
  const [masterDisplayCount, setMasterDisplayCount] = useState(250);

  const isSeoAgent = slug === "seo-agent";

  const MASTER_PAGE_SIZE = 250;

  const defaultLocation = "United States";
  const defaultLanguage = "English";
  const defaultLimit = 200;
  const defaultDepth = 2;

  const fetchOpportunities = () => {
    if (!isSeoAgent) return;
    setOpportunitiesLoading(true);
    fetch("/api/agents/seo/keyword-opportunities")
      .then((res) => res.json())
      .then((data) => {
        setOpportunities(Array.isArray(data.opportunities) ? data.opportunities : []);
      })
      .catch(() => setOpportunities([]))
      .finally(() => setOpportunitiesLoading(false));
  };

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

  useEffect(() => {
    if (isSeoAgent && activeTab === "master-variations") fetchOpportunities();
  }, [isSeoAgent, activeTab]);

  const masterPrimaryKeywordsList = useMemo(() => {
    const set = new Set(opportunities.map((o) => o.primary_keyword).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [opportunities]);

  const masterFiltered = useMemo(() => {
    if (!primaryKeywordFilter) return opportunities;
    return opportunities.filter((o) => o.primary_keyword === primaryKeywordFilter);
  }, [opportunities, primaryKeywordFilter]);

  const masterSorted = useMemo(() => {
    const key = masterSortKey;
    const dir = masterSortDir;
    if (!key) return [...masterFiltered];
    return [...masterFiltered].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      const isNum = typeof av === "number" && typeof bv === "number";
      const isNullA = av == null;
      const isNullB = bv == null;
      if (isNullA && isNullB) return 0;
      if (isNullA) return dir === "asc" ? 1 : -1;
      if (isNullB) return dir === "asc" ? -1 : 1;
      if (isNum) return dir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
      const sa = String(av).toLowerCase();
      const sb = String(bv).toLowerCase();
      return dir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
  }, [masterFiltered, masterSortKey, masterSortDir]);

  const masterVisible = useMemo(
    () => masterSorted.slice(0, masterDisplayCount),
    [masterSorted, masterDisplayCount]
  );
  const masterHasMore = masterSorted.length > masterDisplayCount;

  const handleMasterSort = (key: keyof KeywordOpportunity) => {
    if (masterSortKey === key) {
      setMasterSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setMasterSortKey(key);
      setMasterSortDir("asc");
    }
  };

  useEffect(() => {
    setMasterDisplayCount(MASTER_PAGE_SIZE);
  }, [primaryKeywordFilter]);

  const handleFindOpportunities = async (kw: PrimaryKeywordEntry) => {
    if (!isSeoAgent) return;
    setFindOpportunitiesError(null);
    setFindOpportunitiesLoading(kw.keyword);
    try {
      const res = await fetch("/api/agents/seo/keyword-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryKeyword: kw.keyword,
          location: kw.location,
          language: kw.language,
          limit: kw.limit,
          depth: kw.depth,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      fetchOpportunities();
      if (activeTab !== "master-variations") setActiveTab("master-variations");
    } catch (e) {
      setFindOpportunitiesError(e instanceof Error ? e.message : "Find keyword opportunities failed");
    } finally {
      setFindOpportunitiesLoading(null);
    }
  };

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

          {activeTab === "primary-keywords" && (
            <>
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
              </div>
              {generateError && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                  {generateError}
                </p>
              )}
            </>
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
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151", width: "140px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {keywordsLoading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "1.5rem", color: "#6b7280" }}>Loading…</td>
                    </tr>
                  ) : keywords.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "1rem 1rem", color: "#6b7280", fontSize: "0.8125rem" }}>
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
                        <td style={{ padding: "0.5rem 1rem" }}>
                          <button
                            type="button"
                            onClick={() => handleFindOpportunities(kw)}
                            disabled={findOpportunitiesLoading !== null}
                            style={{
                              padding: "0.35rem 0.6rem",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: findOpportunitiesLoading === kw.keyword ? "#6b7280" : "#0369a1",
                              backgroundColor: findOpportunitiesLoading === kw.keyword ? "#f3f4f6" : "#e0f2fe",
                              border: "1px solid #bae6fd",
                              borderRadius: "6px",
                              cursor: findOpportunitiesLoading !== null ? "not-allowed" : "pointer",
                            }}
                          >
                            {findOpportunitiesLoading === kw.keyword ? "Finding…" : "Find opportunities"}
                          </button>
                        </td>
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
                      <td style={{ padding: "0.5rem 1rem" }}></td>
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
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              {findOpportunitiesError && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: "0.75rem 1rem 0", padding: "0 0 0.5rem" }}>
                  {findOpportunitiesError}
                </p>
              )}
              {opportunities.length > 0 && (
                <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Primary keyword:</label>
                  <select
                    value={primaryKeywordFilter}
                    onChange={(e) => setPrimaryKeywordFilter(e.target.value)}
                    style={{
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.875rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      minWidth: "180px",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">All</option>
                    {masterPrimaryKeywordsList.map((pk) => (
                      <option key={pk} value={pk}>{pk}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                    {masterFiltered.length} keyword{masterFiltered.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {(["keyword", "primary_keyword", "type", "msv", "search_intent", "kw_difficulty", "competition", "cpc"] as const).map((col) => {
                      const label = col === "primary_keyword" ? "Primary keyword" : col === "search_intent" ? "Search intent" : col === "kw_difficulty" ? "KW difficulty" : col === "msv" ? "MSV" : col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, " ");
                      const active = masterSortKey === col;
                      return (
                        <th
                          key={col}
                          onClick={() => handleMasterSort(col)}
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "left",
                            fontWeight: 600,
                            color: "#374151",
                            width: col === "msv" || col === "kw_difficulty" || col === "competition" ? "90px" : col === "cpc" ? "64px" : undefined,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          {label}
                          {active && (masterSortDir === "asc" ? " ↑" : " ↓")}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {opportunitiesLoading ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "1.5rem", color: "#6b7280" }}>Loading…</td>
                    </tr>
                  ) : opportunities.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "1.5rem", color: "#6b7280", fontSize: "0.875rem" }}>
                        No keyword opportunities yet. In the Primary keywords tab, click “Find opportunities” on a row to fetch related keywords, suggestions, and ideas from DataForSEO.
                      </td>
                    </tr>
                  ) : (
                    masterVisible.map((o) => (
                      <tr key={o.id ?? `${o.keyword}-${o.primary_keyword}-${o.type}`} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "0.75rem 1rem", color: "#111827" }}>{o.keyword}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#374151" }}>{o.primary_keyword}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#6b7280", fontSize: "0.8125rem" }}>
                          {o.type === "related_keywords" ? "Related" : o.type === "keyword_suggestions" ? "Suggestions" : "Ideas"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#374151" }}>{o.msv != null ? o.msv.toLocaleString() : "—"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#374151", fontSize: "0.8125rem" }}>{o.search_intent ?? "—"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#374151" }}>{o.kw_difficulty != null ? o.kw_difficulty : "—"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#374151" }}>{o.competition != null ? (o.competition * 100).toFixed(0) + "%" : "—"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#374151" }}>{o.cpc != null ? "$" + o.cpc.toFixed(2) : "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {!opportunitiesLoading && masterHasMore && (
                <div style={{ padding: "1rem", borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => setMasterDisplayCount((c) => c + MASTER_PAGE_SIZE)}
                    style={{
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#0369a1",
                      backgroundColor: "#e0f2fe",
                      border: "1px solid #bae6fd",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Load more ({masterVisible.length} of {masterSorted.length})
                  </button>
                </div>
              )}
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
