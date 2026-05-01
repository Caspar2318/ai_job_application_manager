import * as cheerio from "cheerio";

function findWorkMode(text: string) {
  const lower = text.toLowerCase();

  if (lower.includes("remote")) return "Remote";
  if (lower.includes("hybrid")) return "Hybrid";
  if (lower.includes("on-site") || lower.includes("onsite")) return "On-site";

  return "Unknown";
}

function findCompanySize(text: string) {
  const patterns = [
    /\b\d{1,3}(,\d{3})?\s*-\s*\d{1,3}(,\d{3})?\s+employees\b/i,
    /\b\d{1,3}(,\d{3})?\+\s+employees\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return "Unknown";
}

function findIndustry(text: string) {
  const industries = [
    "Technology",
    "Software",
    "Finance",
    "Healthcare",
    "Education",
    "Retail",
    "E-commerce",
    "Marketing",
    "Consulting",
    "Construction",
    "Real Estate",
    "Hospitality",
    "AI",
    "Machine Learning",
  ];

  const lower = text.toLowerCase();

  return (
    industries.find((item) => lower.includes(item.toLowerCase())) || "Unknown"
  );
}

export async function parseJobUrl(jobUrl: string) {
  const res = await fetch(jobUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch job URL");
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, header").remove();

  const title =
    $("h1").first().text().trim() || $("title").text().trim() || "Unknown role";

  const text = $("body").text().replace(/\s+/g, " ").trim();

  const company =
    $('[data-automation="advertiser-name"]').first().text().trim() ||
    $('[data-testid="company-name"]').first().text().trim() ||
    $(".company").first().text().trim() ||
    "Unknown company";

  const location =
    $('[data-automation="job-detail-location"]').first().text().trim() ||
    $('[data-testid="job-location"]').first().text().trim() ||
    text.match(
      /\b(Sydney|Melbourne|Brisbane|Perth|Adelaide|Canberra|Remote)\b/i,
    )?.[0] ||
    "Unknown";

  return {
    jobUrl,
    role: title,
    company,
    location,
    workMode: findWorkMode(text),
    companySize: findCompanySize(text),
    industry: findIndustry(text),
  };
}
