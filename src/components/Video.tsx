import React from "react";

const Videos: React.FC = () => {
  return (
    <section id="video" className="py-24 bg-black overflow-hidden border-y border-gray-900">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* VIDEO 1: OFFICIAL CLIP */}
          <div className="flex flex-col">
            <div className="relative group">
              <div className="absolute -inset-2 bg-white/5 translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative aspect-video border border-white/20 bg-gray-900 group-hover:border-white transition-colors">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/i33-SrbQpTE"
                  title="Disturbance - Down In Flames"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold uppercase italic">Down In Flames</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Official Animated Video</p>
            </div>
          </div>

          {/* VIDEO 2: LIVE AT GGI */}
          <div className="flex flex-col">
            <div className="relative group">
              {/* Schaduw nu dezelfde kant op voor eenheid */}
              <div className="absolute -inset-2 bg-white/5 translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative aspect-video border border-white/20 bg-gray-900 group-hover:border-white transition-colors">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/0BmN-xNhRz4"
                  title="Disturbance - Live at GGI"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold uppercase italic">Live at BAROEG ROTTERDAM</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Raw Energy — No Bullshit</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Videos;
