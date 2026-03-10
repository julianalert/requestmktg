export default function BrandProfilePage() {
  return (
    <div style={{ maxWidth: "720px" }}>
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 600,
          marginBottom: "0.25rem",
          letterSpacing: "-0.02em",
        }}
      >
        Brand profile
      </h1>
      <p
        style={{
          color: "#6b7280",
          fontSize: "0.9375rem",
          marginBottom: "2rem",
        }}
      >
        Request Finance — positioning, audience, and voice guidelines.
      </p>

      <Section title="Brand">
        <Row label="Brand">Request Finance</Row>
        <Row label="Tone">
          Professional, clear, empowering, and engaging.
        </Row>
        <Row label="Positioning">
          Positioned as a modern, comprehensive spend management platform that
          simplifies financial operations through stablecoins and digital tools.
        </Row>
        <Row label="Examples">
          Businesses that need to streamline financial operations, such as
          managing spend, accounts payable, and stablecoin payments.
        </Row>
      </Section>

      <Section title="Products">
        <ul style={listStyle}>
          <li>Global USD Account</li>
          <li>Corporate Cards</li>
          <li>Accounts Payable</li>
          <li>Accrual Accounting</li>
        </ul>
      </Section>

      <Section title="Goals">
        <ul style={listStyle}>
          <li>Empower finance teams with modern tools.</li>
          <li>
            Provide a streamlined, efficient platform for financial operations.
          </li>
          <li>Enhance security and global operations capability.</li>
        </ul>
      </Section>

      <Section title="Constraints">
        <ul style={listStyle}>
          <li>
            Maintain security and privacy compliances (e.g. SOC 2 Type 1
            auditing).
          </li>
          <li>
            Address the technical sophistication required for stablecoin usage.
          </li>
        </ul>
      </Section>

      <Section title="Audience / ICP">
        <Row label="Who">
          CFOs, COOs, finance managers, founders of modern companies; businesses
          in SaaS, e-commerce, healthcare, Web3, etc.
        </Row>
        <Row label="Problem">
          Managing company finances involves complex processes, scattered tools,
          and inefficiencies with traditional banking systems.
        </Row>
        <Row label="Sophistication">
          High; audience is familiar with financial operations, digital
          payments, stablecoins, and business finance solutions.
        </Row>
      </Section>

      <Section title="Voice & language">
        <Row label="Language">
          Direct and technical enough to resonate with finance professionals;
          avoids jargon to remain accessible.
        </Row>
      </Section>

      <Section title="Desires">
        <ul style={listStyle}>
          <li>Simplicity in financial management.</li>
          <li>Security in transactions.</li>
          <li>Real-time control and insights.</li>
          <li>
            Reliable use of stablecoins and digital payments for global
            operations.
          </li>
        </ul>
      </Section>

      <Section title="Objections">
        <p style={paragraphStyle}>
          Concerns about the security of using stablecoins and digital payment
          systems; potential skepticism about transitioning from traditional
          banking methods.
        </p>
      </Section>

      <Section title="Story">
        <blockquote
          style={{
            margin: 0,
            paddingLeft: "1rem",
            borderLeft: "3px solid #e5e7eb",
            color: "#374151",
            fontStyle: "italic",
          }}
        >
          Upgrade your business financial operations with Request Finance&apos;s
          modern platform, making spend management clear, secure, and efficient.
          Elevate your financial processes with tools designed for the future.
        </blockquote>
      </Section>

      <Section title="Buying triggers">
        <ul style={listStyle}>
          <li>Need to streamline and modernize financial operations.</li>
          <li>
            Desire for comprehensive tools that provide clarity and control over
            spend management.
          </li>
          <li>
            Requirement for a secure system that integrates well with existing
            financial tools and systems.
          </li>
        </ul>
      </Section>

      <Section title="Personal preferences (voice)">
        <ul style={listStyle}>
          <li>Never use emojis.</li>
          <li>One sentence, one line.</li>
          <li>Use short, punchy sentences.</li>
          <li>Avoid clichés.</li>
          <li>Use numbers instead of generic statements.</li>
          <li>Try to include examples.</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginBottom: "2rem",
        paddingBottom: "1.5rem",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#111827",
          marginBottom: "1rem",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: "0.9375rem", color: "#374151", lineHeight: 1.6 }}>
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        marginBottom: "0.75rem",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: "7rem",
          fontWeight: 600,
          color: "#6b7280",
          fontSize: "0.8125rem",
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          color: "#374151",
        }}
      >
        {children}
      </span>
    </div>
  );
}

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: "1.25rem",
  listStylePosition: "outside",
};

const paragraphStyle: React.CSSProperties = {
  margin: 0,
};
