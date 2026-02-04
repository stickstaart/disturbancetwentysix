import React, { useState } from "react";

const Nav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed top-0 left-0 w-full bg-black bg-opacity-90 text-white z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <img
          src="/Disturbance_L.svg"
          alt="Disturbance Logo"
          className="w-[150px] md:w-[200px]"
        />

        {/* Hamburger Menu */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white focus:outline-none"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 uppercase text-sm font-semibold">
          <li><a href="#hero" className="hover:text-gray-400 transition-colors">Home</a></li>
          <li><a href="#video" className="hover:text-gray-400 transition-colors">Video</a></li>
          <li><a href="#tour" className="hover:text-gray-400 transition-colors">Tour</a></li>
          <li><a href="#music" className="hover:text-gray-400 transition-colors">Music</a></li>
          <li><a href="#bio" className="hover:text-gray-400 transition-colors">Bio</a></li>
          <li><a href="#contact" className="hover:text-gray-400 transition-colors">Contact</a></li>
          <li><a href="#history" className="hover:text-gray-400 transition-colors">History</a></li>
        </ul>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden bg-black transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <ul className="flex flex-col items-center gap-6 py-8 uppercase text-lg font-bold">
          <li><a href="#hero" onClick={toggleMenu} className="hover:text-accent">Home</a></li>
          <li><a href="#video" onClick={toggleMenu} className="hover:text-accent">Video</a></li>
          <li><a href="#tour" onClick={toggleMenu} className="hover:text-accent">Tour</a></li>
          <li><a href="#music" onClick={toggleMenu} className="hover:text-accent">Music</a></li>
          <li><a href="#bio" onClick={toggleMenu} className="hover:text-accent">Bio</a></li>
          <li><a href="#contact" onClick={toggleMenu} className="hover:text-accent">Contact</a></li>
          <li><a href="#history" onClick={toggleMenu} className="hover:text-accent">History</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
