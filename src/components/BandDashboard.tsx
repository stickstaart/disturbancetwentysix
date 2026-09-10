import React, { useState, useEffect } from "react";

// --- TYPE DEFINITIES ---
export type ShowStatus = "confirmed" | "option" | "cancelled";

export interface BandEvent {
  id: string;
  year: number;
  dateString: string;
  countryCode?: string;
  city?: string;
  venue?: string;
  info?: string;
  status: ShowStatus;
}

export interface TourIdea {
  id: string;
  title: string;
  supportBands?: string;
  targetPeriod?: string;
  isScratched?: boolean;
}

// --- INITIËLE DEMO DATA ---
const initialEvents: BandEvent[] = [
  {
    id: "1",
    year: 2025,
    dateString: "Do 17 Jul 2025",
    countryCode: "D",
    city: "KASSEL",
    venue: "Goldgrube",
    info: "150€ + 60% deur na break even Joost | Joz | eten + drinken / slaapplekken: bandflat",
    status: "option",
  },
  {
    id: "2",
    year: 2025,
    dateString: "Vr 18 Jul 2025",
    countryCode: "AT",
    city: "HALLSTATT",
    venue: "???",
    info: "800€ Gin | Jona",
    status: "confirmed",
  },
];

const initialTourIdeas: TourIdea[] = [
  { id: "1", title: "Japan 🇯🇵", isScratched: true },
  { id: "2", title: "Canada 🇨🇦", supportBands: "(BALM SQUAD/PHANE)", targetPeriod: "SEP 2027", isScratched: false },
  { id: "3", title: "Mexico 🇲🇽", supportBands: "(ACIDEZ)", targetPeriod: "OKT / NOV 2027", isScratched: false },
];

const BandDashboard: React.FC = () => {
  // 1. WACHTWOORD BEVEILIGING STATE
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("band_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);

  // 2. DASHBOARD & DATA STATE (Met localStorage integratie)
  const [activeTab, setActiveTab] = useState<"agenda" | "ideas">("agenda");

  const [events, setEvents] = useState<BandEvent[]>(() => {
    const saved = localStorage.getItem("band_events");
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [tourIdeas, setTourIdeas] = useState<TourIdea[]>(() => {
    const saved = localStorage.getItem("band_ideas");
    return saved ? JSON.parse(saved) : initialTourIdeas;
  });

  // Filter State voor Jaarhistorie
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [showAddEventForm, setShowAddEventForm] = useState(false);

  // Formulier State voor nieuwe Show
  const [showYear, setShowYear] = useState<number>(2026);
  const [showDate, setShowDate] = useState("");
  const [showCountry, setShowCountry] = useState("");
  const [showCity, setShowCity] = useState("");
  const [showVenue, setShowVenue] = useState("");
  const [showInfo, setShowInfo] = useState("");
  const [showStatus, setShowStatus] = useState<ShowStatus>("option");

  // Formulier State voor ideeën
  const [newTitle, setNewTitle] = useState("");
  const [newBands, setNewBands] = useState("");
  const [newPeriod, setNewPeriod] = useState("");

  // Synchroniseer wijzigingen naar localStorage
  useEffect(() => {
    localStorage.setItem("band_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("band_ideas", JSON.stringify(tourIdeas));
  }, [tourIdeas]);

  // Wachtwoord Controle
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "band2026") {
      setIsAuthenticated(true);
      localStorage.setItem("band_auth", "true");
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("band_auth");
  };

  // Nieuwe Show Toevoegen
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDate.trim() || !showCity.trim()) return;

    const newEvent: BandEvent = {
      id: Date.now().toString(),
      year: Number(showYear),
      dateString: showDate,
      countryCode: showCountry.toUpperCase() || undefined,
      city: showCity.toUpperCase(),
      venue: showVenue || undefined,
      info: showInfo || undefined,
      status: showStatus,
    };

    setEvents([newEvent, ...events]);
    setShowDate("");
    setShowCountry("");
    setShowCity("");
    setShowVenue("");
    setShowInfo("");
    setShowAddEventForm(false);
  };

  // Nieuw Idee Toevoegen
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

  // Unieke jaren ophalen voor de Jaarhistorie Filter
  const availableYears = Array.from(new Set(events.map((e) => e.year))).sort((a, b) => b - a);
  const filteredEvents = selectedYear === "ALL"
    ? events
    : events.filter((e) => e.year === Number(selectedYear));

  // --- WACHTWOORD SCHERM ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded border border-zinc-800 max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-red-500 text-center">Band Access Only</h2>
          <p className="text-xs text-gray-400 text-center">Voer de inlogcode in om toegang te krijgen.</p>
          <input
            type="password"
            placeholder="Wachtwoord"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full p-3 bg-black border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500 text-center font-mono"
          />
          {authError && <p className="text-xs text-red-500 text-center">Ongeldige code!</p>}
          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-all"
          >
            Inloggen
          </button>
        </form>
      </div>
    );
  }

  // --- DASHBOARD SCHERM ---
  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8 font-sans max-w-4xl mx-auto">

      {/* HEADER MET LOGOUT */}
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <span className="text-xs font-mono text-zinc-500">BEVEILIGDE BANDZONE</span>
        <button onClick={handleLogout} className="text-xs font-mono text-red-500 hover:underline">
          Uitloggen 🔒
        </button>
      </div>

      {/* TAB NAVIGATIE */}
      <div className="flex border-b border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab("agenda")}
          className={`py-3 px-6 font-extrabold text-sm uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "agenda"
              ? "border-red-600 text-red-500 bg-zinc-900/50"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          📅 Agenda & Shows
        </button>
        <button
          onClick={() => setActiveTab("ideas")}
          className={`py-3 px-6 font-extrabold text-sm uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "ideas"
              ? "border-red-600 text-red-500 bg-zinc-900/50"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          ✈️ Tour Ideas & Concepts
        </button>
      </div>

      {/* TAB 1: AGENDA CONTENT */}
      {activeTab === "agenda" && (
        <div className="space-y-6">

          {/* BOVENAAN: KNOP OM SCHERM TE OPENEN & JAARFILTER */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-zinc-900/60 p-4 rounded border border-zinc-800">
            <button
              onClick={() => setShowAddEventForm(!showAddEventForm)}
              className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-all"
            >
              {showAddEventForm ? "- Formulier Sluiten" : "+ Nieuwe Show Toevoegen"}
            </button>

            {/* JAARHISTORIE DROPDOWN FILTER */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-gray-400">Jaarhistorie:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-black border border-zinc-700 text-white text-xs font-bold rounded p-2 focus:outline-none focus:border-red-500"
              >
                <option value="ALL">Alle Jaren</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FORMULIER: NIEUWE SHOW TOEVOEGEN */}
          {showAddEventForm && (
            <form onSubmit={handleAddEvent} className="p-4 bg-zinc-900 rounded border border-zinc-800 space-y-3 animate-fade-in">
              <h3 className="text-sm font-bold uppercase text-red-500 tracking-wider">+ Nieuwe Show Aanmaken</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Jaar (bijv. 2026)"
                  value={showYear}
                  onChange={(e) => setShowYear(Number(e.target.value))}
                  className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Datum (bijv. Vr 18 Jul 2026)"
                  value={showDate}
                  onChange={(e) => setShowDate(e.target.value)}
                  className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Landcode (bijv. NL, D, AT)"
                  value={showCountry}
                  onChange={(e) => setShowCountry(e.target.value)}
                  className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Stad"
                  value={showCity}
                  onChange={(e) => setShowCity(e.target.value)}
                  className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Zaal / Zaalnaam"
                  value={showVenue}
                  onChange={(e) => setShowVenue(e.target.value)}
                  className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                />
                <select
                  value={showStatus}
                  onChange={(e) => setShowStatus(e.target.value as ShowStatus)}
                  className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                >
                  <option value="option">In Optie (Oranje)</option>
                  <option value="confirmed">Bevestigd (Groen)</option>
                  <option value="cancelled">Geannuleerd (Rood)</option>
                </select>
              </div>
              <textarea
                placeholder="Gage, contactpersoon, overnachting info..."
                value={showInfo}
                onChange={(e) => setShowInfo(e.target.value)}
                className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white h-20"
              />
              <button
                type="submit"
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-all"
              >
                Opslaan in Agenda
              </button>
            </form>
          )}

          {/* STATUS LEGENDA */}
          <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider p-3 bg-zinc-900/40 rounded border border-zinc-800">
            <span className="text-green-400">GROEN = Bevestigd</span>
            <span className="text-amber-400">ORANJE = In Optie</span>
            <span className="text-red-500">ROOD = Geannuleerd</span>
          </div>

          {/* LIJST MET SHOWS */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Geen shows gevonden voor dit geselecteerde jaar.</p>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-r-lg border-l-4 ${
                    event.status === "confirmed"
                      ? "border-green-500 bg-green-950/20 text-green-400"
                      : event.status === "option"
                        ? "border-amber-500 bg-amber-950/20 text-amber-400"
                        : "border-red-500 bg-red-950/10 text-red-400 line-through"
                  }`}
                >
                  <div className="font-mono text-base md:text-lg font-bold">
                    <span>{event.dateString} </span>
                    {event.countryCode && <span className="text-gray-400">({event.countryCode}) </span>}
                    {event.city && <span className="uppercase text-white">{event.city} </span>}
                    {event.venue && <span>@ {event.venue} </span>}
                  </div>
                  {event.info && (
                    <p className="text-xs md:text-sm text-gray-300 mt-2 font-mono">
                      <span className="text-gray-500">info: </span>{event.info}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TOUR IDEAS CONTENT */}
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
