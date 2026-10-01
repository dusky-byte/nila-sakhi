import { NextRequest, NextResponse } from "next/server";

const EDITIONS: Record<string, { hl: string; gl: string; ceid: string }> = {
  en: { hl: "en-IN", gl: "IN", ceid: "IN:en" },
  ta: { hl: "ta", gl: "IN", ceid: "IN:ta" },
  hi: { hl: "hi", gl: "IN", ceid: "IN:hi" },
};

const USER_AGENT = "Mozilla/5.0 (compatible; IndiaNews/1.0)";

async function fetchNews(lang: string) {
  const { hl, gl, ceid } = EDITIONS[lang] || EDITIONS["en"];
  // Fetch top headlines for the given language in India
  const url = `https://news.google.com/rss?hl=${hl}&gl=${gl}&ceid=${ceid}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { 
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const xml = await res.text();
    
    // Simple regex parsing since we don't have an XML parser on the server
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);

      let title = titleMatch ? titleMatch[1].trim() : "";
      const link = linkMatch ? linkMatch[1].trim() : "";
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";
      const source = sourceMatch ? sourceMatch[1].trim() : "";

      // Decode basic HTML entities
      title = title
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      if (source && title.endsWith(` - ${source}`)) {
        title = title.slice(0, -(source.length + 3));
      }

      let published = null;
      if (pubDate) {
        published = new Date(pubDate);
      }

      if (title && link) {
        items.push({ title, source, published, link });
      }
    }
    return items;
  } catch (error) {
    console.error(`[News] Error fetching news:`, error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") || "en";
  const limit = 20;

  if (!EDITIONS[lang]) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const items = await fetchNews(lang);
  
  // Sort by date just in case
  items.sort((a, b) => {
    const timeA = a.published ? a.published.getTime() : 0;
    const timeB = b.published ? b.published.getTime() : 0;
    return timeB - timeA;
  });

  return NextResponse.json({
    ok: true,
    news: items.slice(0, limit).map((it, idx) => ({
      id: idx + 1,
      title: it.title,
      source: it.source,
      date: it.published ? it.published.toISOString() : null,
      link: it.link
    }))
  });
}
