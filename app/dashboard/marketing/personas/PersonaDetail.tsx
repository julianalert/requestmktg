import type { Persona, PersonaSection } from "./persona-data";
import { personaCampaignByKey } from "./persona-campaign-data";
import type { PersonaCampaignData } from "./persona-campaign-data";
import { PersonaCampaignSection } from "./PersonaCampaignSection";

const sectionStyles = {
  section: {
    marginBottom: "2rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "1rem",
    letterSpacing: "-0.01em",
  } as React.CSSProperties,
  body: {
    fontSize: "0.9375rem",
    color: "#374151",
    lineHeight: 1.6,
  } as React.CSSProperties,
  list: {
    margin: 0,
    paddingLeft: "1.25rem",
    listStylePosition: "outside",
  } as React.CSSProperties,
  row: {
    display: "flex",
    gap: "1rem",
    marginBottom: "0.75rem",
    alignItems: "flex-start",
  } as React.CSSProperties,
  label: {
    flexShrink: 0,
    width: "10rem",
    fontWeight: 600,
    color: "#6b7280",
    fontSize: "0.8125rem",
  } as React.CSSProperties,
  value: {
    flex: 1,
    minWidth: 0,
    color: "#374151",
  } as React.CSSProperties,
};

function SectionBlock({ section }: { section: PersonaSection }) {
  if (section.type === "paragraph") {
    return (
      <section style={sectionStyles.section}>
        <h2 style={sectionStyles.sectionTitle}>{section.title}</h2>
        <div style={sectionStyles.body}>
          <p style={{ margin: 0 }}>{section.content}</p>
        </div>
      </section>
    );
  }
  if (section.type === "list") {
    return (
      <section style={sectionStyles.section}>
        <h2 style={sectionStyles.sectionTitle}>{section.title}</h2>
        <ul style={sectionStyles.list}>
          {section.items.map((item, i) => (
            <li key={i} style={{ marginBottom: "0.35rem" }}>
              {item}
            </li>
          ))}
        </ul>
      </section>
    );
  }
  if (section.type === "keyValue") {
    return (
      <section style={sectionStyles.section}>
        <h2 style={sectionStyles.sectionTitle}>{section.title}</h2>
        <div style={sectionStyles.body}>
          {section.entries.map(({ label, value }, i) => (
            <div key={i} style={sectionStyles.row}>
              <span style={sectionStyles.label}>{label}</span>
              <span style={sectionStyles.value}>{value}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }
  return null;
}

export function PersonaDetail({
  persona,
  campaign: campaignProp,
}: {
  persona: Persona;
  campaign?: PersonaCampaignData | null;
}) {
  const campaign = campaignProp ?? personaCampaignByKey[persona.id];

  return (
    <div style={{ maxWidth: "900px" }}>
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 600,
          marginBottom: "0.25rem",
          letterSpacing: "-0.02em",
        }}
      >
        {persona.name}
      </h1>
      <p
        style={{
          fontSize: "1rem",
          color: "#6b7280",
          marginBottom: "0.5rem",
        }}
      >
        {persona.role}
      </p>
      <p
        style={{
          fontSize: "0.9375rem",
          color: "#374151",
          lineHeight: 1.6,
          marginBottom: "1.5rem",
        }}
      >
        {persona.headline}
      </p>
      <div
        style={{
          display: "grid",
          gap: "0.5rem",
          marginBottom: "2rem",
          padding: "1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          fontSize: "0.875rem",
        }}
      >
        {persona.meta.map(({ label, value }, i) => (
          <div key={i} style={sectionStyles.row}>
            <span style={sectionStyles.label}>{label}</span>
            <span style={sectionStyles.value}>{value}</span>
          </div>
        ))}
      </div>
      {campaign ? <PersonaCampaignSection data={campaign} /> : null}
      {persona.sections.map((section, i) => (
        <SectionBlock key={i} section={section} />
      ))}
    </div>
  );
}
