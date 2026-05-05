import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  getProfileById,
  type ProfileId,
} from "@/lib/agents/social-post-writer/profiles";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

type RawIdea = {
  post_intent: string;
  trigger_or_spark: string;
  founder_pov: string;
  audience: string;
  sharpness: number;
  cta_style: string;
  personal_detail_hint: string;
};

function parseRobust(raw: string): RawIdea[] {
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array in AI response");
  const extracted = raw.slice(start, end + 1);
  const normalised = extracted
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
  return JSON.parse(normalised);
}

function buildSystemPrompt(profileId: ProfileId, categories: string[]): string {
  const categoryList = categories.map((c) => `- "${c}"`).join("\n");

  const profileContext: Record<ProfileId, string> = {
    jb: `You are a content strategist helping Jean-Baptiste Chenut — Co-founder, CFO & CEO of Request Finance — build a backlog of LinkedIn post ideas.
JB writes from the CFO's chair: finance operations, payment infrastructure, crypto/fiat complexity, control systems, and the lived stress of being both a founder and a finance executive.
Request Finance helps companies pay and get paid in crypto and fiat, automate AP/payroll/expenses, and replace fragmented tools with one platform.`,

    ludo: `You are a content strategist helping Ludo — Head of Sales & COO at Request Finance — build a backlog of LinkedIn post ideas.
Ludo writes from the intersection of sales leadership and operations: closing fintech deals with skeptical CFOs, building GTM in new markets, running operations across time zones, and navigating the trust problem in crypto payments.`,

    simran: `You are a content strategist helping Simran — Head of Community at Request Finance and the Web3 Finance Club — build a backlog of LinkedIn post ideas.
Simran writes from the community builder's perspective: vetting and onboarding finance leaders, creating conditions for real peer connections, organizing intimate global events, and believing that professional belonging is infrastructure.
The Web3 Finance Club has 1,500+ vetted members: CFOs, Treasury Managers, CPAs exploring stablecoin payments.`,
  };

  return `${profileContext[profileId]}

## ALLOWED CATEGORIES (use ONLY these exact strings for post_intent):
${categoryList}

## IDEA QUALITY RULES
- Every idea must be grounded in a specific, real-world trigger (a moment, a conversation, a frustration, a pattern noticed)
- The trigger_or_spark must be concrete — not "thinking about finance" but "watching a CFO triple-check a payment at midnight"
- The founder_pov must be a single clear insight or opinion — the thing the post would prove
- personal_detail_hint must be a specific memory anchor — a real scene, not a category
- sharpness is 1–5: 1–2 reflective, 3 direct, 4–5 bold/contrarian
- cta_style must be exactly one of: "Reflection", "Question", "Mic drop", "Invite discussion"
- Ideas must be meaningfully different from each other — varied triggers, POVs, and audiences
- Never repeat ideas that already exist in the profile's list

## OUTPUT FORMAT
Return ONLY a valid JSON array. No markdown, no commentary, no preamble.
Each object must have exactly these fields:
{
  "post_intent": string,       // must match one of the allowed categories exactly
  "trigger_or_spark": string,  // specific moment or event
  "founder_pov": string,       // the core insight — one clear sentence
  "audience": string,          // e.g. "CFOs", "Sales Leaders / Founders"
  "sharpness": number,         // 1–5
  "cta_style": string,         // "Reflection" | "Question" | "Mic drop" | "Invite discussion"
  "personal_detail_hint": string // specific memory anchor
}`;
}

function buildUserPrompt(opts: {
  count: number;
  context: string | null;
  profileName: string;
  existingIdeasSummary: string;
}): string {
  const { count, context, profileName, existingIdeasSummary } = opts;

  if (count === 1 && context) {
    return `${profileName} has told me exactly what they want to write about next:

"${context}"

Generate exactly 1 LinkedIn post idea built tightly around this. The idea should feel like it came directly from this experience or thought — not a generic version of it. Use the category (post_intent) that fits most naturally.

Already existing ideas (do not repeat or closely echo):
${existingIdeasSummary}

Return a JSON array with exactly 1 object.`;
  }

  const contextLine = context
    ? `\nDirectional hint from ${profileName}: "${context}" — let this influence some of the themes but don't be too literal. Not all ideas need to be about this.\n`
    : "";

  return `Generate ${count} fresh LinkedIn post ideas for ${profileName}.
${contextLine}
Spread ideas across different categories and sharpness levels. Aim for variety in tone — some reflective, some bold, some educational.

Already existing ideas (do not repeat or closely echo):
${existingIdeasSummary}

Return a JSON array with exactly ${count} objects.`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || !body.profile_id || !body.count) {
    return NextResponse.json(
      { error: "profile_id and count are required" },
      { status: 400 }
    );
  }

  const {
    profile_id,
    count,
    context,
  }: { profile_id: ProfileId; count: number; context?: string } = body;

  const VALID_COUNTS = [1, 5, 25, 50];
  if (!VALID_COUNTS.includes(count)) {
    return NextResponse.json(
      { error: "count must be 1, 5, 25, or 50" },
      { status: 400 }
    );
  }

  const profile = getProfileById(profile_id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Derive allowed categories from the profile's static ideas
  const categories = Array.from(
    new Set(profile.ideas.map((i) => i.post_intent))
  );

  // Build a compact summary of existing ideas to avoid repetition
  const existingIdeasSummary = profile.ideas
    .map((i) => `- [${i.post_intent}] ${i.trigger_or_spark} / ${i.founder_pov}`)
    .join("\n");

  const systemPrompt = buildSystemPrompt(profile_id, categories);
  const userPrompt = buildUserPrompt({
    count,
    context: context?.trim() || null,
    profileName: profile.name,
    existingIdeasSummary,
  });

  let ideas: RawIdea[];

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: count <= 5 ? 1500 : count <= 25 ? 6000 : 12000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    ideas = parseRobust(raw);
  } catch (e) {
    return NextResponse.json(
      {
        error: `AI generation failed: ${
          e instanceof Error ? e.message : String(e)
        }`,
      },
      { status: 500 }
    );
  }

  if (!Array.isArray(ideas) || ideas.length === 0) {
    return NextResponse.json(
      { error: "Claude returned no ideas" },
      { status: 500 }
    );
  }

  // Save to Supabase
  const rows = ideas.map((idea) => ({
    profile_id,
    post_intent: idea.post_intent,
    trigger_or_spark: idea.trigger_or_spark,
    founder_pov: idea.founder_pov,
    audience: idea.audience,
    sharpness: Number(idea.sharpness),
    cta_style: idea.cta_style,
    personal_detail_hint: idea.personal_detail_hint,
    context_hint: context?.trim() || null,
  }));

  const { data: saved, error: insertErr } = await supabase
    .from("social_post_writer_ideas")
    .insert(rows)
    .select();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json(saved, { status: 201 });
}
