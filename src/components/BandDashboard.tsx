import React, { useState, useEffect } from "react";
import { CustomDatePicker } from "./dashboard/CustomDatePicker";
import { ShowCard } from "./dashboard/ShowCard";
import { CountryFlag } from "./dashboard/CountryFlag";

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
  paymentMethod?: "cash" | "wire";
  breakEvenInfo?: string;
  owner?: string;
  drivers?: string;
  transportMethod?: string;
  transportCost?: string;
  isBlocked?: boolean;
  blockedBy?: string;
}

export interface TourIdea {
  id: string;
  title: string;
  country?: string;
  supportBands?: string;
  targetPeriod?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  isScratched?: boolean;
}

export const BAND_MEMBERS = ["Joz (Superadmin)", "Jona", "Rob", "Johnny"];

export const COUNTRIES = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albanië" }, { code: "DZ", name: "Algerije" },
  { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" }, { code: "AR", name: "Argentinië" },
  { code: "AM", name: "Armenië" }, { code: "AU", name: "Australië" }, { code: "AT", name: "Oostenrijk" },
  { code: "AZ", name: "Azerbeidzjan" }, { code: "BE", name: "België" }, { code: "BR", name: "Brazilië" },
  { code: "BG", name: "Bulgarije" }, { code: "CA", name: "Canada" }, { code: "CL", name: "Chili" },
  { code: "CN", name: "China" }, { code: "CO", name: "Colombia" }, { code: "HR", name: "Kroatië" },
  { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Tsjechië" }, { code: "DK", name: "Denemarken" },
  { code: "DE", name: "Duitsland" }, { code: "EE", name: "Estland" }, { code: "FI", name: "Finland" },
  { code: "FR", name: "Frankrijk" }, { code: "GR", name: "Griekenland" }, { code: "HU", name: "Hongarije" },
  { code: "IS", name: "IJsland" }, { code: "IE", name: "Ierland" }, { code: "IT", name: "Italië" },
  { code: "JP", name: "Japan" }, { code: "MX", name: "Mexico" }, { code: "NL", name: "Nederland" },
  { code: "NO", name: "Noorwegen" }, { code: "PL", name: "Polen" }, { code: "PT", name: "Portugal" },
  { code: "RO", name: "Roemenië" }, { code: "ES", name: "Spanje" }, { code: "SE", name: "Zweden" },
  { code: "CH", name: "Zwitserland" }, { code: "GB", name: "Verenigd Koninkrijk" }, { code: "US", name: "Verenigde Staten" }
].sort((a, b) => a.name.localeCompare(b.name));

const getTodayString = () => new Date().toISOString().split("T")[0];

const BandDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem("band_auth") === "true");
  const [passwordInput, setPasswordInput] = useState("");

  // Superadmin functionaliteit: Standaard ingesteld op Joz (Superadmin), instelling wordt opgeslagen
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem("band_active_user") || "Joz (Superadmin)";
  });

  const [activeTab, setActiveTab] = useState<"agenda" | "ideas">("agenda");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const [isYearModalOpen, setIsYearModalOpen] = useState<boolean>(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState<boolean>(false);
  const [countryModalTarget, setCountryModalTarget] = useState<"show" | "idea">("show");

  // Toggle status voor formulieren
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState<boolean>(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState<boolean>(false);

  const [blockDate, setBlockDate] = useState(getTodayString());

  const [shows, setShows] = useState<DateItem[]>(() => {
    const saved = localStorage.getItem("band_events_v3");
    return saved ? JSON.parse(saved) : [];
  });

  const [tourIdeas, setTourIdeas] = useState<TourIdea[]>(() => {
    const saved = localStorage.getItem("band_ideas");
    return saved ? JSON.parse(saved) : [];
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Show Form State
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
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "wire">("cash");
  const [breakEvenInfo, setBreakEvenInfo] = useState("");
  const [owner, setOwner] = useState(currentUser);
  const [drivers, setDrivers] = useState("");
  const [transportMethod, setTransportMethod] = useState("");
  const [transportCost, setTransportCost] = useState("");

  // Idea Form State
  const [newTitle, setNewTitle] = useState("");
  const [newIdeaCountry, setNewIdeaCountry] = useState("NL");
  const [newBands, setNewBands] = useState("");
  const [newPeriod, setNewPeriod] = useState("");
  const [newIdeaContactPerson, setNewIdeaContactPerson] = useState("");
  const [newIdeaContactEmail, setNewIdeaContactEmail] = useState("");
  const [newIdeaContactPhone, setNewIdeaContactPhone] = useState("");
  const [newIdeaNotes, setNewIdeaNotes] = useState("");

  useEffect(() => {
    localStorage.setItem("band_events_v3", JSON.stringify(shows));
  }, [shows]);

  useEffect(() => {
    localStorage.setItem("band_ideas", JSON.stringify(tourIdeas));
  }, [tourIdeas]);

  // Onthoud de actieve gebruiker
  const handleUserChange = (newUser: string) => {
    setCurrentUser(newUser);
    setOwner(newUser);
    localStorage.setItem("band_active_user", newUser);
  };

  const sortedShows = [...shows].sort((a, b) => a.date.localeCompare(b.date));
  const filteredShows = sortedShows.filter((s) => s.date && s.date.startsWith(selectedYear));

  useEffect(() => {
    if (activeTab === "agenda" && filteredShows.length > 0) {
      const today = getTodayString();
      const upcomingShow = filteredShows.find((s) => s.date >= today);
      if (upcomingShow) {
        setTimeout(() => {
          const el = document.getElementById(`show-${upcomingShow.id}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [activeTab, selectedYear]);

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
    setPaymentMethod("cash");
    setBreakEvenInfo("");
    setOwner(currentUser);
    setDrivers("");
    setTransportMethod("");
    setTransportCost("");
    setIsFormOpen(false);
  };

  const resetIdeaForm = () => {
    setNewTitle("");
    setNewIdeaCountry("NL");
    setNewBands("");
    setNewPeriod("");
    setNewIdeaContactPerson("");
    setNewIdeaContactEmail("");
    setNewIdeaContactPhone("");
    setNewIdeaNotes("");
    setIsIdeaFormOpen(false);
  };

  // Toggle functionaliteit voor knoppen
  const toggleShowForm = () => {
    setIsBlockModalOpen(false);
    setIsFormOpen((prev) => !prev);
  };

  const toggleBlockModal = () => {
    setIsFormOpen(false);
    setIsBlockModalOpen((prev) => !prev);
  };

  const toggleIdeaForm = () => {
    setIsIdeaFormOpen((prev) => !prev);
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
      paymentMethod,
      breakEvenInfo: breakEvenInfo || undefined,
      owner,
      drivers: drivers || undefined,
      transportMethod: transportMethod || undefined,
      transportCost: transportCost || undefined,
    };

    if (editingId) {
      setShows(shows.map((s) => (s.id === editingId ? showData : s)));
    } else {
      setShows([...shows, showData]);
    }

    resetShowForm();
  };

  const handleSaveBlockDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) return;

    // Naam om in de historie te tonen (korte weergave zonder superadmin label)
    const displayName = currentUser.replace(" (Superadmin)", "");

    const existingIndex = shows.findIndex((s) => s.date === blockDate && s.isBlocked);

    if (existingIndex !== -1) {
      const existing = shows[existingIndex];
      const names = existing.blockedBy ? existing.blockedBy.split(", ").map(n => n.trim()) : [];

      if (!names.includes(displayName)) {
        names.push(displayName);
      }

      const updated = [...shows];
      updated[existingIndex] = { ...existing, blockedBy: names.join(", ") };
      setShows(updated);
    } else {
      const blockData: DateItem = {
        id: Date.now().toString(),
        date: blockDate,
        country: "NL",
        city: "GEBLOKKEERD",
        venue: "",
        status: "cancelled",
        isBlocked: true,
        blockedBy: displayName,
      };
      setShows([...shows, blockData]);
    }

    setIsBlockModalOpen(false);
  };

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const idea: TourIdea = {
      id: Date.now().toString(),
      title: newTitle,
      country: newIdeaCountry,
      supportBands: newBands || undefined,
      targetPeriod: newPeriod || undefined,
      contactPerson: newIdeaContactPerson || undefined,
      contactEmail: newIdeaContactEmail || undefined,
      contactPhone: newIdeaContactPhone || undefined,
      notes: newIdeaNotes || undefined,
      isScratched: false,
    };

    setTourIdeas([...tourIdeas, idea]);
    resetIdeaForm();
  };

  const handleToggleScratchIdea = (id: string) => {
    setTourIdeas(tourIdeas.map((i) => (i.id === id ? { ...i, isScratched: !i.isScratched } : i)));
  };

  const handleDeleteIdea = (id: string) => {
    if (confirm("Weet je zeker dat je dit idee wilt verwijderen?")) {
      setTourIdeas(tourIdeas.filter((i) => i.id !== id));
    }
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
    setPaymentMethod(show.paymentMethod || "cash");
    setBreakEvenInfo(show.breakEvenInfo || "");
    setOwner(show.owner || currentUser);
    setDrivers(show.drivers || "");
    setTransportMethod(show.transportMethod || "");
    setTransportCost(show.transportCost || "");

    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Weet je zeker dat je dit item wilt verwijderen?")) {
      setShows((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: ShowStatus) => {
    setShows((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "band2026") {
      setIsAuthenticated(true);
      localStorage.setItem("band_auth", "true");
    }
  };

  const availableYears = Array.from(
    new Set([
      new Date().getFullYear().toString(),
      (new Date().getFullYear() + 1).toString(),
      ...shows.map((s) => s.date ? s.date.substring(0, 4) : ""),
    ])
  ).filter(Boolean).sort();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded border border-zinc-800 max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold text-red-500 text-center uppercase font-mono">Band Access</h2>
          <input
            type="password"
            placeholder="Wachtwoord"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full p-3 bg-black border border-zinc-700 rounded text-white text-center font-mono"
          />
          <button type="submit" className="w-full py-3 bg-red-600 text-white font-bold uppercase text-xs rounded font-mono">
            Inloggen
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-3 md:p-8 font-sans max-w-4xl mx-auto space-y-6">
      {/* HEADER MET SUPERADMIN ACCOUNT SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] md:text-xs text-zinc-400 uppercase font-bold">Inlog Account:</span>
          <select
            value={currentUser}
            onChange={(e) => handleUserChange(e.target.value)}
            className="bg-zinc-900 border border-red-900/60 text-red-400 text-xs font-bold py-1 px-2 rounded focus:outline-none focus:border-red-500 cursor-pointer"
          >
            {BAND_MEMBERS.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => { setIsAuthenticated(false); localStorage.removeItem("band_auth"); }}
          className="text-xs text-red-500 hover:underline cursor-pointer"
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

      {/* TAB 1: AGENDA */}
      {activeTab === "agenda" && (
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between bg-zinc-900 p-3 rounded border border-zinc-800 font-mono">
            <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">SELECTEER JAAR:</span>
            <button
              type="button"
              onClick={() => setIsYearModalOpen(true)}
              className="bg-black border border-red-600 hover:border-red-500 rounded px-4 py-2 text-base font-extrabold text-white flex items-center gap-2 cursor-pointer"
            >
              <span>{selectedYear}</span>
              <span className="text-xs text-zinc-400">▼</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono">
            <button
              type="button"
              onClick={toggleShowForm}
              className={`w-full py-3 font-bold uppercase text-xs tracking-widest rounded transition-all cursor-pointer shadow border ${
                isFormOpen
                  ? "bg-zinc-800 border-zinc-600 text-zinc-300"
                  : "bg-red-600 hover:bg-red-700 border-red-600 text-white"
              }`}
            >
              {isFormOpen ? "✕ SLUIT FORMULIER" : "+ NIEUWE SHOW TOEVOEGEN"}
            </button>
            <button
              type="button"
              onClick={toggleBlockModal}
              className={`w-full py-3 font-bold uppercase text-xs tracking-widest rounded transition-all cursor-pointer shadow border ${
                isBlockModalOpen
                  ? "bg-zinc-800 border-zinc-600 text-zinc-300"
                  : "bg-zinc-900 hover:bg-zinc-800 text-red-400 border-red-900/50"
              }`}
            >
              {isBlockModalOpen ? "✕ SLUIT BLOKKEREN" : "+ DATUM BLOKKEN 🚫"}
            </button>
          </div>

          {isFormOpen && (
            <form onSubmit={handleSaveShow} className="p-4 bg-zinc-900 rounded border border-zinc-800 space-y-4 font-mono">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-bold uppercase text-red-500 tracking-wider">
                  {editingId ? "✏️ Show Bewerken" : "+ Nieuwe Show Toevoegen"}
                </h3>
                <button
                  type="button"
                  onClick={resetShowForm}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-red-950 border border-red-600 text-red-500 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Datum</label>
                  <CustomDatePicker value={date} onChange={(newDate) => setDate(newDate)} />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Land</label>
                  <button
                    type="button"
                    onClick={() => { setCountryModalTarget("show"); setIsCountryModalOpen(true); }}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white text-left flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <CountryFlag code={country} />
                      {COUNTRIES.find((c) => c.code === country)?.name || country}
                    </span>
                    <span className="text-[10px] text-zinc-400">▼</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Stad</label>
                  <input
                    type="text"
                    placeholder="Stadnaam..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Zaal / Venue</label>
                  <input
                    type="text"
                    placeholder="Zaalnaam..."
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Andere Bands</label>
                  <input
                    type="text"
                    placeholder="Support / Co-headliners..."
                    value={otherbands}
                    onChange={(e) => setOtherbands(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Status</label>
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
                <span className="text-[11px] font-bold text-zinc-400 uppercase block mb-2">💰 Financiën & Gage</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Gage Bedrag (€)"
                    value={guaranteedFee}
                    onChange={(e) => setGuaranteedFee(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as "cash" | "wire")}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  >
                    <option value="cash">💵 Cash (Contant)</option>
                    <option value="wire">🏛️ Wire (Bankoverschrijving)</option>
                  </select>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  >
                    {BAND_MEMBERS.map((m) => (
                      <option key={m} value={m}>Show Eigenaar: {m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase block mb-2">🚗 Vervoer & Kosten</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Chauffeur(s)..."
                    value={drivers}
                    onChange={(e) => setDrivers(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Vervoer (Bus, Vliegtuig, Trein...)"
                    value={transportMethod}
                    onChange={(e) => setTransportMethod(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="Totale Vervoerskosten (€)"
                    value={transportCost}
                    onChange={(e) => setTransportCost(e.target.value)}
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
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs tracking-widest rounded transition-all cursor-pointer"
              >
                OPSLAAN
              </button>
            </form>
          )}

          {isBlockModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
              <form onSubmit={handleSaveBlockDate} className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-xs w-full p-5 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <h3 className="text-sm font-bold uppercase text-red-500">🚫 Datum Blokken</h3>
                  <button type="button" onClick={() => setIsBlockModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Datum om te blokkeren</label>
                  <CustomDatePicker value={blockDate} onChange={(d) => setBlockDate(d)} />
                </div>
                <div className="p-2.5 bg-black border border-zinc-800 rounded text-xs text-zinc-400">
                  Blokkade wordt toegevoegd op naam van: <strong className="text-red-400">{currentUser}</strong>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-xs rounded transition-all cursor-pointer"
                >
                  BLOKKADE OPSLAAN
                </button>
              </form>
            </div>
          )}

          <div className="space-y-3 font-mono">
            <h2 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
              AGENDA {selectedYear} ({filteredShows.length})
            </h2>

            {filteredShows.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">Geen optredens of blokkades gevonden voor {selectedYear}.</p>
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

      {/* TAB 2: TOUR IDEAS & CONCEPTS */}
      {activeTab === "ideas" && (
        <div className="space-y-4 md:space-y-6 font-mono">
          <button
            type="button"
            onClick={toggleIdeaForm}
            className={`w-full py-3 font-bold uppercase text-xs tracking-widest rounded transition-all cursor-pointer shadow border ${
              isIdeaFormOpen
                ? "bg-zinc-800 border-zinc-600 text-zinc-300"
                : "bg-red-600 hover:bg-red-700 border-red-600 text-white"
            }`}
          >
            {isIdeaFormOpen ? "✕ SLUIT FORMULIER" : "+ NIEUW TOUR IDEE TOEVOEGEN"}
          </button>

          {isIdeaFormOpen && (
            <form onSubmit={handleAddIdea} className="p-4 bg-zinc-900 rounded border border-zinc-800 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-bold uppercase text-red-500 tracking-wider">+ Nieuw Tour Idee Toevoegen</h3>
                <button
                  type="button"
                  onClick={resetIdeaForm}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-red-950 border border-red-600 text-red-500 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Titel / Tour Concept</label>
                  <input
                    type="text"
                    placeholder="Bijv. UK Tour, Japan Run..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Land</label>
                  <button
                    type="button"
                    onClick={() => { setCountryModalTarget("idea"); setIsCountryModalOpen(true); }}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white text-left flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <CountryFlag code={newIdeaCountry} />
                      {COUNTRIES.find((c) => c.code === newIdeaCountry)?.name || newIdeaCountry}
                    </span>
                    <span className="text-[10px] text-zinc-400">▼</span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Doelperiode</label>
                  <input
                    type="text"
                    placeholder="Bijv. Najaar 2027, SEP 2027..."
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Samen met bands</label>
                  <input
                    type="text"
                    placeholder="Co-headliners of support bands..."
                    value={newBands}
                    onChange={(e) => setNewBands(e.target.value)}
                    className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase block mb-2">👤 Contactpersoon / Agent</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Naam contactpersoon"
                    value={newIdeaContactPerson}
                    onChange={(e) => setNewIdeaContactPerson(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                  <input
                    type="email"
                    placeholder="E-mailadres"
                    value={newIdeaContactEmail}
                    onChange={(e) => setNewIdeaContactEmail(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Telefoonnummer"
                    value={newIdeaContactPhone}
                    onChange={(e) => setNewIdeaContactPhone(e.target.value)}
                    className="p-2 bg-black border border-zinc-700 rounded text-xs text-white"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3">
                <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1">📝 Opmerkingen & Notities</label>
                <textarea
                  placeholder="Bijzonderheden, logistieke ideeën, mogelijke zalen..."
                  value={newIdeaNotes}
                  onChange={(e) => setNewIdeaNotes(e.target.value)}
                  className="w-full p-2 bg-black border border-zinc-700 rounded text-xs text-white h-16"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-xs rounded transition-all cursor-pointer"
              >
                IDEE TOEVOEGEN
              </button>
            </form>
          )}

          {/* IDEEËN LIJST WEERGAVE */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
              TOUR CONCEPTEN & IDEEËN ({tourIdeas.length})
            </h2>

            {tourIdeas.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">Nog geen tour concepten ingevoerd.</p>
            ) : (
              tourIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className={`p-4 bg-zinc-900 border rounded space-y-2 ${
                    idea.isScratched ? "border-zinc-800 opacity-50" : "border-zinc-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className={`text-base font-bold flex items-center gap-2 ${idea.isScratched ? "line-through text-zinc-500" : "text-white"}`}>
                      <span>{idea.title}</span>
                      {idea.country && <CountryFlag code={idea.country} />}
                    </h3>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleScratchIdea(idea.id)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs rounded uppercase cursor-pointer"
                      >
                        {idea.isScratched ? "Herstellen" : "Doorstrepen"}
                      </button>
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900 text-xs rounded uppercase cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {idea.supportBands && (
                    <p className="text-xs text-zinc-300">
                      <span className="text-zinc-500">Bands:</span> ({idea.supportBands})
                    </p>
                  )}
                  {idea.targetPeriod && (
                    <p className="text-xs text-amber-500/90 font-bold">
                      <span className="text-zinc-500 font-normal">Periode:</span> {idea.targetPeriod}
                    </p>
                  )}

                  {(idea.contactPerson || idea.contactEmail || idea.contactPhone) && (
                    <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                      <span className="text-zinc-500">Contact:</span> {idea.contactPerson || "Onbekend"}
                      {idea.contactEmail && ` (${idea.contactEmail})`}
                      {idea.contactPhone && ` - ${idea.contactPhone}`}
                    </div>
                  )}

                  {idea.notes && (
                    <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                      <span className="text-zinc-500 block mb-0.5">Opmerkingen:</span>
                      <p className="text-zinc-300 whitespace-pre-line">{idea.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL VOOR LAND KEUZE */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-xs w-full p-4 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-bold uppercase text-zinc-200">Kies Land</h3>
              <button type="button" onClick={() => setIsCountryModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {COUNTRIES.map((item) => {
                const isSelected = countryModalTarget === "show" ? country === item.code : newIdeaCountry === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      if (countryModalTarget === "show") {
                        setCountry(item.code);
                      } else {
                        setNewIdeaCountry(item.code);
                      }
                      setIsCountryModalOpen(false);
                    }}
                    className={`w-full p-2 rounded text-xs font-bold text-left border flex justify-between items-center cursor-pointer ${
                      isSelected ? "bg-red-950 text-red-400 border-red-500" : "bg-black/50 text-zinc-300 border-zinc-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <CountryFlag code={item.code} />
                      {item.name} ({item.code})
                    </span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL VOOR JAAR KEUZE */}
      {isYearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-xs w-full p-4 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-bold uppercase text-zinc-200">Kies Jaar</h3>
              <button type="button" onClick={() => setIsYearModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-1">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => { setSelectedYear(yr); setIsYearModalOpen(false); }}
                  className={`w-full p-2.5 rounded text-xs font-bold text-left border flex justify-between items-center cursor-pointer ${
                    selectedYear === yr ? "bg-red-950 text-red-400 border-red-500" : "bg-black/50 text-zinc-300 border-zinc-800"
                  }`}
                >
                  <span>Jaar {yr}</span>
                  {selectedYear === yr && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BandDashboard;
