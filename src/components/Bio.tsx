import React from "react";

const Bio: React.FC = () => {
  return (
    <section id="bio" className="py-24 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* FOTO KANT */}
          <div className="w-full lg:w-1/2 relative group">
            {/* Punk-stijl fotolijst / offset */}
            <div className="absolute -inset-4 border-2 border-white/10 translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>

            <div className="relative overflow-hidden border border-white/20 shadow-2xl">
              <img
                src="/Disturbance-square-0030834.jpg"
                alt="Disturbance Live"
                className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              />
              {/* Overlay voor extra rauwe vibe */}
              <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
            </div>

            <p className="mt-6 text-[10px] uppercase tracking-[0.5em] text-gray-500 italic text-center lg:text-left">
              Established 1995 • Rotterdam Hardcore Punk
            </p>
          </div>

          {/* TEKST KANT */}
          <div className="w-full lg:w-1/2 space-y-6">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
              Since <span className="text-white">1995</span>
            </h2>

            <div className="space-y-4 text-gray-300 text-lg leading-relaxed font-light">
              <p>
                Going at it since 1995, originating in the rough Rotterdam (NL) area,
                Disturbance toured all over <span className="text-white font-semibold italic">Europe, UK, China, Brasil, USA and South-Africa.</span>
              </p>

              <p className="border-l-4 border-white pl-6 py-2 italic bg-white/5 text-white font-medium">
                "Disturbance is known as a super tight and explosive live act with a crazy energetic and charismatic singer,
                once described by a German music critic as <span className="text-accent uppercase not-italic font-black">Iggy Pop with a Mohawk!</span>"
              </p>

              <p>
                The music however resembles an original version of the UK ‘77 and ‘82 Punk sound with a touch of Anarcho and Hardcore Punk.
                Add some sharp socially critical lyrics with sometimes party and/or “fuck you” attitude and you’ll have an idea of what Disturbance is all about.
              </p>
            </div>

            <div className="pt-8">
              <a href="#contact" className="inline-block border-2 border-white px-8 py-3 uppercase font-black tracking-widest hover:bg-white hover:text-black transition-all">
                Contact / Booking
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Bio;
