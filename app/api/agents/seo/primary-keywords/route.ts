import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { WEBSITE_CONTENT, BRAND_PROFILE } from "@/app/api/personas/prompts";
import { PRIMARY_KEYWORDS_SYSTEM_PROMPT } from "../prompts";

const OPENAI_MODEL = "gpt-4o-mini";

export type PrimaryKeywordEntry = {
  keyword: string;
  location: string;
  language: string;
  limit: number;
  depth: number;
};

const DEFAULT_LOCATION = "United States";
const DEFAULT_LANGUAGE = "English";
const DEFAULT_LIMIT = 200;
const DEFAULT_DEPTH = 2;

function toEntry(kw: string | PrimaryKeywordEntry): PrimaryKeywordEntry {
  if (typeof kw === "string") {
    return {
      keyword: kw,
      location: DEFAULT_LOCATION,
      language: DEFAULT_LANGUAGE,
      limit: DEFAULT_LIMIT,
      depth: DEFAULT_DEPTH,
    };
  }
  return {
    keyword: kw.keyword ?? "",
    location: kw.location ?? DEFAULT_LOCATION,
    language: kw.language ?? DEFAULT_LANGUAGE,
    limit: typeof kw.limit === "number" ? kw.limit : DEFAULT_LIMIT,
    depth: typeof kw.depth === "number" ? kw.depth : DEFAULT_DEPTH,
  };
}

export function normalizeKeywords(raw: unknown): PrimaryKeywordEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => toEntry(item as string | PrimaryKeywordEntry)).filter((e) => e.keyword.trim() !== "");
}

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
    const { data: rows, error } = await supabase
      .from("seo_primary_keywords")
      .select("id, keywords, created_at")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return Response.json(
        { error: "Failed to fetch primary keywords", details: error.message },
        { status: 500 }
      );
    }

    const latest = rows?.[0];
    const keywords = normalizeKeywords(latest?.keywords ?? []);
    return Response.json({
      keywords,
      createdAt: latest?.created_at ?? null,
      id: latest?.id ?? null,
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const userPrompt = `Here is the content of my landing page and my brand info:

**Landing page content:**
${WEBSITE_CONTENT}

**Brand profile:**
${BRAND_PROFILE}

Identify 10 primary keywords and return valid JSON only.`;

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: PRIMARY_KEYWORDS_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const jsonStr = raw.startsWith("{") ? raw : extractJson(raw);
    const parsed = JSON.parse(jsonStr) as { keywords?: string[] };

    const newKeywordStrings = Array.isArray(parsed.keywords)
      ? parsed.keywords.slice(0, 10).filter((k): k is string => typeof k === "string").map((k) => k.trim()).filter(Boolean)
      : [];

    const { data: existingRows } = await supabase
      .from("seo_primary_keywords")
      .select("keywords")
      .order("created_at", { ascending: false })
      .limit(1);

    const existing = normalizeKeywords(existingRows?.[0]?.keywords ?? []);
    const existingSet = new Set(existing.map((e) => e.keyword.toLowerCase().trim()));

    const newEntries: PrimaryKeywordEntry[] = newKeywordStrings
      .filter((k) => !existingSet.has(k.toLowerCase().trim()))
      .map((keyword) => ({
        keyword: keyword.trim(),
        location: DEFAULT_LOCATION,
        language: DEFAULT_LANGUAGE,
        limit: DEFAULT_LIMIT,
        depth: DEFAULT_DEPTH,
      }));

    const merged = [...existing, ...newEntries];

    if (newEntries.length === 0) {
      const { data: latestRows } = await supabase
        .from("seo_primary_keywords")
        .select("id, created_at")
        .order("created_at", { ascending: false })
        .limit(1);
      const latestRow = latestRows?.[0];
      return Response.json({
        keywords: existing,
        createdAt: latestRow?.created_at ?? null,
        id: latestRow?.id ?? null,
      });
    }

    const { data: row, error: insertError } = await supabase
      .from("seo_primary_keywords")
      .insert({ keywords: merged })
      .select("id, keywords, created_at")
      .single();

    if (insertError) {
      return Response.json(
        { error: "Failed to save keywords", details: insertError.message },
        { status: 500 }
      );
    }

    const keywords = normalizeKeywords(row?.keywords ?? []);
    return Response.json({
      keywords,
      createdAt: row?.created_at,
      id: row?.id,
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Generate primary keywords failed",
      },
      { status: 500 }
    );
  }
}
