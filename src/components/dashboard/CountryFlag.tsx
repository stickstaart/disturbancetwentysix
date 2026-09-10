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
