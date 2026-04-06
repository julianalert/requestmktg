import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function GET() {
  const { data, error } = await supabase
    .from("content_ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const requestedCategory: string | null = body.category ?? null;
  // Fetch existing ideas so Claude doesn't repeat them
  const { data: existing } = await supabase
    .from("content_ideas")
    .select("category, headline")
    .order("created_at", { ascending: false });

  const existingList =
    existing && existing.length > 0
      ? existing
          .map((i) => `- [${i.category}] ${i.headline}`)
          .join("\n")
      : "None yet.";

  const systemPrompt = `You are a content strategist for the Web3 Finance Club — a free, vetted community of 1,500+ finance leaders (CFOs, Heads of Finance, Treasury Managers, CPAs) who use or are exploring stablecoin payments and on-chain financial operations.

The Club is built and sponsored by Request Finance but operates as an independent community brand. The tone is warm, peer-driven, practical, and inclusive — never salesy, never jargon-heavy, never "crypto bro."

## Club identity
- One-liner: "The community where finance leaders learn how to use stablecoins to run their business."
- 1,500+ manually vetted members
- Free to join
- Private Slack + Circle community, exclusive in-person events, monthly CFO AMAs, curated intros, $10K+ partner perks

## The audience — 3 personas
- Persona A (60%): Web3-native CFOs managing on-chain treasury, paying contractors in USDC, using Safe/Fireblocks. They want peer validation, regulatory updates, and tool recommendations.
- Persona B (25%): CPAs, fractional CFOs, lawyers advising crypto clients. They want to stay current and find clients.
- Persona C (15%, growing): Traditional finance leaders exploring stablecoins for cross-border payments. They want beginner-friendly education with zero jargon. They search for "cheaper international payments," not "DeFi treasury."

## Channels
- Slack/Circle (internal, members only): longer-form, discussion-oriented, safe space for questions
- LinkedIn (@web3financeclub): public-facing, acquisition-focused, insight-led, 5–8 line posts
- X/Twitter (@web3financeclub): crypto-native audience, punchy, shorter, more opinionated

## 10 content categories
1. Member Spotlight — a real member's story, challenge, or insight
2. Stablecoin News & Regulatory Update — one curated news item + "why it matters" take
3. Practitioner Tip — specific, tactical, actionable advice from a practitioner
4. Tool & Stack Insight — peer-level comparison or recommendation of tools (sub-ledgers: Cryptio/Tres/Bitwave; wallets: Safe/Fireblocks; ERPs: QuickBooks/Xero/NetSuite; payment platforms)
5. Data Point / Stat — one compelling number with context
6. Question / Discussion Starter — open question that invites participation
7. Event Recap / AMA Takeaway — summary of latest AMA, event, or Office Hours
8. Web2 Bridge Content — stablecoin concepts in traditional finance language, zero jargon, problem-first framing
9. Industry / Vertical Spotlight — how a specific industry (gaming, agencies, logistics, real estate) uses stablecoins
10. Hot Take / Contrarian View — spicy but informed opinion (use sparingly)

## Voice rules
- Warm, not corporate. Sound like a trusted colleague.
- Peer-level, not expert-down. Feature members as the experts, not the Club itself.
- Inclusive, not gatekeeping. No question is too basic.
- Practical, not theoretical. Every piece should be actionable.
- Confident, not salesy.
- Use: "finance leaders," "stablecoin payments," "peer network," "cross-border payments"
- Avoid: "degens," "blockchain revolution," "cutting-edge," "disrupt," "leverage," DeFi jargon
- Never pitch Request Finance directly — it can be mentioned as "a tool many members use" but content is community-first.

## Brand context
- Real members: Jean-Baptiste Chenut (CFO @ Request Finance), Katya Kharitonova (CFO @ P2P.org), Alexandre Caffarelli (CFO @ Kiln), Guillaume de Saint Rémy (Director of Finance @ Ledger), Edwin Aguilar (CFO @ SUI/Mysten Labs)
- Member pain points: professional isolation, no best practices playbook, compliance anxiety, tool overload
- Joining triggers: "my bank charges 40% on transfers from Brazil," "our company just received funding in crypto," "I need to set up stablecoin payroll"
- Geography: 35% EU, 25% US+CA, 18% UAE/Dubai, 12% APAC, 10% LATAM

You always respond with valid JSON only — no markdown, no explanation, no preamble.`;

  const categoryInstruction = requestedCategory
    ? `ALL 10 ideas must use the category: "${requestedCategory}". Set "category" to exactly "${requestedCategory}" for every single object — no exceptions.`
    : `Vary the categories across the 10 ideas. Include a healthy mix from all 10 categories.`;

  const userPrompt = `Generate 10 fresh content ideas for the Web3 Finance Club. These must be completely different from the existing ideas listed below.

## Category instruction
${categoryInstruction}

## Already existing ideas (DO NOT repeat or closely echo these):
${existingList}

For each idea, provide a JSON object with exactly these fields:
- "category": one of the 10 categories (use the exact category name)
- "headline": the hook / first line someone reads (punchy, specific, human — not generic)
- "draft": a creative brief for this idea — NOT a full post. Include: the specific angle to take, 3–4 key points or facts to cover, and the tone to use. 3–5 sentences max. This is a reference for the editor, not the final content.
- "target_persona": "A", "B", "C", or "All"
- "channel": "Slack", "LinkedIn", "X", or "All"
- "engagement_cta": a suggested call-to-action or discussion hook (1 sentence)

Return a JSON array of exactly 10 objects. Nothing else.`;

  let ideas: Array<{
    category: string;
    headline: string;
    draft: string;
    target_persona: string;
    channel: string;
    engagement_cta: string;
  }> = [];

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract the JSON array between the first [ and last ]
    const startIdx = raw.indexOf("[");
    const endIdx = raw.lastIndexOf("]");
    if (startIdx === -1 || endIdx === -1) {
      throw new Error("No JSON array found in AI response");
    }
    const extracted = raw.slice(startIdx, endIdx + 1);

    // Normalise curly/smart quotes → straight quotes so JSON.parse doesn't choke
    const normalised = extracted
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"');

    ideas = JSON.parse(normalised);
  } catch (e) {
    return NextResponse.json(
      { error: `AI generation failed: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 }
    );
  }

  // Save all ideas to Supabase
  const { data: saved, error: insertError } = await supabase
    .from("content_ideas")
    .insert(ideas)
    .select();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(saved, { status: 201 });
}
