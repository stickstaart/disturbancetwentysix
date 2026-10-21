import React, { useState, useRef, useEffect } from "react";

interface CustomDatePickerProps {
  value: string; // ISO format string: YYYY-MM-DD
  onChange: (dateString: string) => void;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(currentDate.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth() || new Date().getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Sluit pop-up bij klik buiten component
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = [
    "Januari", "Februari", "Maart", "April", "Mei", "Juni",
    "Juli", "Augustus", "September", "Oktober", "November", "December"
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Maandag = 0
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    onChange(`${viewYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const formattedDisplayDate = () => {
    if (!value) return "Selecteer datum";
    const [y, m, d] = value.split("-");
    return `${d}-${m}-${y}`;
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const startDay = getFirstDayOfWeek(viewYear, viewMonth);

  return (
    <div className="relative w-full font-mono" ref={containerRef}>
      {/* VELD-KNOP */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 bg-black border border-zinc-700 rounded text-sm text-white text-left flex items-center justify-between cursor-pointer"
      >
        <span>📅 {formattedDisplayDate()}</span>
        <span className="text-[13px] text-zinc-400">▼</span>
      </button>

      {/* KALENDER POP-UP (VOLLE BREEDTE OP MOBIEL) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-2xl w-full max-w-sm mx-auto">
          {/* HEADER: MAAND & JAAR SELECTIE */}
          <div className="flex justify-between items-center mb-3 gap-2">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="bg-black text-white border border-zinc-700 rounded p-1 text-sm font-bold"
            >
              {monthNames.map((name, index) => (
                <option key={index} value={index}>{name}</option>
              ))}
            </select>

            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="bg-black text-white border border-zinc-700 rounded p-1 text-sm font-bold"
            >
              {Array.from({ length: 10 }, (_, i) => 2024 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* DAGEN VAN DE WEEK */}
          <div className="grid grid-cols-7 gap-1 text-center text-[13px] font-bold text-zinc-400 mb-1">
            <span>Ma</span><span>Di</span><span>Wo</span><span>Do</span><span>Vr</span><span>Za</span><span>Zo</span>
          </div>

          {/* DAGEN GRID */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedMonth = String(viewMonth + 1).padStart(2, "0");
              const formattedDay = String(day).padStart(2, "0");
              const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
              const isSelected = value === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`p-1.5 text-sm rounded font-bold transition-colors ${
                    isSelected
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
