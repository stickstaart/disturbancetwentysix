import React from "react";

// De data voor je eigen releases
const mainReleases = [
  {
    id: 'civilization-leftovers',
    title: 'Civilization Leftovers',
    type: 'Split 10" with Blatoidea / 10"',
    year: '2024',
    cover: '/releases/civilization-leftovers.webp',
    label: 'Katabomb Records (France)',
    spotify: 'https://open.spotify.com/album/30v8cKBiNCRy113LhLAhwf' ,
    bandcamp: 'https://disturbancepunk.bandcamp.com/album/civilization-leftovers',
    shop: 'https://katabombrecords.com/index.php?id_product=560...'
  },
  {
    id: 'tox-populi',
    title: 'Tox Populi',
    type: 'Full Album / CD and LP',
    year: '2018',
    cover: '/releases/tox-populi.webp',
    label: 'Punk ‘n’ Loud Records (Greece), Dirty Punk Records (France), Dead Lamb Records (Ireland), Dirty Old Man' +
      ' Records (UK)',
    spotify: 'https://open.spotify.com/album/0ODUvNfdFzJrUWe3utlPhv',
    bandcamp: 'https://disturbancepunk.bandcamp.com/album/tox-populi',
    shop: '#'
  },
  {
    id: 'disturbance-burninglady',
    title: 'Disturbance / Burning Lady',
    type: 'Split 10" with Burning Lady / 10"',
    year: '2011',
    cover: '/releases/disturbance-burninglady.webp',
    label: 'Dirty Punk Records (France)',
    spotify: 'https://open.spotify.com/album/09AfLfuStDOf8TfK3kmMLL',
    bandcamp: 'https://disturbancepunk.bandcamp.com/album/disturbance-burning-lady-split-album',
    shop: '#'
  },
  {
    id: 'shades-of-fear',
    title: 'Shades of Fear',
    type: 'Full Album / CD and LP',
    year: '2007',
    cover: '/releases/shades-of-fear.webp',
    label: 'Dirty Punk Records (France)',
    spotify: 'https://open.spotify.com/album/4PG3VKo6boT50JaqkBTQMH',
    bandcamp: 'https://disturbancepunk.bandcamp.com/album/shades-of-fear',
    shop: '#'
  },
  {
    id: 'malice-in-slumberland',
    title: 'Malice in Slumberland',
    type: 'Full Album / CD and LP',
    year: '2003',
    cover: '/releases/malice-in-slumberland.webp',
    label: 'StreetMusic OTK Records (Germany)',
    spotify: 'https://open.spotify.com/album/67ytXdYJsamj9wYoK3dbd1',
    bandcamp: 'https://disturbancepunk.bandcamp.com/album/malice-in-slumberland',
    shop: '#'
  },

  {
    id: 'live-on-to-decline',
    title: 'Live on to Decline',
    type: 'EP / 7"',
    year: '2001',
    cover: '/releases/live-on-to-decline.webp',
    label: 'Tocado Records (The Netherlands)',
    spotify: 'https://open.spotify.com/album/3KIx2EC9nUcWuBS19yhgdC',
    bandcamp: 'https://disturbancepunk.bandcamp.com/album/live-on-to-decline-first-ep-release',
    shop: '#'
  },
];

// De verzamelalbums (overkill voorkomen)
const compilations = [
  "Never Too Old To Motörhead || Katabomb Records, 2023 (France, CD & LP)",
  "30 Jahre Gaussplatz || Vogelfrei, 2023 (Germany, LP)",
  "Compilation Vol.1 || Kids Union Records, 2020 (China, CD & LP)",
  "Punk's not Deaf || Repunkerator Records, 2013 (NL, LP)",
  "Oi! Made in Holland 2 || Rebellion Records, 2013 (NL, CD)",
  "Angry Scene Records Compilation Vol. 2 || Angry Scene Records, 2007 (UK, CD)",
  "Beer Bois United || Neuro Empire Records, ???? (Russia, CD & LP)",
  "PunkShit Volume 3 || PunkShit Records, 2007 (UK, CD)",
  "Oi! Made in Holland || Rebellion Records, 2005 (NL, CD)",
  "Punk in Sunderland Volume 4 || Stretch Records, 2005 (UK, CD)",
  "PunkShit Volume 2 || PunkShit Records, 2004 (UK, CD)",
  "Punk in Sunderland Volume 3 || Stretch Records, 2004 (UK, CD)",
  "PunkShit Volume 1 || PunkShit Records, 2003 (UK, CD)",
  "Krusefix Compilation || Agressive Noise 014, 2003 (Germany, CD)",
  "Las Fronteras No Nos Paran || 2002 (Equador, CD)",
  "Threat Records Compilation || Threat Records, 2002 (Indonesia, Casette)",
  "Best of Heel Erg Punk || Tocado Records, 2001 (NL, CD)",
  "Heel Erg Punk II || Tocado Records, 1999 (NL, CD)",
  "The First, 6 tracks of Punk || Self Published, 1996 (NL, DEMO CD & Cassette)"
];

const Discography: React.FC = () => {
  return (
    <section id="music" className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-12 uppercase text-center tracking-tighter">
          Releases
        </h2>

        {/* MAIN RELEASES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {mainReleases.map((release, index) => (
            <div key={index} className="group relative flex flex-col bg-zinc-900 overflow-hidden">
              {/* Afbeelding Container */}
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={release.cover}
                  alt={release.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay: Op desktop verschijnt deze bij hover. Op mobiel verbergen we deze overlay vaak om verwarring te voorkomen, OF we laten hem staan. */}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <h3 className="text-xl font-black uppercase text-white mb-4 text-center leading-none">
                    {release.title} ({release.year})
                  </h3>

                  {/* Desktop Links (binnen de hover) */}
                  <div className="hidden md:flex flex-col gap-3 w-full max-w-[160px]">
                    <a href={release.spotify} target="_blank" className="bg-[#1DB954] hover:bg-[#1ed760] text-white py-2 px-4 rounded-full text-xs font-bold uppercase text-center transition-colors">
                      Spotify
                    </a>
                    <a href={release.bandcamp} target="_blank" className="bg-[#629aa9] hover:bg-[#72aab9] text-white py-2 px-4 rounded-full text-xs font-bold uppercase text-center transition-colors">
                      Bandcamp
                    </a>
                  </div>
                </div>
              </div>

              {/* Mobiele Links: Altijd zichtbaar direct onder de afbeelding op kleine schermen */}
              <div className="flex md:hidden border-t border-white/10">
                <a
                  href={release.spotify}
                  target="_blank"
                  className="flex-1 bg-[#1DB954] text-white py-4 text-center text-xs font-black uppercase tracking-tighter"
                >
                  Spotify
                </a>
                <a
                  href={release.bandcamp}
                  target="_blank"
                  className="flex-1 bg-[#629aa9] text-white py-4 text-center text-xs font-black uppercase tracking-tighter border-l border-black/20"
                >
                  Bandcamp
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* COMPILATIONS LIST */}
        <div className="mt-24 pt-12 border-t border-gray-800 text-left max-w-3xl mx-auto">
          <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500 mb-10 text-center">
            Also featured on various compilations
          </h3>

          <div className="flex flex-col space-y-3">
            {compilations.map((item, index) => {
              // Split de string op de '||'
              const [title, details] = item.split(" || ");

              return (
                <div
                  key={index}
                  className="group border-b border-gray-900 pb-2 flex flex-col md:flex-row md:justify-between md:items-baseline transition-all duration-300 hover:border-white/20"
                >
                  {/* Titel van de compilatie */}
                  <strong className="text-white font-bold uppercase tracking-tight text-base group-hover:text-accent">
                    {title}
                  </strong>

                  {/* Details (Label, Jaar, Land) */}
                  {details && (
                    <span className="text-gray-500 text-xs uppercase tracking-wider md:text-right">
              {details}
            </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Discography;
