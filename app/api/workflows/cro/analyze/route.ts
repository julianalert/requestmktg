import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import {
  WORKFLOW_ANTHROPIC_MODEL,
  WORKFLOW_ANTHROPIC_MAX_TOKENS,
  extractTextFromMessage,
} from "@/lib/workflows/anthropic";
import { scrapePageText } from "@/lib/workflows/scrape";
import { CRO_SYSTEM_PROMPT, CRO_OUTPUT_STRUCTURE } from "../prompts";

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
    const conversionGoal =
      typeof body.conversionGoal === "string" ? body.conversionGoal.trim() : "";

    if (!url) {
      return Response.json(
        { error: "Website URL is required" },
        { status: 400 }
      );
    }

    let pageText: string;
    try {
      pageText = await scrapePageText(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch URL";
      return Response.json(
        { error: `Could not scrape page: ${message}` },
        { status: 400 }
      );
    }

    if (!pageText || pageText.length < 50) {
      return Response.json(
        { error: "Page content too short or inaccessible. Check the URL." },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const userContent = [
      `Landing page URL: ${url}`,
      conversionGoal ? `Conversion goal (optional): ${conversionGoal}` : "",
      "",
      "Page content (extracted text):",
      "---",
      pageText.slice(0, 120000),
    ]
      .filter(Boolean)
      .join("\n");

    const message = await anthropic.messages.create({
      model: WORKFLOW_ANTHROPIC_MODEL,
      max_tokens: WORKFLOW_ANTHROPIC_MAX_TOKENS,
      system: CRO_SYSTEM_PROMPT + CRO_OUTPUT_STRUCTURE,
      messages: [{ role: "user", content: userContent }],
    });

    const analysis =
      extractTextFromMessage(message.content).trim() ||
      "No analysis generated.";

    const { data: run, error: insertError } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id: "conversion-rate-optimizer",
        input: { url, conversionGoal: conversionGoal || undefined },
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
          err instanceof Error ? err.message : "CRO analysis failed",
      },
      { status: 500 }
    );
  }
}
