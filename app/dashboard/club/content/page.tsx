"use client";

import { useState, useEffect, useCallback, Fragment } from "react";

type ContentType = "slack" | "linkedin" | "x";

interface SlackContent {
  post_text: string;
  discussion_cta: string;
  suggested_channel: string;
}
interface LinkedInContent {
  post_text: string;
  hook_line: string;
  cta_line: string;
  hashtags: string[];
  target_persona: string;
}
interface XContent {
  tweet_text: string;
  is_thread: boolean;
  thread_tweets: string[];
  engagement_hook: string;
}

interface ContentPiece {
  id: string;
  idea_id: string | null;
  type: ContentType;
  category: string;
  headline: string;
  content: SlackContent | LinkedInContent | XContent;
  created_at: string;
}

const TYPE_CONFIG: Record<ContentType, { label: string; color: string; bg: string }> = {
  slack:    { label: "Slack",    color: "#4a154b", bg: "#f3e8ff" },
  linkedin: { label: "LinkedIn", color: "#0a66c2", bg: "#dbeafe" },
  x:        { label: "X",       color: "#111827", bg: "#f3f4f6" },
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

type Filter = "all" | ContentType;

export default function ListOfContentPage() {
  const [pieces, setPieces] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchPieces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/club/content");
      if (!res.ok) throw new Error("Failed to fetch content");
      setPieces(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPieces(); }, [fetchPieces]);

  const filtered = filter === "all" ? pieces : pieces.filter((p) => p.type === filter);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const counts = {
    all: pieces.length,
    slack: pieces.filter((p) => p.type === "slack").length,
    linkedin: pieces.filter((p) => p.type === "linkedin").length,
    x: pieces.filter((p) => p.type === "x").length,
  };

  return (
    <div style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
          List of Content
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9375rem", margin: 0 }}>
          All content pieces created from ideas. Click a row to read the full post.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.5rem" }}>
        {(["all", "slack", "linkedin", "x"] as const).map((f) => {
          const isActive = filter === f;
          const cfg = f === "all" ? null : TYPE_CONFIG[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "0.375rem 0.875rem",
                fontSize: "0.8125rem", fontWeight: 600,
                border: `1px solid ${isActive ? (cfg?.color ?? "#111827") : "#e5e7eb"}`,
                borderRadius: "6px",
                backgroundColor: isActive ? (cfg?.bg ?? "#f3f4f6") : "#fff",
                color: isActive ? (cfg?.color ?? "#111827") : "#6b7280",
                cursor: "pointer",
              }}
            >
              {f === "all" ? "All" : TYPE_CONFIG[f].label}
              <span style={{ marginLeft: "0.375rem", fontSize: "0.6875rem", opacity: 0.7 }}>
                ({counts[f]})
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ padding: "0.75rem 1rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}
      {loading && <p style={{ color: "#6b7280" }}>Loading…</p>}

      {!loading && filtered.length === 0 && (
        <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed #d1d5db", borderRadius: "10px", color: "#9ca3af" }}>
          <p style={{ fontSize: "1rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>No content yet</p>
          <p style={{ fontSize: "0.875rem", margin: 0 }}>
            Go to Content Ideas and click a platform button to generate your first piece.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ ...thStyle, width: "80px" }}>Type</th>
                <th style={{ ...thStyle, width: "130px" }}>Category</th>
                <th style={thStyle}>Headline</th>
                <th style={{ ...thStyle, width: "110px" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((piece, i) => {
                const isExpanded = expandedId === piece.id;
                const typeCfg = TYPE_CONFIG[piece.type];
                const catColor = CATEGORY_COLORS[piece.category] ?? "#6b7280";

                return (
                  <Fragment key={piece.id}>
                    <tr
                      style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa", cursor: "pointer" }}
                      onClick={() => setExpandedId(isExpanded ? null : piece.id)}
                    >
                      <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: typeCfg.bg, color: typeCfg.color }}>
                          {typeCfg.label}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: catColor + "18", color: catColor }}>
                          {piece.category}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                        <span style={{ fontWeight: 500, color: "#111827" }}>{piece.headline}</span>
                        <span style={{ marginLeft: "0.5rem", fontSize: "0.6875rem", color: "#9ca3af" }}>
                          {isExpanded ? "▲ hide" : "▼ read"}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: "#9ca3af", verticalAlign: "middle" }}>
                        {formatDate(piece.created_at)}
                      </td>
                    </tr>

                    {/* Expanded content */}
                    {isExpanded && (
                      <tr style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td colSpan={4} style={{ padding: "0 1.25rem 1.5rem 1.25rem" }}>
                          <ContentView piece={piece} />
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

      {!loading && pieces.length > 0 && (
        <p style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
          {filtered.length} piece{filtered.length !== 1 ? "s" : ""}
          {filter !== "all" ? ` (${TYPE_CONFIG[filter].label})` : ""} · {pieces.length} total
        </p>
      )}
    </div>
  );
}

/* ─── Content renderers ───────────────────────────────────────────────── */

function ContentView({ piece }: { piece: ContentPiece }) {
  if (piece.type === "slack") return <SlackView content={piece.content as SlackContent} />;
  if (piece.type === "linkedin") return <LinkedInView content={piece.content as LinkedInContent} />;
  return <XView content={piece.content as XContent} />;
}

function SlackView({ content }: { content: SlackContent }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "1.25rem", padding: "1rem 1.125rem", backgroundColor: "#f8faff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
      <div>
        <Label>Post text</Label>
        <PostBody text={content.post_text} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <Label>Discussion CTA</Label>
          <p style={metaText}>{content.discussion_cta}</p>
        </div>
        <div>
          <Label>Suggested channel</Label>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#4a154b", backgroundColor: "#f3e8ff", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
            {content.suggested_channel}
          </span>
        </div>
      </div>
    </div>
  );
}

function LinkedInView({ content }: { content: LinkedInContent }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "1.25rem", padding: "1rem 1.125rem", backgroundColor: "#f8faff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
      <div>
        <Label>Post text</Label>
        <PostBody text={content.post_text} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <Label>Hook line</Label>
          <p style={{ ...metaText, fontStyle: "italic" }}>{content.hook_line}</p>
        </div>
        <div>
          <Label>CTA line</Label>
          <p style={metaText}>{content.cta_line}</p>
        </div>
        {content.hashtags?.length > 0 && (
          <div>
            <Label>Hashtags</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
              {content.hashtags.map((h) => (
                <span key={h} style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#0a66c2", backgroundColor: "#dbeafe", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                  #{h}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function XView({ content }: { content: XContent }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "1.25rem", padding: "1rem 1.125rem", backgroundColor: "#f8faff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
      <div>
        <Label>{content.is_thread ? "Thread — Tweet 1" : "Tweet"}</Label>
        <PostBody text={content.tweet_text} />
        {content.is_thread && content.thread_tweets?.length > 0 && (
          <>
            {content.thread_tweets.map((t, i) => (
              <div key={i} style={{ marginTop: "0.75rem" }}>
                <Label>Tweet {i + 2}</Label>
                <PostBody text={t} />
              </div>
            ))}
          </>
        )}
      </div>
      <div>
        <Label>Engagement hook</Label>
        <p style={metaText}>{content.engagement_hook}</p>
        {content.is_thread && (
          <div style={{ marginTop: "0.75rem" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#111827", backgroundColor: "#f3f4f6", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
              Thread ({(content.thread_tweets?.length ?? 0) + 1} tweets)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function PostBody({ text }: { text: string }) {
  return (
    <p style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "0.75rem 0.875rem" }}>
      {text}
    </p>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.375rem 0" }}>
      {children}
    </p>
  );
}

const metaText: React.CSSProperties = { fontSize: "0.8125rem", color: "#374151", lineHeight: 1.6, margin: 0 };

const thStyle: React.CSSProperties = {
  padding: "0.625rem 1rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700,
  color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em",
  borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
};
const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem", borderBottom: "1px solid #f3f4f6",
};
