import React, { useState } from "react";
import type { DateItem, ShowStatus } from "../BandDashboard";
import { CountryFlag } from "./CountryFlag";

function formatShowDate(dateString: string): { formatted: string; weekNum: number | null } {
  if (!dateString) return { formatted: "", weekNum: null };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { formatted: dateString, weekNum: null };

  // ISO Weeknummer
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.round((firstThursday - target.valueOf()) / 604800000);

  const formatted = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();

  return { formatted, weekNum };
}

interface ShowCardProps {
  item: DateItem;
  onEdit: (show: DateItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: ShowStatus) => void;
}

export const ShowCard: React.FC<ShowCardProps> = ({ item, onEdit, onDelete, onStatusChange }) => {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Als dit een geblokkeerde datum is:
  if (item.isBlocked) {
    const { formatted, weekNum } = formatShowDate(item.date);
    return (
      <div className="w-full p-3 rounded bg-zinc-950 border-l-4 border-l-red-600 border border-zinc-800 font-mono space-y-1">
        <div className="flex justify-between items-center">
          <div className="text-sm font-bold text-red-500">
            {weekNum && <span className="text-zinc-500 text-xs mr-2">WK {weekNum}</span>}
            {formatted}
          </div>
          <button
            onClick={() => onDelete(item.id)}
            className="text-xs text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
            title="Verwijder blokkade"
          >
            🗑️
          </button>
        </div>
        <div className="text-xs text-zinc-300">
          <span className="text-red-400 font-bold">🚫 GEBLOKKEERD DOOR:</span> {item.blockedBy}
        </div>
      </div>
    );
  }

  const getStatusStyles = (status: ShowStatus) => {
    switch (status) {
      case "confirmed":
        return {
          titleColor: "text-emerald-400 font-extrabold",
          locationColor: "text-white font-bold",
          borderColor: "border-l-4 border-l-emerald-500",
          selectStyle: "bg-emerald-950 text-emerald-400 border-emerald-500 font-bold",
          label: "CONFIRMED",
          isCancelled: false,
        };
      case "cancelled":
        return {
          titleColor: "text-red-500 font-extrabold",
          locationColor: "text-red-500 font-bold",
          borderColor: "border-l-4 border-l-red-500",
          selectStyle: "bg-red-950 text-red-500 border-red-500 font-bold",
          label: "CANCELLED",
          isCancelled: true,
        };
      case "option":
      default:
        return {
          titleColor: "text-amber-500 font-extrabold",
          locationColor: "text-white font-bold",
          borderColor: "border-l-4 border-l-amber-500",
          selectStyle: "bg-amber-950 text-amber-500 border-amber-500 font-bold",
          label: "OPTION",
          isCancelled: false,
        };
    }
  };

  const styles = getStatusStyles(item.status);
  const { formatted, weekNum } = formatShowDate(item.date);

  // Bereken netto resultaat
  const fee = parseFloat(item.guaranteedFee || "0") || 0;
  const cost = parseFloat(item.transportCost || "0") || 0;
  const netResult = fee - cost;
  const hasFinancials = item.guaranteedFee || item.transportCost;

  return (
    <div id={`show-${item.id}`} className={`w-full p-3 md:p-4 rounded bg-zinc-900/90 border border-zinc-800 font-mono space-y-2.5 ${styles.borderColor}`}>

      {/* REGEL 1: DATUM + NETTO FINANCIEEL RESULTAAT */}
      <div className="w-full flex justify-between items-start">
        <div className={`text-xl md:text-sm tracking-wide leading-snug break-all ${styles.titleColor} ${styles.isCancelled ? "line-through" : ""}`}>
          {weekNum && <span className="text-zinc-500 text-xs font-normal mr-2">WK {weekNum}</span>}
          {formatted}
        </div>

        {/* NETTO GAGE WEERGAVE RECHTSBOVEN */}
        {hasFinancials && !styles.isCancelled && (
          <div
            className={`text-sm font-extrabold px-2 py-0.5 rounded border ${
              netResult >= 0
                ? "bg-emerald-950/80 text-emerald-400 border-emerald-500"
                : "bg-red-950/80 text-red-500 border-red-500"
            }`}
          >
            {netResult >= 0 ? `+€${netResult}` : `-€${Math.abs(netResult)}`}
          </div>
        )}
      </div>

      {/* REGEL 2: VLAG + LAND + LOCATIE */}
      <div className="w-full relative">
        <div className={`w-full text-m uppercase leading-snug break-all flex flex-wrap items-center gap-1.5 ${styles.locationColor} ${styles.isCancelled ? "line-through" : ""}`}>
          <CountryFlag code={item.country} />
          <span className="shrink-0">({item.country})</span>
          <span className="grow min-w-0">{item.city} @ {item.venue || "TBA"}</span>
        </div>
      </div>

      {/* REGEL 3: BANDS */}
      {item.otherbands && (
        <div className="w-full px-1 pt-1">
          <p className="text-xs text-zinc-300 break-words leading-snug">
            <span className="text-zinc-500">Bands:</span> {item.otherbands}
          </p>
        </div>
      )}

      {/* DETAILS / INFORMATIE */}
      {(item.owner || item.guaranteedFee || item.contact?.name || item.transportMethod || item.drivers || item.breakEvenInfo) && (
        <div className="w-full pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 space-y-1 px-1">
          {item.owner && (
            <div><span className="text-zinc-500">Band Eigenaar:</span> <span className="text-white font-bold">{item.owner}</span></div>
          )}
          {item.guaranteedFee && (
            <div>
              <span className="text-zinc-500">Gage:</span> €{item.guaranteedFee} {item.paymentMethod ? `(${item.paymentMethod.toUpperCase()})` : ""}
            </div>
          )}
          {item.drivers && (
            <div><span className="text-zinc-500">Chauffeur(s):</span> {item.drivers}</div>
          )}
          {item.transportMethod && (
            <div><span className="text-zinc-500">Vervoer:</span> {item.transportMethod} {item.transportCost ? `(€${item.transportCost})` : ""}</div>
          )}
          {item.contact?.name && (
            <div>
              <span className="text-zinc-500">Contact:</span> {item.contact.name}
              {item.contact.phone && ` (${item.contact.phone})`}
            </div>
          )}
          {item.breakEvenInfo && (
            <div><span className="text-zinc-500">Afspraken:</span> {item.breakEvenInfo}</div>
          )}
        </div>
      )}

      {/* ONDERAAN: KNOPPEN */}
      <div className="w-full pt-1 grid grid-cols-3 gap-2">
        <button
          onClick={() => onEdit(item)}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs py-2 rounded font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          ✏️ BEWERKEN
        </button>

        <button
          onClick={() => onDelete(item.id)}
          className="w-full bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-900/60 text-xs py-2 rounded font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          🗑️ VERWIJDER
        </button>

        <button
          type="button"
          onClick={() => setIsStatusModalOpen(true)}
          className={`w-full text-xs py-2 px-1 rounded font-bold uppercase cursor-pointer border flex items-center justify-center gap-1 ${styles.selectStyle}`}
        >
          <span>{styles.label}</span>
          <span className="text-[10px]">▼</span>
        </button>
      </div>

      {/* STATUS MODAL */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-xs w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-bold uppercase text-zinc-200 font-mono">Kies Status</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-zinc-400 hover:text-white text-base font-bold p-1">✕</button>
            </div>
            <div className="space-y-2 font-mono">
              <button
                onClick={() => { onStatusChange(item.id, "option"); setIsStatusModalOpen(false); }}
                className={`w-full py-3 px-4 rounded text-xs font-bold uppercase text-left border flex justify-between items-center ${
                  item.status === "option" ? "bg-amber-950 text-amber-400 border-amber-500" : "bg-black/50 text-zinc-300 border-zinc-800"
                }`}
              >
                <span>🟧 OPTION (In optie)</span>
                {item.status === "option" && <span>✓</span>}
              </button>
              <button
                onClick={() => { onStatusChange(item.id, "confirmed"); setIsStatusModalOpen(false); }}
                className={`w-full py-3 px-4 rounded text-xs font-bold uppercase text-left border flex justify-between items-center ${
                  item.status === "confirmed" ? "bg-emerald-950 text-emerald-400 border-emerald-500" : "bg-black/50 text-zinc-300 border-zinc-800"
                }`}
              >
                <span>🟩 CONFIRMED (Bevestigd)</span>
                {item.status === "confirmed" && <span>✓</span>}
              </button>
              <button
                onClick={() => { onStatusChange(item.id, "cancelled"); setIsStatusModalOpen(false); }}
                className={`w-full py-3 px-4 rounded text-xs font-bold uppercase text-left border flex justify-between items-center ${
                  item.status === "cancelled" ? "bg-red-950 text-red-500 border-red-500" : "bg-black/50 text-zinc-300 border-zinc-800"
                }`}
              >
                <span>🟥 CANCELLED (Geannuleerd)</span>
                {item.status === "cancelled" && <span>✓</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
