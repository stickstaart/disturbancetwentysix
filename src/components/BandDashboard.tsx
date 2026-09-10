import React, { useState, useEffect, useRef } from "react";

// --- TYPE DEFINITIES ---
export type ShowStatus = "confirmed" | "option" | "cancelled";

export interface ContactPerson {
  name?: string;
  email?: string;
  phone?: string;
}

export interface DateItem {
  id: string;
  date: string; // Formaat: YYYY-MM-DD
  country: string;
  city: string;
  venue: string;
  otherbands?: string;
  status: ShowStatus;
  contact?: ContactPerson;
  guaranteedFee?: string;
  breakEvenInfo?: string;
  owner?: string;
  transportInfo?: string;
}

export interface TourIdea {
  id: string;
  title: string;
  supportBands?: string;
  targetPeriod?: string;
  isScratched?: boolean;
}

export interface CountryOption {
  code: string;
  name: string;
}

// --- ISO LANDEN LIJST ---
export const COUNTRIES: CountryOption[] = [
  { code: "NL", name: "Nederland" },
  { code: "BE", name: "België" },
  { code: "DE", name: "Duitsland" },
  { code: "AT", name: "Oostenrijk" },
  { code: "CH", name: "Zwitserland" },
  { code: "GB", name: "Verenigd Koninkrijk" },
  { code: "FR", name: "Frankrijk" },
  { code: "ES", name: "Spanje" },
  { code: "IT", name: "Italië" },
  { code: "DK", name: "Denemarken" },
  { code: "SE", name: "Zweden" },
  { code: "NO", name: "Noorwegen" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Polen" },
  { code: "CZ", name: "Tsjechië" },
  { code: "US", name: "Verenigde Staten" },
  { code: "CA", name: "Canada" },
];

const getTodayString = () => new Date().toISOString().split("T")[0];

const MONTH_NAMES = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December"
];

// --- HELPER: DATUM FORMATTEREN VOOR MOBIELE WEERGAVE ---
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

// --- COMPONENT VOOR LOCAL SVG VLAGGEN ---
const CountryFlag: React.FC<{ code: string }> = ({ code }) => {
  if (!code) return null;
  const isoCode = code.toLowerCase();

  return (
    <img
      src={`/flag-icons-main/flags/4x3/${isoCode}.svg`}
      alt={code}
      className="w-4 h-3 inline-block object-cover rounded-[1px] shadow-sm mr-1.5 align-middle"
      onError={(e) => {
        (e.target as HTMLElement).style.display = "none";
      }}
    />
  );
};

// --- HELPER: ISO WEEKNUMMER ---
const getISOWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// --- CUSTOM DATUMPRIKKER ---
interface CustomDatePickerProps {
  value: string;
  onChange: (dateStr: string) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange }) => {
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

  const getWeekForDay = (dayNum: number) => {
    const targetDate = new Date(viewYear, viewMonth, dayNum);
    return getISOWeekNumber(targetDate);
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

              const weekNum = getWeekForDay(dayForWeekCalc);

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

// --- HOOFD DASHBOARD COMPONENT ---
const BandDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("band_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState<"agenda" | "ideas">("agenda");

  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const [shows, setShows] = useState<DateItem[]>(() => {
    const saved = localStorage.getItem("band_events_v3");
    return saved ? JSON.parse(saved) : [];
  });

  const [tourIdeas, setTourIdeas] = useState<TourIdea[]>(() => {
    const saved = localStorage.getItem("band_ideas");
    return saved ? JSON.parse(saved) : [];
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // FORMULIER STATE
  const [date, setDate] = useState(getTodayString());
  const [country, setCountry] = useState("NL");
  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [otherbands, setOtherbands] = useState("");
  const [status, setStatus] = useState<ShowStatus>("option");

  // Details
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [guaranteedFee, setGuaranteedFee] = useState("");
  const [breakEvenInfo, setBreakEvenInfo] = useState("");
  const [owner, setOwner] = useState("");
  const [transportInfo, setTransportInfo] = useState("");

  // Tour Ideas state
  const [newTitle, setNewTitle] = useState("");
  const [newBands, setNewBands] = useState("");
  const [newPeriod, setNewPeriod] = useState("");

  useEffect(() => {
    localStorage.setItem("band_events_v3", JSON.stringify(shows));
  }, [shows]);

  useEffect(() => {
    localStorage.setItem("band_ideas", JSON.stringify(tourIdeas));
  }, [tourIdeas]);

  const uniqueCities = Array.from(new Set(shows.map((s) => s.city).filter(Boolean)));
  const uniqueVenues = Array.from(new Set(shows.map((s) => s.venue).filter(Boolean)));
  const uniqueBands = Array.from(new Set(shows.map((s) => s.otherbands).filter(Boolean)));

  const filteredShows = shows.filter((s) => {
    if (!s.date) return false;
    return s.date.startsWith(selectedYear);
  });

  const resetShowForm = () => {
    setEditingId(null);
    setDate(getTodayString());
    setCountry("NL");
    setCity("");
    setVenue("");
    setOtherbands("");
    setStatus("option");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setGuaranteedFee("");
    setBreakEvenInfo("");
    setOwner("");
    setTransportInfo("");
    setIsFormOpen(false);
  };

  const handleSaveShow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !city) return;

    const showData: DateItem = {
      id: editingId || Date.now().toString(),
      date,
      country,
      city,
      venue,
      otherbands: otherbands || undefined,
      status,
      contact: {
        name: contactName || undefined,
        email: contactEmail || undefined,
        phone: contactPhone || undefined,
      },
      guaranteedFee: guaranteedFee || undefined,
      breakEvenInfo: breakEvenInfo || undefined,
      owner: owner || undefined,
      transportInfo: transportInfo || undefined,
    };

    if (editingId) {
      setShows(shows.map((s) => (s.id === editingId ? showData : s)));
    } else {
      setShows([showData, ...shows]);
    }

    resetShowForm();
  };

  const handleEditClick = (show: DateItem) => {
    setEditingId(show.id);
    setDate(show.date || getTodayString());
    setCountry(show.country || "NL");
    setCity(show.city || "");
    setVenue(show.venue || "");
    setOtherbands(show.otherbands || "");
    setStatus(show.status);
    setContactName(show.contact?.name || "");
    setContactEmail(show.contact?.email || "");
    setContactPhone(show.contact?.phone || "");
    setGuaranteedFee(show.guaranteedFee || "");
    setBreakEvenInfo(show.breakEvenInfo || "");
    setOwner(show.owner || "");
    setTransportInfo(show.transportInfo || "");

    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Weet je zeker dat je deze show wilt verwijderen?")) {
      setShows((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: ShowStatus) => {
    setShows((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newIdea: TourIdea = {
      id: Date.now().toString(),
      title: newTitle,
      supportBands: newBands ? `(${newBands})` : undefined,
      targetPeriod: newPeriod.toUpperCase() || undefined,
      isScratched: false,
    };

    setTourIdeas([...tourIdeas, newIdea]);
    setNewTitle("");
    setNewBands("");
    setNewPeriod("");
  };

  const toggleScratch = (id: string) => {
    setTourIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, isScratched: !idea.isScratched } : idea
      )
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "band2026") {
      setIsAuthenticated(true);
      localStorage.setItem("band_auth", "true");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded border border-zinc-800 max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold text-red-500 text-center uppercase">Band Access</h2>
          <input
            type="password"
            placeholder="Wachtwoord"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full p-3 bg-black border border-zinc-700 rounded text-white text-center font-mono"
          />
          <button type="submit" className="w-full py-3 bg-red-600 text-white font-bold uppercase text-xs rounded">
            Inloggen
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-3 md:p-8 font-sans max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <span className="text-[10px] md:text-xs font-mono text-zinc-500">BEVEILIGDE BANDZONE</span>
        <button
          onClick={() => { setIsAuthenticated(false); localStorage.removeItem("band_auth"); }}
          className="text-xs font-mono text-red-500 hover:underline"
        >
          Uitloggen 🔒
        </button>
      </div>

      {/* TAB NAVIGATIE */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => { setActiveTab("agenda"); resetShowForm(); }}
          className={`py-2 px-4 md:py-3 md:px-6 font-extrabold text-xs md:text-sm uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "agenda"
              ? "border-red-600 text-red-500 bg-zinc-900/50"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          📅 AGENDA & SHOWS
        </button>
        <button
          onClick={() => setActiveTab("ideas")}
          className={`py-2 px-4 md:py-3 md:px-6 font-extrabold text-xs md:text-sm uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "ideas"
              ? "border-red-600 text-red-500 bg-zinc-900/50"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          ✈️ TOUR IDEAS & CONCEPTS
        </button>
      </div>

      {/* TAB 1: AGENDA */}
      {activeTab === "agenda" && (
        <div className="space-y-4 md:space-y-6">

          {/* JAAR DROPDOWN FILTER */}
          <div className="flex items-center justify-between bg-zinc-900 p-3 rounded border border-zinc-800">
            <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">SELECTEER JAAR:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-black border border-zinc-700 rounded p-1.5 text-xs text-white font-mono font-bold text-center focus:border-red-500"
            >
              {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 1 + i).map((year) => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>

          {/* KNOP FORMULIER */}
          {!isFormOpen ? (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-all shadow"
            >
              + NIEUWE SHOW TOEVOEGEN
            </button>
          ) : (
            <form onSubmit={handleSaveShow} className="p-4 bg-zinc-900 rounded border border-zinc-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase text-red-500 tracking-wider">
                  {editingId ? "✏️ Show Bewerken" : "+ Nieuwe Show Toevoegen"}
                </h3>
                <button
                  type="button"
                  onClick={resetShowForm}
                  className="text-xs text-zinc-400 hover:text-white underline"
                >
                  Annuleren / Sluiten
                </button>
              </div>

              {/* RIJ 1: BASIS INFO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Datum</label>
                  <CustomDatePicker value={date} onChange={(newDate) => setDate(newDate)} />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Land</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  >
                    {COUNTRIES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name} ({item.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Stad</label>
                  <input
                    type="text"
                    list="city-suggestions"
                    placeholder="Stadnaam..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                    required
                  />
                  <datalist id="city-suggestions">
                    {uniqueCities.map((c, i) => (
                      <option key={i} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Zaal / Venue</label>
                  <input
                    type="text"
                    list="venue-suggestions"
                    placeholder="Zaalnaam..."
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                  <datalist id="venue-suggestions">
                    {uniqueVenues.map((v, i) => (
                      <option key={i} value={v} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Andere Bands</label>
                  <input
                    type="text"
                    list="band-suggestions"
                    placeholder="Support / Co-headliners..."
                    value={otherbands}
                    onChange={(e) => setOtherbands(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                  <datalist id="band-suggestions">
                    {uniqueBands.map((b, i) => (
                      <option key={i} value={b} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ShowStatus)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  >
                    <option value="option">In Optie (Oranje)</option>
                    <option value="confirmed">Bevestigd (Groen)</option>
                    <option value="cancelled">Geannuleerd (Rood)</option>
                  </select>
                </div>
              </div>

              {/* RIJ 2: CONTACTPERSOON SHOW */}
              <div className="border-t border-zinc-800 pt-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase block mb-2">👤 Contactpersoon Show</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Naam contactpersoon"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                  <input
                    type="email"
                    placeholder="E-mailadres"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Telefoonnummer"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                </div>
              </div>

              {/* RIJ 3: FINANCIËN & LOGISTIEK */}
              <div className="border-t border-zinc-800 pt-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase block mb-2">💰 Financiën & Logistiek</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Gage (bijv. €400)"
                    value={guaranteedFee}
                    onChange={(e) => setGuaranteedFee(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Show Eigenaar (Aanspreekpunt Band)"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Vervoer & Kosten (Bushuur/Chauffeur)"
                    value={transportInfo}
                    onChange={(e) => setTransportInfo(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                </div>
                <textarea
                  placeholder="Break-even afspraken / Bijzonderheden..."
                  value={breakEvenInfo}
                  onChange={(e) => setBreakEvenInfo(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white h-14"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-all"
              >
                {editingId ? "Wijzigingen Opslaan" : "Opslaan & Bovenaan Plaatsen"}
              </button>
            </form>
          )}

          {/* OVERZICHT SHOWS VOOR GESELECTEERD JAAR */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
              SHOWS IN {selectedYear} ({filteredShows.length})
            </h2>

            {filteredShows.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">Geen optredens gevonden voor {selectedYear}.</p>
            ) : (
              filteredShows.map((item) => {
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
                  <div
                    key={item.id}
                    className={`p-3 md:p-4 rounded border-l-4 bg-zinc-900/90 relative transition-all ${borderLeftColor}`}
                  >
                    {/* ACTIES BOVENIN RECHTS (BEWERKEN, VERWIJDER, STATUS) */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end w-24">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-[10px] py-1 rounded text-white font-mono text-center"
                      >
                        ✏️ Bewerken
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-full bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/50 text-[9px] uppercase font-bold py-1 rounded font-mono text-center"
                      >
                        🗑️ VERWIJDER
                      </button>

                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(
                            item.id,
                            e.target.value as ShowStatus
                          )
                        }
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-[9px] font-mono rounded px-1 py-1 text-center focus:outline-none focus:border-amber-500 cursor-pointer uppercase"
                      >
                        <option value="option">OPTION</option>
                        <option value="confirmed">CONFIRMED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </div>

                    {/* REGEL 1: DATUM BOVENAAN */}
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

                    {/* LOGISTIEK & FINANCIËN RASTER */}
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
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TOUR IDEAS */}
      {activeTab === "ideas" && (
        <div className="space-y-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Klik op een optie om deze door te strepen of te herstellen.
          </p>

          <div className="grid gap-3">
            {tourIdeas.map((idea) => (
              <div
                key={idea.id}
                onClick={() => toggleScratch(idea.id)}
                className={`p-4 rounded border cursor-pointer select-none flex justify-between items-center transition-all ${
                  idea.isScratched
                    ? "border-zinc-800 opacity-40 line-through bg-zinc-950"
                    : "border-zinc-700 hover:border-red-600 bg-zinc-900"
                }`}
              >
                <div>
                  <span className="font-bold text-white text-lg mr-2">{idea.title}</span>
                  {idea.supportBands && (
                    <span className="text-sm text-gray-400 font-mono">{idea.supportBands}</span>
                  )}
                </div>
                {idea.targetPeriod && (
                  <span className="text-xs font-mono bg-black/60 px-2.5 py-1 rounded text-amber-400 border border-amber-500/30">
                    {idea.targetPeriod}
                  </span>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddIdea} className="p-4 bg-zinc-900 rounded border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold uppercase text-red-500 tracking-wider">
              + Nieuwe Tour Optie Toevoegen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Land / Bestemming"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
              />
              <input
                type="text"
                placeholder="Bands"
                value={newBands}
                onChange={(e) => setNewBands(e.target.value)}
                className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
              />
              <input
                type="text"
                placeholder="Periode"
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-all"
            >
              Toevoegen aan Schetsen
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BandDashboard;
