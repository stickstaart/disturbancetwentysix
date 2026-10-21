// Shows voor de publieke website (TOUR + HISTORY).
// = vast archief uit SHOWS/dates.js  +  live aangekondigde shows uit Firestore (publicShows).
import { useEffect, useState } from "react";
import { nieuweData } from "../../SHOWS/dates";
import { subscribePublicShows, type PublicShow } from "./agendaStore";
import { isTestMode } from "./testMode";

export interface SiteShow {
  id: string;
  date: string; // "YYYY-MM-DD" of alleen "YYYY" in het archief
  country: string;
  city: string;
  venue: string;
  bands?: string[];
  tour?: string | null;
}

const archive = nieuweData as SiteShow[];
const key = (s: SiteShow) => `${s.date}|${(s.city || "").toLowerCase().replace(/[^a-z0-9]/g, "")}`;

/** Archief + agenda samengevoegd; bij dubbele datum+stad wint de agenda. */
export function useSiteShows(): SiteShow[] {
  const [live, setLive] = useState<PublicShow[]>([]);

  useEffect(() => subscribePublicShows(setLive, () => setLive([])), []);

  const merged = new Map<string, SiteShow>();
  archive.forEach((s) => merged.set(key(s), s));
  live
    .filter((s) => !s.isDummy || isTestMode) // testdata alleen lokaal / preview, nooit op de live site
    .forEach((s) => merged.set(key(s), s));
  return [...merged.values()];
}
