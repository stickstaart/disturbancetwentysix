import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import "./index.css";

// Documentatie: Importeer de hoofdpagina en de agenda uit de components map
import Home from "./components/Home";
import BandDashboard from "./components/BandDashboard";
import { useScrollGlow } from "./lib/useScrollGlow";

const App: React.FC = () => {
  // Mobiel: groene lijnen lichten op tijdens scrollen (desktop gebruikt hover)
  useScrollGlow();

  return (
    <Router>
      <Routes>
        {/* De openbare homepage op het hoofdadres */}
        <Route path="/" element={<Home />} />

        {/* De afgeschermde Band Agenda op /agenda */}
        <Route path="/agenda" element={<BandDashboard />} />
      </Routes>

      {/* Vercel Web Analytics + Speed Insights (telt ook routewissels) */}
      <Analytics />
      <SpeedInsights />
    </Router>
  );
};

export default App;
