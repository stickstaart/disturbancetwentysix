// Testdata voor de band-agenda, relatief aan vandaag zodat er altijd verleden én toekomst is.
// Alleen bedoeld voor development: elk item krijgt isDummy: true, zodat "Wis testdata" precies deze items weghaalt.
import type { DateItem, TourIdea } from "../components/BandDashboard";

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

type Seed = Omit<DateItem, "id">;

export const dummyShows = (): Seed[] => [
  // --- VERLEDEN ---
  { date: iso(-120), country: "DE", city: "Kassel", venue: "Goldgrube", otherbands: "The Lager Louts", status: "confirmed", isPublic: true,
    guaranteedFee: "150", paymentMethod: "cash", breakEvenInfo: "60% deur na break-even, eten + slaapplek (bandflat)",
    owner: "Joz (Superadmin)", drivers: "Rob", transportMethod: "Busje huren", transportCost: "120",
    contact: { name: "Joost", phone: "+49 151 0000000" } },
  { date: iso(-118), country: "AT", city: "Hallstatt", venue: "Jugendzentrum", status: "confirmed",
    guaranteedFee: "250", paymentMethod: "wire", owner: "Jona", drivers: "Rob, Johnny", transportMethod: "Busje huren", transportCost: "80" },
  { date: iso(-75), country: "NL", city: "Rotterdam", venue: "Rotown", otherbands: "Antidote, HDF", status: "confirmed", isPublic: true,
    guaranteedFee: "1500", paymentMethod: "wire", breakEvenInfo: "1500 totaal", owner: "Rob", contact: { name: "Leon" } },
  { date: iso(-60), country: "FR", city: "Lyon", venue: "Tattoo conventie", status: "cancelled", owner: "Johnny" },
  { date: iso(-30), country: "NL", city: "Oud-Beijerland", venue: "Baroeg Open Air", status: "confirmed", owner: "Joz (Superadmin)" },
  { date: iso(-12), country: "NL", city: "GEBLOKKEERD", venue: "", status: "cancelled", isBlocked: true, blockedBy: "Jona" },

  // --- TOEKOMST ---
  { date: iso(9), country: "NL", city: "Arnhem", venue: "Luxor", otherbands: "UK Subs, GBH", status: "confirmed", isPublic: true,
    guaranteedFee: "400", paymentMethod: "wire", owner: "Joz (Superadmin)", drivers: "Joz", transportMethod: "Eigen auto's", transportCost: "60",
    contact: { name: "Sanne", email: "booking@example.com", phone: "+31 6 00000000" } },
  { date: iso(16), country: "BE", city: "Antwerpen", venue: "Kavka", otherbands: "Flog", status: "option",
    guaranteedFee: "300", owner: "Rob", breakEvenInfo: "Optie verloopt over 2 weken" },
  { date: iso(17), country: "DE", city: "Düsseldorf", venue: "AK47", status: "option", owner: "Rob" },
  { date: iso(24), country: "NL", city: "GEBLOKKEERD", venue: "", status: "cancelled", isBlocked: true, blockedBy: "Johnny, Rob" },
  { date: iso(45), country: "NL", city: "Den Bosch", venue: "De Boulevard", otherbands: "Nervous Boys, Blok 1A", status: "confirmed", isPublic: true, tourName: "Oubollig Festival",
    guaranteedFee: "200", paymentMethod: "cash", owner: "Jona", transportMethod: "Trein", transportCost: "90" },
  { date: iso(80), country: "CZ", city: "Praag", venue: "Modrá Vopice", status: "cancelled", owner: "Johnny", breakEvenInfo: "Organisator gestopt" },
  { date: iso(140), country: "ES", city: "Barcelona", venue: "Sala Upload", otherbands: "Ilegales", status: "option",
    guaranteedFee: "800", paymentMethod: "wire", owner: "Joz (Superadmin)", transportMethod: "Vliegtuig", transportCost: "950" },
];

export const dummyIdeas = (): Omit<TourIdea, "id">[] => [
  { title: "Spanje voorjaarstour", country: "ES", supportBands: "Ilegales", targetPeriod: "april – mei", owner: "Joz (Superadmin)",
    notes: "Barcelona als startpunt, 5 shows, vlucht + busje ter plekke." },
  { title: "Duitsland weekendje", country: "DE", targetPeriod: "najaar", contactPerson: "Joost", owner: "Rob",
    notes: "Kassel opnieuw + Leipzig of Dresden." },
  { title: "UK met de Lager Louts", country: "GB", supportBands: "The Lager Louts", owner: "Jona", isScratched: true,
    notes: "Te duur na Brexit-papierwerk." },
];
