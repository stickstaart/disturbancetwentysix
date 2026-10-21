import React from "react";

interface Show {
  date: string;
  venue: string;
  city: string;
  country: string;
  bands?: string[];
}

import { useSiteShows } from '../lib/useSiteShows';
import { parseLocalDate, todayString } from './dashboard/dateUtils';

const Hero: React.FC = () => {
  // Zelfde bron als TOUR/HISTORY: archief + aangekondigde shows uit de agenda
  const shows = useSiteShows() as Show[];
  const today = todayString();

  // Eerstvolgende show (vandaag telt mee); alleen volledige datums (archief heeft soms alleen een jaartal)
  const nextShow = shows
    .filter((show) => /^\d{4}-\d{2}-\d{2}$/.test(show.date) && show.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const heroDate = nextShow ? parseLocalDate(nextShow.date) : null;
  const formattedHeroDate = heroDate
    ? heroDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    : '';

  return (
    <section
      id="hero"
      className="relative h-screen flex flex-col justify-center items-center text-center bg-black text-white overflow-hidden">
      {/* Achtergrond overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-80"></div>

      {/* Content */}
      <div className="relative z-10 px-4 animate-fade-in">
        <img
          src="/Disturbance_L.svg"
          alt="Disturbance Logo"
          className="mx-auto mb-4 w-[600px]"
        />

        {/* 2. De Next Show Sectie */}
        {nextShow && (
          <div
            className="mb-8 animate-fade-up delay-200 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg inline-block">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Next Show</p>
            <p className="text-lg font-bold">
              {formattedHeroDate.toUpperCase()} — {(nextShow.venue || 'TBA').toUpperCase()}
            </p>
            <div>
              <p className="text-sm text-gray-300">{nextShow.city}</p>
              <span className={`fi fi-${nextShow.country.toLowerCase()} fib`}></span>
            </div>
            <p className="text-sm text-gray-300">
              {nextShow.bands && nextShow.bands.length > 0 && (
                <>
                  with {new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(nextShow.bands)}
                </>
              )}
            </p>

          </div>
        )}

        <div className="flex justify-center gap-4 animate-fade-up delay-300">
          <a
            href="#tour"
            className="px-6 py-3 border-2 border-white hover:bg-white hover:text-black transition-all duration-300 uppercase font-bold"
          >
            Tour Dates
          </a>
          <a
            href="#music"
            className="px-6 py-3 border-2 border-white hover:bg-white hover:text-black transition-all duration-300 uppercase font-bold"
          >
            Listen
          </a>
        </div>
      </div>

      {/* Subtle animated achtergrond */}
      <div className="absolute inset-0 -z-0">
        <div
          className="w-full h-full bg-[url('/src/assets/BG_Tox_Website.png')] bg-cover opacity-20 animate-pulse [animation-duration:5s]"
        ></div>
      </div>
    </section>
  );
};

export default Hero;
