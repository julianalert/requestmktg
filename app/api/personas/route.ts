import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import {
  WEBSITE_CONTENT,
  BRAND_PROFILE,
  PERSONA_SYSTEM_PROMPT,
  CAMPAIGN_SYSTEM_PROMPT,
} from "../prompts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function extractJson(text: string): string {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}") + 1;
  if (start === -1 || end <= start) return trimmed;
  return trimmed.slice(start, end);
}

export async function GET() {
  try {
    const { data: personas, error: personasError } = await supabase
      .from("personas")
      .select("*")
      .order("created_at", { ascending: false });

    if (personasError) {
      return Response.json(
        { error: "Failed to fetch personas", details: personasError.message },
        { status: 500 }
      );
    }

    const ids = (personas ?? []).map((p) => p.id);
    if (ids.length === 0) {
      return Response.json({ personas: [], campaignsByPersonaId: {} });
    }

    const { data: campaigns, error: campaignsError } = await supabase
      .from("persona_campaigns")
      .select("*")
      .in("persona_id", ids);

    if (campaignsError) {
      return Response.json(
        { error: "Failed to fetch campaigns", details: campaignsError.message },
        { status: 500 }
      );
    }

    const campaignsByPersonaId: Record<string, unknown> = {};
    for (const c of campaigns ?? []) {
      campaignsByPersonaId[c.persona_id] = {
        ad_angles: c.ad_angles ?? [],
        landing_page_hooks: c.landing_page_hooks ?? [],
        sales_outreach_angles: c.sales_outreach_angles ?? [],
        seo_topics: c.seo_topics ?? [],
      };
    }

    const personasWithMeta = (personas ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      headline: p.headline,
      meta: p.meta ?? [],
      sections: p.sections ?? [],
      prompt_input: p.prompt_input,
      created_at: p.created_at,
    }));

    return Response.json({
      personas: personasWithMeta,
      campaignsByPersonaId,
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
