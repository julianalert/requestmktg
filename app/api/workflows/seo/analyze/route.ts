import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { scrapePageHtml } from "@/lib/workflows/scrape";
import { SEO_SYSTEM_PROMPT, SEO_OUTPUT_STRUCTURE } from "../prompts";

const OPENAI_MODEL = "gpt-4o-mini";
const MAX_HTML_CHARS = 120_000;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY is not set" },
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

    const openai = new OpenAI({ apiKey });

    const userContent = `Page URL: ${url}\n\nHTML code and content:\n---\n${truncatedHtml}`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SEO_SYSTEM_PROMPT + SEO_OUTPUT_STRUCTURE },
        { role: "user", content: userContent },
      ],
    });

    const analysis =
      completion.choices[0]?.message?.content?.trim() ??
      "No audit generated.";

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
