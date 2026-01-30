import React from "react";

const Nav: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-black bg-opacity-90 text-white z-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <img
          src="/src/assets/Disturbance_L.svg"
          alt="Disturbance Logo"
          className="w-[200px] "
        />
        <ul className="flex gap-6 uppercase text-sm font-semibold">
          <li><a href="#hero" className="hover:text-gray-300 hover:scale-110 transition transform duration-200">Home</a>
          </li>
          <li><a href="#video" className="hover:text-gray-300 hover:scale-110 transition transform duration-200">Video</a>
          </li>
          <li><a href="#tour" className="hover:text-gray-300 hover:scale-110 transition transform duration-200">Tour</a>
          </li>
          <li><a href="#music"
                 className="hover:text-gray-300 hover:scale-110 transition transform duration-200">Music</a></li>
          <li><a href="#bio" className="hover:text-gray-300 hover:scale-110 transition transform duration-200">Bio</a>
          </li>
          <li><a href="#contact"
                 className="hover:text-gray-300 hover:scale-110 transition transform duration-200">Contact</a></li>
        </ul>

      </div>
    </nav>
  );
};

export default Nav;
