import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SERVICE_LABELS, safeTarget } from "../lib/outbound";

// Tussenpagina voor uitgaande links (/go/<dienst>/<item>?to=<url>).
// Vercel Analytics telt deze paginaweergave (incl. land); daarna meteen door naar de bestemming.
const GoRedirect: React.FC = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const target = safeTarget(new URLSearchParams(search).get("to"));
  const service = pathname.split("/")[2] || "";
  const label = SERVICE_LABELS[service] ?? "de link";

  useEffect(() => {
    if (!target) {
      navigate("/", { replace: true });
      return;
    }
    // Korte pauze zodat de analytics-ping zeker verstuurd is
    const t = window.setTimeout(() => window.location.replace(target), 350);
    return () => window.clearTimeout(t);
  }, [target, navigate]);

  return (
    <div className="min-h-screen bg-black text-gray-400 flex items-center justify-center p-6 text-center">
      {target && (
        <p className="text-sm uppercase tracking-widest">
          Doorsturen naar {label}…{" "}
          <a href={target} className="text-white underline">
            klik hier als het niet vanzelf gaat
          </a>
        </p>
      )}
    </div>
  );
};

export default GoRedirect;
