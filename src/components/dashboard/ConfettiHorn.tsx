import React, { useEffect, useRef, useState } from "react";

// Feestknop naast het tandwieltje: confettikanon.
// Confetti schiet centraal van onderen met hoge snelheid omhoog, waaiert uit naar links en rechts,
// wordt door luchtweerstand steeds trager en dwarrelt daarna langzaam neer.
// Geen dependencies: alles op een <canvas>.

const COLORS = ["#1fe063", "#84ff00", "#ff2a45", "#ff8a1f", "#ffea00", "#ffffff", "#38bdf8"];
const DURATION = 10000; // ms tot alles weg is (omhoog + langzaam neer)

interface Piece { x: number; y: number; w: number; h: number; vy: number; vx: number; drag: number; rot: number; vr: number; sway: number; phase: number; color: string; delay: number }

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
    const count = Math.min(240, Math.round(W / 4));
    // Natuurkunde per frame van 60 fps. Luchtweerstand = lineair + kwadratisch:
    // bij hoge snelheid remt het hard af, daarna blijft een lage valsnelheid (~2 px/frame) over.
    const GRAVITY = 0.05;
    const LINEAR = 0.022;
    const QUADRATIC = 0.0006;
    const pieces: Piece[] = Array.from({ length: count }, () => {
      const angle = (Math.random() - 0.5) * 1.9;                           // ±54° rond recht omhoog
      const speed = (H * (0.55 + Math.random() * 0.45)) / 21;               // komt tot ~55–100% van de schermhoogte
      return {
        x: W / 2 + (Math.random() - 0.5) * 6,  // uit de smalle loop van het kanon
        y: H + 4,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 10,
        vx: Math.sin(angle) * speed,
        vy: -Math.cos(angle) * speed,
        drag: 0.8 + Math.random() * 0.45,      // lichte en zwaardere snippers
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        sway: 0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 120,            // salvo over ~0,12 s (ms)
      };
    });

    const start = performance.now();
    let last = start;
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = t - start;
      const f = Math.min((t - last) / (1000 / 60), 3); // onafhankelijk van 60/120 Hz-schermen
      last = t;
      const fade = elapsed > DURATION - 1500 ? Math.max(0, (DURATION - elapsed) / 1500) : 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = fade;
      for (const p of pieces) {
        if (elapsed < p.delay) continue;
        p.phase += 0.03 * f;
        p.vy += GRAVITY * f;
        const v = Math.hypot(p.vx, p.vy);
        const keep = Math.max(0, Math.exp(-LINEAR * p.drag * f) - QUADRATIC * p.drag * v * f);
        p.vx *= keep;
        p.vy *= keep;
        const falling = p.vy > 0;
        p.x += (p.vx + (falling ? Math.sin(p.phase) * p.sway * 0.5 : 0)) * f; // dwarrelen bij het vallen
        p.y += p.vy * f;
        p.rot += p.vr * f;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.phase * 1.7)); // "kantelen" zoals papiertjes
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
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
