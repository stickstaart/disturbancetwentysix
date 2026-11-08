import React, { useEffect, useRef, useState } from "react";

// Feestknop naast het tandwieltje: scheepshoorn + "HAHA, I LIVE!!" + langzaam dwarrelende confetti.
// Geen dependencies: confetti op een <canvas>, de hoorn met de Web Audio API.
// Geluid speelt alleen als het apparaat geluid aan heeft (iOS: stille modus = stil).

const COLORS = ["#1fe063", "#84ff00", "#ff2a45", "#ff8a1f", "#ffea00", "#ffffff", "#38bdf8"];
const DURATION = 7000; // ms tot alles weg is

/** Scheepshoorn: twee lage, licht ontstemde zaagtanden door een laagdoorlaatfilter */
function playHorn() {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const now = ctx.currentTime;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, now);
  out.gain.exponentialRampToValueAtTime(0.35, now + 0.15); // aanzwellen
  out.gain.setValueAtTime(0.35, now + 1.6);
  out.gain.exponentialRampToValueAtTime(0.0001, now + 2.4); // uitsterven
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 700;
  filter.Q.value = 4;
  filter.connect(out).connect(ctx.destination);
  [73.4, 110.1, 74.2].forEach((f) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(f * 0.97, now);
    osc.frequency.linearRampToValueAtTime(f, now + 0.25); // klein "glijtje" omhoog bij het aanblazen
    osc.connect(filter);
    osc.start(now);
    osc.stop(now + 2.5);
  });
  window.setTimeout(() => void ctx.close(), 3000);
}

interface Piece { x: number; y: number; w: number; h: number; vy: number; vx: number; rot: number; vr: number; sway: number; phase: number; color: string }

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
    const count = Math.min(220, Math.round(W / 4));
    const pieces: Piece[] = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * window.innerHeight * 0.6, // verspreid boven het scherm starten
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 10,
      vy: 0.6 + Math.random() * 1.1, // langzaam vallen
      vx: (Math.random() - 0.5) * 0.6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.12,
      sway: 0.6 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = t - start;
      const fade = elapsed > DURATION - 1500 ? Math.max(0, (DURATION - elapsed) / 1500) : 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = fade;
      for (const p of pieces) {
        p.phase += 0.03;
        p.x += p.vx + Math.sin(p.phase) * p.sway * 0.5; // dwarrelen
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

  const fire = () => {
    playHorn();
    setBurst((b) => b + 1);
  };

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
