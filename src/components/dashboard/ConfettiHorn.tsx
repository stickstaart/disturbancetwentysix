import React, { useEffect, useRef, useState } from "react";

// Feestknop naast het tandwieltje: "HAHA, I LIVE!!" + confettikanon.
// Confetti schiet centraal van onderen omhoog, waaiert uit naar links en rechts en dwarrelt daarna langzaam neer.
// Geen dependencies: alles op een <canvas>.

const COLORS = ["#1fe063", "#84ff00", "#ff2a45", "#ff8a1f", "#ffea00", "#ffffff", "#38bdf8"];
const DURATION = 9000; // ms tot alles weg is (omhoog + langzaam neer)

interface Piece { x: number; y: number; w: number; h: number; vy: number; vx: number; rot: number; vr: number; sway: number; phase: number; color: string; delay: number }

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
    const GRAVITY = 0.22;  // px per frame²
    const TERMINAL = 1.3;  // max valsnelheid: langzaam dwarrelen
    const pieces: Piece[] = Array.from({ length: count }, () => {
      const angle = (Math.random() - 0.5) * 1.3;                          // ±37° rond recht omhoog
      const speed = Math.sqrt(2 * GRAVITY * H * (0.55 + Math.random() * 0.5)); // komt tot ~55–105% van de schermhoogte
      return {
        x: W / 2 + (Math.random() - 0.5) * 24, // uit de "loop" van het kanon
        y: H + 10,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 10,
        vx: Math.sin(angle) * speed * 1.35,     // iets extra breed uitwaaieren
        vy: -Math.cos(angle) * speed,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        sway: 0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.floor(Math.random() * 12), // salvo over ~0,2 s
      };
    });

    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = t - start;
      const fade = elapsed > DURATION - 1500 ? Math.max(0, (DURATION - elapsed) / 1500) : 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = fade;
      for (const p of pieces) {
        if (p.delay > 0) { p.delay--; continue; }
        p.phase += 0.03;
        p.vy = Math.min(p.vy + GRAVITY, TERMINAL);
        p.vx *= p.vy < 0 ? 0.985 : 0.96; // luchtweerstand, sterker zodra hij valt
        const falling = p.vy > 0;
        p.x += p.vx + (falling ? Math.sin(p.phase) * p.sway * 0.5 : 0); // dwarrelen bij het vallen
        p.y += p.vy;
        p.rot += p.vr;
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
      <button type="button" onClick={fire} aria-label="HAHA, I LIVE!!" title="HAHA, I LIVE!!" className={`shrink-0 p-3 rounded-xl border cursor-pointer text-xl leading-none ${className}`}>
        <span aria-hidden>🎉</span>
      </button>
      {burst > 0 && (
        <React.Fragment key={burst}>
          <Confetti onDone={() => setBurst(0)} />
          <div className="fixed inset-0 z-[71] pointer-events-none flex items-center justify-center px-4" role="status">
            <span className="haha-i-live font-display text-[clamp(3rem,12vw,8rem)] font-extrabold uppercase leading-none text-center text-white">
              HAHA, I LIVE!!
            </span>
          </div>
        </React.Fragment>
      )}
    </>
  );
};
