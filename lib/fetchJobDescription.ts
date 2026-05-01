import * as cheerio from "cheerio";

export async function fetchJobDescription(jobUrl: string) {
  try {
    const res = await fetch(jobUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    $("script, style, nav, footer, header").remove();

    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);

    return text || null;
  } catch {
    return null;
  }
}
