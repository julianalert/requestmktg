"use client";

import { useState, useEffect, useCallback, Fragment } from "react";

interface ContentIdea {
  id: string;
  category: string;
  headline: string;
  draft: string;
  target_persona: string;
  channel: string;
  engagement_cta: string;
  created_at: string;
}

// Tracks which (idea_id, type) combos have already been generated
type GeneratedKey = string; // `${idea_id}-${type}`

const PERSONA_LABELS: Record<string, string> = {
  A: "Web3 CFO", B: "Advisor", C: "Web2 CFO", All: "All",
};
const PERSONA_COLORS: Record<string, string> = {
  A: "#2b6ff4", B: "#d4a017", C: "#14b8a6", All: "#6b7280",
};
const CHANNEL_COLORS: Record<string, string> = {
  Slack: "#4a154b", LinkedIn: "#0a66c2", X: "#000000", All: "#6b7280",
};
const CATEGORY_COLORS: Record<string, string> = {
  "Stablecoin News & Regulatory Update": "#f59e0b",
  "Practitioner Tip": "#10b981",
  "Tool & Stack Insight": "#6366f1",
  "Data Point / Stat": "#06b6d4",
  "Question / Discussion Starter": "#8b5cf6",
  "Web2 Bridge Content": "#14b8a6",
  "Industry / Vertical Spotlight": "#d4a017",
  "Hot Take / Contrarian View": "#ef4444",
};

const CATEGORIES = [
  "Stablecoin News & Regulatory Update",
  "Practitioner Tip",
  "Tool & Stack Insight",
  "Data Point / Stat",
  "Question / Discussion Starter",
  "Web2 Bridge Content",
  "Industry / Vertical Spotlight",
  "Hot Take / Contrarian View",
] as const;

export default function ContentIdeasPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("mix");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Per-button loading state: key = `${idea_id}-${type}`
  const [buttonLoading, setButtonLoading] = useState<Set<string>>(new Set());
  // Keys that have been generated this session or pre-exist
  const [generatedKeys, setGeneratedKeys] = useState<Set<GeneratedKey>>(new Set());
  const [buttonError, setButtonError] = useState<Record<string, string>>({});

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/club/content-ideas");
      if (!res.ok) throw new Error("Failed to fetch ideas");
      setIdeas(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load which content pieces already exist
  const fetchExisting = useCallback(async () => {
    try {
      const res = await fetch("/api/club/content");
      if (!res.ok) return;
      const pieces: Array<{ idea_id: string; type: string }> = await res.json();
      const keys = new Set(pieces.map((p) => `${p.idea_id}-${p.type}`));
      setGeneratedKeys(keys);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
    fetchExisting();
  }, [fetchIdeas, fetchExisting]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/club/content-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory === "mix" ? null : selectedCategory }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      await fetchIdeas();
      setGenerating(false);
    }
  };

  const handleCreate = async (ideaId: string, type: "slack" | "linkedin" | "x") => {
    const key = `${ideaId}-${type}`;
    setButtonLoading((prev) => new Set(prev).add(key));
    setButtonError((prev) => { const n = { ...prev }; delete n[key]; return n; });

    try {
      const res = await fetch("/api/club/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea_id: ideaId, type }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      setGeneratedKeys((prev) => new Set(prev).add(key));
    } catch (e) {
      setButtonError((prev) => ({
        ...prev,
        [key]: e instanceof Error ? e.message : "Failed",
      }));
    } finally {
      setButtonLoading((prev) => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const displayedIdeas = categoryFilter === "all"
    ? ideas
    : ideas.filter((i) => i.category === categoryFilter);

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
            Content Ideas
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.9375rem", margin: 0 }}>
            AI-generated ideas for Slack, LinkedIn &amp; X — click an action button to create the post.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={generating}
            style={{
              padding: "0.5rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "0.8125rem",
              color: "#374151",
              backgroundColor: "#fff",
              cursor: generating ? "not-allowed" : "pointer",
              outline: "none",
            }}
          >
            <option value="mix">Mix of all categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.5625rem 1.125rem",
              backgroundColor: generating ? "#9ca3af" : "#111827",
              color: "#fff", border: "none", borderRadius: "6px",
              fontSize: "0.875rem", fontWeight: 600,
              cursor: generating ? "not-allowed" : "pointer",
            }}
          >
            {generating ? <><Spinner /> Generating…</> : <>✦ Find new content ideas</>}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "0.75rem 1rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}
      {generating && (
        <div style={{ padding: "0.875rem 1rem", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", color: "#1d4ed8", fontSize: "0.875rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Spinner color="#1d4ed8" />
          Claude is generating 10 new content ideas… this takes about 15 seconds.
        </div>
      )}
      {loading && !generating && <p style={{ color: "#6b7280", fontSize: "0.9375rem" }}>Loading…</p>}

      {/* Category filter pills */}
      {!loading && ideas.length > 0 && (
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <FilterPill
            label="All"
            count={ideas.length}
            active={categoryFilter === "all"}
            color="#374151"
            bg="#f3f4f6"
            onClick={() => setCategoryFilter("all")}
          />
          {CATEGORIES.map((cat) => {
            const count = ideas.filter((i) => i.category === cat).length;
            if (count === 0) return null;
            const color = CATEGORY_COLORS[cat] ?? "#6b7280";
            return (
              <FilterPill
                key={cat}
                label={cat}
                count={count}
                active={categoryFilter === cat}
                color={color}
                bg={color + "18"}
                onClick={() => setCategoryFilter(cat)}
              />
            );
          })}
        </div>
      )}

      {!loading && !generating && ideas.length === 0 && (
        <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed #d1d5db", borderRadius: "10px", color: "#9ca3af" }}>
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>No ideas yet</p>
          <p style={{ fontSize: "0.875rem", margin: 0 }}>Click &ldquo;✦ Find new content ideas&rdquo; to generate your first batch.</p>
        </div>
      )}

      {!loading && displayedIdeas.length > 0 && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ ...thStyle, width: "140px" }}>Category</th>
                <th style={thStyle}>Headline / Hook</th>
                <th style={{ ...thStyle, width: "90px" }}>Persona</th>
                <th style={{ ...thStyle, width: "90px" }}>Channel</th>
                <th style={{ ...thStyle, width: "110px" }}>Date</th>
                <th style={{ ...thStyle, width: "250px" }}>Create post</th>
              </tr>
            </thead>
            <tbody>
              {displayedIdeas.map((idea, i) => {
                const isExpanded = expandedId === idea.id;
                const catColor = CATEGORY_COLORS[idea.category] ?? "#6b7280";
                const chanColor = CHANNEL_COLORS[idea.channel] ?? "#6b7280";
                const personaColor = PERSONA_COLORS[idea.target_persona] ?? "#6b7280";

                return (
                  <Fragment key={idea.id}>
                    <tr
                      style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa", cursor: "pointer" }}
                      onClick={() => setExpandedId(isExpanded ? null : idea.id)}
                    >
                      {/* Category */}
                      <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                        <span style={{ display: "inline-block", fontSize: "0.6875rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: catColor + "18", color: catColor, lineHeight: 1.4 }}>
                          {idea.category}
                        </span>
                      </td>

                      {/* Headline */}
                      <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                        <span style={{ fontWeight: 500, color: "#111827", lineHeight: 1.45 }}>{idea.headline}</span>
                        <span style={{ display: "inline-block", marginLeft: "0.5rem", fontSize: "0.6875rem", color: "#9ca3af" }}>
                          {isExpanded ? "▲ hide" : "▼ draft"}
                        </span>
                      </td>

                      {/* Persona */}
                      <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: personaColor + "18", color: personaColor }}>
                          {PERSONA_LABELS[idea.target_persona] ?? idea.target_persona}
                        </span>
                      </td>

                      {/* Channel */}
                      <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: chanColor + "18", color: chanColor }}>
                          {idea.channel}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ ...tdStyle, color: "#9ca3af", verticalAlign: "middle" }}>
                        {formatDate(idea.created_at)}
                      </td>

                      {/* Action buttons */}
                      <td style={{ ...tdStyle, verticalAlign: "middle" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                          {(["x", "linkedin", "slack"] as const).map((type) => {
                            const key = `${idea.id}-${type}`;
                            const isLoading = buttonLoading.has(key);
                            const isDone = generatedKeys.has(key);
                            const errMsg = buttonError[key];
                            return (
                              <button
                                key={type}
                                onClick={() => handleCreate(idea.id, type)}
                                disabled={isLoading}
                                title={errMsg ?? (isDone ? "Already created — create again?" : `Create ${type} post`)}
                                style={{
                                  display: "flex", alignItems: "center", gap: "0.25rem",
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.6875rem", fontWeight: 600,
                                  border: `1px solid ${errMsg ? "#fca5a5" : isDone ? "#86efac" : "#e5e7eb"}`,
                                  borderRadius: "4px",
                                  backgroundColor: errMsg ? "#fef2f2" : isDone ? "#f0fdf4" : "#fff",
                                  color: errMsg ? "#dc2626" : isDone ? "#16a34a" : "#374151",
                                  cursor: isLoading ? "not-allowed" : "pointer",
                                  whiteSpace: "nowrap",
                                  opacity: isLoading ? 0.7 : 1,
                                }}
                              >
                                {isLoading ? (
                                  <><Spinner color="#6b7280" size={10} />{TYPE_LABEL[type]}</>
                                ) : isDone ? (
                                  <>✓ {TYPE_LABEL[type]}</>
                                ) : (
                                  TYPE_LABEL[type]
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {Object.entries(buttonError)
                          .filter(([k]) => k.startsWith(idea.id))
                          .map(([k, msg]) => (
                            <p key={k} style={{ fontSize: "0.6875rem", color: "#dc2626", margin: "0.25rem 0 0 0" }}>
                              {msg.slice(0, 60)}
                            </p>
                          ))}
                      </td>
                    </tr>

                    {/* Expanded brief row */}
                    {isExpanded && (
                      <tr style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td colSpan={6} style={{ padding: "0 1.25rem 1.25rem 1.25rem" }}>
                          <div style={{ padding: "1rem 1.125rem", backgroundColor: "#f8faff", border: "1px solid #e5e7eb", borderRadius: "8px", display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem" }}>
                            <div>
                              <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.5rem 0" }}>Brief</p>
                              <p style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{idea.draft}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.5rem 0" }}>Engagement CTA</p>
                              <p style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.6, margin: 0 }}>{idea.engagement_cta}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && ideas.length > 0 && (
        <p style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
          {displayedIdeas.length} idea{displayedIdeas.length !== 1 ? "s" : ""}
          {categoryFilter !== "all" ? ` in "${categoryFilter}"` : ""} · {ideas.length} total
        </p>
      )}
    </div>
  );
}

function FilterPill({ label, count, active, color, bg, onClick }: {
  label: string; count: number; active: boolean;
  color: string; bg: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.25rem 0.625rem",
        fontSize: "0.75rem", fontWeight: active ? 700 : 500,
        border: `1px solid ${active ? color : "#e5e7eb"}`,
        borderRadius: "99px",
        backgroundColor: active ? bg : "#fff",
        color: active ? color : "#6b7280",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <span style={{ marginLeft: "0.3rem", opacity: 0.65 }}>({count})</span>
    </button>
  );
}

const TYPE_LABEL: Record<string, string> = { x: "𝕏 Post", linkedin: "in Post", slack: "💬 Post" };

function Spinner({ color = "#fff", size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="7" cy="7" r="5.5" stroke={color} strokeOpacity="0.25" strokeWidth="2" />
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.625rem 1rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700,
  color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em",
  borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
};
const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem", borderBottom: "1px solid #f3f4f6",
};
