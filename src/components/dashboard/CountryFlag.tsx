import React from "react";

interface CountryFlagProps {
  code: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ code }) => {
  if (!code) return null;
  const isoCode = code.toLowerCase();

  return (
    <img
      src={`/flag-icons-main/flags/4x3/${isoCode}.svg`}
      alt={code}
      className="w-4 h-3 inline-block object-cover rounded-[1px] shadow-sm mr-1.5 align-middle"
      onError={(e) => {
        (e.target as HTMLElement).style.display = "none";
      }}
    />
  );
};

/** "Niet beschikbaar"-vlag: Zwitserse vlag met het kruis 45° gedraaid (wit ✕ op rood). */
export const UnavailableFlag: React.FC = () => (
  <svg
    viewBox="0 0 32 32"
    className="w-3.5 h-3.5 inline-block shrink-0 rounded-[1px] shadow-sm mr-1.5 align-middle"
    role="img"
    aria-label="Niet beschikbaar"
  >
    <rect width="32" height="32" fill="#da291c" />
    <g transform="rotate(45 16 16)" fill="#fff">
      <rect x="13" y="6" width="6" height="20" />
      <rect x="6" y="13" width="20" height="6" />
    </g>
  </svg>
);
