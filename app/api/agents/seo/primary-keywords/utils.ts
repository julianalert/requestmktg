export type PrimaryKeywordEntry = {
  keyword: string;
  location: string;
  language: string;
  limit: number;
  depth: number;
};

export const DEFAULT_LOCATION = "United States";
export const DEFAULT_LANGUAGE = "English";
export const DEFAULT_LIMIT = 200;
export const DEFAULT_DEPTH = 2;

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
