import React, { useState, useEffect } from "react";
import { CustomDatePicker } from "./dashboard/CustomDatePicker";
import { ShowFormSheet, type ShowDraft } from "./dashboard/ShowForm";
import { ShowCard } from "./dashboard/ShowCard";
import { CountryFlag } from "./dashboard/CountryFlag";
import * as store from "../lib/agendaStore";
import { FiChevronDown, FiLogOut, FiPlus, FiSettings, FiSlash } from "react-icons/fi";
import { useSnapZoom } from "../lib/useSnapZoom";
import { BAND_MEMBERS, COUNTRIES, displayName } from "./dashboard/constants";
import { parseLocalDate, todayString } from "./dashboard/dateUtils";

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
  // Website (TOUR/HISTORY)
  isPublic?: boolean;
  tourName?: string;
  isDummy?: boolean;
  // Audit (gezet door agendaStore)
  createdBy?: string;
  updatedBy?: string;
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
  isDummy?: boolean;
  // Audit (gezet door agendaStore)
  createdBy?: string;
  updatedBy?: string;
}

export type ThemeType = "ORIGINAL" | "80ies Miami" | "Horror" | "Superdark" | "Superlight" | "Lemon" | "Nerd";


// Thema Kleurenschema Definities (Zonder aanpassing van font-size of font-family)
// panelBg = dekkende kleur voor pop-ups en panelen (cardBg is bij veel thema's half-transparant)
const THEME_CONFIGS: Record<ThemeType, { bg: string; cardBg: string; panelBg: string; text: string; border: string; primaryBtn: string; accentText: string }> = {
  ORIGINAL: {
    bg: "bg-black",
    cardBg: "bg-zinc-900",
    panelBg: "bg-zinc-900",
    text: "text-gray-100",
    border: "border-zinc-800",
    primaryBtn: "bg-red-600 hover:bg-red-700 border-red-600 text-white",
    accentText: "text-red-500",
  },
  "80ies Miami": {
    bg: "bg-slate-950",
    cardBg: "bg-fuchsia-950/40",
    panelBg: "bg-[#1e0a26]",
    text: "text-cyan-200",
    border: "border-pink-500/40",
    primaryBtn: "bg-pink-600 hover:bg-pink-500 border-pink-400 text-white font-bold",
    accentText: "text-pink-400",
  },
  Horror: {
    bg: "bg-stone-950",
    cardBg: "bg-red-950/20",
    panelBg: "bg-[#1f0e0c]",
    text: "text-stone-300",
    border: "border-red-900/60",
    primaryBtn: "bg-red-900 hover:bg-red-800 border-red-700 text-red-100",
    accentText: "text-red-600",
  },
  Superdark: {
    bg: "bg-black",
    cardBg: "bg-zinc-950",
    panelBg: "bg-zinc-950",
    text: "text-zinc-400",
    border: "border-zinc-900",
    primaryBtn: "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200",
    accentText: "text-zinc-200",
  },
  Superlight: {
    bg: "bg-gray-100",
    cardBg: "bg-white",
    panelBg: "bg-white",
    text: "text-gray-900",
    border: "border-gray-300",
    primaryBtn: "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white",
    accentText: "text-blue-600",
  },
  Lemon: {
    bg: "bg-zinc-950",
    cardBg: "bg-zinc-900",
    panelBg: "bg-zinc-900",
    text: "text-yellow-100",
    border: "border-yellow-500/30",
    primaryBtn: "bg-yellow-500 hover:bg-yellow-400 text-black font-bold border-yellow-400",
    accentText: "text-yellow-400",
  },
  Nerd: {
    bg: "bg-black",
    cardBg: "bg-black",
    panelBg: "bg-black",
    text: "text-green-500",
    border: "border-green-600/60",
    primaryBtn: "bg-green-950 hover:bg-green-900 border-green-500 text-green-400",
    accentText: "text-green-400",
  },
};

const getTodayString = todayString;

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

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState<boolean>(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState<boolean>(false);

  const [blockDate, setBlockDate] = useState(getTodayString());

  useSnapZoom();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Data komt live uit Firestore (zie src/lib/agendaStore.ts)
  const [shows, setShows] = useState<DateItem[]>([]);
  const [tourIdeas, setTourIdeas] = useState<TourIdea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  // Voorbije maanden zijn standaard dichtgeklapt; hier staan de maanden die je zelf openklapt ("YYYY-MM")
  const [openPastMonths, setOpenPastMonths] = useState<Set<string>>(new Set());
  const togglePastMonth = (key: string) =>
    setOpenPastMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);


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

  // Live-abonnement op Firestore zodra je bent ingelogd
  useEffect(() => {
    if (!isAuthenticated) return;
    const onError = (e: Error) => setSyncError(e.message);
    store.migrateLocalStorage(currentUser);
    const unsubShows = store.subscribeShows((data) => {
      setShows(data);
      setIsLoading(false);
      setSyncError(null);
    }, onError);
    const unsubIdeas = store.subscribeIdeas(setTourIdeas, onError);
    return () => {
      unsubShows();
      unsubIdeas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Fouten bij opslaan zichtbaar maken i.p.v. stil falen
  const run = (p: Promise<unknown>) => p.catch((e: Error) => setSyncError(e.message));

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem("band_theme", newTheme);
  };

  const handleUserChange = (newUser: string) => {
    setCurrentUser(newUser);
    if (!editingIdeaId) setIdeaOwner(newUser);
    localStorage.setItem("band_active_user", newUser);
  };

  const sortedShows = [...shows].sort((a, b) => a.date.localeCompare(b.date));
  const filteredShows = sortedShows.filter((s) => s.date && s.date.startsWith(selectedYear));

  // Groeperen per maand (zoals de kopjes in het Google Doc)
  const today = todayString();
  const nextShowId = filteredShows.find((s) => s.date >= today)?.id;
  const showsByMonth = filteredShows.reduce<{ key: string; label: string; items: DateItem[] }[]>((groups, item) => {
    const key = item.date.substring(0, 7);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      const d = parseLocalDate(item.date);
      const label = d
        ? new Intl.DateTimeFormat("nl-NL", { month: "long", year: "numeric" }).format(d).toUpperCase()
        : key;
      group = { key, label, items: [] };
      groups.push(group);
    }
    group.items.push(item);
    return groups;
  }, []);

  // Bij openen (en jaarwissel) naar de eerstvolgende afspraak scrollen
  const scrolledFor = React.useRef<string | null>(null);
  useEffect(() => {
    if (isLoading || !nextShowId || scrolledFor.current === selectedYear) return;
    scrolledFor.current = selectedYear;
    document.getElementById("today-marker")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [isLoading, nextShowId, selectedYear]);

  const resetShowForm = () => {
    setEditingId(null);
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

  const handleSaveShow = (draft: ShowDraft) => {
    const original = editingId ? shows.find((s) => s.id === editingId) : undefined;
    run(store.saveShow({ ...original, ...draft, id: editingId || store.newId() }, currentUser, !editingId));
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

      run(store.patchShow(existing, { blockedBy: names.join(", ") }, currentUser));
    } else {
      const blockData: DateItem = {
        id: store.newId(),
        date: blockDate,
        country: "NL",
        city: "GEBLOKKEERD",
        venue: "",
        status: "cancelled",
        isBlocked: true,
        blockedBy: displayName,
      };
      run(store.saveShow(blockData, currentUser, true));
    }

    setIsBlockModalOpen(false);
  };

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const ideaData: TourIdea = {
      id: editingIdeaId || store.newId(),
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

    const originalIdea = editingIdeaId ? tourIdeas.find((i) => i.id === editingIdeaId) : undefined;
    run(store.saveIdea(
      { ...originalIdea, ...ideaData, isScratched: originalIdea?.isScratched ?? false },
      currentUser,
      !editingIdeaId,
    ));

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
    const idea = tourIdeas.find((i) => i.id === id);
    if (idea) run(store.patchIdea(id, { isScratched: !idea.isScratched }, currentUser));
  };

  const handleDeleteIdea = (id: string) => {
    if (confirm("Weet je zeker dat je dit idee wilt verwijderen?")) {
      run(store.deleteIdea(id));
    }
  };

  const handleEditClick = (show: DateItem) => {
    setIsBlockModalOpen(false);
    setEditingId(show.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Weet je zeker dat je dit item wilt verwijderen?")) {
      run(store.deleteShow(id));
    }
  };

  const handleStatusChange = (id: string, newStatus: ShowStatus) => {
    const show = shows.find((s) => s.id === id);
    if (show) run(store.patchShow(show, { status: newStatus }, currentUser));
  };

  const handleTogglePublic = (id: string) => {
    const show = shows.find((s) => s.id === id);
    if (show) run(store.patchShow(show, { isPublic: !show.isPublic }, currentUser));
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
      <div className={`min-h-screen ${themeStyle.bg} ${themeStyle.text} flex items-center justify-center p-4 font-mono band-agenda`}>
        <form onSubmit={handleLogin} className={`${themeStyle.cardBg} p-8 rounded-lg border ${themeStyle.border} max-w-sm w-full space-y-4`}>
          <h2 className={`text-xl font-bold ${themeStyle.accentText} text-center uppercase`}>Band Access</h2>
          <input
            type="password"
            placeholder="Wachtwoord"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full p-3 bg-black/50 border border-zinc-700 rounded-lg text-center text-white"
          />
          <button type="submit" className={`w-full py-3 ${themeStyle.primaryBtn} font-bold uppercase text-sm rounded-lg`}>
            Inloggen
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeStyle.bg} ${themeStyle.text} p-3 md:p-8 band-agenda transition-colors duration-200`}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* COMPACTE KOP: titel + wie je bent + instellingen */}
        <header className={`relative flex items-center justify-between gap-3 border-b ${themeStyle.border} pb-3`}>
          <div className="min-w-0">
            <h1 className="font-display text-[28px] font-bold uppercase tracking-wide leading-none">Band-agenda</h1>
            <div className="mt-1 text-sm opacity-70">
              Ingelogd als <span className={`font-semibold ${themeStyle.accentText}`}>{displayName(currentUser)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen((o) => !o)}
            aria-expanded={isSettingsOpen}
            aria-label="Instellingen"
            className={`shrink-0 p-3 rounded-xl border ${themeStyle.border} ${isSettingsOpen ? "bg-white/10" : "bg-black/30"} cursor-pointer`}
          >
            <FiSettings className="text-xl" />
          </button>

          {/* INSTELLINGEN-PANEEL */}
          {isSettingsOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsSettingsOpen(false)} />
              <div className={`absolute right-0 top-full mt-2 z-40 w-[min(20rem,calc(100vw-1.5rem))] p-4 space-y-4 rounded-2xl ${themeStyle.panelBg} border ${themeStyle.border} shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] max-h-[calc(100dvh-8rem)] overflow-y-auto`}>
                {/* Account wisselen: tijdelijk (testen) en straks alleen voor de superadmin */}
                <label className="block">
                  <span className="block mb-1.5 font-mono text-[13px] uppercase tracking-[0.06em] opacity-70">Account (testen / corrigeren)</span>
                  <select
                    value={currentUser}
                    onChange={(e) => handleUserChange(e.target.value)}
                    className={`w-full bg-black/40 border ${themeStyle.border} text-base py-2.5 px-3 rounded-lg focus:outline-none cursor-pointer`}
                  >
                    {BAND_MEMBERS.map((member) => (
                      <option key={member} value={member} className="bg-black text-white">{member}</option>
                    ))}
                  </select>
                </label>

                {/* Thema: tegels met voorbeeld (een native keuzelijst kan geen kleuren tonen op iOS) */}
                <div>
                  <span className="block mb-1.5 font-mono text-[13px] uppercase tracking-[0.06em] opacity-70">Thema</span>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Thema">
                    {(Object.keys(THEME_CONFIGS) as ThemeType[]).map((t) => {
                      const c = THEME_CONFIGS[t];
                      const isActive = theme === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={isActive}
                          onClick={() => handleThemeChange(t)}
                          className={`text-left rounded-xl p-1.5 cursor-pointer transition ring-2 ${isActive ? "ring-white/70" : "ring-transparent hover:ring-white/20"}`}
                        >
                          {/* Mini-voorbeeld: achtergrond, kaart met accenttekst en knop */}
                          <div className={`${c.bg} rounded-lg p-2 border ${c.border}`} aria-hidden="true">
                            <div className={`${c.cardBg} rounded-md border ${c.border} px-2 py-1.5 space-y-1.5`}>
                              <div className={`font-display text-lg font-bold leading-none ${c.accentText}`}>ARNHEM</div>
                              <div className={`h-1.5 w-3/4 rounded-full ${c.text} bg-current opacity-40`} />
                              <div className={`h-3 w-1/2 rounded border ${c.primaryBtn}`} />
                            </div>
                          </div>
                          <div className="mt-1 px-0.5 flex items-center justify-between text-sm">
                            <span className={isActive ? "font-semibold" : "opacity-80"}>{t}</span>
                            {isActive && <span aria-hidden="true">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TESTDATA — alleen zichtbaar bij `npm run dev`, nooit op de live site */}
                {import.meta.env.DEV && isSuperadmin && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { run(store.seedDummyData(currentUser)); setIsSettingsOpen(false); }}
                      className="py-2.5 rounded-lg border border-dashed border-sky-600 text-sky-400 text-sm cursor-pointer"
                    >
                      🧪 Testdata
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (confirm("Alle testdata (isDummy) verwijderen?")) { run(store.clearDummyData()); setIsSettingsOpen(false); } }}
                      className="py-2.5 rounded-lg border border-dashed border-zinc-600 text-zinc-400 text-sm cursor-pointer"
                    >
                      🧹 Wis test
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => { setIsAuthenticated(false); localStorage.removeItem("band_auth"); }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border ${themeStyle.border} ${themeStyle.accentText} text-base font-semibold cursor-pointer`}
                >
                  <FiLogOut /> Uitloggen
                </button>
              </div>
            </>
          )}
        </header>

        {/* SYNC-STATUS (Firestore) */}
        {syncError && (
          <div className="border border-red-500 bg-red-950/60 text-red-200 text-sm font-mono p-3 rounded-lg">
            ⚠️ Synchronisatie mislukt: {syncError}
          </div>
        )}
        {isLoading && !syncError && (
          <div className="text-sm font-mono opacity-60">Agenda laden…</div>
        )}

        {/* HOOFDTABS */}
        <div className="flex gap-1 p-1 rounded-xl bg-black/40 ring-1 ring-white/[0.06]">
          <button
            onClick={() => { setActiveTab("agenda"); resetShowForm(); }}
            className={`flex-1 py-2.5 px-2 text-sm font-semibold uppercase tracking-[0.06em] rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer font-mono ${
              activeTab === "agenda"
                ? `${themeStyle.cardBg} ${themeStyle.border} ${themeStyle.accentText} shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_20px_-10px_rgba(0,0,0,0.9)]`
                : "border-transparent opacity-55 hover:opacity-100"
            }`}
          >
            Agenda & shows
          </button>
          <button
            onClick={() => { setActiveTab("ideas"); resetIdeaForm(); }}
            className={`flex-1 py-2.5 px-2 text-sm font-semibold uppercase tracking-[0.06em] rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer font-mono ${
              activeTab === "ideas"
                ? `${themeStyle.cardBg} ${themeStyle.border} ${themeStyle.accentText} shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_20px_-10px_rgba(0,0,0,0.9)]`
                : "border-transparent opacity-55 hover:opacity-100"
            }`}
          >
            Tour-ideeën
          </button>
        </div>

        {/* TAB 1: AGENDA */}
        {activeTab === "agenda" && (
          <div className="space-y-4 md:space-y-6">
            {/* Jaar (tik om te wisselen) + aantal */}
            <div className="flex items-end justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsYearModalOpen(true)}
                aria-label="Kies jaar"
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="font-display text-5xl font-bold leading-none tabular">{selectedYear}</span>
                <FiChevronDown className="text-2xl opacity-60 mb-1" />
              </button>
              <span className="font-mono text-sm opacity-70 pb-1">
                {filteredShows.filter((s) => !s.isBlocked).length} shows · {filteredShows.filter((s) => s.isBlocked).length} geblokt
              </span>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button
                type="button"
                onClick={toggleShowForm}
                className={`flex items-center justify-center gap-2 py-3.5 font-bold uppercase text-base tracking-wider rounded-xl cursor-pointer shadow border ${themeStyle.primaryBtn}`}
              >
                <FiPlus className="text-lg" /> Nieuwe show
              </button>
              <button
                type="button"
                onClick={toggleBlockModal}
                className={`flex items-center justify-center gap-2 px-4 py-3.5 font-semibold text-base rounded-xl cursor-pointer border ${
                  isBlockModalOpen ? "bg-white/10 border-white/20" : `${themeStyle.cardBg} ${themeStyle.border}`
                }`}
              >
                <FiSlash /> Blokkeer
              </button>
            </div>

            {isFormOpen && (
              <ShowFormSheet
                key={editingId ?? "new"}
                initial={editingId ? shows.find((s) => s.id === editingId) ?? null : null}
                defaultOwner={currentUser}
                canChangeOwner={isSuperadmin}
                saveButtonClass={themeStyle.primaryBtn}
                onSave={handleSaveShow}
                onClose={resetShowForm}
              />
            )}

            {isBlockModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
                <form onSubmit={handleSaveBlockDate} className={`${themeStyle.panelBg} border ${themeStyle.border} rounded-lg max-w-xs w-full p-5 space-y-4 shadow-2xl`}>
                  <div className={`flex justify-between items-center border-b ${themeStyle.border} pb-2`}>
                    <h3 className={`text-base font-bold uppercase ${themeStyle.accentText}`}>🚫 Datum Blokken</h3>
                    <button type="button" onClick={() => setIsBlockModalOpen(false)} className="opacity-70 hover:opacity-100">✕</button>
                  </div>
                  <div>
                    <label className="text-[13px] opacity-70 uppercase block mb-1">Datum om te blokkeren</label>
                    <CustomDatePicker value={blockDate} onChange={(d) => setBlockDate(d)} />
                  </div>
                  <div className="p-2.5 bg-black/40 border border-zinc-800 rounded-lg text-sm opacity-70">
                    Blokkade op naam van: <strong className={themeStyle.accentText}>{currentUser}</strong>
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-2.5 ${themeStyle.primaryBtn} font-bold uppercase text-sm rounded-lg transition-all cursor-pointer`}
                  >
                    BLOKKADE OPSLAAN
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-3">

              {filteredShows.length === 0 ? (
                <p className="text-sm opacity-70 italic">Geen optredens of blokkades gevonden voor {selectedYear}.</p>
              ) : (
                showsByMonth.map((group) => {
                  const isPastMonth = group.key < today.substring(0, 7);
                  const isCollapsed = isPastMonth && !openPastMonths.has(group.key);
                  const showCount = group.items.filter((i) => !i.isBlocked).length;
                  // ORIGINAL: maandkoppen wit; andere thema's in hun accentkleur
                  const monthColor = theme === "ORIGINAL" ? "text-white" : themeStyle.accentText;
                  return (
                  <section key={group.key} className="space-y-2">
                    {/* Sticky maandkopje */}
                    <h3 className={`sticky top-0 z-10 ${themeStyle.bg} border-b ${themeStyle.border}`}>
                      {isPastMonth ? (
                        <button
                          type="button"
                          onClick={() => togglePastMonth(group.key)}
                          aria-expanded={!isCollapsed}
                          className="w-full pt-4 pb-2 flex items-baseline justify-between text-left cursor-pointer group"
                        >
                          <span className={`font-display text-[28px] font-bold uppercase tracking-wide opacity-60 group-hover:opacity-100 transition-opacity ${monthColor}`}>
                            {group.label}
                          </span>
                          <span className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.06em] opacity-70 group-hover:opacity-90">
                            {showCount} {showCount === 1 ? "show" : "shows"}
                            <span className={`inline-block transition-transform duration-200 ${isCollapsed ? "" : "rotate-180"}`}>▾</span>
                          </span>
                        </button>
                      ) : (
                        <div className="pt-4 pb-2 flex items-baseline justify-between">
                          <span className={`font-display text-[28px] font-bold uppercase tracking-wide ${monthColor}`}>{group.label}</span>
                          <span className="font-mono text-[13px] uppercase tracking-[0.06em] opacity-50">{showCount} {showCount === 1 ? "show" : "shows"}</span>
                        </div>
                      )}
                    </h3>
                    {!isCollapsed && group.items.map((item) => (
                      <React.Fragment key={item.id}>
                        {item.id === nextShowId && (
                          <div id="today-marker" className="scroll-mt-16 flex items-center gap-3 py-1">
                            <span className="h-px grow bg-gradient-to-r from-transparent to-white/25" />
                            <span className={`font-mono text-[13px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full ring-1 ring-white/15 bg-white/[0.04] ${themeStyle.accentText}`}>
                              Vandaag · hierna
                            </span>
                            <span className="h-px grow bg-gradient-to-l from-transparent to-white/25" />
                          </div>
                        )}
                        <ShowCard
                          item={item}
                          isPast={item.date < today}
                          onEdit={handleEditClick}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                          onTogglePublic={handleTogglePublic}
                        />
                      </React.Fragment>
                    ))}
                  </section>
                  );
                })
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
              className={`w-full py-3 font-bold uppercase text-sm tracking-wider rounded-lg transition-all cursor-pointer shadow border ${
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
              <form onSubmit={handleSaveIdea} className={`p-4 ${themeStyle.cardBg} rounded-lg border ${themeStyle.border} space-y-4`}>
                <div className={`flex justify-between items-center border-b ${themeStyle.border} pb-2`}>
                  <h3 className={`text-base font-bold uppercase ${themeStyle.accentText} tracking-wider`}>
                    {editingIdeaId ? "✏️ Tour Idee Bewerken" : "+ Nieuw Tour Idee Toevoegen"}
                  </h3>
                  <button
                    type="button"
                    onClick={resetIdeaForm}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-red-950 border border-red-600 text-red-500 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[13px] opacity-70 uppercase block mb-1">Titel / Tour Concept</label>
                    <input
                      type="text"
                      placeholder="Bijv. UK Tour, Japan Run..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded-lg text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[13px] opacity-70 uppercase block mb-1">Land</label>
                    <button
                      type="button"
                      onClick={() => { setIsCountryModalOpen(true); }}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded-lg text-sm text-left flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <CountryFlag code={newIdeaCountry} />
                        {COUNTRIES.find((c) => c.code === newIdeaCountry)?.name || newIdeaCountry}
                      </span>
                      <span className="text-[13px] opacity-50">▼</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[13px] opacity-70 uppercase block mb-1">Doelperiode</label>
                    <input
                      type="text"
                      placeholder="Bijv. Najaar 2027..."
                      value={newPeriod}
                      onChange={(e) => setNewPeriod(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[13px] opacity-70 uppercase block mb-1">Samen met bands</label>
                    <input
                      type="text"
                      placeholder="Co-headliners..."
                      value={newBands}
                      onChange={(e) => setNewBands(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-zinc-700 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] opacity-70 uppercase block mb-1">Tour-eigenaar</label>
                    {isSuperadmin ? (
                      <select
                        value={ideaOwner}
                        onChange={(e) => setIdeaOwner(e.target.value)}
                        className="w-full p-2 bg-black/40 border border-zinc-700 rounded-lg text-sm"
                      >
                        {BAND_MEMBERS.map((m) => (
                          <option key={m} value={m} className="bg-black text-white">
                            Eigenaar: {m}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full p-2 bg-black/40 border border-zinc-800 rounded-lg text-sm opacity-80">
                        {ideaOwner}
                      </div>
                    )}
                  </div>
                </div>

                <div className={`border-t ${themeStyle.border} pt-3`}>
                  <span className="text-sm font-bold opacity-70 uppercase block mb-2">👤 Contactpersoon / Agent</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Naam contactpersoon"
                      value={newIdeaContactPerson}
                      onChange={(e) => setNewIdeaContactPerson(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded-lg text-sm"
                    />
                    <input
                      type="email"
                      placeholder="E-mailadres"
                      value={newIdeaContactEmail}
                      onChange={(e) => setNewIdeaContactEmail(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Telefoonnummer"
                      value={newIdeaContactPhone}
                      onChange={(e) => setNewIdeaContactPhone(e.target.value)}
                      className="p-2 bg-black/40 border border-zinc-700 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className={`border-t ${themeStyle.border} pt-3`}>
                  <label className="text-sm font-bold opacity-70 uppercase block mb-1">📝 Opmerkingen & Notities</label>
                  <textarea
                    placeholder="Bijzonderheden..."
                    value={newIdeaNotes}
                    onChange={(e) => setNewIdeaNotes(e.target.value)}
                    className="w-full p-2 bg-black/40 border border-zinc-700 rounded-lg text-sm h-16"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 ${themeStyle.primaryBtn} font-bold uppercase text-sm rounded-lg transition-all cursor-pointer`}
                >
                  {editingIdeaId ? "BEWERKING OPSLAAN" : "IDEE TOEVOEGEN"}
                </button>
              </form>
            )}

            {/* IDEEËN LIJST WEERGAVE */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase opacity-70 tracking-wider">
                TOUR CONCEPTEN & IDEEËN ({tourIdeas.length})
              </h2>

              {tourIdeas.length === 0 ? (
                <p className="text-sm opacity-70 italic">Nog geen tour concepten ingevoerd.</p>
              ) : (
                tourIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className={`p-4 ${themeStyle.cardBg} border rounded-lg space-y-2 ${
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
                          className="px-2 py-1 bg-black/40 hover:bg-black/60 border border-zinc-700 text-sm rounded-lg uppercase cursor-pointer"
                        >
                          ✏️ Bewerken
                        </button>
                        <button
                          onClick={() => handleToggleScratchIdea(idea.id)}
                          className="px-2 py-1 bg-black/40 hover:bg-black/60 border border-zinc-700 text-sm rounded-lg uppercase cursor-pointer"
                        >
                          {idea.isScratched ? "Herstellen" : "Doorstrepen"}
                        </button>
                        <button
                          onClick={() => handleDeleteIdea(idea.id)}
                          className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900 text-sm rounded-lg uppercase cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className={`text-sm ${themeStyle.accentText} font-bold`}>
                      <span className="opacity-70 font-normal">Tour-eigenaar:</span> {idea.owner || "Onbekend"}
                    </div>

                    {idea.supportBands && (
                      <p className="text-sm">
                        <span className="opacity-70">Bands:</span> ({idea.supportBands})
                      </p>
                    )}
                    {idea.targetPeriod && (
                      <p className={`text-sm ${themeStyle.accentText} font-bold`}>
                        <span className="opacity-70 font-normal">Periode:</span> {idea.targetPeriod}
                      </p>
                    )}

                    {(idea.contactPerson || idea.contactEmail || idea.contactPhone) && (
                      <div className={`text-sm opacity-80 pt-1 border-t ${themeStyle.border}`}>
                        <span className="opacity-70">Contact:</span> {idea.contactPerson || "Onbekend"}
                        {idea.contactEmail && ` (${idea.contactEmail})`}
                        {idea.contactPhone && ` - ${idea.contactPhone}`}
                      </div>
                    )}

                    {idea.notes && (
                      <div className={`text-sm opacity-80 pt-1 border-t ${themeStyle.border}`}>
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
            <div className={`${themeStyle.panelBg} border ${themeStyle.border} rounded-lg max-w-xs w-full p-4 space-y-3 shadow-2xl`}>
              <div className={`flex justify-between items-center border-b ${themeStyle.border} pb-2`}>
                <h3 className="text-base font-bold uppercase">Kies Land</h3>
                <button type="button" onClick={() => setIsCountryModalOpen(false)} className="opacity-70 hover:opacity-100">✕</button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {COUNTRIES.map((item) => {
                  const isSelected = newIdeaCountry === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setNewIdeaCountry(item.code);
                        setIsCountryModalOpen(false);
                      }}
                      className={`w-full p-2 rounded-lg text-sm font-bold text-left border flex justify-between items-center cursor-pointer ${
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
            <div className={`${themeStyle.panelBg} border ${themeStyle.border} rounded-lg max-w-xs w-full p-4 space-y-3 shadow-2xl`}>
              <div className={`flex justify-between items-center border-b ${themeStyle.border} pb-2`}>
                <h3 className="text-base font-bold uppercase">Kies Jaar</h3>
                <button type="button" onClick={() => setIsYearModalOpen(false)} className="opacity-70 hover:opacity-100">✕</button>
              </div>
              <div className="space-y-1">
                {availableYears.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => { setSelectedYear(yr); setIsYearModalOpen(false); }}
                    className={`w-full p-2.5 rounded-lg text-sm font-bold text-left border flex justify-between items-center cursor-pointer ${
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
