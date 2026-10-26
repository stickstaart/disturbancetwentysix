import React, { useCallback, useEffect, useState } from "react";
import { FiChevronDown, FiRefreshCw } from "react-icons/fi";
import { SERVICE_LABELS } from "../../lib/outbound";
import { CountryFlag } from "./CountryFlag";

// Stats-tab: websitecijfers (Vercel Web Analytics via /api/stats) en doorkliks naar Spotify/Bandcamp/… (geteld via de /go/-tussenpagina's).
// Periodes: 30 dagen (live bij Vercel), 12 maanden en altijd (dagcijfers die /api/stats-snapshot
// elke nacht in Firestore bewaart).
// Eén reeks per grafiek → één kleur (gifgroen), geen legenda; getallen in neutrale tekstkleur.

type Range = "30d" | "12m" | "all";
const RANGES: { id: Range; label: string }[] = [
  { id: "30d", label: "30 dagen" },
  { id: "12m", label: "12 maanden" },
  { id: "all", label: "Altijd" },
];

interface StatsData {
  granularity?: "day" | "month";
  days?: number;
  since: string;
  until: string;
  totals: { visitors: number; pageviews: number };
  perDay: { date: string; visitors: number; pageviews: number }[];
  countries: { key: string; visitors: number }[];
  referrers: { key: string; visitors: number }[];
  devices: { key: string; visitors: number }[];
  clicks: { path: string; country: string; clicks: number }[];
}

const BAR = "bg-[#84ff00]";
const regionName = (() => {
  try {
    const dn = new Intl.DisplayNames(["nl"], { type: "region" });
    return (code: string) => (/^[A-Z]{2}$/.test(code) ? dn.of(code) ?? code : code === "Others" ? "Overig" : code);
  } catch {
    return (code: string) => code;
  }
})();
const DEVICE_LABELS: Record<string, string> = { mobile: "Mobiel", desktop: "Desktop", tablet: "Tablet", Others: "Overig" };
const fmtDay = (iso: string) =>
  new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${iso}T12:00:00`)).replace(/\./g, "");
const fmtMonth = (ym: string) =>
  new Intl.DateTimeFormat("nl-NL", { month: "short", year: "2-digit" }).format(new Date(`${ym}-15T12:00:00`)).replace(/\./g, "");
const fmtBucket = (d: string) => (d.length === 7 ? fmtMonth(d) : fmtDay(d));
const nf = new Intl.NumberFormat("nl-NL");

/** Kerncijfer */
const Tile: React.FC<{ label: string; value: number; sub?: string }> = ({ label, value, sub }) => (
  <div className="rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 ring-1 ring-white/[0.06] p-3">
    <div className="font-mono text-[13px] uppercase tracking-[0.05em] text-zinc-400">{label}</div>
    <div className="font-display text-4xl font-bold leading-none mt-1 text-white tabular">{nf.format(value)}</div>
    {sub && <div className="text-sm text-zinc-400 mt-1">{sub}</div>}
  </div>
);

/** Horizontale balken met label en getal (direct gelabeld, dus geen tooltip nodig) */
const BarList: React.FC<{ rows: { key: string; label: React.ReactNode; value: number }[]; unit?: string }> = ({ rows, unit = "" }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="text-sm text-zinc-500 italic">Nog geen gegevens.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-3 text-base">
            <span className="min-w-0 truncate text-zinc-200">{r.label}</span>
            <span className="shrink-0 font-mono text-sm text-zinc-300 tabular">{nf.format(r.value)}{unit}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-white/[0.06]">
            <div className={`h-1.5 rounded-full ${BAR}`} style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
  <section className="rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 ring-1 ring-white/[0.06] p-4 space-y-3">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="font-display text-2xl font-bold uppercase tracking-wide leading-none text-white">{title}</h3>
      {right}
    </div>
    {children}
  </section>
);

/** Bezoekers per dag: staafjes, waarde bij hover/tik */
const DailyBars: React.FC<{ days: StatsData["perDay"] }> = ({ days }) => {
  const [sel, setSel] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.visitors));
  const shown = sel ?? days.length - 1;
  const cur = days[shown];
  return (
    <div>
      <div className="text-sm text-zinc-300 h-5">
        {cur && (
          <>
            <span className="text-zinc-400">{fmtBucket(cur.date)}:</span> <span className="font-mono tabular">{nf.format(cur.visitors)}</span> bezoekers ·{" "}
            <span className="font-mono tabular">{nf.format(cur.pageviews)}</span> weergaven
          </>
        )}
      </div>
      <div className="mt-2 flex items-end gap-[2px] h-32" onMouseLeave={() => setSel(null)} role="list" aria-label="Bezoekers per periode">
        {days.map((d, i) => (
          <button
            key={d.date}
            type="button"
            role="listitem"
            aria-label={`${fmtBucket(d.date)}: ${d.visitors} bezoekers`}
            onMouseEnter={() => setSel(i)}
            onClick={() => setSel(i)}
            className="relative flex-1 h-full flex items-end cursor-pointer group"
          >
            <span
              className={`w-full rounded-t-[3px] ${BAR} ${i === shown ? "opacity-100" : "opacity-60 group-hover:opacity-90"}`}
              style={{ height: `${d.visitors ? Math.max(3, (d.visitors / max) * 100) : 1}%` }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[13px] text-zinc-500">
        <span>{days[0] && fmtBucket(days[0].date)}</span>
        <span>{days.at(-1) && fmtBucket(days.at(-1)!.date)}</span>
      </div>
    </div>
  );
};

/** Doorkliks per dienst; tik om landen en releases te zien */
const ClickList: React.FC<{ clicks: StatsData["clicks"] }> = ({ clicks }) => {
  const [open, setOpen] = useState<string | null>(null);
  // /go/<dienst>/<item>
  const parsed = clicks.map((c) => {
    const [, , service = "?", item = ""] = c.path.split("/");
    return { ...c, service, item };
  });
  const services = Object.entries(
    parsed.reduce<Record<string, number>>((acc, c) => ((acc[c.service] = (acc[c.service] ?? 0) + c.clicks), acc), {}),
  ).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...services.map(([, n]) => n));
  if (!services.length) return <p className="text-sm text-zinc-500 italic">Nog geen doorkliks gemeten.</p>;

  return (
    <ul className="space-y-1">
      {services.map(([svc, total]) => {
        const rows = parsed.filter((c) => c.service === svc);
        const byCountry = Object.entries(rows.reduce<Record<string, number>>((a, c) => ((a[c.country] = (a[c.country] ?? 0) + c.clicks), a), {}))
          .sort((a, b) => b[1] - a[1]).slice(0, 8);
        const byItem = Object.entries(rows.reduce<Record<string, number>>((a, c) => ((a[c.item || "algemeen"] = (a[c.item || "algemeen"] ?? 0) + c.clicks), a), {}))
          .sort((a, b) => b[1] - a[1]);
        const isOpen = open === svc;
        return (
          <li key={svc} className="rounded-lg">
            <button type="button" onClick={() => setOpen(isOpen ? null : svc)} aria-expanded={isOpen} className="w-full text-left py-1.5 cursor-pointer">
              <div className="flex items-baseline justify-between gap-3 text-base">
                <span className="text-zinc-100 font-semibold">{SERVICE_LABELS[svc] ?? svc}</span>
                <span className="flex items-center gap-2 font-mono text-sm text-zinc-300 tabular">
                  {nf.format(total)}
                  <FiChevronDown className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-white/[0.06]">
                <div className={`h-1.5 rounded-full ${BAR}`} style={{ width: `${Math.max(2, (total / max) * 100)}%` }} />
              </div>
            </button>
            {isOpen && (
              <div className="grid sm:grid-cols-2 gap-4 pl-3 py-3 border-l border-white/10 ml-1">
                <div>
                  <div className="font-mono text-[13px] uppercase text-zinc-400 mb-2">Per land</div>
                  <BarList rows={byCountry.map(([k, v]) => ({ key: k, value: v, label: <><CountryFlag code={k} />{regionName(k)}</> }))} />
                </div>
                <div>
                  <div className="font-mono text-[13px] uppercase text-zinc-400 mb-2">Via</div>
                  <BarList rows={byItem.map(([k, v]) => ({ key: k, value: v, label: k === "footer" ? "Footer / social icons" : k.replace(/-/g, " ") }))} />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// Voorbeelddata voor lokaal ontwikkelen (npm run dev kent /api/stats niet)
const sample = (): StatsData => {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 864e5);
    const v = Math.round(20 + 15 * Math.sin(i / 3) + (i % 7 === 5 ? 25 : 0) + Math.random() * 10);
    return { date: d.toISOString().slice(0, 10), visitors: v, pageviews: Math.round(v * 2.3) };
  });
  return {
    since: days[0].date, until: days[29].date,
    totals: { visitors: 812, pageviews: days.reduce((s, d) => s + d.pageviews, 0) },
    perDay: days,
    countries: [["NL", 402], ["DE", 131], ["BE", 74], ["ES", 52], ["FR", 41], ["GB", 33], ["US", 29], ["Others", 50]].map(([k, v]) => ({ key: String(k), visitors: Number(v) })),
    referrers: [["Direct", 390], ["instagram.com", 188], ["google.com", 121], ["facebook.com", 67], ["linktr.ee", 31]].map(([k, v]) => ({ key: String(k), visitors: Number(v) })),
    devices: [["mobile", 601], ["desktop", 198], ["tablet", 13]].map(([k, v]) => ({ key: String(k), visitors: Number(v) })),
    clicks: [
      ["/go/spotify/tox-populi", "NL", 41], ["/go/spotify/tox-populi", "DE", 12], ["/go/spotify/footer", "NL", 18],
      ["/go/bandcamp/civilization-leftovers", "NL", 22], ["/go/bandcamp/civilization-leftovers", "FR", 9],
      ["/go/youtube/footer", "NL", 14], ["/go/instagram/footer", "ES", 8], ["/go/facebook/footer", "NL", 5],
    ].map(([p, c, n]) => ({ path: String(p), country: String(c), clicks: Number(n) })),
  };
};

export const StatsPanel: React.FC = () => {
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("30d");

  const load = useCallback(async (r: Range) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stats?range=${r}`);
      const body = await res.json().catch(() => null);
      if (!res.ok || !body || body.error) throw new Error(body?.message ?? `HTTP ${res.status}`);
      setData(body as StatsData);
      setIsSample(false);
    } catch (e) {
      if (import.meta.env.DEV) {
        setData(sample());
        setIsSample(true);
      } else {
        setData(null);
        setError((e as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Eerste keer laden (fetch in effect; geen synchrone setState → lint-proof via microtask)
  useEffect(() => {
    void Promise.resolve().then(() => load(range));
  }, [load, range]);

  const isLong = range !== "30d";

  const totalClicks = data?.clicks.reduce((s, c) => s + c.clicks, 0) ?? 0;
  const devTotal = Math.max(1, data?.devices.reduce((s, d) => s + d.visitors, 0) ?? 1);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-end justify-between gap-3">
        <span className="font-display text-5xl font-bold leading-none uppercase">Stats</span>
        <button type="button" onClick={() => load(range)} disabled={loading} aria-label="Vernieuwen" className="flex items-center gap-2 pb-1 font-mono text-sm opacity-70 hover:opacity-100 cursor-pointer disabled:cursor-wait">
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Vernieuwen
        </button>
      </div>

      <div className="flex gap-1 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] p-1" role="tablist" aria-label="Periode">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={range === r.id}
            onClick={() => setRange(r.id)}
            className={`flex-1 rounded-lg py-2 font-mono text-sm uppercase tracking-[0.05em] cursor-pointer transition-colors ${
              range === r.id ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {isSample && (
        <div className="rounded-lg border border-dashed border-sky-600 text-sky-300 text-sm p-3">
          Voorbeelddata: <code>/api/stats</code> draait alleen op Vercel. Op de preview en live site zie je de echte cijfers.
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500 bg-red-950/60 text-red-200 text-sm p-3">
          Cijfers konden niet worden geladen: {error}
        </div>
      )}
      {loading && !data && <p className="font-mono text-sm opacity-70">Cijfers laden…</p>}

      {data && isLong && data.days === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-600 text-zinc-300 text-sm p-3">
          Nog geen bewaarde dagen. De site bewaart elke nacht de cijfers van de dag ervoor (alleen vanaf de live site); daarna vult dit zich vanzelf.
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Tile label="Bezoekers" value={data.totals.visitors} sub={isLong ? "opgeteld per dag" : undefined} />
            <Tile label="Weergaven" value={data.totals.pageviews} />
            <Tile label="Doorkliks" value={totalClicks} />
          </div>

          <Card title={data.granularity === "month" ? "Bezoekers per maand" : "Bezoekers per dag"}>
            <DailyBars days={data.perDay} />
          </Card>

          <Card title="Doorkliks" right={<span className="font-mono text-[13px] text-zinc-400">tik voor details</span>}>
            <ClickList clicks={data.clicks} />
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Landen">
              <BarList rows={data.countries.map((c) => ({ key: c.key, value: c.visitors, label: <><CountryFlag code={c.key} />{regionName(c.key)}</> }))} />
            </Card>
            <Card title="Herkomst">
              <BarList rows={data.referrers.map((r) => ({ key: r.key, value: r.visitors, label: r.key === "Direct" ? "Direct / onbekend" : r.key.replace(/^www\./, "") }))} />
            </Card>
          </div>

          <Card title="Apparaten">
            <BarList
              unit="%"
              rows={data.devices.map((d) => ({ key: d.key, value: Math.round((d.visitors / devTotal) * 100), label: DEVICE_LABELS[d.key] ?? d.key }))}
            />
          </Card>

          <p className="text-sm text-zinc-500">
            Bron: Vercel Web Analytics (zonder cookies). Bezoeken aan de agenda tellen niet mee.{" "}
            {isLong
              ? `Gebaseerd op ${data.days ?? 0} bewaarde dag${data.days === 1 ? "" : "en"}${data.days ? ` (sinds ${new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${data.since}T12:00:00`))})` : ""}.`
              : "Vercel bewaart zelf 1 maand; oudere cijfers staan onder 12 maanden en Altijd."}
          </p>
        </>
      )}
    </div>
  );
};
