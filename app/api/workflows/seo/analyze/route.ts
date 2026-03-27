import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import {
  WORKFLOW_ANTHROPIC_MODEL,
  WORKFLOW_ANTHROPIC_MAX_TOKENS,
  extractTextFromMessage,
} from "@/lib/workflows/anthropic";
import { scrapePageHtml } from "@/lib/workflows/scrape";
import { SEO_SYSTEM_PROMPT, SEO_OUTPUT_STRUCTURE } from "../prompts";

const MAX_HTML_CHARS = 120_000;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY is not set" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";

    if (!url) {
      return Response.json(
        { error: "Website URL is required" },
        { status: 400 }
      );
    }

    let html: string;
    try {
      html = await scrapePageHtml(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch URL";
      return Response.json(
        { error: `Could not fetch page: ${message}` },
        { status: 400 }
      );
    }

    if (!html || html.length < 100) {
      return Response.json(
        { error: "Page content too short or inaccessible. Check the URL." },
        { status: 400 }
      );
    }

    const truncatedHtml =
      html.length > MAX_HTML_CHARS
        ? html.slice(0, MAX_HTML_CHARS) +
          "\n\n[... HTML truncated for length ...]"
        : html;

    const anthropic = new Anthropic({ apiKey });

    const userContent = `Page URL: ${url}\n\nHTML code and content:\n---\n${truncatedHtml}`;

    const message = await anthropic.messages.create({
      model: WORKFLOW_ANTHROPIC_MODEL,
      max_tokens: WORKFLOW_ANTHROPIC_MAX_TOKENS,
      system: SEO_SYSTEM_PROMPT + SEO_OUTPUT_STRUCTURE,
      messages: [{ role: "user", content: userContent }],
    });

    const analysis =
      extractTextFromMessage(message.content).trim() || "No audit generated.";

    const { data: run, error: insertError } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id: "seo-audit",
        input: { url },
        result: analysis,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to save workflow run:", insertError);
    }

    return Response.json({
      analysis,
      runId: run?.id ?? null,
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "SEO audit failed",
      },
      { status: 500 }
    );
  }
}
