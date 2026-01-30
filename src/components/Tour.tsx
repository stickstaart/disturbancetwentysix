import React from "react";
import { nieuweData } from '../../SHOWS/dates';

// We definiëren de blauwdruk voor een Show
interface Show {
  date: string;
  venue: string;
  city: string;
  country: string;
  bands?: string[];
}

const Tour: React.FC = () => {
  const now = new Date();

// We vertellen TypeScript dat onze data voldoet aan de Show-interface
  const shows = nieuweData as Show[];

// Filter en sorteer de shows
  const upcomingShows = shows
    .filter(show => new Date(show.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

// Helper functie voor de datum: 2026-02-28 -> 28 FEB 2026
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };
  return (
    <section id="tour" className="py-20 bg-gray-900 text-white text-center">
      <h2 className="text-4xl font-bold mb-12 uppercase">Upcoming Tour Dates</h2>

      {upcomingShows.length === 0 && (
        <p className="opacity-60 text-center py-12">
          No upcoming shows. Stay alert.
        </p>
      )}

      <div className="max-w-5xl mx-auto px-4">

        {/* MOBILE VIEW: Kaarten */}
        <div className="grid gap-6 sm:grid-cols-2 md:hidden">
          {upcomingShows.map((t, i) => (
            <div key={i}
                 className="group relative bg-black p-6 rounded-lg border border-gray-700 overflow-hidden min-h-[160px] flex flex-col justify-center">
              <div className="absolute inset-0 bg-black/80 z-0"></div>
              <div className="relative z-10">
                <p className="font-semibold text-accent">{formatDate(t.date)}</p>
                <p className="text-xl font-bold">{t.city}</p>
                <p className="text-gray-400">{t.venue}</p>

                {/* Bands zichtbaar op mobile (altijd of via touch) */}
                {t.bands && t.bands.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    with {t.bands.join(', ')}
                  </p>
                )}
                <span className={`fi fi-${t.country.toLowerCase()} fib mt-2 inline-block`}></span>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW: Lijst met Hover effect voor bands */}
        <div className="hidden md:block">
          <div className="flex flex-col">
            {upcomingShows.map((t, i) => (
              <div key={i}
                   className="group relative flex items-center justify-between p-5 bg-black/40 border-b border-gray-800 hover:bg-black/60 hover:border-white transition-all duration-300">

                {/* Datum links */}
                <div className="w-1/4 text-left font-mono text-gray-400 group-hover:text-white transition-colors">
                  {formatDate(t.date)}
                </div>

                {/* Stad & Venue midden */}
                <div className="w-2/4 text-center relative">
                  {/* Stad en Venue (verdwijnen deels/worden lichter bij hover) */}
                  <div className="group-hover:opacity-20 transition-opacity duration-300">
                    <span className="text-xl font-bold uppercase tracking-wide">{t.city}</span>
                    <span className="mx-3 text-gray-600">|</span>
                    <span className="text-gray-400 uppercase text-sm">{t.venue}</span>
                  </div>

                  {/* Bands (Alleen zichtbaar bij hover) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">
                      {t.bands && t.bands.length > 0
                        ? `with ${t.bands.join(', ')}`
                        : 'Headline Show'}
                    </p>
                  </div>
                </div>

                {/* Vlag & Landcode rechts */}
                <div className="w-1/4 text-right flex justify-end items-center gap-4">
                   <span className="text-xs font-mono text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     {t.country}
                   </span>
                  <span className={`fi fi-${t.country.toLowerCase()} fib shadow-lg scale-110`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Tour;
