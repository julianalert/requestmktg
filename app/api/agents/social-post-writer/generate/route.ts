import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  buildSystemPrompt,
  getProfileById,
  type ProfileId,
  type PostIdea,
} from "@/lib/agents/social-post-writer/profiles";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || !body.profile_id || !body.idea) {
    return NextResponse.json(
      { error: "profile_id and idea are required" },
      { status: 400 }
    );
  }

  const { profile_id, idea }: { profile_id: ProfileId; idea: PostIdea & { id: number | string } } = body;

  const profile = getProfileById(profile_id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const systemPrompt = buildSystemPrompt(profile_id);

  const userPrompt = `Goal of the post: ${idea.post_intent}

What sparked this post: ${idea.trigger_or_spark}

What I actually think: ${idea.founder_pov}

I'm talking to: ${idea.audience}

Sharpness level: ${idea.sharpness} out of 5

CTA style: ${idea.cta_style}

Personal detail to anchor the post: ${idea.personal_detail_hint}`;

  let postText: string;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    postText =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    if (!postText) {
      throw new Error("Empty response from Claude");
    }
  } catch (e) {
    return NextResponse.json(
      {
        error: `AI generation failed: ${e instanceof Error ? e.message : String(e)}`,
      },
      { status: 500 }
    );
  }

  // Static ideas have numeric ids; AI-generated ideas have UUID string ids
  const numericIdeaId = typeof idea.id === "number" ? idea.id : null;
  const dbIdeaId = typeof idea.id === "string" ? idea.id : null;

  const { data: saved, error: insertErr } = await supabase
    .from("social_post_writer_posts")
    .insert({
      profile_id,
      idea_id: numericIdeaId,
      db_idea_id: dbIdeaId,
      post_intent: idea.post_intent,
      trigger_or_spark: idea.trigger_or_spark,
      post_text: postText,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json(saved, { status: 201 });
}
