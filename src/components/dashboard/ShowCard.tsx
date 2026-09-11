import React, { useState } from "react";
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
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

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

  const handleSelectStatus = (newStatus: ShowStatus) => {
    onStatusChange(item.id, newStatus);
    setIsStatusModalOpen(false);
  };

  return (
    <div className={`w-full p-3 md:p-4 rounded bg-zinc-900/90 border border-zinc-800 font-mono space-y-2.5 ${styles.borderColor}`}>

      {/* REGEL 1: DATUM */}
      <div className="w-full relative">
        <div className={`w-full text-xl md:text-sm tracking-wide leading-snug break-all ${styles.titleColor} ${styles.isCancelled ? 'line-through' : ''}`}>
          {formatShowDate(item.date)}
        </div>
      </div>

      {/* REGEL 2: VLAG + LAND + LOCATIE */}
      <div className="w-full relative">
        <div className={`w-full text-m uppercase leading-snug break-all flex flex-wrap items-center gap-1.5 ${styles.locationColor} ${styles.isCancelled ? 'line-through' : ''}`}>
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
      {(item.owner || item.guaranteedFee || item.contact?.name || item.transportInfo || item.breakEvenInfo) && (
        <div className="w-full pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 space-y-1 px-1">
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

        {/* GEWOON EEN KNOP IN PLAATS VAN NATIVE SELECT */}
        <button
          type="button"
          onClick={() => setIsStatusModalOpen(true)}
          className={`w-full text-xs py-2 px-1 rounded font-bold uppercase cursor-pointer border flex items-center justify-center gap-1 ${styles.selectStyle}`}
        >
          <span>{styles.label}</span>
          <span className="text-[10px]">▼</span>
        </button>
      </div>

      {/* CUSTOM STATUS MODAL FOR MOBIEL & DESKTOP */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-xs w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-bold uppercase text-zinc-200 font-mono">
                Kies Status
              </h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-zinc-400 hover:text-white text-base font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 font-mono">
              <button
                onClick={() => handleSelectStatus("option")}
                className={`w-full py-3 px-4 rounded text-xs font-bold uppercase text-left border flex justify-between items-center ${
                  item.status === "option"
                    ? "bg-amber-950 text-amber-400 border-amber-500"
                    : "bg-black/50 text-zinc-300 border-zinc-800 hover:border-amber-500/50"
                }`}
              >
                <span>🟧 OPTION (In optie)</span>
                {item.status === "option" && <span>✓</span>}
              </button>

              <button
                onClick={() => handleSelectStatus("confirmed")}
                className={`w-full py-3 px-4 rounded text-xs font-bold uppercase text-left border flex justify-between items-center ${
                  item.status === "confirmed"
                    ? "bg-emerald-950 text-emerald-400 border-emerald-500"
                    : "bg-black/50 text-zinc-300 border-zinc-800 hover:border-emerald-500/50"
                }`}
              >
                <span>🟩 CONFIRMED (Bevestigd)</span>
                {item.status === "confirmed" && <span>✓</span>}
              </button>

              <button
                onClick={() => handleSelectStatus("cancelled")}
                className={`w-full py-3 px-4 rounded text-xs font-bold uppercase text-left border flex justify-between items-center ${
                  item.status === "cancelled"
                    ? "bg-red-950 text-red-500 border-red-500"
                    : "bg-black/50 text-zinc-300 border-zinc-800 hover:border-red-500/50"
                }`}
              >
                <span>🟥 CANCELLED (Geannuleerd)</span>
                {item.status === "cancelled" && <span>✓</span>}
              </button>
            </div>

            <button
              onClick={() => setIsStatusModalOpen(false)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase font-bold rounded"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
