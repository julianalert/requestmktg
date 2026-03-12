import { createClient } from "@supabase/supabase-js";

const BASE = "https://api.dataforseo.com/v3/dataforseo_labs/google";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type KeywordOpportunityRow = {
  id?: string;
  keyword: string;
  primary_keyword: string;
  type: "related_keywords" | "keyword_suggestions" | "keyword_ideas";
  msv: number | null;
  search_intent: string | null;
  kw_difficulty: number | null;
  competition: number | null;
  cpc: number | null;
  created_at?: string;
};

function getAuthHeader(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD must be set");
  }
  return "Basic " + Buffer.from(`${login}:${password}`).toString("base64");
}

async function dataforseoPost(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DataForSEO ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function toRow(
  primaryKeyword: string,
  type: KeywordOpportunityRow["type"],
  item: {
    keyword?: string;
    keyword_data?: {
      keyword?: string;
      keyword_info?: { search_volume?: number; competition?: number; cpc?: number };
      keyword_properties?: { keyword_difficulty?: number };
      search_intent_info?: { main_intent?: string };
    };
    keyword_info?: { search_volume?: number; competition?: number; cpc?: number };
    keyword_properties?: { keyword_difficulty?: number };
    search_intent_info?: { main_intent?: string };
  }
): KeywordOpportunityRow {
  const kw = item.keyword ?? item.keyword_data?.keyword ?? "";
  const info = item.keyword_info ?? item.keyword_data?.keyword_info;
  const props = item.keyword_properties ?? item.keyword_data?.keyword_properties;
  const intent = item.search_intent_info ?? item.keyword_data?.search_intent_info;
  return {
    keyword: kw,
    primary_keyword: primaryKeyword,
    type,
    msv: info?.search_volume ?? null,
    search_intent: intent?.main_intent ?? null,
    kw_difficulty: props?.keyword_difficulty ?? null,
    competition: info?.competition ?? null,
    cpc: info?.cpc ?? null,
  };
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("seo_keyword_opportunities")
      .select("id, keyword, primary_keyword, type, msv, search_intent, kw_difficulty, competition, cpc, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json(
        { error: "Failed to fetch keyword opportunities", details: error.message },
        { status: 500 }
      );
    }
    return Response.json({ opportunities: data ?? [] });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    if (!login || !password) {
      return Response.json(
        { error: "DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables must be set" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const primaryKeyword = typeof body.primaryKeyword === "string" ? body.primaryKeyword.trim() : "";
    if (!primaryKeyword) {
      return Response.json({ error: "primaryKeyword is required" }, { status: 400 });
    }

    const location = typeof body.location === "string" ? body.location : "United States";
    const language = typeof body.language === "string" ? body.language : "English";
    const limit = typeof body.limit === "number" ? Math.min(Math.max(body.limit, 1), 700) : 200;
    const depth = typeof body.depth === "number" ? Math.min(Math.max(body.depth, 0), 4) : 2;

    const rows: KeywordOpportunityRow[] = [];

    // 1. Related keywords
    const relatedRes = await dataforseoPost("/related_keywords/live", [
      { keyword: primaryKeyword, location_name: location, language_name: language, limit, depth },
    ]) as { status_code?: number; tasks?: { result?: Array<{ items?: unknown[] }> }[] };
    if (relatedRes.status_code === 20000 && relatedRes.tasks?.[0]?.result?.[0]?.items) {
      const items = relatedRes.tasks[0].result[0].items as Array<{ keyword_data?: { keyword?: string; keyword_info?: { search_volume?: number; competition?: number; cpc?: number }; keyword_properties?: { keyword_difficulty?: number }; search_intent_info?: { main_intent?: string } } }>;
      for (const it of items) {
        const kw = it.keyword_data?.keyword;
        if (kw) rows.push(toRow(primaryKeyword, "related_keywords", it));
      }
    }

    // 2. Keyword suggestions
    const suggestionsRes = await dataforseoPost("/keyword_suggestions/live", [
      { keyword: primaryKeyword, location_name: location, language_name: language, limit },
    ]) as { status_code?: number; tasks?: { result?: Array<{ items?: unknown[] }> }[] };
    if (suggestionsRes.status_code === 20000 && suggestionsRes.tasks?.[0]?.result?.[0]?.items) {
      const items = suggestionsRes.tasks[0].result[0].items as Array<{ keyword?: string; keyword_info?: unknown; keyword_properties?: unknown; search_intent_info?: unknown }>;
      for (const it of items) {
        if (it.keyword) rows.push(toRow(primaryKeyword, "keyword_suggestions", it));
      }
    }

    // 3. Keyword ideas
    const ideasRes = await dataforseoPost("/keyword_ideas/live", [
      { keywords: [primaryKeyword], location_name: location, language_name: language, limit },
    ]) as { status_code?: number; tasks?: { result?: Array<{ items?: unknown[] }> }[] };
    if (ideasRes.status_code === 20000 && ideasRes.tasks?.[0]?.result?.[0]?.items) {
      const items = ideasRes.tasks[0].result[0].items as Array<{ keyword?: string; keyword_info?: unknown; keyword_properties?: unknown; search_intent_info?: unknown }>;
      for (const it of items) {
        if (it.keyword) rows.push(toRow(primaryKeyword, "keyword_ideas", it));
      }
    }

    if (rows.length === 0) {
      return Response.json({ opportunities: [], message: "No keyword opportunities returned from DataForSEO" });
    }

    // Avoid duplicates: only insert (keyword, primary_keyword, type) that don't already exist
    const { data: existing } = await supabase
      .from("seo_keyword_opportunities")
      .select("keyword, type")
      .eq("primary_keyword", primaryKeyword);

    const existingKey = new Set(
      (existing ?? []).map((r) => `${String(r.keyword).toLowerCase().trim()}|${r.type}`)
    );

    const toInsert = rows.filter(
      (r) => !existingKey.has(`${r.keyword.toLowerCase().trim()}|${r.type}`)
    );

    if (toInsert.length === 0) {
      const { data: allForPrimary } = await supabase
        .from("seo_keyword_opportunities")
        .select("id, keyword, primary_keyword, type, msv, search_intent, kw_difficulty, competition, cpc, created_at")
        .eq("primary_keyword", primaryKeyword)
        .order("created_at", { ascending: false });
      return Response.json({
        opportunities: allForPrimary ?? [],
        message: "All returned keywords already exist; no duplicates added.",
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("seo_keyword_opportunities")
      .insert(toInsert)
      .select("id, keyword, primary_keyword, type, msv, search_intent, kw_difficulty, competition, cpc, created_at");

    if (insertError) {
      return Response.json(
        { error: "Failed to save keyword opportunities", details: insertError.message },
        { status: 500 }
      );
    }

    return Response.json({ opportunities: inserted ?? toInsert });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Find keyword opportunities failed" },
      { status: 500 }
    );
  }
}
