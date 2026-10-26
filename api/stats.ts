// Serverfunctie voor de Stats-tab in de band-agenda.
// Haalt de websitecijfers van de laatste 30 dagen op bij Vercel Web Analytics.
// De Vercel-token staat alleen hier (server), nooit in de website zelf.
//
// Benodigde Environment Variables in Vercel (Production + Preview):
//   STATS_VERCEL_TOKEN  – Vercel access token (Account Settings → Tokens)
//   STATS_TEAM_ID       – team_… (Team Settings → General → Team ID)
// Het project-ID komt automatisch uit VERCEL_PROJECT_ID (systeemvariabele van
// de deployment zelf); STATS_PROJECT_ID is alleen een reserve.

const API = "https://api.vercel.com/v1/query/web-analytics";
const DAYS = 30;

// Bezoeken aan de site zelf: zonder de agenda en zonder doorklik-tussenpagina's
const SITE_FILTER = "not startswith(requestPath, '/go/') and not startswith(requestPath, '/agenda')";
const CLICK_FILTER = "startswith(requestPath, '/go/')";

type Row = Record<string, string | number | undefined> & { pageviews?: number; visitors?: number };

const projectId = () => process.env.VERCEL_PROJECT_ID || process.env.STATS_PROJECT_ID || "";

async function query(path: string, params: Record<string, string | string[]>) {
  const url = new URL(`${API}/${path}`);
  url.searchParams.set("projectId", projectId());
  if (process.env.STATS_TEAM_ID) url.searchParams.set("teamId", process.env.STATS_TEAM_ID);
  for (const [k, v] of Object.entries(params)) {
    for (const val of Array.isArray(v) ? v : [v]) url.searchParams.append(k, val);
  }
  const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.STATS_VERCEL_TOKEN}` } });
  if (!res.ok) {
    const who = `project ${projectId()}, team ${process.env.STATS_TEAM_ID || "(geen)"}`;
    throw new Error(`Vercel ${path} ${res.status} (${who}): ${(await res.text()).slice(0, 200)}`);
  }
  return (await res.json()) as { data: unknown };
}

const json = (body: unknown, status = 200, cache = false) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // 10 minuten cachen op Vercel: snelle tab, weinig API-verkeer
      "Cache-Control": cache ? "public, s-maxage=600, stale-while-revalidate=300" : "no-store",
    },
  });

export async function GET() {
  if (!process.env.STATS_VERCEL_TOKEN || !projectId()) {
    return json({ error: "not_configured", message: "STATS_VERCEL_TOKEN ontbreekt in Vercel (of er is geen project-ID)." }, 503);
  }

  const until = new Date();
  const since = new Date(until.getTime() - DAYS * 24 * 60 * 60 * 1000);
  const range = { since: since.toISOString(), until: until.toISOString() };

  try {
    const [total, perDay, countries, referrers, devices, clicks] = await Promise.all([
      query("visits/count", { ...range, filter: SITE_FILTER }),
      query("visits/aggregate", { ...range, by: "day", filter: SITE_FILTER, limit: "100" }),
      query("visits/aggregate", { ...range, by: "country", filter: SITE_FILTER, limit: "10" }),
      query("visits/aggregate", { ...range, by: "referrerHostname", filter: SITE_FILTER, limit: "8" }),
      query("visits/aggregate", { ...range, by: "deviceType", filter: SITE_FILTER, limit: "5" }),
      // Doorkliks: per tussenpagina én per land
      query("visits/aggregate", { ...range, by: ["requestPath", "country"], filter: CLICK_FILTER, limit: "100" }),
    ]);

    const t = total.data as { pageviews?: number; visitors?: number };
    const rows = (q: { data: unknown }) => (q.data as Row[]) ?? [];

    return json(
      {
        since: range.since,
        until: range.until,
        totals: { visitors: t.visitors ?? 0, pageviews: t.pageviews ?? 0 },
        perDay: rows(perDay).map((r) => ({ date: String(r.timestamp).slice(0, 10), visitors: r.visitors ?? 0, pageviews: r.pageviews ?? 0 })),
        countries: rows(countries).map((r) => ({ key: String(r.country ?? "Others"), visitors: r.visitors ?? 0 })),
        referrers: rows(referrers).map((r) => ({ key: String(r.referrerHostname || "Direct"), visitors: r.visitors ?? 0 })),
        devices: rows(devices).map((r) => ({ key: String(r.deviceType ?? "Others"), visitors: r.visitors ?? 0 })),
        clicks: rows(clicks).map((r) => ({ path: String(r.requestPath ?? ""), country: String(r.country ?? "Others"), clicks: r.pageviews ?? 0 })),
      },
      200,
      true,
    );
  } catch (err) {
    return json({ error: "vercel_api", message: (err as Error).message }, 502);
  }
}
