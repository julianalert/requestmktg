export default function PlaybookPage() {
  return (
    <div style={{ maxWidth: "760px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: "0.375rem",
          }}
        >
          Club Manager Playbook
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9375rem", margin: 0 }}>
          The operating system for running the club. Follow this every day — no exceptions.
        </p>
      </div>

      {/* Daily section */}
      <Section
        cadence="Daily"
        color="#6366f1"
        description="These four tasks happen every single business day, in order. They are non-negotiable."
        tasks={DAILY_TASKS}
      />

      {/* Weekly section */}
      <Section
        cadence="Weekly"
        color="#10b981"
        description="These tasks happen once a week on fixed days. Block time for them — they don't happen on their own."
        tasks={WEEKLY_TASKS}
      />

      {/* Monthly placeholder */}
      <ComingSoonSection cadence="Monthly" color="#f59e0b" />
    </div>
  );
}

/* ─── Data ─────────────────────────────────────────────────────────────────── */

interface Task {
  order: number;
  title: string;
  sla?: string;
  description: string;
  bullets: string[];
  aiNote?: string;
}

const DAILY_TASKS: Task[] = [
  {
    order: 1,
    title: "Review new applications",
    sla: "Within 12h of application (business day)",
    description:
      "Every application deserves a same-day response. Speed signals quality — it's the applicant's first impression of the club.",
    bullets: [
      "Open the application queue. AI has already pre-scored each application based on role, company, and profile fit.",
      "For each application, send one of two responses: a polite, brief rejection — or an onboarding call invite.",
      "Onboarding call target: scheduled within 12 hours of the application, during business hours.",
      "Never leave an application sitting overnight without a reply.",
    ],
    aiNote: "AI pre-scores every application. Your job is to review, decide, and send — not to evaluate from scratch.",
  },
  {
    order: 2,
    title: "Post one thing of value in the community",
    sla: "Community must never be silent for more than 24 hours",
    description:
      "The community is only as alive as what you put into it. One post a day keeps it warm, trusted, and worth coming back to.",
    bullets: [
      "Choose one format: a tip, an actionable advice, a useful resource, a regulatory update, a member spotlight, or a short prompt that helps CFOs think.",
      "Keep it to 2–3 sentences. Short and sharp beats long and ignored.",
      "Post in the community Slack or Circle — wherever the members are active.",
      "The goal is simple: bring value every single day, without fail.",
    ],
    aiNote:
      "AI generates a fresh list of post ideas every business day. Use them as starting points — add your voice and context before posting.",
  },
  {
    order: 3,
    title: "Check and reply to all messages",
    sla: "No message waits more than 4 hours (business hours)",
    description:
      "Speed of response is a direct signal of community quality. A slow reply communicates that nobody is home.",
    bullets: [
      "Check all inboxes: demo invitation replies, application questions, member messages in the community, and emails.",
      "Every message gets a reply before the 4-hour mark during your working day.",
      "If you can't give a full answer yet, acknowledge and set expectations: 'On it — I'll get back to you by [time].'",
      "Batch-check at minimum three times a day: morning, midday, and late afternoon.",
    ],
    aiNote:
      "AI flags priority messages that need your attention first — demo requests, time-sensitive questions, and messages from high-fit members.",
  },
  {
    order: 4,
    title: "Run your planned onboarding calls",
    sla: "Show up on time, prepared",
    description:
      "The onboarding call is the single most important touchpoint in the membership journey. It sets the tone for everything that follows.",
    bullets: [
      "Check your calendar for calls scheduled today. No reschedules unless the member initiates.",
      "Before each call: review the applicant's profile and AI pre-score notes.",
      "Goal of the call: understand their situation, explain the value of the club, and decide together if they're a fit.",
      "After the call: log the outcome immediately (invited / not invited) and trigger the next step the same day.",
      "Log your call notes in the dedicated Slack channel immediately after hanging up — while it's fresh. Include: who you spoke to, key context, outcome, and next step.",
    ],
  },
  {
    order: 5,
    title: "Welcome new members personally",
    description:
      "The moment someone joins is when their excitement is highest. A personal welcome turns a sign-up into a relationship.",
    bullets: [
      "Check for any new members who joined since your last check.",
      "Send a personal welcome message — not a template. Reference something specific about their company or role.",
      "Point them to one concrete thing they can do right now: join a channel, introduce themselves, or check a resource.",
      "Make them feel seen from day one. That's what makes people stay.",
    ],
  },
];

const WEEKLY_TASKS: Task[] = [
  {
    order: 1,
    title: "Fill the weekly report",
    sla: "Every Monday morning",
    description:
      "Numbers don't lie. Logging the weekly data keeps the funnel honest and surfaces problems before they become patterns.",
    bullets: [
      "Open the Dashboard tab and click '+ Add data'.",
      "Fill in all funnel metrics for the week: visitors, applications, invited to call, onboarding calls made, people invited, people joined, RF demos.",
      "Take 2 minutes to look at the conversion rates — if something dropped, note why.",
    ],
  },
  {
    order: 2,
    title: "Follow up on pending onboarding call invitations",
    sla: "Every Monday",
    description:
      "People get busy. A single, timely follow-up is the difference between a lost lead and a new member.",
    bullets: [
      "Review your CRM or calendar for invitations sent but not yet confirmed.",
      "Send one follow-up — friendly, short, no pressure. Offer an alternative slot if needed.",
      "If there's still no response after the follow-up, mark them as inactive and move on.",
    ],
  },
  {
    order: 3,
    title: "Identify members who could benefit from Request Finance",
    sla: "Every week",
    description:
      "The club is a pipeline. Proactively spotting the right members and starting a conversation is how demos get booked.",
    bullets: [
      "Review the community (Slack/Circle) and your CRM for active members who haven't had a RF demo yet.",
      "Look for signals: payment questions, mentions of invoicing friction, treasurer or CFO roles, multi-chain operations.",
      "Reach out personally — not with a pitch, but with a relevant observation or question. The goal is a conversation, not a close.",
    ],
    aiNote: "Cross-reference member profiles with RF use-case signals to surface the highest-potential leads each week.",
  },
  {
    order: 4,
    title: "Follow up on unanswered demo invitations",
    sla: "One follow-up only, every week",
    description:
      "One follow-up is respectful. Two is a reminder. Three is spam. Keep it to one.",
    bullets: [
      "Check which demo invitations haven't received a reply in more than 5 business days.",
      "Send one short, human follow-up. No automated-sounding copy.",
      "After the follow-up, archive the lead. You've done your job.",
    ],
  },
  {
    order: 5,
    title: "Sync with the outreach specialist",
    sla: "Every week",
    description:
      "The outreach team needs your on-the-ground intelligence. You talk to members every day — they don't. That context is gold.",
    bullets: [
      "Share what profile types you've been seeing this week: job titles, company stages, pain points, hesitations.",
      "Give a clear steer on which profiles to prioritise (e.g. web3 CFO, web2 stablecoin-curious, accounting firms).",
      "Flag anything unusual: a new company type, a geography spike, a recurring objection.",
      "Keep it short — 15 minutes max. The goal is a clear target for next week's outreach.",
    ],
  },
  {
    order: 6,
    title: "Publish 3 LinkedIn & X posts",
    sla: "Monday + Wednesday + Friday",
    description:
      "Consistent public presence builds the club's reputation and drives inbound applications. Three posts a week is the minimum to stay visible.",
    bullets: [
      "Monday: publish a post. Wednesday: publish a post. Friday: publish a post.",
      "Formats that work: a member insight, a regulatory update with your take, a behind-the-scenes of the club, a short contrarian opinion.",
      "Post on both LinkedIn and X (Twitter). Same content is fine — adjust the tone slightly for each platform.",
      "Don't overthink it. A good post published is better than a perfect post sitting in drafts.",
    ],
    aiNote: "AI can draft post ideas and copy each week — especially useful for Monday when you're filling in the report at the same time.",
  },
  {
    order: 7,
    title: "Write and send the community newsletter",
    sla: "Every Tuesday — max 300 words",
    description:
      "1,000+ members hear from the club every Tuesday. This is your most important recurring content. Keep it tight, keep it valuable.",
    bullets: [
      "Structure (non-negotiable): one insight (a trend or news in web3 finance), one member spotlight (2–3 sentences about a member's company), one resource (a tool, article, or regulatory update), one invite (upcoming event or a soft demo CTA).",
      "Maximum 300 words. If it's longer, cut it.",
      "AI drafts a complete newsletter every Monday morning. Your job on Tuesday: read it, rewrite it in your voice, and send it. Budget 20 minutes.",
      "The newsletter is a signal of club quality. If it's good, members share it. If it's boring, they unsubscribe.",
    ],
    aiNote: "AI drafts the full newsletter every Monday based on recent news, member activity, and upcoming events. You edit — you don't write from scratch.",
  },
];

/* ─── Components ────────────────────────────────────────────────────────────── */

function Section({
  cadence,
  color,
  description,
  tasks,
}: {
  cadence: string;
  color: string;
  description: string;
  tasks: Task[];
}) {
  return (
    <div style={{ marginBottom: "3rem" }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#fff",
            backgroundColor: color,
            padding: "0.2rem 0.625rem",
            borderRadius: "99px",
          }}
        >
          {cadence}
        </span>
        <span
          style={{
            height: "1px",
            flex: 1,
            backgroundColor: "#e5e7eb",
          }}
        />
      </div>
      <p
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          margin: "0 0 1.5rem 0",
        }}
      >
        {description}
      </p>

      {/* Task cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {tasks.map((task) => (
          <TaskCard key={task.order} task={task} accentColor={color} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, accentColor }: { task: Task; accentColor: string }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "1rem",
          padding: "1rem 1.25rem",
          borderBottom: "1px solid #f3f4f6",
          backgroundColor: "#fafafa",
        }}
      >
        {/* Step number */}
        <div
          style={{
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: accentColor,
            color: "#fff",
            fontSize: "0.8125rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "1px",
          }}
        >
          {task.order}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#111827",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {task.title}
            </h3>
            {task.sla && (
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#6b7280",
                  backgroundColor: "#f3f4f6",
                  padding: "0.125rem 0.5rem",
                  borderRadius: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                ⏱ {task.sla}
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              margin: "0.375rem 0 0 0",
              lineHeight: 1.5,
            }}
          >
            {task.description}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "1rem 1.25rem 1rem 1.25rem" }}>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
          }}
        >
          {task.bullets.map((bullet, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.625rem",
                fontSize: "0.875rem",
                color: "#374151",
                lineHeight: 1.55,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  marginTop: "0.45rem",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor: accentColor,
                }}
              />
              {bullet}
            </li>
          ))}
        </ul>

        {/* AI note */}
        {task.aiNote && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.625rem 0.875rem",
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "6px",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.875rem", flexShrink: 0 }}>✦</span>
            <p
              style={{
                margin: 0,
                fontSize: "0.8125rem",
                color: "#1d4ed8",
                lineHeight: 1.5,
              }}
            >
              <strong>AI assist —</strong> {task.aiNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ComingSoonSection({
  cadence,
  color,
}: {
  cadence: string;
  color: string;
}) {
  return (
    <div
      style={{
        border: "1px dashed #d1d5db",
        borderRadius: "10px",
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#fff",
          backgroundColor: color,
          padding: "0.2rem 0.625rem",
          borderRadius: "99px",
          flexShrink: 0,
        }}
      >
        {cadence}
      </span>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "#9ca3af" }}>
        {cadence} tasks coming soon.
      </p>
    </div>
  );
}
