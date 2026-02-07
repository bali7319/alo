const SAMPLE = process.argv[2] || "https://alo17.tr/sitemap.xml";

async function main() {
  const sitemapUrl = SAMPLE.endsWith(".xml") ? SAMPLE : "https://alo17.tr/sitemap.xml";
  const smRes = await fetch(sitemapUrl, { signal: AbortSignal.timeout(15000) });
  const smText = await smRes.text();
  console.log("sitemap_status=" + smRes.status);

  const locMatch = smText.match(/<loc>(https:\/\/alo17\.tr\/ilan\/[^<]+)<\/loc>/);
  if (!locMatch) {
    console.log("sitemap_has_listing=false");
    return;
  }

  const canonical = locMatch[1];
  console.log("sitemap_has_listing=true");
  console.log("sample_canonical=" + canonical);

  const seg = canonical.split("/ilan/")[1] || "";
  const id = seg.split("-").pop();
  const idUrl = "https://alo17.tr/ilan/" + id;
  const idRes = await fetch(idUrl, { redirect: "manual", signal: AbortSignal.timeout(15000) });
  console.log("id_url_status=" + idRes.status);
  console.log("id_url_location=" + (idRes.headers.get("location") || ""));

  const pageRes = await fetch(canonical, { signal: AbortSignal.timeout(15000) });
  const html = await pageRes.text();
  console.log("canonical_status=" + pageRes.status);

  const canonicalHref =
    html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] || "";
  const robotsMeta = html.match(/<meta[^>]+name="robots"[^>]+>/i)?.[0] || "";

  console.log("html_canonical_href=" + canonicalHref);
  console.log("html_robots_meta=" + robotsMeta);
}

main().catch((e) => {
  console.error("error:", e?.stack || e?.message || String(e));
  process.exit(1);
});

