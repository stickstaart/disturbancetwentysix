import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import "./index.css";

// Documentatie: Importeer de hoofdpagina uit de components map
import Home from "./components/Home";
import GoRedirect from "./components/GoRedirect";
import { useScrollGlow } from "./lib/useScrollGlow";

const App: React.FC = () => {
  // Mobiel: groene lijnen lichten op tijdens scrollen (desktop gebruikt hover)
  useScrollGlow();

  return (
    <Router>
      <Routes>
        {/* De openbare homepage op het hoofdadres */}
        <Route path="/" element={<Home />} />

        {/* Uitgaande links: tellen in Vercel Analytics, dan doorsturen */}
        <Route path="/go/*" element={<GoRedirect />} />
      </Routes>

      {/* Vercel Web Analytics + Speed Insights (telt ook routewissels) */}
      <Analytics />
      <SpeedInsights />
    </Router>
  );
};

export default App;
