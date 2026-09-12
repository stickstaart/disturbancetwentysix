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
  owner?: string;
}

export type ThemeType = "ORIGINAL" | "80ies Miami" | "Horror" | "Superdark" | "Superlight" | "Lemon" | "Nerd";

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

// Thema Kleurenschema Definities (Zonder aanpassing van font-size of font-family)
const THEME_CONFIGS: Record<ThemeType, { bg: string; cardBg: string; text: string; border: string; primaryBtn: string; accentText: string }> = {
  ORIGINAL: {
    bg: "bg-black",
    cardBg: "bg-zinc-900",
    text: "text-gray-100",
    border: "border-zinc-800",
    primaryBtn: "bg-red-600 hover:bg-red-700 border-red-600 text-white",
    accentText: "text-red-500",
  },
  "80ies Miami": {
    bg: "bg-slate-950",
    cardBg: "bg-fuchsia-950/40",
    text: "text-cyan-200",
    border: "border-pink-500/40",
    primaryBtn: "bg-pink-600 hover:bg-pink-500 border-pink-400 text-white font-bold",
    accentText: "text-pink-400",
  },
  Horror: {
    bg: "bg-stone-950",
    cardBg: "bg-red-950/20",
    text: "text-stone-300",
    border: "border-red-900/60",
    primaryBtn: "bg-red-900 hover:bg-red-800 border-red-700 text-red-100",
    accentText: "text-red-600",
  },
  Superdark: {
    bg: "bg-black",
    cardBg: "bg-zinc-950",
    text: "text-zinc-400",
    border: "border-zinc-900",
    primaryBtn: "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200",
    accentText: "text-zinc-200",
  },
  Superlight: {
    bg: "bg-gray-100",
    cardBg: "bg-white",
    text: "text-gray-900",
    border: "border-gray-300",
    primaryBtn: "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white",
    accentText: "text-blue-600",
  },
  Lemon: {
    bg: "bg-zinc-950",
    cardBg: "bg-zinc-900",
    text: "text-yellow-100",
    border: "border-yellow-500/30",
    primaryBtn: "bg-yellow-500 hover:bg-yellow-400 text-black font-bold border-yellow-400",
    accentText: "text-yellow-400",
  },
  Nerd: {
    bg: "bg-black",
    cardBg: "bg-black",
    text: "text-green-500",
    border: "border-green-600/60",
    primaryBtn: "bg-green-950 hover:bg-green-900 border-green-500 text-green-400",
    accentText: "text-green-400",
  },
};

const getTodayString = () => new Date().toISOString().split("T")[0];

const BandDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem("band_auth") === "true");
  const [passwordInput, setPasswordInput] = useState("");

  // Thema State
  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem("band_theme") as ThemeType) || "ORIGINAL";
  });

  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem("band_active_user") || "Joz (Superadmin)";
  });

  const [activeTab, setActiveTab] = useState<"agenda" | "ideas">("agenda");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const [isYearModalOpen, setIsYearModalOpen] = useState<boolean>(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState<boolean>(false);
  const [countryModalTarget, setCountryModalTarget] = useState<"show" | "idea">("show");

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
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);

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
  const [ideaOwner, setIdeaOwner] = useState(currentUser);

  const isSuperadmin = currentUser === "Joz (Superadmin)";
  const themeStyle = THEME_CONFIGS[theme] || THEME_CONFIGS.ORIGINAL;

  useEffect(() => {
    localStorage.setItem("band_events_v3", JSON.stringify(shows));
  }, [shows]);

  useEffect(() => {
    localStorage.setItem("band_ideas", JSON.stringify(tourIdeas));
  }, [tourIdeas]);

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem("band_theme", newTheme);
  };

  const handleUserChange = (newUser: string) => {
    setCurrentUser(newUser);
    if (!editingId) setOwner(newUser);
    if (!editingIdeaId) setIdeaOwner(newUser);
    localStorage.setItem("band_active_user", newUser);
  };

  const sortedShows = [...shows].sort((a, b) => a.date.localeCompare(b.date));
  const filteredShows = sortedShows.filter((s) => s.date && s.date.startsWith(selectedYear));

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
    setEditingIdeaId(null);
    setNewTitle("");
    setNewIdeaCountry("NL");
    setNewBands("");
    setNewPeriod("");
    setNewIdeaContactPerson("");
    setNewIdeaContactEmail("");
    setNewIdeaContactPhone("");
    setNewIdeaNotes("");
    setIdeaOwner(currentUser);
    setIsIdeaFormOpen(false);
  };

  const toggleShowForm = () => {
    setIsBlockModalOpen(false);
    if (isFormOpen) {
      resetShowForm();
    } else {
      setIsFormOpen(true);
    }
  };

  const toggleBlockModal = () => {
    setIsFormOpen(false);
    setIsBlockModalOpen((prev) => !prev);
  };

  const toggleIdeaForm = () => {
    if (isIdeaFormOpen) {
      resetIdeaForm();
    } else {
      setIsIdeaFormOpen(true);
    }
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

    const displayName = currentUser.replace(" (Superadmin)", "");
    const existingIndex = shows.findIndex((s) => s.date === blockDate && s.isBlocked);

    if (existingIndex !== -1) {
      const existing = shows[existingIndex];
      const names = existing.blockedBy ? existing.blockedBy.split(", ").map((n) => n.trim()) : [];
      if (!names.includes(displayName)) names.push(displayName);

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

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const ideaData: TourIdea = {
      id: editingIdeaId || Date.now().toString(),
      title: newTitle,
      country: newIdeaCountry,
      supportBands: newBands || undefined,
      targetPeriod: newPeriod || undefined,
      contactPerson: newIdeaContactPerson || undefined,
      contactEmail: newIdeaContactEmail || undefined,
      contactPhone: newIdeaContactPhone || undefined,
      notes: newIdeaNotes || undefined,
      isScratched: false,
      owner: ideaOwner,
    };

    if (editingIdeaId) {
      setTourIdeas(tourIdeas.map((i) => (i.id === editingIdeaId ? ideaData : i)));
    } else {
      setTourIdeas([...tourIdeas, ideaData]);
    }

    resetIdeaForm();
  };

  const handleEditIdeaClick = (idea: TourIdea) => {
    setEditingIdeaId(idea.id);
    setNewTitle(idea.title);
    setNewIdeaCountry(idea.country || "NL");
    setNewBands(idea.supportBands || "");
    setNewPeriod(idea.targetPeriod || "");
    setNewIdeaContactPerson(idea.contactPerson || "");
    setNewIdeaContactEmail(idea.contactEmail || "");
    setNewIdeaContactPhone(idea.contactPhone || "");
    setNewIdeaNotes(idea.notes || "");
    setIdeaOwner(idea.owner || currentUser);

    setIsIdeaFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <div className={`min-h-screen ${themeStyle.bg} ${themeStyle.text} flex items-center justify-center p-4 font-mono`}>
        <form onSubmit={handleLogin} className={`${themeStyle.cardBg} p-8 rounded border ${themeStyle.border} max-w-sm w-full space-y-4`}>
          <h2 className={`text-xl font-bold ${themeStyle.accentText} text-center uppercase`}>Band Access</h2>
          <input
            type="password"
            placeholder="Wachtwoord"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full p-3 bg-black/50 border border-zinc-700 rounded text-center text-white"
          />
          <button type="submit" className={`w-full py-3 ${themeStyle.primaryBtn} font-bold uppercase text-xs rounded`}>
            Inloggen
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeStyle.bg} ${themeStyle.text} p-3 md:p-8 font-sans transition-colors duration-200`}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER MET SUPERADMIN ACCOUNT SWITCHER + THEME SELECTOR */}
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${themeStyle.border} pb-3 font-mono`}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] md:text-xs opacity-70 uppercase font-bold">Account:</span>
              <select
                value={currentUser}
                onChange={(e) => handleUserChange(e.target.value)}
                className={`bg-black/40 border ${themeStyle.border} ${themeStyle.accentText} text-xs font-bold py-1 px-2 rounded focus:outline-none cursor-pointer`}
              >
                {BAND_MEMBERS.map((member) => (
                  <option key={member} value={member} className="bg-black text-white">
                    {member}
                  </option>
                ))}
              </select>
            </div>

            {/* THEMA KIEZER */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] md:text-xs opacity-70 uppercase font-bold">🎨 Thema:</span>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as ThemeType)}
                className={`bg-black/40 border ${themeStyle.border} ${themeStyle.accentText} text-xs font-bold py-1 px-2 rounded focus:outline-none cursor-pointer`}
              >
                <option value="ORIGINAL" className="bg-black text-white">ORIGINAL</option>
                <option value="80ies Miami" className="bg-black text-white">80ies Miami</option>
                <option value="Horror" className="bg-black text-white">Horror</option>
                <option value="Superdark" className="bg-black text-white">Superdark</option>
                <option value="Superlight" className="bg-white text-black">Superlight</option>
                <option value="Lemon" className="bg-black text-white">Lemon</option>
                <option value="Nerd" className="bg-black text-white">Nerd</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => { setIsAuthenticated(false); localStorage.removeItem("band_auth"); }}
            className={`text-xs ${themeStyle.accentText} hover:underline cursor-pointer`}
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
                ? `${themeStyle.cardBg} ${themeStyle.border} ${themeStyle.accentText}`
                : "bg-black/30 border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            📆 AGENDA & SHOWS
          </button>
          <button
            onClick={() => { setActiveTab("ideas"); resetIdeaForm(); }}
            className={`flex-1 py-3 px-2 text-xs font-bold uppercase rounded border transition-colors flex items-center justify-center gap-2 cursor-pointer font-mono ${
              activeTab === "ideas"
                ? `${themeStyle.cardBg} ${themeStyle.border} ${themeStyle.accentText}`
                : "bg-black/30 border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            ✈️ TOUR IDEAS & CONCEPTS
          </button>
        </div>

        {/* TAB 1: AGENDA */}
        {activeTab === "agenda" && (
          <div className="space-y-4 md:space-y-6">
            <div className={`flex items-center justify-between ${themeStyle.cardBg} p-3 rounded border ${themeStyle.border} font-mono`}>
              <span className="text-xs font-bold uppercase opacity-70 tracking-wider">SELECTEER JAAR:</span>
              <button
                type="button"
                onClick={() => setIsYearModalOpen(true)}
                className={`bg-black/50 border ${themeStyle.border} rounded px-4 py-2 text-base font-extrabold flex items-center gap-2 cursor-pointer`}
              >
                <span>{selectedYear}</span>
                <span className="text-xs opacity-50">▼</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono">
              <button
                type="button"
                onClick={toggleShowForm}
                className={`w-full py-3 font-bold uppercase text-xs tracking-widest rounded transition-all cursor-pointer shadow border ${
                  isFormOpen ? "bg-zinc-800 border-zinc-600 text-zinc-300" : themeStyle.primaryBtn
                }`}
              >
                {isFormOpen ? "✕ SLUIT FORMULIER" : "+ NIEUWE SHOW TOEVOEGEN"}
              </button>
              <button
                type="button"
                onClick={toggleBlockModal}
                className={`w-full py-3 font-bold uppercase text-xs tracking-widest rounded transition-all cursor-pointer shadow border ${
                  isBlockModalOpen ? "bg-zinc-800 border-zinc-600 text-zinc-300" : `${themeStyle.cardBg} ${themeStyle.border} ${themeStyle.accentText}`
                }`}
              >
                {isBlockModalOpen ? "✕ SLUIT BLOKKEREN" : "+ DATUM BLOKKEN 🚫"}
              </button>
            </div>

            {isFormOpen && (
              <form onSubmit={handleSaveShow} className={`p-4 ${themeStyle.cardBg} rounded border ${themeStyle.border} space-y-4 font-mono`}>
                <div className={`flex justify-between items-center border-b ${themeStyle.border} pb-2`}>
                  <h3 className={`text-sm font-bold uppercase ${themeStyle.accentText} tracking-wider`}>
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
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Datum</label>
                    <CustomDatePicker value={date} onChange={(newDate) => setDate(newDate)} />
                  </div>

                  <div>
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Land</label>
                    <button
                      type="button"
                      onClick={() => { setCountryModalTarget("show"); setIsCountryModalOpen(true); }}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs text-left flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <CountryFlag code={country} />
                        {COUNTRIES.find((c) => c.code === country)?.name || country}
                      </span>
                      <span className="text-[10px] opacity-50">▼</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Stad</label>
                    <input
                      type="text"
                      placeholder="Stadnaam..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Zaal / Venue</label>
                    <input
                      type="text"
                      placeholder="Zaalnaam..."
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Andere Bands</label>
                    <input
                      type="text"
                      placeholder="Support / Co-headliners..."
                      value={otherbands}
                      onChange={(e) => setOtherbands(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ShowStatus)}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    >
                      <option value="option" className="bg-black text-white">In Optie (Oranje)</option>
                      <option value="confirmed" className="bg-black text-white">Bevestigd (Groen)</option>
                      <option value="cancelled" className="bg-black text-white">Geannuleerd (Rood)</option>
                    </select>
                  </div>
                </div>

                <div className={`border-t ${themeStyle.border} pt-3`}>
                  <span className="text-[11px] font-bold opacity-70 uppercase block mb-2">👤 Contactpersoon Show</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Naam contactpersoon"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                    <input
                      type="email"
                      placeholder="E-mailadres"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Telefoonnummer"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                  </div>
                </div>

                <div className={`border-t ${themeStyle.border} pt-3`}>
                  <span className="text-[11px] font-bold opacity-70 uppercase block mb-2">💰 Financiën & Gage</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Gage Bedrag (€)"
                      value={guaranteedFee}
                      onChange={(e) => setGuaranteedFee(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as "cash" | "wire")}
                      className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    >
                      <option value="cash" className="bg-black text-white">💵 Cash (Contant)</option>
                      <option value="wire" className="bg-black text-white">🏛️ Wire (Bankoverschrijving)</option>
                    </select>

                    {isSuperadmin ? (
                      <select
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                      >
                        {BAND_MEMBERS.map((m) => (
                          <option key={m} value={m} className="bg-black text-white">Eigenaar: {m}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2 bg-black/40 border border-zinc-800 rounded text-xs opacity-70 flex items-center">
                        Eigenaar: <strong className="ml-1">{owner}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`border-t ${themeStyle.border} pt-3`}>
                  <span className="text-[11px] font-bold opacity-70 uppercase block mb-2">🚗 Vervoer & Kosten</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Chauffeur(s)..."
                      value={drivers}
                      onChange={(e) => setDrivers(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Vervoer (Bus, Vliegtuig...)"
                      value={transportMethod}
                      onChange={(e) => setTransportMethod(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Totale Vervoerskosten (€)"
                      value={transportCost}
                      onChange={(e) => setTransportCost(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                  </div>
                  <textarea
                    placeholder="Break-even afspraken / Bijzonderheden..."
                    value={breakEvenInfo}
                    onChange={(e) => setBreakEvenInfo(e.target.value)}
                    className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs h-14"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 ${themeStyle.primaryBtn} font-bold uppercase text-xs tracking-widest rounded transition-all cursor-pointer`}
                >
                  OPSLAAN
                </button>
              </form>
            )}

            {isBlockModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
                <form onSubmit={handleSaveBlockDate} className={`${themeStyle.cardBg} border ${themeStyle.border} rounded-lg max-w-xs w-full p-5 space-y-4 shadow-2xl`}>
                  <div className={`flex justify-between items-center border-b ${themeStyle.border} pb-2`}>
                    <h3 className={`text-sm font-bold uppercase ${themeStyle.accentText}`}>🚫 Datum Blokken</h3>
                    <button type="button" onClick={() => setIsBlockModalOpen(false)} className="opacity-70 hover:opacity-100">✕</button>
                  </div>
                  <div>
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Datum om te blokkeren</label>
                    <CustomDatePicker value={blockDate} onChange={(d) => setBlockDate(d)} />
                  </div>
                  <div className="p-2.5 bg-black/40 border border-zinc-800 rounded text-xs opacity-70">
                    Blokkade op naam van: <strong className={themeStyle.accentText}>{currentUser}</strong>
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-2.5 ${themeStyle.primaryBtn} font-bold uppercase text-xs rounded transition-all cursor-pointer`}
                  >
                    BLOKKADE OPSLAAN
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-3 font-mono">
              <h2 className="text-xs font-bold uppercase opacity-70 tracking-wider">
                AGENDA {selectedYear} ({filteredShows.length})
              </h2>

              {filteredShows.length === 0 ? (
                <p className="text-xs opacity-50 italic">Geen optredens of blokkades gevonden voor {selectedYear}.</p>
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
                  : themeStyle.primaryBtn
              }`}
            >
              {isIdeaFormOpen
                ? "✕ SLUIT FORMULIER"
                : editingIdeaId
                  ? "✏️ TOUR IDEE BEWERKEN"
                  : "+ NIEUW TOUR IDEE TOEVOEGEN"}
            </button>

            {isIdeaFormOpen && (
              <form onSubmit={handleSaveIdea} className={`p-4 ${themeStyle.cardBg} rounded border ${themeStyle.border} space-y-4`}>
                <div className={`flex justify-between items-center border-b ${themeStyle.border} pb-2`}>
                  <h3 className={`text-sm font-bold uppercase ${themeStyle.accentText} tracking-wider`}>
                    {editingIdeaId ? "✏️ Tour Idee Bewerken" : "+ Nieuw Tour Idee Toevoegen"}
                  </h3>
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
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Titel / Tour Concept</label>
                    <input
                      type="text"
                      placeholder="Bijv. UK Tour, Japan Run..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Land</label>
                    <button
                      type="button"
                      onClick={() => { setCountryModalTarget("idea"); setIsCountryModalOpen(true); }}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs text-left flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <CountryFlag code={newIdeaCountry} />
                        {COUNTRIES.find((c) => c.code === newIdeaCountry)?.name || newIdeaCountry}
                      </span>
                      <span className="text-[10px] opacity-50">▼</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Doelperiode</label>
                    <input
                      type="text"
                      placeholder="Bijv. Najaar 2027..."
                      value={newPeriod}
                      onChange={(e) => setNewPeriod(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Samen met bands</label>
                    <input
                      type="text"
                      placeholder="Co-headliners..."
                      value={newBands}
                      onChange={(e) => setNewBands(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] opacity-70 uppercase block mb-1">Tour-eigenaar</label>
                    {isSuperadmin ? (
                      <select
                        value={ideaOwner}
                        onChange={(e) => setIdeaOwner(e.target.value)}
                        className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                      >
                        {BAND_MEMBERS.map((m) => (
                          <option key={m} value={m} className="bg-black text-white">
                            Eigenaar: {m}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full p-2 bg-black/40 border border-zinc-800 rounded text-xs opacity-80">
                        {ideaOwner}
                      </div>
                    )}
                  </div>
                </div>

                <div className={`border-t ${themeStyle.border} pt-3`}>
                  <span className="text-[11px] font-bold opacity-70 uppercase block mb-2">👤 Contactpersoon / Agent</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Naam contactpersoon"
                      value={newIdeaContactPerson}
                      onChange={(e) => setNewIdeaContactPerson(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                    <input
                      type="email"
                      placeholder="E-mailadres"
                      value={newIdeaContactEmail}
                      onChange={(e) => setNewIdeaContactEmail(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Telefoonnummer"
                      value={newIdeaContactPhone}
                      onChange={(e) => setNewIdeaContactPhone(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded text-xs"
                    />
                  </div>
                </div>

                <div className={`border-t ${themeStyle.border} pt-3`}>
                  <label className="text-[11px] font-bold opacity-70 uppercase block mb-1">📝 Opmerkingen & Notities</label>
                  <textarea
                    placeholder="Bijzonderheden..."
                    value={newIdeaNotes}
                    onChange={(e) => setNewIdeaNotes(e.target.value)}
                    className="w-full p-2 bg-black/40 border border-zinc-700 rounded text-xs h-16"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 ${themeStyle.primaryBtn} font-bold uppercase text-xs rounded transition-all cursor-pointer`}
                >
                  {editingIdeaId ? "BEWERKING OPSLAAN" : "IDEE TOEVOEGEN"}
                </button>
              </form>
            )}

            {/* IDEEËN LIJST WEERGAVE */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase opacity-70 tracking-wider">
                TOUR CONCEPTEN & IDEEËN ({tourIdeas.length})
              </h2>

              {tourIdeas.length === 0 ? (
                <p className="text-xs opacity-50 italic">Nog geen tour concepten ingevoerd.</p>
              ) : (
                tourIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className={`p-4 ${themeStyle.cardBg} border rounded space-y-2 ${
                      idea.isScratched ? "border-zinc-800 opacity-50" : themeStyle.border
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className={`text-base font-bold flex items-center gap-2 ${idea.isScratched ? "line-through opacity-50" : ""}`}>
                        <span>{idea.title}</span>
                        {idea.country && <CountryFlag code={idea.country} />}
                      </h3>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditIdeaClick(idea)}
                          className="px-2 py-1 bg-black/40 hover:bg-black/60 border border-zinc-700 text-xs rounded uppercase cursor-pointer"
                        >
                          ✏️ Bewerken
                        </button>
                        <button
                          onClick={() => handleToggleScratchIdea(idea.id)}
                          className="px-2 py-1 bg-black/40 hover:bg-black/60 border border-zinc-700 text-xs rounded uppercase cursor-pointer"
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

                    <div className={`text-[11px] ${themeStyle.accentText} font-bold`}>
                      <span className="opacity-70 font-normal">Tour-eigenaar:</span> {idea.owner || "Onbekend"}
                    </div>

                    {idea.supportBands && (
                      <p className="text-xs">
                        <span className="opacity-70">Bands:</span> ({idea.supportBands})
                      </p>
                    )}
                    {idea.targetPeriod && (
                      <p className={`text-xs ${themeStyle.accentText} font-bold`}>
                        <span className="opacity-70 font-normal">Periode:</span> {idea.targetPeriod}
                      </p>
                    )}

                    {(idea.contactPerson || idea.contactEmail || idea.contactPhone) && (
                      <div className={`text-[11px] opacity-80 pt-1 border-t ${themeStyle.border}`}>
                        <span className="opacity-70">Contact:</span> {idea.contactPerson || "Onbekend"}
                        {idea.contactEmail && ` (${idea.contactEmail})`}
                        {idea.contactPhone && ` - ${idea.contactPhone}`}
                      </div>
                    )}

                    {idea.notes && (
                      <div className={`text-[11px] opacity-80 pt-1 border-t ${themeStyle.border}`}>
                        <span className="opacity-70 block mb-0.5">Opmerkingen:</span>
                        <p className="whitespace-pre-line">{idea.notes}</p>
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
            <div className={`${themeStyle.cardBg} border ${themeStyle.border} rounded-lg max-w-xs w-full p-4 space-y-3 shadow-2xl`}>
              <div className={`flex justify-between items-center border-b ${themeStyle.border} pb-2`}>
                <h3 className="text-sm font-bold uppercase">Kies Land</h3>
                <button type="button" onClick={() => setIsCountryModalOpen(false)} className="opacity-70 hover:opacity-100">✕</button>
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
                        isSelected ? `${themeStyle.cardBg} ${themeStyle.accentText} ${themeStyle.border}` : "bg-black/40 border-zinc-800"
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
            <div className={`${themeStyle.cardBg} border ${themeStyle.border} rounded-lg max-w-xs w-full p-4 space-y-3 shadow-2xl`}>
              <div className={`flex justify-between items-center border-b ${themeStyle.border} pb-2`}>
                <h3 className="text-sm font-bold uppercase">Kies Jaar</h3>
                <button type="button" onClick={() => setIsYearModalOpen(false)} className="opacity-70 hover:opacity-100">✕</button>
              </div>
              <div className="space-y-1">
                {availableYears.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => { setSelectedYear(yr); setIsYearModalOpen(false); }}
                    className={`w-full p-2.5 rounded text-xs font-bold text-left border flex justify-between items-center cursor-pointer ${
                      selectedYear === yr ? `${themeStyle.cardBg} ${themeStyle.accentText} ${themeStyle.border}` : "bg-black/40 border-zinc-800"
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
    </div>
  );
};

export default BandDashboard;
