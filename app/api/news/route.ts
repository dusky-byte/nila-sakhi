import { NextRequest, NextResponse } from "next/server";

const EDITIONS: Record<string, { hl: string; gl: string; ceid: string }> = {
  en: { hl: "en-IN", gl: "IN", ceid: "IN:en" },
  ta: { hl: "ta",    gl: "IN", ceid: "IN:ta" },
  hi: { hl: "hi",    gl: "IN", ceid: "IN:hi" },
};

// India-specific search queries per language
const INDIA_QUERIES: Record<string, string> = {
  en: "India news today",
  ta: "இந்தியா செய்திகள்",
  hi: "भारत समाचार आज",
};

const USER_AGENT = "Mozilla/5.0 (compatible; IndiaNews/1.0)";

async function fetchRSS(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

function parseXML(xml: string) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const titleMatch  = itemXml.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch   = itemXml.match(/<link>([\s\S]*?)<\/link>/);
    const pubMatch    = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);

    let title    = titleMatch  ? titleMatch[1].trim()  : "";
    const link   = linkMatch   ? linkMatch[1].trim()   : "";
    const pubDate = pubMatch   ? pubMatch[1].trim()    : "";
    const source  = sourceMatch ? sourceMatch[1].trim() : "";

    // Decode HTML entities
    title = title
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">").replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");

    // Strip " - Source" suffix Google News appends
    if (source && title.endsWith(` - ${source}`)) {
      title = title.slice(0, -(source.length + 3));
    }

    const published = pubDate ? new Date(pubDate) : null;
    if (title && link) items.push({ title, source, published, link });
  }
  return items;
}

export async function GET(req: NextRequest) {
  const url  = new URL(req.url);
  const lang = url.searchParams.get("lang") || "en";

  if (!EDITIONS[lang]) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const { hl, gl, ceid } = EDITIONS[lang];
  const query = INDIA_QUERIES[lang];

  // Fetch the language-specific India top-news RSS AND an explicit search query in parallel
  const [topXML, searchXML] = await Promise.all([
    fetchRSS(`https://news.google.com/rss?hl=${hl}&gl=${gl}&ceid=${ceid}`),
    fetchRSS(
      `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`
    ),
  ]);

  const topItems    = parseXML(topXML);
  const searchItems = parseXML(searchXML);

  // Merge, deduplicate by normalised title prefix
  const seen  = new Set<string>();
  const merged = [];
  for (const item of [...topItems, ...searchItems]) {
    const key = item.title.toLowerCase().replace(/\W+/g, " ").trim().slice(0, 60);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  merged.sort((a, b) => {
    const ta = a.published ? a.published.getTime() : 0;
    const tb = b.published ? b.published.getTime() : 0;
    return tb - ta;
  });

  return NextResponse.json({
    ok: true,
    news: merged.slice(0, 20).map((it, idx) => ({
      id:     idx + 1,
      title:  it.title,
      source: it.source,
      date:   it.published ? it.published.toISOString() : null,
      link:   it.link,
    })),
  });
}
