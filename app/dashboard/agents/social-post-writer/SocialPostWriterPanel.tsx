"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import {
  PROFILES,
  type Profile,
  type ProfileId,
  type PostIdea,
} from "@/lib/agents/social-post-writer/profiles";

// ─── Types ────────────────────────────────────────────────────────────────────

type DbIdea = {
  id: string; // UUID from Supabase
  profile_id: string;
  post_intent: string;
  trigger_or_spark: string;
  founder_pov: string;
  audience: string;
  sharpness: number;
  cta_style: string;
  personal_detail_hint: string;
  context_hint: string | null;
  created_at: string;
};

// Unified idea — static ideas have numeric id, DB ideas have UUID string id
type AnyIdea = (PostIdea | DbIdea) & { _isAi?: boolean };

type SavedPost = {
  id: string;
  profile_id: string;
  idea_id: number | null;
  db_idea_id: string | null;
  post_intent: string;
  trigger_or_spark: string;
  post_text: string;
  created_at: string;
};

type TabId = "ideas" | "posts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ideaUid(idea: AnyIdea): string {
  return String(idea.id);
}

function isDbIdea(idea: AnyIdea): idea is DbIdea & { _isAi: true } {
  return typeof idea.id === "string";
}

const SHARPNESS_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: "#f0fdf4", color: "#166534" },
  2: { bg: "#f0fdf4", color: "#166534" },
  3: { bg: "#fffbeb", color: "#92400e" },
  4: { bg: "#fff7ed", color: "#9a3412" },
  5: { bg: "#fef2f2", color: "#991b1b" },
};

const INTENT_COLORS: Record<string, string> = {
  "Hard-earned insight": "#2563eb",
  "Story from CFO life": "#7c3aed",
  "Story from sales life": "#7c3aed",
  "Opinion / Contrarian": "#dc2626",
  "Educational": "#0891b2",
  "Failure / Reflection": "#d97706",
  "Behind-the-scenes": "#6b7280",
  "Behind-the-scenes (COO lens)": "#6b7280",
  "Community insight": "#2563eb",
  "Story from community life": "#7c3aed",
  "Reflection": "#6b7280",
};

function intentColor(intent: string): string {
  return INTENT_COLORS[intent] ?? "#6b7280";
}

const COUNT_OPTIONS = [1, 5, 25, 50] as const;
type CountOption = (typeof COUNT_OPTIONS)[number];

// ─── Small components ─────────────────────────────────────────────────────────

function Spinner({ color = "#fff", size = 14 }: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="7" cy="7" r="5.5" stroke={color} strokeOpacity="0.25" strokeWidth="2" />
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      style={{
        padding: "0.25rem 0.625rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        border: `1px solid ${copied ? "#86efac" : "#e5e7eb"}`,
        borderRadius: "4px",
        backgroundColor: copied ? "#f0fdf4" : "#f9fafb",
        color: copied ? "#166534" : "#374151",
        cursor: "pointer",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
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
        fontSize: "0.75rem",
        fontWeight: active ? 700 : 500,
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af",
      textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.375rem 0",
    }}>
      {children}
    </p>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function SocialPostWriterPanel() {
  const [activeProfile, setActiveProfile] = useState<ProfileId>("jb");
  const [activeTab, setActiveTab] = useState<TabId>("ideas");

  // DB-generated ideas
  const [dbIdeas, setDbIdeas] = useState<DbIdea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);

  // Per-idea post-generation button state — keyed by uid (string)
  const [buttonLoading, setButtonLoading] = useState<Set<string>>(new Set());
  const [buttonError, setButtonError] = useState<Record<string, string>>({});
  // Static idea uids that have at least one saved post
  const [postedStaticIds, setPostedStaticIds] = useState<Set<string>>(new Set());
  // DB idea UUIDs that have at least one saved post
  const [postedDbIds, setPostedDbIds] = useState<Set<string>>(new Set());

  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [expandedIdeaUid, setExpandedIdeaUid] = useState<string | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [intentFilter, setIntentFilter] = useState<string>("all");

  // Generate ideas modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState("");
  const [modalCount, setModalCount] = useState<CountOption>(5);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const profile: Profile = PROFILES.find((p) => p.id === activeProfile)!;

  // ── Fetch DB ideas ────────────────────────────────────────────────────────

  const fetchDbIdeas = useCallback(async (profileId: ProfileId) => {
    setIdeasLoading(true);
    try {
      const res = await fetch(`/api/agents/social-post-writer/ideas?profile_id=${profileId}`);
      if (!res.ok) throw new Error("Failed to load ideas");
      const data: DbIdea[] = await res.json();
      setDbIdeas(data);
    } catch {
      // non-critical — static ideas still show
    } finally {
      setIdeasLoading(false);
    }
  }, []);

  // ── Fetch saved posts ─────────────────────────────────────────────────────

  const fetchPosts = useCallback(async (profileId: ProfileId) => {
    setPostsLoading(true);
    setPostsError(null);
    try {
      const res = await fetch(`/api/agents/social-post-writer/posts?profile_id=${profileId}`);
      if (!res.ok) throw new Error("Failed to load posts");
      const data: SavedPost[] = await res.json();
      setSavedPosts(data);
      setPostedStaticIds(
        new Set(data.filter((p) => p.idea_id != null).map((p) => String(p.idea_id)))
      );
      setPostedDbIds(
        new Set(data.filter((p) => p.db_idea_id != null).map((p) => p.db_idea_id!))
      );
    } catch (e) {
      setPostsError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeProfile);
    fetchDbIdeas(activeProfile);
    setExpandedIdeaUid(null);
    setExpandedPostId(null);
    setIntentFilter("all");
    setButtonError({});
  }, [activeProfile, fetchPosts, fetchDbIdeas]);

  // ── Generate a LinkedIn post from an idea ─────────────────────────────────

  const handleGeneratePost = async (idea: AnyIdea) => {
    const uid = ideaUid(idea);
    setButtonLoading((prev) => new Set(prev).add(uid));
    setButtonError((prev) => { const n = { ...prev }; delete n[uid]; return n; });

    try {
      const res = await fetch("/api/agents/social-post-writer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: activeProfile, idea }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }

      const newPost: SavedPost = await res.json();
      setSavedPosts((prev) => [newPost, ...prev]);

      if (!isDbIdea(idea)) {
        setPostedStaticIds((prev) => new Set(prev).add(uid));
      } else {
        setPostedDbIds((prev) => new Set(prev).add(uid));
      }
    } catch (e) {
      setButtonError((prev) => ({
        ...prev,
        [uid]: e instanceof Error ? e.message : "Failed",
      }));
    } finally {
      setButtonLoading((prev) => {
        const n = new Set(prev);
        n.delete(uid);
        return n;
      });
    }
  };

  // ── Generate ideas modal submit ───────────────────────────────────────────

  const handleGenerateIdeas = async () => {
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch("/api/agents/social-post-writer/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: activeProfile,
          count: modalCount,
          context: modalContext.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }

      const newIdeas: DbIdea[] = await res.json();
      setDbIdeas((prev) => [...newIdeas, ...prev]);
      setModalOpen(false);
      setModalContext("");
      setModalCount(5);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "Failed");
    } finally {
      setModalLoading(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  // Merge static + DB ideas (static first, newest DB at bottom)
  const allIdeas: AnyIdea[] = [
    ...profile.ideas,
    ...[...dbIdeas].reverse(), // newest DB ideas appear at the end, after static
  ];

  const distinctIntents = Array.from(
    new Set(allIdeas.map((i) => i.post_intent))
  ).sort();

  const filteredIdeas =
    intentFilter === "all"
      ? allIdeas
      : allIdeas.filter((i) => i.post_intent === intentFilter);

  const profilePosts = savedPosts.filter((p) => p.profile_id === activeProfile);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: "1100px" }}>

      {/* ── Profile selector ── */}
      <div style={{ marginBottom: "1.75rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.625rem 0" }}>
          Writing as
        </p>
        <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
          {PROFILES.map((p) => {
            const active = p.id === activeProfile;
            return (
              <button
                key={p.id}
                onClick={() => setActiveProfile(p.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  gap: "0.125rem", padding: "0.625rem 1rem",
                  border: `2px solid ${active ? p.color : "#e5e7eb"}`,
                  borderRadius: "8px", backgroundColor: active ? p.bgColor : "#fff",
                  cursor: "pointer", transition: "all 0.12s ease", minWidth: "160px",
                }}
              >
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: active ? p.color : "#374151" }}>
                  {p.emoji} {p.name}
                </span>
                <span style={{ fontSize: "0.6875rem", color: active ? p.color : "#9ca3af", lineHeight: 1.4 }}>
                  {p.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "0.75rem" }}>
        {(["ideas", "posts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.375rem 0.875rem", fontSize: "0.875rem",
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "#111827" : "#6b7280",
              backgroundColor: activeTab === tab ? "#f3f4f6" : "transparent",
              border: "none", borderRadius: "4px", cursor: "pointer",
            }}
          >
            {tab === "ideas"
              ? `Post Ideas (${allIdeas.length})`
              : `Generated Posts (${profilePosts.length})`}
          </button>
        ))}
      </div>

      {/* ── Post Ideas tab ── */}
      {activeTab === "ideas" && (
        <>
          {/* Header row: filter pills + generate ideas button */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", flex: 1 }}>
              <FilterPill
                label="All"
                count={allIdeas.length}
                active={intentFilter === "all"}
                color="#374151"
                bg="#f3f4f6"
                onClick={() => setIntentFilter("all")}
              />
              {distinctIntents.map((intent) => {
                const count = allIdeas.filter((i) => i.post_intent === intent).length;
                const color = intentColor(intent);
                return (
                  <FilterPill
                    key={intent}
                    label={intent}
                    count={count}
                    active={intentFilter === intent}
                    color={color}
                    bg={color + "18"}
                    onClick={() => setIntentFilter(intent)}
                  />
                );
              })}
            </div>

            <button
              onClick={() => { setModalOpen(true); setModalError(null); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                padding: "0.4375rem 0.875rem",
                fontSize: "0.8125rem", fontWeight: 600,
                backgroundColor: profile.bgColor, color: profile.color,
                border: `1px solid ${profile.color}55`,
                borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              ✦ Generate ideas
            </button>
          </div>

          {/* Ideas table */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <th style={{ ...thStyle, width: "36px" }}>#</th>
                  <th style={thStyle}>Post Intent</th>
                  <th style={thStyle}>Trigger / Spark</th>
                  <th style={{ ...thStyle, width: "120px" }}>Audience</th>
                  <th style={{ ...thStyle, width: "56px" }}>Sharp</th>
                  <th style={{ ...thStyle, width: "110px" }}>CTA</th>
                  <th style={{ ...thStyle, width: "130px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {ideasLoading && dbIdeas.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: "1.5rem", color: "#9ca3af", fontSize: "0.8125rem" }}>
                      Loading ideas…
                    </td>
                  </tr>
                )}
                {filteredIdeas.map((idea, i) => {
                  const uid = ideaUid(idea);
                  const isAi = isDbIdea(idea);
                  const isExpanded = expandedIdeaUid === uid;
                  const isLoading = buttonLoading.has(uid);
                  const isDone = isAi ? postedDbIds.has(uid) : postedStaticIds.has(uid);
                  const errMsg = buttonError[uid];
                  const iColor = intentColor(idea.post_intent);
                  const sharpStyle = SHARPNESS_COLORS[idea.sharpness] ?? SHARPNESS_COLORS[3];
                  const isAlreadyDone = !isAi && (idea as PostIdea).alreadyDone;

                  return (
                    <Fragment key={uid}>
                      <tr
                        style={{
                          backgroundColor: isAlreadyDone ? "#fafafa" : i % 2 === 0 ? "#fff" : "#fafafa",
                          cursor: "pointer",
                          opacity: isAlreadyDone ? 0.55 : 1,
                        }}
                        onClick={() => setExpandedIdeaUid(isExpanded ? null : uid)}
                      >
                        {/* # */}
                        <td style={{ ...tdStyle, color: "#9ca3af", textAlign: "center", fontSize: "0.6875rem" }}>
                          {isAi ? "✦" : (idea as PostIdea).id}
                        </td>

                        {/* Post Intent */}
                        <td style={tdStyle}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "0.25rem",
                            fontSize: "0.6875rem", fontWeight: 600, padding: "0.2rem 0.5rem",
                            borderRadius: "4px", backgroundColor: iColor + "18", color: iColor, lineHeight: 1.4,
                          }}>
                            {idea.post_intent}
                            {isAi && (
                              <span style={{
                                fontSize: "0.5625rem", fontWeight: 700, padding: "0.1rem 0.3rem",
                                borderRadius: "3px", backgroundColor: iColor + "30", color: iColor,
                                letterSpacing: "0.04em",
                              }}>
                                AI
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Trigger */}
                        <td style={{ ...tdStyle, color: "#374151", lineHeight: 1.45 }}>
                          {idea.trigger_or_spark}
                          <span style={{ display: "inline-block", marginLeft: "0.4rem", fontSize: "0.6875rem", color: "#9ca3af" }}>
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </td>

                        {/* Audience */}
                        <td style={{ ...tdStyle, color: "#6b7280", fontSize: "0.6875rem" }}>
                          {idea.audience}
                        </td>

                        {/* Sharpness */}
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <span style={{
                            display: "inline-block", fontSize: "0.6875rem", fontWeight: 700,
                            padding: "0.15rem 0.4rem", borderRadius: "4px", ...sharpStyle,
                          }}>
                            {idea.sharpness}/5
                          </span>
                        </td>

                        {/* CTA */}
                        <td style={{ ...tdStyle, color: "#6b7280", fontSize: "0.6875rem" }}>
                          {idea.cta_style}
                        </td>

                        {/* Action */}
                        <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleGeneratePost(idea)}
                            disabled={isLoading}
                            title={errMsg ?? (isDone ? "Already generated — generate again?" : "Generate LinkedIn post")}
                            style={{
                              display: "flex", alignItems: "center", gap: "0.3rem",
                              padding: "0.3rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600,
                              border: `1px solid ${errMsg ? "#fca5a5" : isDone ? "#86efac" : profile.color + "55"}`,
                              borderRadius: "5px",
                              backgroundColor: errMsg ? "#fef2f2" : isDone ? "#f0fdf4" : profile.bgColor,
                              color: errMsg ? "#dc2626" : isDone ? "#166534" : profile.color,
                              cursor: isLoading ? "not-allowed" : "pointer",
                              whiteSpace: "nowrap", opacity: isLoading ? 0.7 : 1,
                            }}
                          >
                            {isLoading ? (
                              <><Spinner color={profile.color} size={10} /> Writing…</>
                            ) : isDone ? (
                              <>✓ Generated</>
                            ) : (
                              <>✦ Generate post</>
                            )}
                          </button>
                          {errMsg && (
                            <p style={{ fontSize: "0.6875rem", color: "#dc2626", margin: "0.2rem 0 0" }}>
                              {errMsg.slice(0, 50)}
                            </p>
                          )}
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td colSpan={7} style={{ padding: "0 1rem 1rem 1rem" }}>
                            <div style={{
                              padding: "0.875rem 1rem", backgroundColor: "#f8faff",
                              border: "1px solid #e5e7eb", borderRadius: "8px",
                              display: "grid",
                              gridTemplateColumns: isAi && (idea as DbIdea).context_hint ? "1fr 1fr 1fr" : "1fr 1fr",
                              gap: "1rem",
                            }}>
                              <div>
                                <Label>Point of view</Label>
                                <p style={detailText}>{idea.founder_pov}</p>
                              </div>
                              <div>
                                <Label>Personal detail</Label>
                                <p style={detailText}>{idea.personal_detail_hint}</p>
                              </div>
                              {isAi && (idea as DbIdea).context_hint && (
                                <div>
                                  <Label>Context used</Label>
                                  <p style={{ ...detailText, color: "#9ca3af", fontStyle: "italic" }}>
                                    {(idea as DbIdea).context_hint}
                                  </p>
                                </div>
                              )}
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

          <p style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
            {filteredIdeas.length} idea{filteredIdeas.length !== 1 ? "s" : ""}
            {intentFilter !== "all" ? ` in "${intentFilter}"` : ""} ·{" "}
            {profile.ideas.length} static, {dbIdeas.length} AI-generated
          </p>
        </>
      )}

      {/* ── Generated Posts tab ── */}
      {activeTab === "posts" && (
        <>
          {postsLoading && <p style={{ color: "#6b7280", fontSize: "0.9375rem" }}>Loading…</p>}
          {postsError && (
            <div style={{ padding: "0.75rem 1rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              {postsError}
            </div>
          )}

          {!postsLoading && profilePosts.length === 0 && (
            <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed #d1d5db", borderRadius: "10px", color: "#9ca3af" }}>
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                No posts yet for {profile.name}
              </p>
              <p style={{ fontSize: "0.875rem", margin: 0 }}>
                Go to Post Ideas and click ✦ Generate post on any idea.
              </p>
            </div>
          )}

          {!postsLoading && profilePosts.length > 0 && (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    <th style={thStyle}>Post Intent</th>
                    <th style={thStyle}>Trigger</th>
                    <th style={{ ...thStyle, width: "110px" }}>Date</th>
                    <th style={{ ...thStyle, width: "90px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {profilePosts.map((post, i) => {
                    const isExpanded = expandedPostId === post.id;
                    const iColor = intentColor(post.post_intent);
                    return (
                      <Fragment key={post.id}>
                        <tr
                          style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa", cursor: "pointer" }}
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                        >
                          <td style={tdStyle}>
                            <span style={{ display: "inline-block", fontSize: "0.6875rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: iColor + "18", color: iColor }}>
                              {post.post_intent}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, color: "#374151", lineHeight: 1.45 }}>
                            {post.trigger_or_spark}
                            <span style={{ display: "inline-block", marginLeft: "0.4rem", fontSize: "0.6875rem", color: "#9ca3af" }}>
                              {isExpanded ? "▲ hide" : "▼ read"}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, color: "#9ca3af" }}>{formatDate(post.created_at)}</td>
                          <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                            <CopyButton text={post.post_text} />
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                            <td colSpan={4} style={{ padding: "0 1rem 1.25rem 1rem" }}>
                              <div style={{ padding: "1rem 1.125rem", backgroundColor: "#f8faff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                  <Label>LinkedIn post</Label>
                                  <CopyButton text={post.post_text} />
                                </div>
                                <p style={{ fontSize: "0.9375rem", color: "#111827", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                                  {post.post_text}
                                </p>
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

          {!postsLoading && profilePosts.length > 0 && (
            <p style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "#9ca3af" }}>
              {profilePosts.length} post{profilePosts.length !== 1 ? "s" : ""} for {profile.name}
            </p>
          )}
        </>
      )}

      {/* ── Generate Ideas Modal ── */}
      {modalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget && !modalLoading) setModalOpen(false); }}
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "1rem",
          }}
        >
          <div style={{
            backgroundColor: "#fff", borderRadius: "12px", padding: "1.75rem",
            width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: "0 0 0.25rem 0" }}>
                  Generate ideas for {profile.name}
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "#6b7280", margin: 0 }}>
                  Claude will write new post ideas using {profile.name}&apos;s existing categories.
                </p>
              </div>
              {!modalLoading && (
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "1.25rem", padding: "0", lineHeight: 1, marginLeft: "1rem", flexShrink: 0 }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Count selector */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>
                Number of ideas
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {COUNT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setModalCount(n)}
                    style={{
                      flex: 1, padding: "0.5rem",
                      fontSize: "0.875rem", fontWeight: modalCount === n ? 700 : 400,
                      border: `2px solid ${modalCount === n ? profile.color : "#e5e7eb"}`,
                      borderRadius: "6px",
                      backgroundColor: modalCount === n ? profile.bgColor : "#fff",
                      color: modalCount === n ? profile.color : "#374151",
                      cursor: "pointer",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Context textarea */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>
                Tell me more{modalCount === 1 ? "" : " (optional)"}
                {modalCount === 1 && (
                  <span style={{ fontWeight: 400, color: "#6b7280", marginLeft: "0.25rem" }}>— what do you want to write about?</span>
                )}
              </label>
              <textarea
                value={modalContext}
                onChange={(e) => setModalContext(e.target.value)}
                disabled={modalLoading}
                placeholder={
                  modalCount === 1
                    ? "Describe the specific moment, feeling, or insight you want this post to be about. The more specific, the better."
                    : "Optional — steer the themes, e.g. 'more about compliance anxiety' or 'focus on cross-border payments'"
                }
                rows={modalCount === 1 ? 4 : 3}
                style={{
                  width: "100%", padding: "0.625rem 0.75rem",
                  fontSize: "0.875rem", color: "#111827",
                  border: "1px solid #e5e7eb", borderRadius: "6px",
                  resize: "vertical", outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: modalLoading ? "#f9fafb" : "#fff",
                }}
              />
              {modalCount === 1 && (
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0.3rem 0 0" }}>
                  For a single idea, the more detail you give here, the sharper the output.
                </p>
              )}
            </div>

            {/* Error */}
            {modalError && (
              <div style={{ padding: "0.625rem 0.875rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", fontSize: "0.8125rem", marginBottom: "1rem" }}>
                {modalError}
              </div>
            )}

            {/* Loading state */}
            {modalLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.875rem", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", color: "#1d4ed8", fontSize: "0.8125rem", marginBottom: "1rem" }}>
                <Spinner color="#1d4ed8" size={12} />
                Claude is writing {modalCount} idea{modalCount !== 1 ? "s" : ""}… this may take a moment.
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              {!modalLoading && (
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 500, border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fff", color: "#374151", cursor: "pointer" }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleGenerateIdeas}
                disabled={modalLoading || (modalCount === 1 && !modalContext.trim())}
                style={{
                  display: "flex", alignItems: "center", gap: "0.375rem",
                  padding: "0.5rem 1.125rem",
                  fontSize: "0.875rem", fontWeight: 600,
                  backgroundColor: modalLoading || (modalCount === 1 && !modalContext.trim()) ? "#9ca3af" : profile.color,
                  color: "#fff", border: "none", borderRadius: "6px",
                  cursor: modalLoading || (modalCount === 1 && !modalContext.trim()) ? "not-allowed" : "pointer",
                }}
              >
                {modalLoading ? (
                  <><Spinner size={12} /> Generating…</>
                ) : (
                  <>✦ Generate {modalCount} idea{modalCount !== 1 ? "s" : ""}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  padding: "0.625rem 1rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 700,
  color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em",
  borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle",
};

const detailText: React.CSSProperties = {
  fontSize: "0.875rem", color: "#374151", lineHeight: 1.6, margin: 0,
};
