import React, { useState, useEffect } from "react";
import { CustomDatePicker } from "./dashboard/CustomDatePicker";
import { ShowFormSheet, type ShowDraft } from "./dashboard/ShowForm";
import { IdeaFormSheet, type IdeaDraft } from "./dashboard/IdeaForm";
import { IdeaCard } from "./dashboard/IdeaCard";
import { ShowCard } from "./dashboard/ShowCard";
import * as store from "../lib/agendaStore";
import { FiChevronDown, FiLogOut, FiPlus, FiSettings, FiSlash } from "react-icons/fi";
import { useSnapZoom } from "../lib/useSnapZoom";
import { isTestMode } from "../lib/testMode";
import { BAND_MEMBERS, displayName } from "./dashboard/constants";
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
  /** Blokkade over meerdere dagen: laatste dag (t/m), YYYY-MM-DD */
  endDate?: string;
  /** Blokkade: reden (vakantie, andere band, studio, ...) */
  reason?: string;
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

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState<boolean>(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState<boolean>(false);

  const [blockDate, setBlockDate] = useState(getTodayString());
  const [blockEndDate, setBlockEndDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockFor, setBlockFor] = useState("");

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
  // Doorgestreepte ideeën staan ingeklapt onderaan
  const [showScratched, setShowScratched] = useState(false);

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
    localStorage.setItem("band_active_user", newUser);
  };

  const sortedShows = [...shows].sort((a, b) => a.date.localeCompare(b.date));
  const filteredShows = sortedShows.filter((s) => s.date && s.date.startsWith(selectedYear));

  // Groeperen per maand (zoals de kopjes in het Google Doc)
  const today = todayString();
  const nextShowId = filteredShows.find((s) => (s.endDate || s.date) >= today)?.id;
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


  const handleSaveShow = (draft: ShowDraft) => {
    const original = editingId ? shows.find((s) => s.id === editingId) : undefined;
    run(store.saveShow({ ...original, ...draft, id: editingId || store.newId() }, currentUser, !editingId));
    resetShowForm();
  };

  const handleSaveBlockDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) return;

    const who = blockFor || displayName(currentUser);
    const endDate = blockEndDate && blockEndDate > blockDate ? blockEndDate : undefined;
    const reason = blockReason.trim() || undefined;

    // Losse dag zonder reden: samenvoegen met een bestaande blokkade op die dag ("Joz, Rob")
    const existing = !endDate && !reason
      ? shows.find((s) => s.isBlocked && s.date === blockDate && !s.endDate && !s.reason)
      : undefined;

    if (existing) {
      const names = existing.blockedBy ? existing.blockedBy.split(", ").map((n) => n.trim()) : [];
      if (!names.includes(who)) names.push(who);
      run(store.patchShow(existing, { blockedBy: names.join(", ") }, currentUser));
    } else {
      const blockData: DateItem = {
        id: store.newId(),
        date: blockDate,
        endDate,
        reason,
        country: "NL",
        city: "GEBLOKKEERD",
        venue: "",
        status: "cancelled",
        isBlocked: true,
        blockedBy: who,
      };
      run(store.saveShow(blockData, currentUser, true));
    }

    setBlockEndDate("");
    setBlockReason("");
    setBlockFor("");
    setIsBlockModalOpen(false);
  };

  const handleSaveIdea = (draft: IdeaDraft) => {
    const original = editingIdeaId ? tourIdeas.find((i) => i.id === editingIdeaId) : undefined;
    run(store.saveIdea(
      { ...original, ...draft, id: editingIdeaId || store.newId(), isScratched: original?.isScratched ?? false },
      currentUser,
      !editingIdeaId,
    ));
    resetIdeaForm();
  };

  const handleEditIdeaClick = (idea: TourIdea) => {
    setEditingIdeaId(idea.id);
    setIsIdeaFormOpen(true);
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
            <h1 className="font-display text-[28px] font-bold uppercase tracking-wide leading-none">super-secret-agenda</h1>
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

                {/* Thema: één rij kleurstalen (achtergrond + accentrand), naam van het gekozen thema eronder */}
                <div>
                  <span className="block mb-2 font-mono text-[13px] uppercase tracking-[0.06em] opacity-70">Thema</span>
                  <div className="flex items-center justify-between gap-1" role="radiogroup" aria-label="Thema">
                    {(Object.keys(THEME_CONFIGS) as ThemeType[]).map((t) => {
                      const c = THEME_CONFIGS[t];
                      const isActive = theme === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={isActive}
                          aria-label={t}
                          title={t}
                          onClick={() => handleThemeChange(t)}
                          className={`rounded-full p-0.5 cursor-pointer transition ring-2 ${isActive ? "ring-white/80" : "ring-transparent hover:ring-white/25"}`}
                        >
                          <span className={`block h-9 w-9 rounded-full border-[3px] border-current ${c.bg} ${c.accentText}`} />
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-base font-semibold">{theme}</div>
                </div>

                {/* TESTDATA — alleen zichtbaar bij `npm run dev`, nooit op de live site */}
                {isTestMode && isSuperadmin && (
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
              <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsBlockModalOpen(false)}>
                <form
                  onSubmit={handleSaveBlockDate}
                  onClick={(e) => e.stopPropagation()}
                  className={`${themeStyle.panelBg} border ${themeStyle.border} w-full md:max-w-sm rounded-t-2xl md:rounded-2xl p-5 space-y-4 shadow-2xl pb-[max(1.25rem,env(safe-area-inset-bottom))]`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-display text-[28px] font-bold uppercase tracking-wide leading-none">Blokkeren</h3>
                    <button type="button" onClick={() => setIsBlockModalOpen(false)} aria-label="Sluiten" className="p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 cursor-pointer">✕</button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block mb-1.5 font-mono text-[13px] uppercase tracking-[0.06em] opacity-70">Van</span>
                      <CustomDatePicker value={blockDate} onChange={(d) => setBlockDate(d)} />
                    </div>
                    <div>
                      <span className="block mb-1.5 font-mono text-[13px] uppercase tracking-[0.06em] opacity-70">T/m (optioneel)</span>
                      {blockEndDate ? (
                        <div className="flex gap-1">
                          <div className="grow"><CustomDatePicker value={blockEndDate} onChange={(d) => setBlockEndDate(d)} /></div>
                          <button type="button" onClick={() => setBlockEndDate("")} aria-label="Eén dag" className="px-2 rounded-lg opacity-70 hover:opacity-100 cursor-pointer">✕</button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setBlockEndDate(blockDate)}
                          className="w-full py-2.5 rounded-lg border border-dashed border-white/20 text-base opacity-80 hover:opacity-100 cursor-pointer"
                        >
                          + Periode
                        </button>
                      )}
                    </div>
                  </div>

                  <label className="block">
                    <span className="block mb-1.5 font-mono text-[13px] uppercase tracking-[0.06em] opacity-70">Reden (optioneel)</span>
                    <input
                      type="text"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Vakantie, andere band, studio…"
                      className="w-full px-3 py-2.5 rounded-lg bg-black/40 ring-1 ring-white/10 text-base placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </label>

                  <label className="block">
                    <span className="block mb-1.5 font-mono text-[13px] uppercase tracking-[0.06em] opacity-70">Wie kan niet</span>
                    <select
                      value={blockFor || displayName(currentUser)}
                      onChange={(e) => setBlockFor(e.target.value)}
                      disabled={!isSuperadmin}
                      className="w-full px-3 py-2.5 rounded-lg bg-black/40 ring-1 ring-white/10 text-base focus:outline-none cursor-pointer disabled:cursor-default"
                    >
                      {[...BAND_MEMBERS.map(displayName), "Hele band"].map((n) => (
                        <option key={n} value={n} className="bg-zinc-900">{n}</option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="submit"
                    className={`w-full py-3 ${themeStyle.primaryBtn} font-bold uppercase text-base tracking-wider rounded-xl border cursor-pointer`}
                  >
                    Blokkade opslaan
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
                          isPast={(item.endDate || item.date) < today}
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

        {/* TAB 2: TOUR-IDEEËN — zelfde opbouw als de agenda */}
        {activeTab === "ideas" && (() => {
          const activeIdeas = tourIdeas.filter((i) => !i.isScratched).sort((a, b) => a.title.localeCompare(b.title));
          const scratchedIdeas = tourIdeas.filter((i) => i.isScratched).sort((a, b) => a.title.localeCompare(b.title));
          const ideaCard = (idea: TourIdea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              accentText={theme === "ORIGINAL" ? "text-white" : themeStyle.accentText}
              onEdit={handleEditIdeaClick}
              onDelete={handleDeleteIdea}
              onToggleScratch={handleToggleScratchIdea}
            />
          );
          return (
            <div className="space-y-4 md:space-y-6">
              {/* Titel + aantallen */}
              <div className="flex items-end justify-between gap-3">
                <span className="font-display text-5xl font-bold leading-none uppercase">Ideeën</span>
                <span className="font-mono text-sm opacity-70 pb-1">
                  {activeIdeas.length} actief · {scratchedIdeas.length} geschrapt
                </span>
              </div>

              <button
                type="button"
                onClick={() => { setEditingIdeaId(null); setIsIdeaFormOpen(true); }}
                className={`w-full flex items-center justify-center gap-2 py-3.5 font-bold uppercase text-base tracking-wider rounded-xl cursor-pointer shadow border ${themeStyle.primaryBtn}`}
              >
                <FiPlus className="text-lg" /> Nieuw idee
              </button>

              {isIdeaFormOpen && (
                <IdeaFormSheet
                  key={editingIdeaId ?? "new"}
                  initial={editingIdeaId ? tourIdeas.find((i) => i.id === editingIdeaId) ?? null : null}
                  defaultOwner={currentUser}
                  canChangeOwner={isSuperadmin}
                  saveButtonClass={themeStyle.primaryBtn}
                  onSave={handleSaveIdea}
                  onClose={resetIdeaForm}
                />
              )}

              <div className="space-y-2">
                {activeIdeas.length === 0 && scratchedIdeas.length === 0 && (
                  <p className="text-base opacity-60 italic">Nog geen tour-ideeën. Begin met “Nieuw idee”.</p>
                )}
                {activeIdeas.map(ideaCard)}
              </div>

              {/* Doorgestreept: ingeklapt, zoals voorbije maanden */}
              {scratchedIdeas.length > 0 && (
                <section className="space-y-2">
                  <h3 className={`border-b ${themeStyle.border}`}>
                    <button
                      type="button"
                      onClick={() => setShowScratched((v) => !v)}
                      aria-expanded={showScratched}
                      className="w-full pt-4 pb-2 flex items-baseline justify-between text-left cursor-pointer group"
                    >
                      <span className="font-display text-[28px] font-bold uppercase tracking-wide opacity-60 group-hover:opacity-100 transition-opacity">
                        Geschrapt
                      </span>
                      <span className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.06em] opacity-70">
                        {scratchedIdeas.length} {scratchedIdeas.length === 1 ? "idee" : "ideeën"}
                        <span className={`inline-block transition-transform duration-200 ${showScratched ? "rotate-180" : ""}`}>▾</span>
                      </span>
                    </button>
                  </h3>
                  {showScratched && scratchedIdeas.map(ideaCard)}
                </section>
              )}
            </div>
          );
        })()}

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
