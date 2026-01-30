import React from "react";
import { FaFacebookF, FaInstagram, FaYoutube, FaSpotify, FaBandcamp, FaLink } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-gray-500 py-12 border-t border-gray-900 text-center">
      <div className="max-w-7xl mx-auto px-6">

        {/* LOGO IN FOOTER - GECENTREERD */}
        <div className="flex justify-center mb-10">
          <img
            src="/Disturbance_L.svg"
            alt="Disturbance Logo"
            className="w-[200px] h-auto opacity-80 hover:opacity-100 transition-opacity"
          />
        </div>


        {/* SOCIAL LINKS GRID */}
        <div className="flex justify-center flex-wrap gap-8 mb-10">
          <a href="https://www.facebook.com/disturbancepunknl" target="_blank" rel="noopener noreferrer"
             className="hover:text-white hover:scale-125 transition-all duration-200 text-xl">
            <FaFacebookF title="Facebook" />
          </a>
          <a href="https://www.instagram.com/disturbance_official" target="_blank" rel="noopener noreferrer"
             className="hover:text-white hover:scale-125 transition-all duration-200 text-xl">
            <FaInstagram title="Instagram" />
          </a>
          <a href="https://www.youtube.com/user/disturbancepunk1?sub_confirmation=1" target="_blank" rel="noopener noreferrer"
             className="hover:text-white hover:scale-125 transition-all duration-200 text-xl">
            <FaYoutube title="YouTube" />
          </a>
          <a href="https://open.spotify.com/artist/2YomKyw73NZ5n19DYzp0j8" target="_blank" rel="noopener noreferrer"
             className="hover:text-[#1DB954] hover:scale-125 transition-all duration-200 text-xl">
            <FaSpotify title="Spotify" />
          </a>
          <a href="https://disturbance.bandcamp.com" target="_blank" rel="noopener noreferrer"
             className="hover:text-[#629aa9] hover:scale-125 transition-all duration-200 text-xl">
            <FaBandcamp title="Bandcamp" />
          </a>
          {/* LINKTREE LINK */}
          <a href="https://linktr.ee/disturbance_official" target="_blank" rel="noopener noreferrer"
             className="hover:text-white hover:scale-125 transition-all duration-200 text-xl">
            <FaLink title="Linktree" />
          </a>
        </div>

        {/* COPYRIGHT & INFO */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] font-bold">
            &copy; {new Date().getFullYear()} Disturbance • Rotterdam Punk
          </p>
          <p className="text-[10px] uppercase tracking-widest text-gray-700">
            Independent & Proud since 1995
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
