import React from "react";
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
  // Dynamische styling op basis van show status
  const getStatusStyles = (status: ShowStatus) => {
    switch (status) {
      case "confirmed":
        return {
          titleColor: "text-emerald-400 font-extrabold",
          borderColor: "border-l-4 border-l-emerald-500",
          selectStyle: "bg-emerald-950 text-emerald-400 border border-emerald-500 font-bold",
        };
      case "cancelled":
        return {
          titleColor: "text-red-500 line-through font-extrabold",
          borderColor: "border-l-4 border-l-red-500",
          selectStyle: "bg-red-950 text-red-500 border border-red-500 font-bold",
        };
      case "option":
      default:
        return {
          titleColor: "text-amber-500 font-extrabold",
          borderColor: "border-l-4 border-l-amber-500",
          selectStyle: "bg-amber-950 text-amber-500 border border-amber-500 font-bold",
        };
    }
  };

  const styles = getStatusStyles(item.status);

  return (
    <div className={`p-4 rounded bg-zinc-900/90 border border-zinc-800 font-mono space-y-3 ${styles.borderColor}`}>
      {/* REGEL 1: DATUM */}
      <div className={`text-xs md:text-sm tracking-wide ${styles.titleColor}`}>
        {formatShowDate(item.date)}
      </div>

      {/* REGEL 2: VLAG + LAND + LOCATIE */}
      <div className="text-xs text-white flex items-center gap-1.5 font-bold">
        <CountryFlag code={item.country} />
        <span>({item.country})</span>
        <span>{item.city} @ {item.venue || "TBA"}</span>
      </div>

      {/* REGEL 3: BANDS */}
      {item.otherbands && (
        <p className="text-xs text-zinc-300">
          <span className="text-zinc-500">Bands:</span> {item.otherbands}
        </p>
      )}

      {/* DETAILS / INFORMATIE */}
      {(item.owner || item.guaranteedFee || item.contact?.name || item.transportInfo || item.breakEvenInfo) && (
        <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
          {item.owner && (
            <div><span className="text-zinc-500">Band Eigenaar:</span> {item.owner}</div>
          )}
          {item.guaranteedFee && (
            <div><span className="text-zinc-500">Gage:</span> {item.guaranteedFee}</div>
          )}
          {item.contact?.name && (
            <div>
              <span className="text-zinc-500">Contact:</span> {item.contact.name}
              {item.contact.phone && ` (${item.contact.phone})`}
            </div>
          )}
          {item.transportInfo && (
            <div><span className="text-zinc-500">Vervoer:</span> {item.transportInfo}</div>
          )}
          {item.breakEvenInfo && (
            <div><span className="text-zinc-500">Afspraken:</span> {item.breakEvenInfo}</div>
          )}
        </div>
      )}

      {/* ONDERAAN: DRIE KNOPPEN IN EEN RIJ */}
      <div className="pt-2 grid grid-cols-3 gap-2">
        <button
          onClick={() => onEdit(item)}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs py-1.5 rounded font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          ✏️ Bewerken
        </button>

        <button
          onClick={() => onDelete(item.id)}
          className="w-full bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-900/60 text-xs py-1.5 rounded font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          🗑️ VERWIJDER
        </button>

        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value as ShowStatus)}
          className={`w-full text-xs py-1.5 px-2 rounded font-bold uppercase cursor-pointer outline-none ${styles.selectStyle}`}
        >
          <option value="option">OPTION</option>
          <option value="confirmed">CONFIRMED</option>
          <option value="cancelled">CANCELLED</option>
        </select>
      </div>
    </div>
  );
};
