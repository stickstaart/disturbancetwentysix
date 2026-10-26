// Uitgaande links via een korte tussenpagina (/go/<dienst>/<item>), zodat Vercel Web Analytics
// elke doorklik telt als paginaweergave (met land). Werkt op het gratis plan, zonder cookies.
// De bezoeker wordt meteen doorgestuurd en merkt er niets van.

/** Alleen naar deze domeinen doorsturen (voorkomt dat /go/ als open redirect misbruikt wordt). */
const ALLOWED_HOSTS = [
  "spotify.com",
  "bandcamp.com",
  "youtube.com",
  "youtu.be",
  "facebook.com",
  "instagram.com",
  "linktr.ee",
];

/** Leesbare namen voor de Stats-tab */
export const SERVICE_LABELS: Record<string, string> = {
  spotify: "Spotify",
  bandcamp: "Bandcamp",
  youtube: "YouTube",
  facebook: "Facebook",
  instagram: "Instagram",
  linktree: "Linktree",
};

/**
 * Bouw een doorklik-link. `service` = dienst (spotify, bandcamp, …), `item` = waar op de site
 * (bijv. de release-id of "footer"), `url` = de echte bestemming.
 */
export const goLink = (service: string, url: string, item?: string) =>
  `/go/${service}${item ? `/${item}` : ""}?to=${encodeURIComponent(url)}`;

/** Geeft de bestemming terug als die veilig is (https + toegestaan domein), anders null. */
export function safeTarget(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) ? u.toString() : null;
  } catch {
    return null;
  }
}
