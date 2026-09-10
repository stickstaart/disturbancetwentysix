import React from "react";
// Gebruik 'import type' om TypeScript tevreden te houden bij verbatimModuleSyntax
import type { DateItem, ShowStatus } from "../BandDashboard";
import { CountryFlag } from "./CountryFlag";

function formatShowDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

interface ShowCardProps {
  item: DateItem;
  onEdit: (show: DateItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: ShowStatus) => void;
}

export const ShowCard: React.FC<ShowCardProps> = ({ item, onEdit, onDelete, onStatusChange }) => {
  const titleColor =
    item.status === "confirmed"
      ? "text-emerald-400"
      : item.status === "option"
        ? "text-amber-500 font-extrabold"
        : "text-red-500 line-through";

  const borderLeftColor =
    item.status === "confirmed"
      ? "border-emerald-500"
      : item.status === "option"
        ? "border-amber-500"
        : "border-red-600";

  return (
    <div className={`p-3 md:p-4 rounded border-l-4 bg-zinc-900/90 relative transition-all ${borderLeftColor}`}>
      {/* ACTIES (BEWERKEN, VERWIJDER, STATUS) */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end w-24">
        <button
          onClick={() => onEdit(item)}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-[10px] py-1 rounded text-white font-mono text-center"
        >
          ✏️ Bewerken
        </button>

        <button
          onClick={() => onDelete(item.id)}
          className="w-full bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/50 text-[9px] uppercase font-bold py-1 rounded font-mono text-center"
        >
          🗑️ VERWIJDER
        </button>

        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value as ShowStatus)}
          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-[9px] font-mono rounded px-1 py-1 text-center focus:outline-none focus:border-amber-500 cursor-pointer uppercase"
        >
          <option value="option">OPTION</option>
          <option value="confirmed">CONFIRMED</option>
          <option value="cancelled">CANCELLED</option>
        </select>
      </div>

      {/* REGEL 1: DATUM */}
      <div className={`font-mono text-xs md:text-sm tracking-wide pr-28 ${titleColor}`}>
        {formatShowDate(item.date)}
      </div>

      {/* REGEL 2: VLAG + LAND + LOCATIE */}
      <div className="font-mono text-xs text-zinc-200 mt-1 pr-28 flex items-center flex-wrap">
        <CountryFlag code={item.country} />
        <span className="font-bold mr-1">({item.country})</span>
        <span>{item.city} @ {item.venue || "TBA"}</span>
      </div>

      {/* REGEL 3: BANDS */}
      {item.otherbands && (
        <p className="text-[11px] text-zinc-300 font-mono mt-1 pr-28">
          <span className="text-zinc-500">Bands:</span> {item.otherbands}
        </p>
      )}

      {/* DETAILS */}
      <div className="grid grid-cols-1 gap-1 mt-3 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-mono">
        {item.owner && <div><span className="text-zinc-500">Band Eigenaar:</span> {item.owner}</div>}
        {item.guaranteedFee && <div><span className="text-zinc-500">Gage:</span> {item.guaranteedFee}</div>}
        {item.contact?.name && (
          <div>
            <span className="text-zinc-500">Contact:</span> {item.contact.name}
            {item.contact.phone && ` (${item.contact.phone})`}
          </div>
        )}
        {item.transportInfo && <div><span className="text-zinc-500">Vervoer:</span> {item.transportInfo}</div>}
        {item.breakEvenInfo && (
          <div><span className="text-zinc-500">Afspraken:</span> {item.breakEvenInfo}</div>
        )}
      </div>
    </div>
  );
};
