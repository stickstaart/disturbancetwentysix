// Opslaglaag voor de band-agenda.
// Alle Firestore-logica zit hier, zodat BandDashboard alleen met simpele functies werkt.
// Collecties: "shows" (optredens + geblokkeerde data) en "tourIdeas".
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { dummyIdeas, dummyShows } from "./dummyData";
import type { DateItem, TourIdea } from "../components/BandDashboard";

const SHOWS = "shows";
const IDEAS = "tourIdeas";

// Firestore accepteert geen `undefined`; JSON-roundtrip haalt die velden weg.
const clean = <T extends object>(data: T): T => JSON.parse(JSON.stringify(data));

/** Nieuw uniek id (Firestore auto-id). */
export const newId = () => doc(collection(db, SHOWS)).id;

type Unsubscribe = () => void;

function subscribe<T>(name: string, onData: (items: T[]) => void, onError?: (e: Error) => void): Unsubscribe {
  return onSnapshot(
    collection(db, name),
    (snap) => onData(snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }))),
    (err) => {
      console.error(`[agendaStore] ${name}:`, err);
      onError?.(err);
    },
  );
}

/** Wie heeft het gedaan: bij de echte inlog wordt dit de ingelogde gebruiker (of wie de superadmin "speelt"). */
function auditedData(item: { id: string }, actor: string, isNew: boolean) {
  // Audit-velden apart houden: createdAt is een Firestore Timestamp en mag niet door clean().
  const { id: _id, createdBy, createdAt, updatedBy: _ub, updatedAt: _ua, ...rest } = item as Record<string, unknown> & { id: string };
  void _id; void _ub; void _ua;
  return {
    ...clean(rest),
    createdBy: isNew ? actor : (createdBy ?? actor),
    createdAt: isNew || !createdAt ? serverTimestamp() : createdAt,
    updatedBy: actor,
    updatedAt: serverTimestamp(),
  };
}

async function save(name: string, item: { id: string }, actor: string, isNew: boolean) {
  await setDoc(doc(db, name, item.id), auditedData(item, actor, isNew));
}

async function patch(name: string, id: string, fields: Record<string, unknown>, actor: string) {
  await updateDoc(doc(db, name, id), { ...clean(fields), updatedBy: actor, updatedAt: serverTimestamp() });
}

// --- Shows ---
// Elke show-wijziging werkt in dezelfde batch ook publicShows/{id} bij:
// alleen datum/land/stad/venue/bands/tour — nooit gages, contacten of afspraken.
const PUBLIC = "publicShows";

export const isPublishable = (s: Partial<DateItem>) =>
  !!s.isPublic && s.status === "confirmed" && !s.isBlocked && !s.isDummy;

const publicProjection = (s: DateItem) => ({
  date: s.date,
  country: s.country,
  city: s.city,
  venue: s.venue || "",
  bands: (s.otherbands || "").split(",").map((b) => b.trim()).filter(Boolean),
  tour: s.tourName || null,
});

function syncPublic(batch: ReturnType<typeof writeBatch>, show: DateItem) {
  const ref = doc(db, PUBLIC, show.id);
  if (isPublishable(show)) batch.set(ref, publicProjection(show));
  else batch.delete(ref); // delete op een niet-bestaand doc is geen fout
}

export const subscribeShows = (cb: (s: DateItem[]) => void, onError?: (e: Error) => void) =>
  subscribe<DateItem>(SHOWS, cb, onError);

export async function saveShow(show: DateItem, actor: string, isNew: boolean) {
  const batch = writeBatch(db);
  batch.set(doc(db, SHOWS, show.id), auditedData(show, actor, isNew));
  syncPublic(batch, show);
  await batch.commit();
}

/** Deelwijziging (status, blokkade, website-vinkje). `current` is nodig om publicShows correct bij te werken. */
export async function patchShow(current: DateItem, fields: Partial<DateItem>, actor: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, SHOWS, current.id), { ...clean(fields), updatedBy: actor, updatedAt: serverTimestamp() });
  syncPublic(batch, { ...current, ...fields });
  await batch.commit();
}

export async function deleteShow(id: string) {
  const batch = writeBatch(db);
  batch.delete(doc(db, SHOWS, id));
  batch.delete(doc(db, PUBLIC, id));
  await batch.commit();
}

/** Publiek leesbaar: voor TOUR en HISTORY op de website. */
export interface PublicShow {
  id: string;
  date: string;
  country: string;
  city: string;
  venue: string;
  bands: string[];
  tour: string | null;
}
export const subscribePublicShows = (cb: (s: PublicShow[]) => void, onError?: (e: Error) => void) =>
  subscribe<PublicShow>(PUBLIC, cb, onError);

// --- Tour ideas ---
export const subscribeIdeas = (cb: (i: TourIdea[]) => void, onError?: (e: Error) => void) =>
  subscribe<TourIdea>(IDEAS, cb, onError);
export const saveIdea = (idea: TourIdea, actor: string, isNew: boolean) => save(IDEAS, idea, actor, isNew);
export const patchIdea = (id: string, fields: Partial<TourIdea>, actor: string) => patch(IDEAS, id, fields, actor);
export const deleteIdea = (id: string) => deleteDoc(doc(db, IDEAS, id));

/**
 * Eenmalige migratie: testdata uit localStorage van dit apparaat naar Firestore,
 * maar alleen als de betreffende collectie in Firestore nog leeg is.
 */
export async function migrateLocalStorage(actor: string) {
  const FLAG = "band_migrated_to_firestore";
  try {
    if (localStorage.getItem(FLAG)) return;
    const pairs: [string, string][] = [["band_events_v3", SHOWS], ["band_ideas", IDEAS]];
    for (const [key, name] of pairs) {
      const raw = localStorage.getItem(key);
      const items: { id: string }[] = raw ? JSON.parse(raw) : [];
      if (!items.length) continue;
      const existing = await getDocs(query(collection(db, name), limit(1)));
      if (!existing.empty) continue;
      await Promise.all(items.map((it) => (name === SHOWS ? saveShow(it as DateItem, actor, true) : save(name, it, actor, true))));
      console.info(`[agendaStore] ${items.length} items uit localStorage gemigreerd naar ${name}`);
    }
    localStorage.setItem(FLAG, new Date().toISOString());
  } catch (err) {
    console.error("[agendaStore] migratie mislukt:", err);
  }
}

// --- Testdata (alleen development) ---

export async function seedDummyData(actor: string) {
  const batch = writeBatch(db);
  const stamp = { isDummy: true, createdBy: actor, updatedBy: actor, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  dummyShows().forEach((s) => batch.set(doc(collection(db, SHOWS)), { ...clean(s), ...stamp }));
  dummyIdeas().forEach((i) => batch.set(doc(collection(db, IDEAS)), { ...clean(i), ...stamp }));
  await batch.commit();
}

export async function clearDummyData() {
  const batch = writeBatch(db);
  for (const name of [SHOWS, IDEAS]) {
    const snap = await getDocs(query(collection(db, name), where("isDummy", "==", true)));
    snap.forEach((d) => batch.delete(d.ref));
  }
  await batch.commit();
}
