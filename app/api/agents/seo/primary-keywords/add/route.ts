import { createClient } from "@supabase/supabase-js";
import type { PrimaryKeywordEntry } from "../route";
import { normalizeKeywords } from "../route";

const DEFAULT_LOCATION = "United States";
const DEFAULT_LANGUAGE = "English";
const DEFAULT_LIMIT = 200;
const DEFAULT_DEPTH = 2;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const keyword = typeof body.keyword === "string" ? body.keyword.trim() : "";
    if (!keyword) {
      return Response.json(
        { error: "keyword is required" },
        { status: 400 }
      );
    }

    const location = typeof body.location === "string" ? body.location.trim() || DEFAULT_LOCATION : DEFAULT_LOCATION;
    const language = typeof body.language === "string" ? body.language.trim() || DEFAULT_LANGUAGE : DEFAULT_LANGUAGE;
    const limit = typeof body.limit === "number" ? body.limit : DEFAULT_LIMIT;
    const depth = typeof body.depth === "number" ? body.depth : DEFAULT_DEPTH;

    const { data: existingRows } = await supabase
      .from("seo_primary_keywords")
      .select("id, keywords, created_at")
      .order("created_at", { ascending: false })
      .limit(1);

    const latestRow = existingRows?.[0] as { id?: string; keywords?: unknown; created_at?: string } | undefined;
    const existing = normalizeKeywords(latestRow?.keywords ?? []);
    const existingSet = new Set(existing.map((e) => e.keyword.toLowerCase().trim()));
    if (existingSet.has(keyword.toLowerCase())) {
      return Response.json({
        keywords: existing,
        createdAt: latestRow?.created_at ?? null,
        id: latestRow?.id ?? null,
      });
    }

    const newEntry: PrimaryKeywordEntry = {
      keyword,
      location,
      language,
      limit,
      depth,
    };
    const merged = [...existing, newEntry];

    const { data: row, error: insertError } = await supabase
      .from("seo_primary_keywords")
      .insert({ keywords: merged })
      .select("id, keywords, created_at")
      .single();

    if (insertError) {
      return Response.json(
        { error: "Failed to save keyword", details: insertError.message },
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
      { error: err instanceof Error ? err.message : "Add keyword failed" },
      { status: 500 }
    );
  }
}
