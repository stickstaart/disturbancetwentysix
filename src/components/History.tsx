import React, { useState } from 'react';
import { nieuweData } from '../../SHOWS/dates.js';

interface Show {
  date: string;
  venue: string;
  city: string;
  country: string;
  bands?: string[];
}

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const shows = nieuweData as Show[];

  // 1. Filter alleen de shows uit het verleden
  const pastShows = shows
    .filter(show => new Date(show.date) < new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // 2. Uitgebreide en veilige filter logica
  const filteredShows = pastShows.filter(show => {
    const search = searchTerm.toLowerCase();

    // Veilig velden uitlezen (voorkomt crashes bij undefined)
    const city = (show.city || "").toLowerCase();
    const country = (show.country || "").toLowerCase();
    const venue = (show.venue || "").toLowerCase();
    const date = (show.date || "");

    // Bands array omzetten naar string om te kunnen doorzoeken
    const bandsList = show.bands ? show.bands.join(", ").toLowerCase() : "";

    return (
      city.includes(search) ||
      country.includes(search) ||
      venue.includes(search) ||
      date.includes(search) ||
      bandsList.includes(search)
    );
  });

  return (
    <section id="history" className="py-20 bg-black text-white px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 uppercase tracking-tighter italic">Gig History</h2>

        <p className="mb-6 text-gray-400 font-mono">
          {pastShows.length} SHOWS PLAYED
        </p>

        {/* Zoekbalk met verbeterde placeholder */}
        <input
          type="text"
          placeholder="SEARCH BY CITY, VENUE, BAND OR YEAR..."
          className="w-full p-4 mb-10 bg-zinc-900 border-2 border-zinc-700 text-white focus:outline-none focus:border-red-600 transition font-mono"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="space-y-4">
          {filteredShows.length > 0 ? (
            filteredShows.map((show, index) => (
              <div
                // Unieke key door combinatie van datum, stad en index
                key={`${show.date}-${show.city}-${index}`}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b border-zinc-800 pb-4 hover:bg-zinc-900/50 transition p-2"
              >
                <div className="text-red-600 font-mono">
                  {/* Draait de datum om van YYYY-MM-DD naar DD-MM-YYYY voor de look */}
                  {show.date.split('-').reverse().join('-')}
                </div>
                <div className="font-bold uppercase italic">{show.city} ({show.country})</div>
                <div className="text-gray-300">{show.venue}</div>
                <div className="text-xs text-gray-500 italic">
                  {show.bands && show.bands.length > 0 ? `w/ ${show.bands.join(', ')}` : ''}
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-500 font-mono">NO SHOWS FOUND FOR "{searchTerm.toUpperCase()}"</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default History;
