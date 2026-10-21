import React, { useEffect, useState } from "react";
import { FiCheck, FiChevronDown, FiGlobe, FiSearch, FiX } from "react-icons/fi";
import type { DateItem, ShowStatus } from "../BandDashboard";
import { BAND_MEMBERS, COUNTRIES, displayName } from "./constants";
import { CountryFlag } from "./CountryFlag";
import { CustomDatePicker } from "./CustomDatePicker";
import { todayString } from "./dateUtils";

// ------------------------------------------------------------------
// Formulier voor een nieuwe / te bewerken show, als sheet.
// Mobiel: schuift van onder omhoog. Desktop: gecentreerd venster.
// Basis altijd zichtbaar; de rest in uitklapbare blokken met samenvatting.
// ------------------------------------------------------------------

export type ShowDraft = Omit<DateItem, "id">;

const STATUS_OPTIONS: { value: ShowStatus; label: string; active: string }[] = [
  { value: "option", label: "Optie", active: "bg-amber-500/15 text-amber-300 ring-amber-500/50" },
  { value: "confirmed", label: "Bevestigd", active: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/50" },
  { value: "cancelled", label: "Afgelast", active: "bg-red-500/15 text-red-300 ring-red-500/50" },
];
const TRANSPORT_OPTIONS = ["Busje", "Eigen auto", "Trein", "Vliegtuig"];
const MEMBER_NAMES = BAND_MEMBERS.map(displayName);

const INPUT =
  "w-full px-3 py-2.5 rounded-lg bg-black/40 ring-1 ring-white/10 text-sm text-zinc-100 placeholder:text-zinc-600 " +
  "focus:outline-none focus:ring-2 focus:ring-white/30 transition";
const LABEL = "block mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400";
const CHIP = "px-3 py-1.5 rounded-full text-xs font-medium ring-1 transition-colors cursor-pointer";
const chipClass = (on: boolean) =>
  `${CHIP} ${on ? "bg-white/15 text-white ring-white/40" : "text-zinc-400 ring-white/10 hover:text-white"}`;

const splitList = (s?: string) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);
const num = (s?: string) => parseFloat((s || "").replace(",", ".")) || 0;

/** Label boven het veld (geen placeholder-als-label) */
const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className={LABEL}>{label}</span>
    {children}
  </label>
);

/** Bedragveld met € ervoor en cijfertoetsenbord op mobiel */
const MoneyInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">€</span>
    <input
      type="text"
      inputMode="decimal"
      value={value}
      placeholder={placeholder ?? "0"}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ""))}
      className={`${INPUT} pl-7 font-mono tabular`}
    />
  </div>
);

/** Uitklapbaar blok met samenvatting in de kop */
const Section: React.FC<{ title: string; summary?: string; open: boolean; onToggle: () => void; children: React.ReactNode }> = ({
  title, summary, open, onToggle, children,
}) => (
  <div className={`rounded-xl ring-1 transition-colors ${open ? "ring-white/12 bg-white/[0.02]" : "ring-white/[0.06]"}`}>
    <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-3 px-3.5 py-3 text-left cursor-pointer">
      <span className="text-sm font-semibold text-zinc-100 shrink-0">{title}</span>
      <span className="grow min-w-0 truncate text-right text-xs text-zinc-500">{!open && summary}</span>
      <FiChevronDown className={`shrink-0 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="px-3.5 pb-3.5 space-y-3">{children}</div>}
  </div>
);

// Landen waar de band het vaakst speelt: als snelkeuze bovenaan
const QUICK_COUNTRIES = ["NL", "BE", "DE", "FR", "GB", "ES", "IT", "AT", "CH", "CZ", "DK", "PL"];

/** Eigen landkiezer binnen de sheet (native <select> rendert op desktop als piepklein menu buiten beeld) */
const CountryPicker: React.FC<{ value: string; onChange: (code: string) => void; onClose: () => void }> = ({ value, onChange, onClose }) => {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const results = query
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(query) || c.code.toLowerCase() === query)
    : COUNTRIES;
  const pick = (code: string) => {
    onChange(code);
    onClose();
  };
  return (
    <div className="mt-2 rounded-xl bg-zinc-900 ring-1 ring-white/10 p-3 space-y-3">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); if (results[0]) pick(results[0].code); }
            if (e.key === "Escape") { e.stopPropagation(); onClose(); }
          }}
          placeholder="Zoek land…"
          className={`${INPUT} pl-9`}
          autoFocus
        />
      </div>

      {!query && (
        <div className="flex flex-wrap gap-1.5">
          {QUICK_COUNTRIES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => pick(code)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono ring-1 cursor-pointer ${
                value === code ? "bg-white/15 text-white ring-white/40" : "text-zinc-300 ring-white/10 hover:ring-white/25"
              }`}
            >
              <CountryFlag code={code} />
              {code}
            </button>
          ))}
        </div>
      )}

      <ul className="max-h-48 overflow-y-auto overscroll-contain -mx-1 space-y-0.5" role="listbox" aria-label="Land">
        {results.map((c) => (
          <li key={c.code}>
            <button
              type="button"
              role="option"
              aria-selected={value === c.code}
              onClick={() => pick(c.code)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-left cursor-pointer ${
                value === c.code ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5"
              }`}
            >
              <CountryFlag code={c.code} />
              <span className="grow">{c.name}</span>
              <span className="font-mono text-[10px] text-zinc-500">{c.code}</span>
              {value === c.code && <FiCheck className="text-zinc-300" />}
            </button>
          </li>
        ))}
        {results.length === 0 && <li className="px-2 py-3 text-xs text-zinc-500">Geen land gevonden</li>}
      </ul>
    </div>
  );
};

interface ShowFormSheetProps {
  /** null = nieuwe show */
  initial: DateItem | null;
  defaultOwner: string;
  canChangeOwner: boolean;
  saveButtonClass: string;
  onSave: (draft: ShowDraft) => void;
  onClose: () => void;
}

export const ShowFormSheet: React.FC<ShowFormSheetProps> = ({ initial, defaultOwner, canChangeOwner, saveButtonClass, onSave, onClose }) => {
  const [d, setD] = useState<ShowDraft>(() => ({
    date: initial?.date || todayString(),
    country: initial?.country || "NL",
    city: initial?.city || "",
    venue: initial?.venue || "",
    otherbands: initial?.otherbands || "",
    tourName: initial?.tourName || "",
    status: initial?.status || "option",
    isPublic: !!initial?.isPublic,
    guaranteedFee: initial?.guaranteedFee || "",
    paymentMethod: initial?.paymentMethod || "cash",
    drivers: initial?.drivers || "",
    transportMethod: initial?.transportMethod || "",
    transportCost: initial?.transportCost || "",
    contact: { name: initial?.contact?.name || "", phone: initial?.contact?.phone || "", email: initial?.contact?.email || "" },
    breakEvenInfo: initial?.breakEvenInfo || "",
    owner: initial?.owner || defaultOwner,
  }));
  const set = <K extends keyof ShowDraft>(key: K, value: ShowDraft[K]) => setD((prev) => ({ ...prev, [key]: value }));
  const setContact = (key: "name" | "phone" | "email", value: string) => setD((prev) => ({ ...prev, contact: { ...prev.contact, [key]: value } }));

  // Bij bewerken: blokken met gegevens staan open
  const [open, setOpen] = useState<Record<string, boolean>>(() => ({
    lineup: !!(initial?.otherbands || initial?.tourName),
    money: !!initial?.guaranteedFee,
    transport: !!(initial?.drivers || initial?.transportMethod || initial?.transportCost),
    contact: !!(initial?.contact?.name || initial?.contact?.phone || initial?.contact?.email),
    notes: !!initial?.breakEvenInfo,
  }));
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  // Esc sluit; achtergrond scrollt niet mee
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !e.defaultPrevented && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Chauffeurs: bandleden als knopjes, anderen als vrij veld
  const driverList = splitList(d.drivers);
  const memberDrivers = driverList.filter((n) => MEMBER_NAMES.includes(n));
  const otherDrivers = driverList.filter((n) => !MEMBER_NAMES.includes(n)).join(", ");
  const setDrivers = (members: string[], others: string) => set("drivers", [...members, ...splitList(others)].join(", "));
  // Vrij veld voor "andere chauffeurs" lokaal bijhouden, zodat je komma's en spaties kunt typen
  const [othersText, setOthersText] = useState(otherDrivers);
  const toggleDriver = (name: string) =>
    setDrivers(memberDrivers.includes(name) ? memberDrivers.filter((n) => n !== name) : [...memberDrivers, name], othersText);

  // Samenvattingen
  const fee = num(d.guaranteedFee);
  const cost = num(d.transportCost);
  const net = fee - cost;
  const euro = (n: number) => `€${Number.isInteger(n) ? n : n.toFixed(2)}`;
  const summaries = {
    lineup: [d.otherbands && `w/ ${d.otherbands}`, d.tourName].filter(Boolean).join(" · "),
    money: d.guaranteedFee
      ? `${euro(fee)} · ${d.paymentMethod === "wire" ? "bank" : "cash"}${d.transportCost ? ` → netto ${net >= 0 ? "+" : "−"}${euro(Math.abs(net))}` : ""}`
      : "",
    transport: [d.transportMethod, d.drivers, d.transportCost && euro(cost)].filter(Boolean).join(" · "),
    contact: [d.contact?.name, d.contact?.phone || d.contact?.email].filter(Boolean).join(" · "),
    notes: d.breakEvenInfo ? d.breakEvenInfo.slice(0, 40) + (d.breakEvenInfo.length > 40 ? "…" : "") : "",
  };

  const canSave = !!d.date && !!d.city.trim();
  const isConfirmed = d.status === "confirmed";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      ...d,
      city: d.city.trim(),
      drivers: [...memberDrivers, ...splitList(othersText)].join(", "),
      isPublic: isConfirmed && !!d.isPublic,
      contact: {
        name: d.contact?.name || undefined,
        phone: d.contact?.phone || undefined,
        email: d.contact?.email || undefined,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 band-agenda" role="dialog" aria-modal="true" aria-label={initial ? "Show bewerken" : "Nieuwe show"}>
      {/* Achtergrond */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <form
        onSubmit={handleSubmit}
        className="absolute inset-x-0 bottom-0 max-h-[92dvh] flex flex-col rounded-t-2xl bg-zinc-950 ring-1 ring-white/10
                   shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.9)]
                   md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[88vh] md:rounded-2xl"
      >
        {/* Grijpbalkje (mobiel) */}
        <div className="md:hidden flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        {/* Kop */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-3 border-b border-white/[0.06]">
          <div className="grow min-w-0">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white leading-none">
              {initial ? "Show bewerken" : "Nieuwe show"}
            </h2>
            <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
              Eigenaar:
              {canChangeOwner ? (
                <select
                  value={d.owner}
                  onChange={(e) => set("owner", e.target.value)}
                  className="bg-transparent text-zinc-200 font-semibold focus:outline-none cursor-pointer"
                >
                  {BAND_MEMBERS.map((m) => (
                    <option key={m} value={m} className="bg-zinc-900">{displayName(m)}</option>
                  ))}
                </select>
              ) : (
                <span className="text-zinc-200 font-semibold">{displayName(d.owner || "")}</span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Sluiten" className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer">
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Inhoud (scrollt) */}
        <div className="grow overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
          {/* ---- BASIS ---- */}
          <div className="space-y-3">
            <Field label="Datum">
              <CustomDatePicker value={d.date} onChange={(v) => set("date", v)} />
            </Field>

            <div>
              <span className={LABEL}>Stad</span>
              <div className="flex gap-2">
                {/* Land: vlag-knop opent de landkiezer hieronder */}
                <button
                  type="button"
                  onClick={() => setIsCountryOpen((o) => !o)}
                  aria-expanded={isCountryOpen}
                  aria-label={`Land: ${COUNTRIES.find((c) => c.code === d.country)?.name ?? d.country}`}
                  className={`shrink-0 flex items-center gap-1.5 px-3 rounded-lg bg-black/40 ring-1 text-sm text-zinc-200 cursor-pointer ${
                    isCountryOpen ? "ring-white/30" : "ring-white/10"
                  }`}
                >
                  <CountryFlag code={d.country} />
                  <span className="font-mono text-xs">{d.country}</span>
                  <FiChevronDown className={`text-zinc-500 text-xs transition-transform ${isCountryOpen ? "rotate-180" : ""}`} />
                </button>
                <input
                  type="text"
                  value={d.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Bijv. Rotterdam"
                  className={INPUT}
                  autoFocus={!initial}
                  required
                />
              </div>
              {isCountryOpen && (
                <CountryPicker value={d.country} onChange={(code) => set("country", code)} onClose={() => setIsCountryOpen(false)} />
              )}
            </div>

            <Field label="Zaal / venue">
              <input type="text" value={d.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Bijv. Rotown" className={INPUT} />
            </Field>

            <div>
              <span className={LABEL}>Status</span>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-black/40 ring-1 ring-white/[0.06]" role="radiogroup" aria-label="Status">
                {STATUS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={d.status === o.value}
                    onClick={() => set("status", o.value)}
                    className={`py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                      d.status === o.value ? `ring-1 ${o.active}` : "text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Website: alleen bij bevestigd */}
            {isConfirmed && (
              <button
                type="button"
                onClick={() => set("isPublic", !d.isPublic)}
                aria-pressed={!!d.isPublic}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl ring-1 text-left transition-colors cursor-pointer ${
                  d.isPublic ? "bg-sky-500/10 ring-sky-500/40" : "ring-white/10 hover:ring-white/20"
                }`}
              >
                <FiGlobe className={d.isPublic ? "text-sky-300" : "text-zinc-500"} />
                <span className="grow">
                  <span className={`block text-sm font-semibold ${d.isPublic ? "text-sky-200" : "text-zinc-200"}`}>Aankondigen op website</span>
                  <span className="block text-xs text-zinc-500">Onder TOUR, na de datum vanzelf onder HISTORY. Zonder gage of contact.</span>
                </span>
                {/* Schakelaar */}
                <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${d.isPublic ? "bg-sky-500" : "bg-zinc-700"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${d.isPublic ? "left-[18px]" : "left-0.5"}`} />
                </span>
              </button>
            )}
          </div>

          {/* ---- EXTRA (uitklapbaar) ---- */}
          <div className="space-y-2">
            <Section title="Line-up & event" summary={summaries.lineup} open={open.lineup} onToggle={() => toggle("lineup")}>
              <Field label="Andere bands">
                <input type="text" value={d.otherbands} onChange={(e) => set("otherbands", e.target.value)} placeholder="Gescheiden door komma's" className={INPUT} />
              </Field>
              <Field label="Festival / tournaam">
                <input type="text" value={d.tourName} onChange={(e) => set("tourName", e.target.value)} placeholder="Optioneel" className={INPUT} />
              </Field>
            </Section>

            <Section title="Geld" summary={summaries.money} open={open.money} onToggle={() => toggle("money")}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gage">
                  <MoneyInput value={d.guaranteedFee || ""} onChange={(v) => set("guaranteedFee", v)} />
                </Field>
                <div>
                  <span className={LABEL}>Betaling</span>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-black/40 ring-1 ring-white/[0.06]">
                    {(["cash", "wire"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => set("paymentMethod", m)}
                        className={`py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                          d.paymentMethod === m ? "bg-white/15 text-white ring-1 ring-white/30" : "text-zinc-500 hover:text-zinc-200"
                        }`}
                      >
                        {m === "cash" ? "Cash" : "Bank"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {(d.guaranteedFee || d.transportCost) && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/30 text-xs">
                  <span className="text-zinc-500">
                    Netto (gage − vervoer{d.transportCost ? ` ${euro(cost)}` : ""})
                  </span>
                  <span className={`font-mono tabular font-bold ${net >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {net >= 0 ? "+" : "−"}{euro(Math.abs(net))}
                  </span>
                </div>
              )}
            </Section>

            <Section title="Vervoer" summary={summaries.transport} open={open.transport} onToggle={() => toggle("transport")}>
              <div>
                <span className={LABEL}>Hoe</span>
                <div className="flex flex-wrap gap-2">
                  {TRANSPORT_OPTIONS.map((t) => (
                    <button key={t} type="button" onClick={() => set("transportMethod", d.transportMethod === t ? "" : t)} className={chipClass(d.transportMethod === t)}>
                      {d.transportMethod === t && <FiCheck className="inline mr-1 -mt-0.5" />}
                      {t}
                    </button>
                  ))}
                </div>
                {!TRANSPORT_OPTIONS.includes(d.transportMethod || "") && (
                  <input
                    type="text"
                    value={d.transportMethod}
                    onChange={(e) => set("transportMethod", e.target.value)}
                    placeholder="Of iets anders…"
                    className={`${INPUT} mt-2`}
                  />
                )}
              </div>
              <div>
                <span className={LABEL}>Chauffeurs</span>
                <div className="flex flex-wrap gap-2">
                  {MEMBER_NAMES.map((n) => (
                    <button key={n} type="button" onClick={() => toggleDriver(n)} className={chipClass(memberDrivers.includes(n))}>
                      {memberDrivers.includes(n) && <FiCheck className="inline mr-1 -mt-0.5" />}
                      {n}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={othersText}
                  onChange={(e) => setOthersText(e.target.value)}
                  onBlur={() => setDrivers(memberDrivers, othersText)}
                  placeholder="Anderen (bijv. Berrie)"
                  className={`${INPUT} mt-2`}
                />
              </div>
              <Field label="Kosten vervoer">
                <MoneyInput value={d.transportCost || ""} onChange={(v) => set("transportCost", v)} />
              </Field>
            </Section>

            <Section title="Contact" summary={summaries.contact} open={open.contact} onToggle={() => toggle("contact")}>
              <Field label="Naam">
                <input type="text" value={d.contact?.name} onChange={(e) => setContact("name", e.target.value)} className={INPUT} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Telefoon">
                  <input type="tel" inputMode="tel" value={d.contact?.phone} onChange={(e) => setContact("phone", e.target.value)} className={INPUT} />
                </Field>
                <Field label="E-mail">
                  <input type="email" inputMode="email" value={d.contact?.email} onChange={(e) => setContact("email", e.target.value)} className={INPUT} />
                </Field>
              </div>
            </Section>

            <Section title="Afspraken" summary={summaries.notes} open={open.notes} onToggle={() => toggle("notes")}>
              <textarea
                value={d.breakEvenInfo}
                onChange={(e) => set("breakEvenInfo", e.target.value)}
                rows={3}
                placeholder="Break-even, eten & slapen, bijzonderheden…"
                className={`${INPUT} resize-y`}
              />
            </Section>
          </div>
        </div>

        {/* Voet: altijd in beeld */}
        <div className="flex gap-2 px-4 py-3 border-t border-white/[0.06] bg-zinc-950/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-3 rounded-xl text-sm font-semibold text-zinc-300 ring-1 ring-white/10 hover:bg-white/5 cursor-pointer">
            Annuleren
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className={`grow py-3 rounded-xl text-sm font-bold uppercase tracking-wider border transition-opacity ${saveButtonClass} ${
              canSave ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
            }`}
          >
            {initial ? "Wijzigingen opslaan" : "Show opslaan"}
          </button>
        </div>
      </form>
    </div>
  );
};
