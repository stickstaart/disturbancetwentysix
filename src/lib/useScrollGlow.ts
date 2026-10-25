// Mobiele variant van de .glow-line hover: op apparaten zonder muis licht een regel op
// zodra hij door het midden van het scherm schuift, en fadet weer uit als hij verder gaat.
// Werkt voor alle .glow-line-elementen, ook die later verschijnen (bijv. compilaties na openklappen).
import { useEffect } from "react";

const SELECTOR = ".glow-line";
const ACTIVE = "is-glowing";

export function useScrollGlow() {
  useEffect(() => {
    // Alleen op touch-apparaten; met een muis doet :hover het werk
    if (!window.matchMedia("(hover: none)").matches || !("IntersectionObserver" in window)) return;

    // Zeer smalle band precies rond het midden van het scherm (~2% hoog): steeds één regel tegelijk
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle(ACTIVE, e.isIntersecting)),
      { rootMargin: "-49% 0px -49% 0px", threshold: 0 },
    );

    const observed = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      });

    scan();
    // Nieuwe regels oppikken (lijsten die openklappen, data die binnenkomt)
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);
}
