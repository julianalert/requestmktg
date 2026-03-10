import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import {
  PRODUCT_DESCRIPTION,
  COLD_OUTREACH_SYSTEM_PROMPT,
  COLD_OUTREACH_OUTPUT_STRUCTURE,
} from "../prompts";

const OPENAI_MODEL = "gpt-4o-mini";

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

    const personaText = personaToText(persona);

    const openai = new OpenAI({ apiKey });

    const userContent = `Product description:\n${PRODUCT_DESCRIPTION}\n\n---\n\nDetailed buyer persona:\n${personaText}`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: COLD_OUTREACH_SYSTEM_PROMPT + COLD_OUTREACH_OUTPUT_STRUCTURE,
        },
        { role: "user", content: userContent },
      ],
    });

    const analysis =
      completion.choices[0]?.message?.content?.trim() ?? "No sequence generated.";

    const { data: run, error: insertError } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id: "cold-outreach-sequence",
        input: { personaId },
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
