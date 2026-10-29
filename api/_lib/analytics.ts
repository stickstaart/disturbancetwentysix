// Gedeelde helpers voor Vercel Web Analytics (gebruikt door /api/stats en /api/stats-snapshot).
// Bestanden in api/_lib worden door Vercel niet als losse functie gepubliceerd.

const API = "https://api.vercel.com/v1/query/web-analytics";

// Bezoeken aan de site zelf: zonder de agenda en zonder doorklik-tussenpagina's
const SITE_FILTER = "not startswith(requestPath, '/go/') and not startswith(requestPath, '/agenda')";
const CLICK_FILTER = "startswith(requestPath, '/go/')";

export interface KeyCount { key: string; visitors: number }
export interface ClickRow { path: string; country: string; clicks: number }
export interface DayRow { date: string; visitors: number; pageviews: number }
export interface PeriodStats {
  totals: { visitors: number; pageviews: number };
  perDay: DayRow[];
  countries: KeyCount[];
  referrers: KeyCount[];
  devices: KeyCount[];
  clicks: ClickRow[];
}

type Row = Record<string, string | number | undefined> & { pageviews?: number; visitors?: number };

// Project-ID komt automatisch uit de deployment zelf; STATS_PROJECT_ID is reserve.
export const projectId = () => process.env.VERCEL_PROJECT_ID || process.env.STATS_PROJECT_ID || "";
export const analyticsConfigured = () => Boolean(process.env.STATS_VERCEL_TOKEN && projectId());

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

const rows = (q: { data: unknown }) => (q.data as Row[]) ?? [];

/** Alle cijfers voor één periode. `withDays` = ook een reeks per dag (niet nodig voor een dag-snapshot). */
export async function fetchPeriod(since: Date, until: Date, opts: { withDays?: boolean; limits?: Partial<Record<"countries" | "referrers" | "devices" | "clicks", number>> } = {}): Promise<PeriodStats> {
  const range = { since: since.toISOString(), until: until.toISOString() };
  const lim = { countries: 10, referrers: 8, devices: 5, clicks: 100, ...opts.limits };
  const [total, perDay, countries, referrers, devices, clicks] = await Promise.all([
    query("visits/count", { ...range, filter: SITE_FILTER }),
    opts.withDays ? query("visits/aggregate", { ...range, by: "day", filter: SITE_FILTER, limit: "100" }) : Promise.resolve({ data: [] }),
    query("visits/aggregate", { ...range, by: "country", filter: SITE_FILTER, limit: String(lim.countries) }),
    query("visits/aggregate", { ...range, by: "referrerHostname", filter: SITE_FILTER, limit: String(lim.referrers) }),
    query("visits/aggregate", { ...range, by: "deviceType", filter: SITE_FILTER, limit: String(lim.devices) }),
    // Doorkliks: per tussenpagina én per land
    query("visits/aggregate", { ...range, by: ["requestPath", "country"], filter: CLICK_FILTER, limit: String(lim.clicks) }),
  ]);
  const t = total.data as { pageviews?: number; visitors?: number };
  return {
    totals: { visitors: t.visitors ?? 0, pageviews: t.pageviews ?? 0 },
    perDay: rows(perDay).map((r) => ({ date: String(r.timestamp).slice(0, 10), visitors: r.visitors ?? 0, pageviews: r.pageviews ?? 0 })),
    countries: rows(countries).map((r) => ({ key: String(r.country ?? "Others"), visitors: r.visitors ?? 0 })),
    referrers: rows(referrers).map((r) => ({ key: String(r.referrerHostname || "Direct"), visitors: r.visitors ?? 0 })),
    devices: rows(devices).map((r) => ({ key: String(r.deviceType ?? "Others"), visitors: r.visitors ?? 0 })),
    clicks: rows(clicks).map((r) => ({ path: String(r.requestPath ?? ""), country: String(r.country ?? "Others"), clicks: r.pageviews ?? 0 })),
  };
}

/** UTC-dag "YYYY-MM-DD" → [00:00:00.000, 23:59:59.999] */
export const dayRange = (day: string): [Date, Date] => [new Date(`${day}T00:00:00.000Z`), new Date(`${day}T23:59:59.999Z`)];
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);
