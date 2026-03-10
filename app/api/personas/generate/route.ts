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
    const promptInput =
      typeof body.promptInput === "string"
        ? body.promptInput.trim()
        : "No additional guidance provided.";

    const openai = new OpenAI({ apiKey });

    const userMessage1 = `Website content:\n${WEBSITE_CONTENT}\n\nBrand profile:\n${BRAND_PROFILE}\n\nUser guidance for this persona (use to tailor the persona):\n${promptInput}\n\nGenerate the persona as a single JSON object.`;

    const completion1 = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PERSONA_SYSTEM_PROMPT },
        { role: "user", content: userMessage1 },
      ],
      response_format: { type: "json_object" },
    });

    const raw1 = completion1.choices[0]?.message?.content ?? "{}";
    const jsonStr1 = raw1.startsWith("{") ? raw1 : extractJson(raw1);
    const personaPayload = JSON.parse(jsonStr1) as {
      name: string;
      role: string;
      headline: string;
      meta: { label: string; value: string }[];
      sections: { type: string; title: string; content?: string; items?: string[]; entries?: { label: string; value: string }[] }[];
    };

    const { data: insertedPersona, error: insertPersonaError } = await supabase
      .from("personas")
      .insert({
        prompt_input: promptInput,
        name: personaPayload.name ?? "Unnamed",
        role: personaPayload.role ?? "",
        headline: personaPayload.headline ?? "",
        meta: personaPayload.meta ?? [],
        sections: personaPayload.sections ?? [],
      })
      .select("id, name, role, headline, meta, sections, created_at")
      .single();

    if (insertPersonaError || !insertedPersona) {
      console.error(insertPersonaError);
      return Response.json(
        {
          error: "Failed to save persona",
          details: insertPersonaError?.message ?? "No data returned",
        },
        { status: 500 }
      );
    }

    const personaForCampaign = JSON.stringify(personaPayload);
    const userMessage2 = `Here is the persona (use it to generate ad angles, landing page hooks, sales outreach angles, and SEO topics):\n\n${personaForCampaign}\n\nReturn the JSON object only.`;

    const completion2 = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CAMPAIGN_SYSTEM_PROMPT },
        { role: "user", content: userMessage2 },
      ],
      response_format: { type: "json_object" },
    });

    const raw2 = completion2.choices[0]?.message?.content ?? "{}";
    const jsonStr2 = raw2.startsWith("{") ? raw2 : extractJson(raw2);
    const campaignPayload = JSON.parse(jsonStr2) as {
      ad_angles: { angle_title: string; core_pain: string; hook: string; why_it_resonates: string }[];
      landing_page_hooks: { headline: string; subheadline: string; core_problem_addressed: string }[];
      sales_outreach_angles: { angle: string; opening_message: string; pain_trigger: string }[];
      seo_topics: { topic: string; search_intent: string; example_keywords: string[] }[];
    };

    const { error: insertCampaignError } = await supabase
      .from("persona_campaigns")
      .insert({
        persona_id: insertedPersona.id,
        ad_angles: campaignPayload.ad_angles ?? [],
        landing_page_hooks: campaignPayload.landing_page_hooks ?? [],
        sales_outreach_angles: campaignPayload.sales_outreach_angles ?? [],
        seo_topics: campaignPayload.seo_topics ?? [],
      });

    if (insertCampaignError) {
      console.error(insertCampaignError);
      return Response.json(
        {
          error: "Persona saved but campaign save failed",
          details: insertCampaignError.message,
          persona: insertedPersona,
        },
        { status: 500 }
      );
    }

    const campaign = {
      ad_angles: campaignPayload.ad_angles ?? [],
      landing_page_hooks: campaignPayload.landing_page_hooks ?? [],
      sales_outreach_angles: campaignPayload.sales_outreach_angles ?? [],
      seo_topics: campaignPayload.seo_topics ?? [],
    };

    return Response.json({
      persona: {
        id: insertedPersona.id,
        name: insertedPersona.name,
        role: insertedPersona.role,
        headline: insertedPersona.headline,
        meta: insertedPersona.meta ?? [],
        sections: insertedPersona.sections ?? [],
      },
      campaign,
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      {
        error: err instanceof Error ? err.message : "Generation failed",
      },
      { status: 500 }
    );
  }
}
