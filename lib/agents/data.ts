/**
 * Agent definitions for the dashboard.
 * Agents are full-featured tools with tables, tabs, and actions (e.g. SEO Agent).
 */

export interface AgentMeta {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
}

export const AGENTS: AgentMeta[] = [
  {
    id: "seo-agent",
    slug: "seo-agent",
    name: "The SEO Agent",
    description:
      "Keyword research and SEO strategy. Generate primary keywords from your landing page and brand, then discover keyword opportunities and master variations.",
    category: "Marketing",
    tags: ["SEO", "Keywords", "Research"],
  },
  {
    id: "social-post-writer",
    slug: "social-post-writer",
    name: "The Social Post Writer",
    description:
      "LinkedIn posts in JB, Ludo, or Simran's voice. Pick a profile, pick an idea from the curated list, and generate a ready-to-publish post.",
    category: "Marketing",
    tags: ["LinkedIn", "Content", "Personal Brand"],
  },
];

export function getAgentBySlug(slug: string): AgentMeta | undefined {
  return AGENTS.find((a) => a.slug === slug);
}

export function getAgentCategoryStyles(category: string): { backgroundColor: string; color: string } {
  switch (category) {
    case "Marketing":
      return { backgroundColor: "#e0f2fe", color: "#0369a1" };
    case "Sales":
      return { backgroundColor: "#dcfce7", color: "#166534" };
    default:
      return { backgroundColor: "#f3f4f6", color: "#374151" };
  }
}
