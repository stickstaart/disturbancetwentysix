import React, { useState, useEffect } from "react";
import { CustomDatePicker } from "./dashboard/CustomDatePicker";
import { ShowCard } from "./dashboard/ShowCard";

export type ShowStatus = "confirmed" | "option" | "cancelled";

export interface ContactPerson {
  name?: string;
  email?: string;
  phone?: string;
}

export interface DateItem {
  id: string;
  date: string;
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

export const COUNTRIES = [
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

const BandDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("band_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState<"agenda" | "ideas">("agenda");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Modal State voor de Landkeuze
  const [isCountryModalOpen, setIsCountryModalOpen] = useState<boolean>(false);

  const [shows, setShows] = useState<DateItem[]>(() => {
    const saved = localStorage.getItem("band_events_v3");
    return saved ? JSON.parse(saved) : [];
  });

  const [tourIdeas, setTourIdeas] = useState<TourIdea[]>(() => {
    const saved = localStorage.getItem("band_ideas");
    return saved ? JSON.parse(saved) : [];
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulier state
  const [date, setDate] = useState(getTodayString());
  const [country, setCountry] = useState("NL");
  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [otherbands, setOtherbands] = useState("");
  const [status, setStatus] = useState<ShowStatus>("option");
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

  const filteredShows = shows.filter((s) => s.date && s.date.startsWith(selectedYear));

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
    setShows((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
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
      prev.map((idea) => (idea.id === id ? { ...idea, isScratched: !idea.isScratched } : idea))
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
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <span className="text-[10px] md:text-xs font-mono text-zinc-500">BEVEILIGDE BANDZONE</span>
        <button
          onClick={() => { setIsAuthenticated(false); localStorage.removeItem("band_auth"); }}
          className="text-xs font-mono text-red-500 hover:underline cursor-pointer"
        >
          Uitloggen 🔒
        </button>
      </div>

      {/* HOOFDTABS */}
      <div className="flex gap-2">
        <button
          onClick={() => { setActiveTab("agenda"); resetShowForm(); }}
          className={`flex-1 py-3 px-2 text-xs font-bold uppercase rounded border transition-colors flex items-center justify-center gap-2 cursor-pointer font-mono ${
            activeTab === "agenda"
              ? "bg-red-950/40 border-red-600 text-red-500"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          📆 AGENDA & SHOWS
        </button>
        <button
          onClick={() => setActiveTab("ideas")}
          className={`flex-1 py-3 px-2 text-xs font-bold uppercase rounded border transition-colors flex items-center justify-center gap-2 cursor-pointer font-mono ${
            activeTab === "ideas"
              ? "bg-red-950/40 border-red-600 text-red-500"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          ✈️ TOUR IDEAS & CONCEPTS
        </button>
      </div>

      {activeTab === "agenda" && (
        <div className="space-y-4 md:space-y-6">
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

          {!isFormOpen ? (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-all shadow cursor-pointer"
            >
              + NIEUWE SHOW TOEVOEGEN
            </button>
          ) : (
            <form onSubmit={handleSaveShow} className="p-4 bg-zinc-900 rounded border border-zinc-800 space-y-4">
              {/* NIEUWE HEADER CODE MET GROEN VINKJE EN ROOD KRUIS */}
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-bold uppercase text-red-500 tracking-wider">
                  {editingId ? "✏️ Show Bewerken" : "+ Nieuwe Show Toevoegen"}
                </h3>

                <div className="flex items-center gap-2">
                  {/* GROENE OPSLAAN KNOP */}
                  <button
                    type="submit"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-base font-extrabold cursor-pointer shadow"
                    title="Show opslaan"
                    aria-label="Show opslaan"
                  >
                    ✓
                  </button>

                  {/* ROODE SLUIT KNOP */}
                  <button
                    type="button"
                    onClick={resetShowForm}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-950/60 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-all text-base font-extrabold cursor-pointer shadow"
                    title="Formulier sluiten"
                    aria-label="Formulier sluiten"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Datum</label>
                  <CustomDatePicker value={date} onChange={(newDate) => setDate(newDate)} />
                </div>

                {/* HERONTWORPEN CUSTOM LANDKEUZE MET MODAL */}
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Land</label>

                  <button
                    type="button"
                    onClick={() => setIsCountryModalOpen(true)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white text-left flex items-center justify-between cursor-pointer font-mono"
                  >
                    <span>🚩 {COUNTRIES.find((c) => c.code === country)?.name || country} ({country})</span>
                    <span className="text-[10px] text-zinc-400">▼</span>
                  </button>

                  {isCountryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-xs w-full p-4 space-y-3 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                          <h3 className="text-sm font-bold uppercase text-zinc-200 font-mono">
                            Kies Land
                          </h3>
                          <button
                            type="button"
                            onClick={() => setIsCountryModalOpen(false)}
                            className="text-zinc-400 hover:text-white text-base font-bold p-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-1 font-mono pr-1">
                          {COUNTRIES.map((item) => (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => {
                                setCountry(item.code);
                                setIsCountryModalOpen(false);
                              }}
                              className={`w-full p-2 rounded text-xs font-bold text-left border flex justify-between items-center cursor-pointer ${
                                country === item.code
                                  ? "bg-red-950 text-red-400 border-red-500"
                                  : "bg-black/50 text-zinc-300 border-zinc-800 hover:border-zinc-600"
                              }`}
                            >
                              <span>{item.name} ({item.code})</span>
                              {country === item.code && <span>✓</span>}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsCountryModalOpen(false)}
                          className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase font-bold rounded cursor-pointer"
                        >
                          Sluiten
                        </button>
                      </div>
                    </div>
                  )}
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
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-all cursor-pointer"
              >
                {editingId ? "Wijzigingen Opslaan" : "Opslaan & Bovenaan Plaatsen"}
              </button>
            </form>
          )}

          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
              SHOWS IN {selectedYear} ({filteredShows.length})
            </h2>

            {filteredShows.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">Geen optredens gevonden voor {selectedYear}.</p>
            ) : (
              filteredShows.map((item) => (
                <ShowCard
                  key={item.id}
                  item={item}
                  onEdit={handleEditClick}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </div>
      )}

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
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-widest rounded transition-all cursor-pointer"
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
