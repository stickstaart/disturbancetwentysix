import React, { useState } from "react";
import { FiAlertTriangle, FiChevronDown, FiEdit2, FiGlobe, FiMail, FiPhone, FiTrash2 } from "react-icons/fi";
import type { DateItem, ShowStatus } from "../BandDashboard";
import { CountryFlag, UnavailableFlag } from "./CountryFlag";
import { parseLocalDate } from "./dateUtils";
import { displayName } from "./constants";

function isoWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.round((firstThursday - target.valueOf()) / 604800000);
}

function dateParts(dateString: string) {
  const d = parseLocalDate(dateString);
  if (!d) return { weekday: "", day: dateString, week: null as number | null };
  const weekday = new Intl.DateTimeFormat("nl-NL", { weekday: "short" }).format(d).replace(".", "");
  return { weekday: weekday.toUpperCase(), day: String(d.getDate()).padStart(2, "0"), week: isoWeek(d) };
}

// Statuskleuren — zelfde betekenis als in het Google Doc: groen / oranje / rood
const STATUS: Record<ShowStatus, { text: string; bar: string; tile: string; active: string; label: string }> = {
  confirmed: {
    text: "text-emerald-400",
    bar: "bg-emerald-500 shadow-[0_0_12px_color-mix(in_oklab,var(--color-emerald-500)_55%,transparent)]",
    tile: "bg-emerald-500/10 ring-emerald-500/25",
    active: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/50",
    label: "Bevestigd",
  },
  option: {
    text: "text-amber-400",
    bar: "bg-amber-500 shadow-[0_0_12px_color-mix(in_oklab,var(--color-amber-500)_50%,transparent)]",
    tile: "bg-amber-500/10 ring-amber-500/25",
    active: "bg-amber-500/15 text-amber-300 ring-amber-500/50",
    label: "Optie",
  },
  cancelled: {
    text: "text-red-500",
    bar: "bg-red-500 shadow-[0_0_12px_color-mix(in_oklab,var(--color-red-500)_50%,transparent)]",
    tile: "bg-red-500/10 ring-red-500/25",
    active: "bg-red-500/15 text-red-300 ring-red-500/50",
    label: "Afgelast",
  },
};
const STATUS_ORDER: ShowStatus[] = ["option", "confirmed", "cancelled"];

const CARD =
  "relative overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 ring-1 ring-white/[0.06] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,0,0,0.9)] transition-all duration-200";

/** Datumtegel links: weekdag kort, dagnummer groot, weeknummer klein */
const DateTile: React.FC<{ date: string; tone: string; tile: string }> = ({ date, tone, tile }) => {
  const { weekday, day, week } = dateParts(date);
  return (
    <div className={`w-14 shrink-0 rounded-lg ring-1 py-1.5 text-center leading-none ${tile}`}>
      <div className={`font-mono text-[13px] font-bold tracking-[0.06em] ${tone}`}>{weekday}</div>
      <div className={`font-display text-[32px] font-extrabold tabular my-0.5 ${tone}`}>{day}</div>
      {week && <div className="font-mono text-[13px] tracking-wider text-zinc-400">WK {week}</div>}
    </div>
  );
};

interface ShowCardProps {
  item: DateItem;
  isPast?: boolean;
  onEdit: (show: DateItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: ShowStatus) => void;
  onTogglePublic: (id: string) => void;
  onEditBlock: (block: DateItem) => void;
  /** Bandleden die op deze datum geblokkeerd hebben */
  absent?: string[];
}

export const ShowCard: React.FC<ShowCardProps> = ({ item, isPast = false, onEdit, onDelete, onStatusChange, onTogglePublic, onEditBlock, absent = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pastStyle = isPast ? "opacity-55 saturate-50 hover:opacity-100 hover:saturate-100" : "";

  // ---------- Geblokkeerde datum / periode ----------
  // Bewust compact (halve hoogte, één regel) en grijs i.p.v. rood, zodat afwezigheden
  // de lijst niet overnemen; de shows blijven de blikvangers.
  if (item.isBlocked) {
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" }).format(d).replace(/\./g, "");
    const start = parseLocalDate(item.date);
    const end = item.endDate ? parseLocalDate(item.endDate) : null;
    const details = [item.reason, end && `t/m ${fmt(end)}`].filter(Boolean).join(" · ");
    return (
      <div
        id={`show-${item.id}`}
        title={[item.blockedBy, details].filter(Boolean).join(" · ")}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-1 bg-zinc-800/50 ring-1 ring-white/[0.05] stripes-blocked ${pastStyle}`}
      >
        <span className="shrink-0 w-[5.5rem] font-mono text-[13px] font-bold uppercase tracking-[0.04em] tabular text-red-300/80">
          {start ? fmt(start) : item.date}
        </span>
        <UnavailableFlag />
        <div className="grow min-w-0 truncate text-[15px] leading-snug">
          <span className="font-semibold text-zinc-200">{item.blockedBy}</span>
          {details && <span className="text-zinc-400"> · {details}</span>}
        </div>
        <div className="shrink-0 flex items-center">
          <button
            onClick={() => onEditBlock(item)}
            className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 cursor-pointer"
            title="Bewerk blokkade"
            aria-label="Bewerk blokkade"
          >
            <FiEdit2 className="text-sm" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
            title="Verwijder blokkade"
            aria-label="Verwijder blokkade"
          >
            <FiTrash2 className="text-sm" />
          </button>
        </div>
      </div>
    );
  }

  // ---------- Show ----------
  const st = STATUS[item.status] ?? STATUS.option;
  const isCancelled = item.status === "cancelled";
  const isOnWebsite = !!item.isPublic && item.status === "confirmed";

  const fee = parseFloat(item.guaranteedFee || "0") || 0;
  const cost = parseFloat(item.transportCost || "0") || 0;
  const net = fee - cost;
  const hasFinancials = item.guaranteedFee || item.transportCost;

  const details: [string, React.ReactNode][] = [];
  if (item.tourName) details.push(["Event", item.tourName]);
  if (item.owner) details.push(["Eigenaar", <span className="font-semibold text-white">{displayName(item.owner)}</span>]);
  if (item.guaranteedFee) details.push(["Gage", <span className="tabular">€{item.guaranteedFee}{item.paymentMethod ? ` · ${item.paymentMethod === "wire" ? "bank" : "cash"}` : ""}</span>]);
  if (item.drivers) details.push(["Chauffeur", item.drivers]);
  if (item.transportMethod) details.push(["Vervoer", <span className="tabular">{item.transportMethod}{item.transportCost ? ` · €${item.transportCost}` : ""}</span>]);
  if (item.contact?.name || item.contact?.phone || item.contact?.email)
    details.push([
      "Contact",
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {item.contact?.name && <span>{item.contact.name}</span>}
        {item.contact?.phone && (
          <a href={`tel:${item.contact.phone}`} className="inline-flex items-center gap-1 text-zinc-200 hover:text-white underline decoration-zinc-600 underline-offset-2">
            <FiPhone className="text-sm" />{item.contact.phone}
          </a>
        )}
        {item.contact?.email && (
          <a href={`mailto:${item.contact.email}`} className="inline-flex items-center gap-1 text-zinc-200 hover:text-white underline decoration-zinc-600 underline-offset-2 break-all">
            <FiMail className="text-sm" />{item.contact.email}
          </a>
        )}
      </span>,
    ]);
  if (item.breakEvenInfo) details.push(["Afspraken", item.breakEvenInfo]);

  return (
    <div id={`show-${item.id}`} className={`${CARD} ${isOpen ? "ring-white/[0.12]" : "hover:ring-white/[0.1]"} ${pastStyle}`}>
      <span className={`absolute left-0 inset-y-0 w-[3px] ${st.bar}`} />

      {/* COMPACTE REGEL — tik om open te klappen */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-3 p-2.5 pl-3.5 text-left cursor-pointer"
      >
        <DateTile date={item.date} tone={st.text} tile={st.tile} />

        <div className="grow min-w-0">
          <div className={`flex items-center gap-1.5 font-display text-[26px] md:text-3xl font-bold uppercase leading-none break-words ${st.text} ${isCancelled ? "line-through decoration-2" : ""}`}>
            <CountryFlag code={item.country} />
            <span className="min-w-0">{item.city}</span>
          </div>
          <div className={`mt-1 text-base text-zinc-300 leading-snug break-words ${isCancelled ? "line-through opacity-60" : ""}`}>
            <span className="text-zinc-400">@</span> {item.venue || "TBA"}
            {item.otherbands && <span className="text-zinc-400"> · w/ {item.otherbands}</span>}
          </div>
          {absent.length > 0 && !isCancelled && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-sm font-semibold bg-red-500/10 text-red-300 ring-1 ring-red-500/30">
              <FiAlertTriangle className="shrink-0" />
              {absent.join(", ")} afwezig
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1.5">
          {hasFinancials && !isCancelled && (
            <span
              className={`font-mono tabular text-sm font-bold px-2 py-0.5 rounded-full ring-1 ${
                net >= 0 ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30" : "bg-red-500/10 text-red-300 ring-red-500/30"
              }`}
            >
              {net >= 0 ? `+€${net}` : `−€${Math.abs(net)}`}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-zinc-400">
            {isOnWebsite && <FiGlobe className="text-sky-400" title="Op de website" />}
            <FiChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </span>
        </div>
      </button>

      {/* UITGEKLAPT */}
      {isOpen && (
        <div className="px-3.5 pb-3.5 space-y-3">
          {details.length > 0 && (
            <dl className="pt-3 border-t border-white/[0.06] grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-base text-zinc-300">
              {details.map(([label, value]) => (
                <React.Fragment key={label}>
                  <dt className="font-mono text-[13px] uppercase tracking-[0.05em] text-zinc-400 pt-[3px]">{label}</dt>
                  <dd className="break-words min-w-0">{value}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}

          {/* Status als segmented control: één tik, geen pop-up */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-black/40 ring-1 ring-white/[0.06]" role="radiogroup" aria-label="Status">
            {STATUS_ORDER.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={item.status === value}
                onClick={() => item.status !== value && onStatusChange(item.id, value)}
                className={`py-1.5 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  item.status === value ? `ring-1 ${STATUS[value].active}` : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {STATUS[value].label}
              </button>
            ))}
          </div>

          {/* Website + acties */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onTogglePublic(item.id)}
              disabled={item.status !== "confirmed"}
              title={item.status !== "confirmed" ? "Kan pas als de show bevestigd is" : undefined}
              className={`grow flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider ring-1 transition-colors ${
                item.status !== "confirmed"
                  ? "text-zinc-400 ring-white/[0.05] cursor-not-allowed"
                  : isOnWebsite
                  ? "bg-sky-500/15 text-sky-300 ring-sky-500/40 cursor-pointer"
                  : "text-zinc-400 ring-white/10 hover:text-white cursor-pointer"
              }`}
            >
              <FiGlobe /> {isOnWebsite ? "Op website" : "Website"}
            </button>
            <button
              onClick={() => onEdit(item)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-zinc-200 bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/10 cursor-pointer"
            >
              <FiEdit2 /> Bewerk
            </button>
            <button
              onClick={() => onDelete(item.id)}
              aria-label="Verwijderen"
              title="Verwijderen"
              className="p-2 rounded-lg text-red-400 ring-1 ring-red-500/25 hover:bg-red-500/10 cursor-pointer"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
