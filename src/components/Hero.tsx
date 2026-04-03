import React from "react";

interface Show {
  date: string;
  venue: string;
  city: string;
  country: string;
  bands?: string[];
}

import { nieuweData } from '../../SHOWS/dates';

const Hero: React.FC = () => {
// Pak de huidige tijd en zet deze op het begin van de dag (00:00:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const shows = nieuweData as Show[];

  // 1. Zoek de eerstvolgende show
  const nextShow = shows
    .map(show => ({
      ...show,
      // Gebruik de slash-methode voor stabiliteit
      parsedDate: new Date(show.date.replace(/-/g, "/"))
    }))
    // Filter nu op 'today' in plaats van 'now'
    .filter(show => show.parsedDate >= today)
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())[0];
  const formattedHeroDate = new Date(nextShow.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });

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
              {formattedHeroDate.toUpperCase()} — {nextShow.venue.toUpperCase()}
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
