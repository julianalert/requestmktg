"use client";

import type {
  PersonaCampaignData,
  AdAngle,
  LandingPageHook,
  SalesOutreachAngle,
  SeoTopic,
} from "./persona-campaign-data";

const palette = {
  bg: "#fafbfc",
  card: "#ffffff",
  border: "#e5e7eb",
  borderAccent: "#3b82f6",
  text: "#111827",
  textMuted: "#6b7280",
  textSoft: "#374151",
  pillBg: "#eff6ff",
  pillText: "#1d4ed8",
  pillMutedBg: "#f3f4f6",
  pillMutedText: "#4b5563",
  quoteBorder: "#c7d2fe",
  quoteBg: "#f8fafc",
};

function BlockHeader({ title }: { title: string }) {
  return (
    <h2
      style={{
        fontSize: "0.6875rem",
        fontWeight: 700,
        color: palette.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "1rem",
      }}
    >
      {title}
    </h2>
  );
}

function AdAngleCard({ a, index }: { a: AdAngle; index: number }) {
  return (
    <article
      style={{
        background: palette.card,
        borderRadius: "12px",
        border: `1px solid ${palette.border}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div
        style={{
          width: "4px",
          flexShrink: 0,
          background:
            index % 3 === 0
              ? "#3b82f6"
              : index % 3 === 1
                ? "#6366f1"
                : "#8b5cf6",
        }}
      />
      <div style={{ padding: "1.25rem 1.25rem 1.25rem 1.5rem", flex: 1 }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: palette.text,
            marginBottom: "0.5rem",
            lineHeight: 1.35,
          }}
        >
          {a.angle_title}
        </h3>
        <span
          style={{
            display: "inline-block",
            fontSize: "0.75rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "6px",
            backgroundColor: palette.pillMutedBg,
            color: palette.pillMutedText,
            marginBottom: "0.75rem",
          }}
        >
          {a.core_pain}
        </span>
        <p
          style={{
            fontSize: "0.9375rem",
            color: palette.textSoft,
            lineHeight: 1.55,
            margin: "0 0 0.75rem 0",
            fontWeight: 500,
          }}
        >
          {a.hook}
        </p>
        <p
          style={{
            fontSize: "0.8125rem",
            color: palette.textMuted,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {a.why_it_resonates}
        </p>
      </div>
    </article>
  );
}

function LandingHookCard({ h }: { h: LandingPageHook }) {
  return (
    <article
      style={{
        background: palette.card,
        borderRadius: "12px",
        border: `1px solid ${palette.border}`,
        padding: "1.25rem",
      }}
    >
      <p
        style={{
          fontSize: "1.0625rem",
          fontWeight: 600,
          color: palette.text,
          lineHeight: 1.4,
          marginBottom: "0.5rem",
        }}
      >
        {h.headline}
      </p>
      <p
        style={{
          fontSize: "0.875rem",
          color: palette.textSoft,
          lineHeight: 1.5,
          marginBottom: "0.75rem",
        }}
      >
        {h.subheadline}
      </p>
      <span
        style={{
          fontSize: "0.75rem",
          padding: "0.25rem 0.5rem",
          borderRadius: "6px",
          backgroundColor: palette.pillBg,
          color: palette.pillText,
        }}
      >
        {h.core_problem_addressed}
      </span>
    </article>
  );
}

function SalesAngleCard({ s }: { s: SalesOutreachAngle }) {
  return (
    <article
      style={{
        background: palette.card,
        borderRadius: "12px",
        border: `1px solid ${palette.border}`,
        padding: "1.25rem",
      }}
    >
      <h3
        style={{
          fontSize: "0.9375rem",
          fontWeight: 600,
          color: palette.text,
          marginBottom: "0.75rem",
        }}
      >
        {s.angle}
      </h3>
      <blockquote
        style={{
          margin: "0 0 0.75rem 0",
          paddingLeft: "1rem",
          borderLeft: `3px solid ${palette.quoteBorder}`,
          backgroundColor: palette.quoteBg,
          padding: "0.75rem 1rem",
          borderRadius: "0 8px 8px 0",
          fontSize: "0.875rem",
          color: palette.textSoft,
          lineHeight: 1.55,
        }}
      >
        {s.opening_message}
      </blockquote>
      <span
        style={{
          fontSize: "0.75rem",
          padding: "0.25rem 0.5rem",
          borderRadius: "6px",
          backgroundColor: palette.pillMutedBg,
          color: palette.pillMutedText,
        }}
      >
        Pain: {s.pain_trigger}
      </span>
    </article>
  );
}

function SeoTopicCard({ t }: { t: SeoTopic }) {
  return (
    <article
      style={{
        background: palette.card,
        borderRadius: "12px",
        border: `1px solid ${palette.border}`,
        padding: "1rem 1.25rem",
      }}
    >
      <p
        style={{
          fontSize: "0.9375rem",
          fontWeight: 600,
          color: palette.text,
          marginBottom: "0.5rem",
        }}
      >
        {t.topic}
      </p>
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: palette.textMuted,
          marginRight: "0.5rem",
        }}
      >
        {t.search_intent}
      </span>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.35rem",
          marginTop: "0.5rem",
        }}
      >
        {t.example_keywords.map((kw, i) => (
          <span
            key={i}
            style={{
              fontSize: "0.75rem",
              padding: "0.2rem 0.5rem",
              borderRadius: "9999px",
              backgroundColor: palette.pillMutedBg,
              color: palette.pillMutedText,
            }}
          >
            {kw}
          </span>
        ))}
      </div>
    </article>
  );
}

export function PersonaCampaignSection({
  data,
}: {
  data: PersonaCampaignData;
}) {
  return (
    <div
      style={{
        marginBottom: "2.5rem",
        padding: "1.5rem",
        backgroundColor: palette.bg,
        borderRadius: "16px",
        border: `1px solid ${palette.border}`,
      }}
    >
      <div
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: palette.text,
          marginBottom: "1.5rem",
          letterSpacing: "-0.02em",
        }}
      >
        Campaign & messaging
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <BlockHeader title="Ad angles" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1rem",
          }}
        >
          {data.ad_angles.map((a, i) => (
            <AdAngleCard key={i} a={a} index={i} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <BlockHeader title="Landing page hooks" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {data.landing_page_hooks.map((h, i) => (
            <LandingHookCard key={i} h={h} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <BlockHeader title="Sales outreach angles" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1rem",
          }}
        >
          {data.sales_outreach_angles.map((s, i) => (
            <SalesAngleCard key={i} s={s} />
          ))}
        </div>
      </div>

      <div>
        <BlockHeader title="SEO topics" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {data.seo_topics.map((t, i) => (
            <SeoTopicCard key={i} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
