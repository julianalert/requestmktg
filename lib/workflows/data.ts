/**
 * Workflow definitions for the dashboard.
 *
 * ADDING A NEW WORKFLOW:
 * 1. Add the workflow id to the WorkflowId union type below.
 * 2. Add an entry to WORKFLOWS with: id, slug, name, description, category,
 *    inputs (key, label, required, placeholder, type?), analyzeEndpoint,
 *    runButtonLabel, resultPlaceholder?, tags, builtFor.
 * 3. Create API route at analyzeEndpoint that accepts input keys in JSON body,
 *    runs the workflow, inserts into workflow_runs (workflow_id = id),
 *    returns { analysis: string, runId?: string }.
 * 4. No UI changes needed—detail page and Previous runs are data-driven.
 */

export type WorkflowId = "conversion-rate-optimizer" | "seo-audit" | "cold-outreach-sequence";

export interface WorkflowInput {
  key: string;
  label: string;
  required: boolean;
  placeholder: string;
  type?: "url" | "text" | "persona";
}

export interface WorkflowMeta {
  id: WorkflowId;
  slug: string;
  name: string;
  description: string;
  category: string;
  inputs: WorkflowInput[];
  /** POST endpoint for running this workflow. If set, detail page shows the run form. */
  analyzeEndpoint?: string;
  /** Label for the run button (e.g. "Analyze Conversion Rate"). */
  runButtonLabel?: string;
  /** Placeholder text in result area before a run. */
  resultPlaceholder?: string;
  builtFor: string[];
  tags: string[];
}

export const WORKFLOWS: WorkflowMeta[] = [
  {
    id: "conversion-rate-optimizer",
    slug: "conversion-rate-optimizer",
    name: "Conversion Rate Optimizer",
    description:
      "Analyzes user behavior and identifies conversion barriers to improve conversion rates across your funnel.",
    category: "Marketing",
    inputs: [
      { key: "url", label: "Website URL", required: true, placeholder: "https://example.com", type: "url" },
      {
        key: "conversionGoal",
        label: "Conversion Goal (optional)",
        required: false,
        placeholder: "e.g., Sign up, Purchase, Download",
        type: "text",
      },
    ],
    analyzeEndpoint: "/api/workflows/cro/analyze",
    runButtonLabel: "Analyze Conversion Rate",
    resultPlaceholder: "Your conversion rate optimization analysis will appear here.",
    builtFor: ["Growth Marketer", "Product Manager", "CRO Specialist"],
    tags: ["CRO", "Conversion Optimization", "UX", "Growth"],
  },
  {
    id: "seo-audit",
    slug: "seo-audit",
    name: "SEO Audit",
    description:
      "Performs a complete technical and on-page SEO audit of a webpage based on its HTML and content to identify ranking blockers and opportunities.",
    category: "Marketing",
    inputs: [
      { key: "url", label: "Website URL", required: true, placeholder: "https://example.com", type: "url" },
    ],
    analyzeEndpoint: "/api/workflows/seo/analyze",
    runButtonLabel: "Run SEO Audit",
    resultPlaceholder: "Your SEO audit will appear here.",
    builtFor: [],
    tags: ["SEO", "Technical SEO", "On-Page SEO", "Audit"],
  },
  {
    id: "cold-outreach-sequence",
    slug: "cold-outreach-sequence",
    name: "Cold Outreach Sequence Writer",
    description:
      "Generates human, concise cold email sequences tailored to a buyer persona—three angles with three emails each, focused on starting a conversation.",
    category: "Sales",
    inputs: [
      {
        key: "personaId",
        label: "Persona",
        required: true,
        placeholder: "Select a persona",
        type: "persona",
      },
    ],
    analyzeEndpoint: "/api/workflows/cold-outreach/analyze",
    runButtonLabel: "Write sequence",
    resultPlaceholder: "Your cold outreach sequences will appear here.",
    builtFor: [],
    tags: ["Outreach", "Cold Email", "Sales", "B2B"],
  },
];

export function getWorkflowBySlug(slug: string): WorkflowMeta | undefined {
  return WORKFLOWS.find((w) => w.slug === slug);
}

export function getWorkflowById(id: string): WorkflowMeta | undefined {
  return WORKFLOWS.find((w) => w.id === id);
}

/** True if the workflow can be run from the UI (has an analyze endpoint). */
export function isRunnable(workflow: WorkflowMeta): boolean {
  return Boolean(workflow.analyzeEndpoint && workflow.inputs.length > 0);
}

/** Badge colors by category for consistent styling across workflow list, detail, and runs. */
export function getCategoryBadgeStyles(category: string): { backgroundColor: string; color: string } {
  switch (category) {
    case "Marketing":
      return { backgroundColor: "#e0f2fe", color: "#0369a1" };
    case "Sales":
      return { backgroundColor: "#dcfce7", color: "#166534" };
    default:
      return { backgroundColor: "#f3f4f6", color: "#374151" };
  }
}
