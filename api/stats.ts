// Serverfunctie voor de Stats-tab in de band-agenda.
//   ?range=30d (standaard) → live uit Vercel Web Analytics
//   ?range=12m / ?range=all → opgetelde dagcijfers uit Firestore (bewaard door /api/stats-snapshot)
// De tokens staan alleen hier (server), nooit in de website zelf.
//
// Environment Variables in Vercel (Production + Preview):
//   STATS_VERCEL_TOKEN        – Vercel access token
//   STATS_TEAM_ID             – team_… (Team Settings → General → Team ID)
//   FIREBASE_SERVICE_ACCOUNT  – service-account JSON (alleen nodig voor 12m / all)
// Het project-ID komt automatisch uit VERCEL_PROJECT_ID.
import { analyticsConfigured, fetchPeriod, isoDay, type ClickRow, type DayRow, type KeyCount, type PeriodStats } from "./_lib/analytics.js";
import { firestoreConfigured, loadDays } from "./_lib/firestore.js";

const json = (body: unknown, status = 200, cache = false) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // 10 minuten cachen op Vercel: snelle tab, weinig API-verkeer
      "Cache-Control": cache ? "public, s-maxage=600, stale-while-revalidate=300" : "no-store",
    },
  });

type DaySnapshot = Omit<PeriodStats, "perDay">;

function mergeKeys(list: KeyCount[][], top: number): KeyCount[] {
  const acc = new Map<string, number>();
  for (const rows of list) for (const r of rows) acc.set(r.key, (acc.get(r.key) ?? 0) + r.visitors);
  const others = acc.get("Others") ?? 0;
  acc.delete("Others");
  const sorted = [...acc.entries()].map(([key, visitors]) => ({ key, visitors })).sort((a, b) => b.visitors - a.visitors);
  const head = sorted.slice(0, top - 1);
  const rest = others + sorted.slice(top - 1).reduce((s, r) => s + r.visitors, 0);
  return rest > 0 ? [...head, { key: "Others", visitors: rest }] : head;
}

function fromHistory(days: Map<string, DaySnapshot>, sinceDay: string) {
  const picked = [...days.entries()].filter(([d]) => d >= sinceDay).sort(([a], [b]) => a.localeCompare(b));
  const snaps = picked.map(([, s]) => s);
  // Per maand bundelen voor de grafiek
  const months = new Map<string, DayRow>();
  for (const [day, s] of picked) {
    const m = day.slice(0, 7);
    const row = months.get(m) ?? { date: m, visitors: 0, pageviews: 0 };
    row.visitors += s.totals.visitors;
    row.pageviews += s.totals.pageviews;
    months.set(m, row);
  }
  const clicks = new Map<string, ClickRow>();
  for (const s of snaps)
    for (const c of s.clicks) {
      const k = `${c.path}|${c.country}`;
      const row = clicks.get(k) ?? { ...c, clicks: 0 };
      row.clicks += c.clicks;
      clicks.set(k, row);
    }
  return {
    since: picked[0]?.[0] ?? sinceDay,
    until: picked.at(-1)?.[0] ?? isoDay(new Date()),
    days: picked.length,
    totals: {
      visitors: snaps.reduce((s, x) => s + x.totals.visitors, 0),
      pageviews: snaps.reduce((s, x) => s + x.totals.pageviews, 0),
    },
    perDay: [...months.values()],
    countries: mergeKeys(snaps.map((s) => s.countries), 10),
    referrers: mergeKeys(snaps.map((s) => s.referrers), 8),
    devices: mergeKeys(snaps.map((s) => s.devices), 5),
    clicks: [...clicks.values()].sort((a, b) => b.clicks - a.clicks),
  };
}

export async function GET(request: Request) {
  const range = new URL(request.url).searchParams.get("range") ?? "30d";

  if (range === "12m" || range === "all") {
    if (!firestoreConfigured()) {
      return json({ error: "not_configured", message: "FIREBASE_SERVICE_ACCOUNT ontbreekt in Vercel." }, 503);
    }
    try {
      const days = await loadDays<DaySnapshot>();
      const sinceDay = range === "all" ? "0000-00-00" : isoDay(new Date(Date.now() - 365 * 864e5));
      return json({ range, granularity: "month", ...fromHistory(days, sinceDay) }, 200, true);
    } catch (err) {
      return json({ error: "firestore", message: (err as Error).message }, 502);
    }
  }

  if (!analyticsConfigured()) {
    return json({ error: "not_configured", message: "STATS_VERCEL_TOKEN ontbreekt in Vercel (of er is geen project-ID)." }, 503);
  }
  const until = new Date();
  const since = new Date(until.getTime() - 30 * 864e5);
  try {
    const stats = await fetchPeriod(since, until, { withDays: true });
    return json({ range: "30d", granularity: "day", since: since.toISOString(), until: until.toISOString(), ...stats }, 200, true);
  } catch (err) {
    return json({ error: "vercel_api", message: (err as Error).message }, 502);
  }
}
