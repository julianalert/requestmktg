import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import {
  WORKFLOW_ANTHROPIC_MODEL,
  WORKFLOW_ANTHROPIC_MAX_TOKENS,
  extractTextFromMessage,
} from "@/lib/workflows/anthropic";
import {
  PRODUCT_DESCRIPTION,
  COLD_OUTREACH_SYSTEM_PROMPT,
  COLD_OUTREACH_OUTPUT_STRUCTURE,
} from "../prompts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function personaToText(p: {
  name?: string | null;
  role?: string | null;
  headline?: string | null;
  meta?: unknown;
  sections?: unknown;
  prompt_input?: string | null;
}): string {
  const parts: string[] = [];
  if (p.name) parts.push(`Name: ${p.name}`);
  if (p.role) parts.push(`Role: ${p.role}`);
  if (p.headline) parts.push(`Headline: ${p.headline}`);
  if (p.prompt_input) parts.push(`Context: ${p.prompt_input}`);
  if (Array.isArray(p.meta) && p.meta.length > 0) {
    parts.push(
      "Meta: " +
        p.meta.map((m: { label?: string; value?: string }) => `${m.label}: ${m.value}`).join(" | ")
    );
  }
  if (Array.isArray(p.sections) && p.sections.length > 0) {
    const sectionTexts = p.sections.map((s: { title?: string; content?: string; items?: string[]; entries?: { label: string; value: string }[] }) => {
      if (s.title) {
        let block = `### ${s.title}\n`;
        if (s.content) block += s.content + "\n";
        if (Array.isArray(s.items)) block += s.items.join("\n") + "\n";
        if (Array.isArray(s.entries)) block += s.entries.map((e) => `${e.label}: ${e.value}`).join("\n") + "\n";
        return block;
      }
      return "";
    });
    parts.push("Sections:\n" + sectionTexts.filter(Boolean).join("\n"));
  }
  return parts.join("\n\n");
}

function formatSalesOutreachAngles(
  angles: Array<{ angle?: string; opening_message?: string; pain_trigger?: string }>
): string {
  if (!angles.length) return "";
  const lines = angles.map((a, i) => {
    const parts: string[] = [];
    if (a.angle) parts.push(`Angle: ${a.angle}`);
    if (a.opening_message) parts.push(`Opening message: ${a.opening_message}`);
    if (a.pain_trigger) parts.push(`Pain trigger: ${a.pain_trigger}`);
    return `${i + 1}. ${parts.join("\n   ")}`;
  });
  return "Sales outreach angles (use these to inspire and align your 3 sequences):\n" + lines.join("\n\n");
}

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
    const personaId = typeof body.personaId === "string" ? body.personaId.trim() : "";

    if (!personaId) {
      return Response.json(
        { error: "Persona is required" },
        { status: 400 }
      );
    }

    const { data: persona, error: fetchError } = await supabase
      .from("personas")
      .select("id, name, role, headline, meta, sections, prompt_input")
      .eq("id", personaId)
      .single();

    if (fetchError || !persona) {
      return Response.json(
        { error: "Persona not found", details: fetchError?.message },
        { status: 404 }
      );
    }

    const { data: campaign } = await supabase
      .from("persona_campaigns")
      .select("sales_outreach_angles")
      .eq("persona_id", personaId)
      .maybeSingle();

    const salesOutreachAngles = (campaign?.sales_outreach_angles ?? []) as Array<{
      angle?: string;
      opening_message?: string;
      pain_trigger?: string;
    }>;

    const personaText = personaToText(persona);
    const salesAnglesText = formatSalesOutreachAngles(salesOutreachAngles);

    const anthropic = new Anthropic({ apiKey });

    const userParts = [
      `Product description:\n${PRODUCT_DESCRIPTION}`,
      `\n---\n\nDetailed buyer persona:\n${personaText}`,
    ];
    if (salesAnglesText) {
      userParts.push(`\n---\n\n${salesAnglesText}`);
    }
    const userContent = userParts.join("");

    const message = await anthropic.messages.create({
      model: WORKFLOW_ANTHROPIC_MODEL,
      max_tokens: WORKFLOW_ANTHROPIC_MAX_TOKENS,
      system: COLD_OUTREACH_SYSTEM_PROMPT + COLD_OUTREACH_OUTPUT_STRUCTURE,
      messages: [{ role: "user", content: userContent }],
    });

    const analysis =
      extractTextFromMessage(message.content).trim() || "No sequence generated.";

    const { data: run, error: insertError } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id: "cold-outreach-sequence",
        input: {
          personaId,
          personaName: persona.name ?? "Unknown",
          personaRole: persona.role ?? undefined,
        },
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
        error: err instanceof Error ? err.message : "Cold outreach sequence failed",
      },
      { status: 500 }
    );
  }
}
