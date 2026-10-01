import { NextRequest, NextResponse } from "next/server";

const EDITIONS: Record<string, { hl: string; gl: string; ceid: string }> = {
  en: { hl: "en-IN", gl: "IN", ceid: "IN:en" },
  ta: { hl: "ta", gl: "IN", ceid: "IN:ta" },
  hi: { hl: "hi", gl: "IN", ceid: "IN:hi" },
};

const DEFAULT_QUERIES: Record<string, string[]> = {
  en: [
    'women scheme OR yojana India government',
    '"women empowerment" scheme OR subsidy OR "financial assistance"',
    '"Lakhpati Didi" OR "Beti Bachao" OR "Sukanya Samriddhi" OR "PM Ujjwala" OR "Mahila Samman"',
    '"Magalir Urimai" OR "Pudhumai Penn" OR "Tamil Nadu" women scheme',
    '"self help group" women loan OR stipend OR subsidy India',
  ],
  ta: [
    'பெண்கள் திட்டம்',
    'மகளிர் உரிமைத் தொகை',
    'மகளிர் சுய உதவிக் குழு கடன்',
    'புதுமைப் பெண் திட்டம்',
    'மகளிர் நலத் திட்டம் அரசு',
  ],
  hi: [
    'महिला योजना सरकार',
    'लाडली बहना योजना',
    'लखपति दीदी',
    'बेटी बचाओ बेटी पढ़ाओ',
    'महिला सशक्तिकरण योजना',
  ],
};

const USER_AGENT = "Mozilla/5.0 (compatible; WomenSchemesNews/1.0)";

async function fetchOne(query: string, lang: string, days: number = 7) {
  const { hl, gl, ceid } = EDITIONS[lang] || EDITIONS["en"];
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    `${query} when:${days}d`
  )}&hl=${hl}&gl=${gl}&ceid=${ceid}`;

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
    console.error(`[News] Error fetching '${query}':`, error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") || "en";
  const limit = 15;
  const days = 7;

  if (!EDITIONS[lang]) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const queries = DEFAULT_QUERIES[lang];
  const allResults = await Promise.all(queries.map(q => fetchOne(q, lang, days)));
  
  const merged = [];
  const seen = new Set<string>();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  for (const batch of allResults) {
    for (const item of batch) {
      const k = item.title.replace(/\W+/g, " ").toLowerCase().trim().slice(0, 80);
      if (!k || seen.has(k)) continue;
      if (item.published && item.published < cutoff) continue;
      
      seen.add(k);
      merged.push(item);
    }
  }

  merged.sort((a, b) => {
    const timeA = a.published ? a.published.getTime() : 0;
    const timeB = b.published ? b.published.getTime() : 0;
    return timeB - timeA;
  });

  return NextResponse.json({
    ok: true,
    alerts: merged.slice(0, limit).map((it, idx) => ({
      id: idx + 1,
      text: it.title,
      source: it.source,
      date: it.published ? it.published.toISOString() : null,
      link: it.link
    }))
  });
}
