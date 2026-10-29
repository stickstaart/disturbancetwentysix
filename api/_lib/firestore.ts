// Minimale Firestore-toegang voor serverfuncties, zonder extra packages:
// service-account → ondertekende JWT → OAuth-token → Firestore REST API.
// Benodigd: FIREBASE_SERVICE_ACCOUNT = volledige inhoud van het service-account JSON-bestand.
import { createSign } from "node:crypto";

interface ServiceAccount { project_id: string; client_email: string; private_key: string }

let cached: { token: string; exp: number } | null = null;

function account(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT ontbreekt in Vercel.");
  const sa = JSON.parse(raw) as ServiceAccount;
  if (!sa.project_id || !sa.client_email || !sa.private_key) throw new Error("FIREBASE_SERVICE_ACCOUNT is geen geldig service-account JSON.");
  return sa;
}

export const firestoreConfigured = () => Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");

async function accessToken(sa: ServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp - 60 > now) return cached.token;
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/datastore", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${b64url(signer.sign(sa.private_key))}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) throw new Error(`Google-token ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const body = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: body.access_token, exp: now + body.expires_in };
  return body.access_token;
}

async function call(path: string, init: RequestInit = {}) {
  const sa = account();
  const token = await accessToken(sa);
  const base = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents`;
  const res = await fetch(`${base}/${path}`, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`Firestore ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json() as Promise<Record<string, unknown>>;
}

// Documenten in "statsDaily" hebben id = "YYYY-MM-DD" en één veld "json" met de dagcijfers.
const COLLECTION = "statsDaily";

export async function saveDay(day: string, data: unknown) {
  await call(`${COLLECTION}/${day}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: { date: { stringValue: day }, json: { stringValue: JSON.stringify(data) }, savedAt: { timestampValue: new Date().toISOString() } } }),
  });
}

/** Alle opgeslagen dagen (id → data). Paar honderd per jaar, dus gewoon alles ophalen. */
export async function loadDays<T>(): Promise<Map<string, T>> {
  const out = new Map<string, T>();
  let pageToken = "";
  do {
    const q = new URLSearchParams({ pageSize: "300" });
    if (pageToken) q.set("pageToken", pageToken);
    const body = (await call(`${COLLECTION}?${q}`)) as { documents?: { name: string; fields?: { json?: { stringValue?: string } } }[]; nextPageToken?: string };
    for (const doc of body.documents ?? []) {
      const id = doc.name.split("/").pop()!;
      const json = doc.fields?.json?.stringValue;
      if (json) out.set(id, JSON.parse(json) as T);
    }
    pageToken = body.nextPageToken ?? "";
  } while (pageToken);
  return out;
}
