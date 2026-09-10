import React, { useState, useEffect, useRef } from "react";

const MONTH_NAMES = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December"
];

const getISOWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

interface CustomDatePickerProps {
  value: string;
  onChange: (dateStr: string) => void;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const currentDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState<number>(currentDate.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(currentDate.getMonth() || 0);

  const presentYear = new Date().getFullYear();
  const dynamicYears = Array.from({ length: 7 }, (_, i) => presentYear - 1 + i);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}`);
    setIsOpen(false);
  };

  const formattedDisplay = value
    ? `${value.split("-")[2]}-${value.split("-")[1]}-${value.split("-")[0]}`
    : "Selecteer datum";

  const totalSlots = firstDayIndex + daysInMonth;
  const rowsCount = Math.ceil(totalSlots / 7);

  return (
    <div className="relative" ref={calendarRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white text-left font-mono focus:border-red-500"
      >
        📅 {formattedDisplay}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-72 text-white text-xs">
          <div className="flex justify-between items-center gap-1 mb-3">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="bg-black border border-zinc-700 rounded p-1 text-xs text-white font-bold"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={index} value={index}>{name}</option>
              ))}
            </select>

            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="bg-black border border-zinc-700 rounded p-1 text-xs text-white font-bold"
            >
              {dynamicYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-8 text-center font-bold text-zinc-500 text-[10px] mb-1">
            <span className="text-red-500 font-mono">Wk</span>
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>

          <div className="space-y-1">
            {Array.from({ length: rowsCount }).map((_, rowIndex) => {
              let dayForWeekCalc = rowIndex * 7 - firstDayIndex + 1;
              if (dayForWeekCalc < 1) dayForWeekCalc = 1;
              if (dayForWeekCalc > daysInMonth) dayForWeekCalc = daysInMonth;

              const weekNum = getISOWeekNumber(new Date(viewYear, viewMonth, dayForWeekCalc));

              return (
                <div key={rowIndex} className="grid grid-cols-8 gap-1 text-center font-mono items-center">
                  <span className="text-[10px] text-zinc-500 font-bold select-none">
                    {weekNum}
                  </span>

                  {Array.from({ length: 7 }).map((_, colIndex) => {
                    const dayIndex = rowIndex * 7 + colIndex;
                    const dayNum = dayIndex - firstDayIndex + 1;

                    if (dayNum < 1 || dayNum > daysInMonth) {
                      return <div key={colIndex} />;
                    }

                    const isSelected =
                      value ===
                      `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

                    return (
                      <button
                        key={colIndex}
                        type="button"
                        onClick={() => handleSelectDay(dayNum)}
                        className={`p-1 rounded text-xs transition-all hover:bg-red-600 hover:text-white ${
                          isSelected ? "bg-red-600 text-white font-bold" : "bg-zinc-800 text-zinc-200"
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
