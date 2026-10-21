import React, { useState } from "react";
import type { DateItem, ShowStatus } from "../BandDashboard";
import { CountryFlag } from "./CountryFlag";
import { parseLocalDate } from "./dateUtils";

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

const STATUS_STYLES: Record<ShowStatus, { accent: string; border: string; chip: string; label: string }> = {
  confirmed: {
    accent: "text-emerald-400",
    border: "border-l-emerald-500",
    chip: "bg-emerald-950 text-emerald-400 border-emerald-500",
    label: "CONFIRMED",
  },
  option: {
    accent: "text-amber-400",
    border: "border-l-amber-500",
    chip: "bg-amber-950 text-amber-400 border-amber-500",
    label: "OPTION",
  },
  cancelled: {
    accent: "text-red-500",
    border: "border-l-red-500",
    chip: "bg-red-950 text-red-500 border-red-500",
    label: "CANCELLED",
  },
};

/** Datumblok links: weekdag kort, dagnummer groot, weeknummer klein */
const DateBlock: React.FC<{ date: string; className?: string }> = ({ date, className = "" }) => {
  const { weekday, day, week } = dateParts(date);
  return (
    <div className={`w-11 shrink-0 text-center font-mono leading-none ${className}`}>
      <div className="text-[10px] font-bold opacity-70">{weekday}</div>
      <div className="text-2xl font-extrabold my-0.5">{day}</div>
      {week && <div className="text-[9px] text-zinc-500">WK{week}</div>}
    </div>
  );
};

interface ShowCardProps {
  item: DateItem;
  isPast?: boolean;
  onEdit: (show: DateItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: ShowStatus) => void;
}

export const ShowCard: React.FC<ShowCardProps> = ({ item, isPast = false, onEdit, onDelete, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const pastStyle = isPast ? "opacity-50 hover:opacity-100 transition-opacity" : "";

  // Geblokkeerde datum: compacte rode regel
  if (item.isBlocked) {
    return (
      <div id={`show-${item.id}`} className={`flex items-center gap-3 p-2 rounded bg-zinc-950 border border-zinc-800 border-l-4 border-l-red-600 ${pastStyle}`}>
        <DateBlock date={item.date} className="text-red-500" />
        <div className="grow min-w-0 text-sm text-zinc-300 break-words">
          <span className="font-mono text-[10px] font-bold text-red-400 block">🚫 GEBLOKKEERD</span>
          {item.blockedBy}
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="text-xs text-zinc-500 hover:text-red-400 p-2 cursor-pointer"
          title="Verwijder blokkade"
        >
          🗑️
        </button>
      </div>
    );
  }

  const styles = STATUS_STYLES[item.status] ?? STATUS_STYLES.option;
  const isCancelled = item.status === "cancelled";

  const fee = parseFloat(item.guaranteedFee || "0") || 0;
  const cost = parseFloat(item.transportCost || "0") || 0;
  const netResult = fee - cost;
  const hasFinancials = item.guaranteedFee || item.transportCost;
  const hasDetails = item.owner || item.guaranteedFee || item.contact?.name || item.transportMethod || item.drivers || item.breakEvenInfo;

  return (
    <div
      id={`show-${item.id}`}
      className={`rounded bg-zinc-900/90 border border-zinc-800 border-l-4 ${styles.border} ${pastStyle}`}
    >
      {/* COMPACTE REGEL — tik om open te klappen */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-3 p-2 md:p-3 text-left cursor-pointer"
      >
        <DateBlock date={item.date} className={styles.accent} />

        <div className="grow min-w-0">
          <div className={`flex items-center gap-1 text-base md:text-lg font-extrabold uppercase leading-tight break-words ${styles.accent} ${isCancelled ? "line-through" : ""}`}>
            <CountryFlag code={item.country} />
            <span className="min-w-0">{item.city}</span>
          </div>
          <div className={`text-xs text-zinc-300 leading-snug break-words ${isCancelled ? "line-through opacity-70" : ""}`}>
            @ {item.venue || "TBA"}
            {item.otherbands && <span className="text-zinc-500"> /w {item.otherbands}</span>}
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1">
          {hasFinancials && !isCancelled && (
            <span
              className={`font-mono text-xs font-extrabold px-1.5 py-0.5 rounded border ${
                netResult >= 0
                  ? "bg-emerald-950/80 text-emerald-400 border-emerald-600"
                  : "bg-red-950/80 text-red-500 border-red-600"
              }`}
            >
              {netResult >= 0 ? `+€${netResult}` : `-€${Math.abs(netResult)}`}
            </span>
          )}
          <span className={`text-zinc-500 text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
        </div>
      </button>

      {/* UITGEKLAPT: DETAILS + ACTIES */}
      {isOpen && (
        <div className="px-3 pb-3 space-y-3">
          {hasDetails && (
            <dl className="pt-2 border-t border-zinc-800 text-xs text-zinc-300 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {item.owner && (<><dt className="font-mono text-zinc-500">Eigenaar</dt><dd className="font-bold text-white">{item.owner}</dd></>)}
              {item.guaranteedFee && (
                <><dt className="font-mono text-zinc-500">Gage</dt><dd>€{item.guaranteedFee}{item.paymentMethod ? ` (${item.paymentMethod})` : ""}</dd></>
              )}
              {item.drivers && (<><dt className="font-mono text-zinc-500">Chauffeur</dt><dd>{item.drivers}</dd></>)}
              {item.transportMethod && (
                <><dt className="font-mono text-zinc-500">Vervoer</dt><dd>{item.transportMethod}{item.transportCost ? ` (€${item.transportCost})` : ""}</dd></>
              )}
              {item.contact?.name && (
                <>
                  <dt className="font-mono text-zinc-500">Contact</dt>
                  <dd className="break-words">
                    {item.contact.name}
                    {item.contact.phone && <> · <a href={`tel:${item.contact.phone}`} className="underline">{item.contact.phone}</a></>}
                    {item.contact.email && <> · <a href={`mailto:${item.contact.email}`} className="underline">{item.contact.email}</a></>}
                  </dd>
                </>
              )}
              {item.breakEvenInfo && (<><dt className="font-mono text-zinc-500">Afspraken</dt><dd className="break-words">{item.breakEvenInfo}</dd></>)}
            </dl>
          )}

          <div className="grid grid-cols-3 gap-2 font-mono">
            <button
              onClick={() => onEdit(item)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] py-2 rounded font-bold uppercase cursor-pointer"
            >
              ✏️ Bewerk
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-900/60 text-[11px] py-2 rounded font-bold uppercase cursor-pointer"
            >
              🗑️ Wis
            </button>
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(true)}
              className={`text-[11px] py-2 px-1 rounded font-bold uppercase cursor-pointer border ${styles.chip}`}
            >
              {styles.label} ▾
            </button>
          </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-xs w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-bold uppercase text-zinc-200 font-mono">Kies Status</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-zinc-400 hover:text-white text-base font-bold p-1">✕</button>
            </div>
            <div className="space-y-2 font-mono">
              {([
                ["option", "🟧 OPTION (In optie)"],
                ["confirmed", "🟩 CONFIRMED (Bevestigd)"],
                ["cancelled", "🟥 CANCELLED (Geannuleerd)"],
              ] as [ShowStatus, string][]).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => { onStatusChange(item.id, value); setIsStatusModalOpen(false); }}
                  className={`w-full py-3 px-4 rounded text-xs font-bold uppercase text-left border flex justify-between items-center ${
                    item.status === value ? STATUS_STYLES[value].chip : "bg-black/50 text-zinc-300 border-zinc-800"
                  }`}
                >
                  <span>{label}</span>
                  {item.status === value && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
