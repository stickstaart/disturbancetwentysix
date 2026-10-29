// Dagelijkse taak (Vercel Cron, zie vercel.json): bewaart de cijfers per dag in Firestore,
// zodat de Stats-tab ook verder terug kan kijken dan de 30 dagen die Vercel zelf bewaart.
// Mist een run (storing, deploy), dan vult de volgende run alle ontbrekende dagen aan,
// zolang die nog binnen Vercels bewaartermijn van ±30 dagen liggen.
//
// Benodigd in Vercel: CRON_SECRET (Vercel stuurt die mee als Bearer-token),
// FIREBASE_SERVICE_ACCOUNT, en de STATS_*-variabelen van /api/stats.
import { analyticsConfigured, dayRange, fetchPeriod, isoDay } from "./_lib/analytics.js";
import { loadDays, saveDay } from "./_lib/firestore.js";

const BACKFILL_DAYS = 29;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ error: "unauthorized" }, 401);
  }
  if (!analyticsConfigured()) return json({ error: "not_configured" }, 503);

  try {
    const stored = await loadDays<unknown>();
    // Gisteren en eerder (vandaag is nog niet af), oudste eerst
    const todo: string[] = [];
    for (let i = BACKFILL_DAYS; i >= 1; i--) {
      const day = isoDay(new Date(Date.now() - i * 864e5));
      if (!stored.has(day)) todo.push(day);
    }
    const saved: string[] = [];
    for (const day of todo) {
      const [since, until] = dayRange(day);
      const stats = await fetchPeriod(since, until, { limits: { countries: 100, referrers: 30, devices: 5, clicks: 100 } });
      await saveDay(day, { totals: stats.totals, countries: stats.countries, referrers: stats.referrers, devices: stats.devices, clicks: stats.clicks });
      saved.push(day);
    }
    return json({ ok: true, saved, alreadyStored: stored.size });
  } catch (err) {
    return json({ error: "snapshot_failed", message: (err as Error).message }, 502);
  }
}
