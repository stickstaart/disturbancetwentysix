import React, { useEffect, useRef, useState } from "react";

// Feestknop naast het tandwieltje: confettikanon.
// Echte natuurkunde, gerekend in meters en seconden (schermhoogte = 5 m):
// - mondingssnelheid 16–22 m/s (≈ 60–80 km/h), zwaartekracht 9,81 m/s²
// - de snippers verlaten de loop als een prop en waaieren pas uit; daardoor groeit de
//   luchtweerstand (kwadratisch in de snelheid) in ~0,5 s van bijna niets naar vol
// - daarna vallen ze met hun eigen eindsnelheid en dwarrelen ze:
//   papier 0,7–1,2 m/s, glitter 0,35–0,6 m/s (fonkelt), folieslierten 0,5–0,8 m/s (krullen en glanzen)
// Geen dependencies: alles op een <canvas>.

const COLORS = ["#1fe063", "#84ff00", "#ff2a45", "#ff8a1f", "#ffea00", "#ffffff", "#38bdf8"];
const METALLIC = ["#f5c84c", "#e5e7eb", "#ff5fa2", "#4ade80", "#60a5fa", "#ff4d4d", "#c084fc"];

type Kind = "paper" | "glitter" | "foil";
const DURATION = 11000; // ms tot alles weg is (omhoog + langzaam neer)

interface Piece { kind: Kind; x: number; y: number; w: number; h: number; vy: number; vx: number; vt: number; spread: number; rot: number; vr: number; sway: number; phase: number; color: string; delay: number }

function Confetti({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Via een ref, zodat een re-render van de agenda (live updates) de animatie niet herstart
  const doneRef = useRef(onDone);
  useEffect(() => { doneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const count = Math.min(380, Math.round(W / 2.6));
    const M = H / 5;     // pixels per meter
    const G = 9.81;      // m/s²
    const pieces: Piece[] = Array.from({ length: count }, () => {
      const r = Math.random();
      const kind: Kind = r < 0.5 ? "paper" : r < 0.82 ? "glitter" : "foil";
      const angle = (Math.random() - 0.5) * 1.4;  // ±40° rond recht omhoog
      const speed = 16 + Math.random() * 6;        // m/s
      const size =
        kind === "paper" ? { w: 6 + Math.random() * 6, h: 8 + Math.random() * 10, vt: 0.7 + Math.random() * 0.5 }
        : kind === "glitter" ? { w: 2 + Math.random() * 2, h: 2 + Math.random() * 2, vt: 0.35 + Math.random() * 0.25 }
        : { w: 1.2 + Math.random() * 0.8, h: 28 + Math.random() * 30, vt: 0.5 + Math.random() * 0.3 };
      return {
        kind,
        x: W / 2 + (Math.random() - 0.5) * 6,     // uit de smalle loop van het kanon (px)
        y: H + 4,
        ...size,                                   // w/h in px, vt = eindvalsnelheid in m/s
        vx: Math.sin(angle) * speed,               // m/s
        vy: -Math.cos(angle) * speed,              // m/s, negatief = omhoog
        spread: 0.4 + Math.random() * 0.25,        // s tot de prop volledig uiteengevallen is
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * (kind === "foil" ? 5 : 12), // rad/s
        sway: kind === "glitter" ? 0.05 + Math.random() * 0.1 : 0.15 + Math.random() * 0.3, // m/s zijwaarts
        phase: Math.random() * Math.PI * 2,
        color: (kind === "paper" ? COLORS : METALLIC)[Math.floor(Math.random() * (kind === "paper" ? COLORS : METALLIC).length)],
        delay: Math.random() * 0.08,               // s: salvo, niet alles in hetzelfde frame
      };
    });

    const start = performance.now();
    let last = start;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const dt = Math.min((now - last) / 1000, 0.05); // seconden; los van 60/120 Hz
      last = now;
      const fade = elapsed > DURATION - 1500 ? Math.max(0, (DURATION - elapsed) / 1500) : 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = fade;
      // In kleine stapjes rekenen: de remming is aan het eind van de prop-fase heel sterk
      const steps = Math.ceil(dt / 0.004);
      const h = dt / steps;
      for (const p of pieces) {
        const age = elapsed / 1000 - p.delay;
        if (age < 0) continue;
        const k = (G / (p.vt * p.vt)) * Math.min(1, (age / p.spread) ** 3); // groeiende luchtweerstand
        for (let i = 0; i < steps; i++) {
          const v = Math.hypot(p.vx, p.vy);
          p.vy += G * h;
          const keep = 1 / (1 + k * v * h); // stabiele kwadratische weerstand
          p.vx *= keep;
          p.vy *= keep;
          p.x += p.vx * M * h;
          p.y += p.vy * M * h;
        }
        p.phase += 9 * dt;
        if (p.vy > 0) p.x += Math.sin(p.phase) * p.sway * M * dt; // dwarrelen bij het vallen
        p.rot += p.vr * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const tilt = Math.cos(p.phase * (p.kind === "glitter" ? 2.2 : 0.6)); // kantelen naar het licht
        if (p.kind === "foil") {
          // dunne slinger die krult; glanst wit als hij plat naar je toe draait
          const bend = Math.sin(p.phase * 0.8) * p.h * 0.35;
          ctx.strokeStyle = Math.abs(tilt) > 0.92 ? "#ffffff" : p.color;
          ctx.lineWidth = p.w;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(0, -p.h / 2);
          ctx.quadraticCurveTo(bend, 0, 0, p.h / 2);
          ctx.stroke();
        } else if (p.kind === "glitter") {
          // fonkelen: alleen zichtbaar fel als het vlakje het licht vangt
          ctx.globalAlpha = fade * (0.35 + 0.65 * Math.abs(tilt));
          ctx.fillStyle = Math.abs(tilt) > 0.95 ? "#ffffff" : p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.scale(1, tilt);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
      if (elapsed < DURATION) raf = requestAnimationFrame(tick);
      else doneRef.current();
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none z-[70]" aria-hidden />;
}

export const ConfettiHornButton: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [burst, setBurst] = useState(0); // telt op per druk, zodat opnieuw drukken opnieuw start

  const fire = () => setBurst((b) => b + 1);

  return (
    <>
      <button type="button" onClick={fire} aria-label="Confetti!" title="Confetti!" className={`shrink-0 p-3 rounded-xl border cursor-pointer text-xl leading-none ${className}`}>
        <span aria-hidden>🎉</span>
      </button>
      {burst > 0 && (
        <Confetti key={burst} onDone={() => setBurst(0)} />
      )}
    </>
  );
};
