import Anthropic from "@anthropic-ai/sdk";

/** Claude Sonnet 4.6 — used by Conversion Rate Optimizer, SEO Audit, Cold Outreach workflows */
export const WORKFLOW_ANTHROPIC_MODEL = "claude-sonnet-4-6";

export const WORKFLOW_ANTHROPIC_MAX_TOKENS = 8192;

export function extractTextFromMessage(
  content: Anthropic.Messages.ContentBlock[]
): string {
  return content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}
