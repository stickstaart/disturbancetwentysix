// Testmodus: testdata zichtbaar (agenda-knoppen + TOUR/HISTORY/Next show).
// Aan bij `npm run dev`, of op Vercel via VITE_TEST_MODE=true (alleen voor de Preview-omgeving instellen!).
export const isTestMode = import.meta.env.DEV || import.meta.env.VITE_TEST_MODE === "true";
