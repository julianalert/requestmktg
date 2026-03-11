/**
 * Experiment definitions for the dashboard.
 * Experiments are initiatives or plays (e.g. EduSales, influence marketing) tracked as cards.
 */

export interface ExperimentStep {
  number: number;
  title: string;
}

export interface ExperimentMeta {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  /** When set, adds step tabs (Overview + Step 1, Step 2, ...) and todo list on Overview. */
  steps?: ExperimentStep[];
}

export const EXPERIMENTS: ExperimentMeta[] = [
  {
    id: "edusales-influence",
    slug: "edusales-influence",
    name: "EduSales Content + Influence Marketing",
    description:
      "Combine educational content with influencer and partner outreach to build authority and reach. Create value-first assets (guides, benchmarks, templates) and distribute through industry voices and communities.",
    category: "Marketing",
    tags: ["EduSales", "Influence", "Content", "Partnerships"],
    steps: [
      { number: 1, title: "Identify 50 potential partners" },
      { number: 2, title: "Create the content" },
      { number: 3, title: "Close partnerships" },
      { number: 4, title: "Distribute" },
      { number: 5, title: "Report" },
    ],
  },
];

export function getExperimentBySlug(slug: string): ExperimentMeta | undefined {
  return EXPERIMENTS.find((e) => e.slug === slug);
}

/** Badge colors by category (aligned with workflow styles). */
export function getExperimentCategoryStyles(category: string): { backgroundColor: string; color: string } {
  switch (category) {
    case "Marketing":
      return { backgroundColor: "#e0f2fe", color: "#0369a1" };
    case "Sales":
      return { backgroundColor: "#dcfce7", color: "#166534" };
    default:
      return { backgroundColor: "#f3f4f6", color: "#374151" };
  }
}
