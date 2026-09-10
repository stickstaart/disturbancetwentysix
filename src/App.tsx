import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./index.css";

// Documentatie: Importeer de hoofdpagina en de agenda uit de components map
import Home from "./components/Home";
import BandDashboard from "./components/BandDashboard";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* De openbare homepage op het hoofdadres */}
        <Route path="/" element={<Home />} />

        {/* De afgeschermde Band Agenda op /agenda */}
        <Route path="/agenda" element={<BandDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
