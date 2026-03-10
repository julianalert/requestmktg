/**
 * Fetch a URL and return raw HTML (for SEO audit).
 * Sets a browser-like User-Agent to reduce blocking.
 */
export async function scrapePageHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

/**
 * Fetch a URL and return visible text content (strip scripts, styles, then tags).
 * Sets a browser-like User-Agent to reduce blocking.
 */
export async function scrapePageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  return htmlToText(html);
}

function htmlToText(html: string): string {
  // Remove script and style blocks (and their content)
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Replace block elements with newlines so structure is preserved
  text = text.replace(/<\/?(?:div|p|br|li|h[1-6]|tr|blockquote|section|article|header|footer|nav|main)[^>]*>/gi, "\n");
  // Replace other tags with space
  text = text.replace(/<[^>]+>/g, " ");
  // Decode common entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  // Collapse whitespace and trim
  text = text.replace(/\s+/g, " ").replace(/\n\s+/g, "\n").trim();
  return text;
}
