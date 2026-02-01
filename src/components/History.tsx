import { useState } from 'react';
import { nieuweData } from '../../SHOWS/dates.js';

interface Show {
  date: string;
  venue: string;
  city: string;
  country: string;
  bands?: string[];
}

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const shows = nieuweData as Show[];

  // 1. Eerst de basislijst maken (Verleden tijd + sorteren)
  const pastShows = shows
    .filter(show => {
      // Als de datum alleen een jaartal is (bijv. "2001"), maken we er "2001-01-01" van voor de check
      const dateString = show.date.length === 4 ? `${show.date}-01-01` : show.date;
      const d = new Date(dateString);

      // Als de datum geldig is, checken we of hij in het verleden ligt
      // Als de datum nog steeds ongeldig is (door typefouten), laten we hem voor de zekerheid toch zien
      return isNaN(d.getTime()) || d.getTime() < new Date().getTime();
    })
    .sort((a, b) => {
      // Sorteer op basis van de tekst (dan komt 2001 netjes bij 2001)
      return b.date.localeCompare(a.date);
    });

  // 2. DAN de zoekfunctie (deze moet altijd gedefinieerd zijn, ook als de lijst dicht is!)
  const filteredShows = pastShows.filter(show => {
    const search = searchTerm.toLowerCase();

    // Landen mapping
    const countryNames: { [key: string]: string } = {
      AF: "Afghanistan",
      AX: "Åland Islands",
      AL: "Albania Albanië Shqipëria",
      DZ: "Algeria Algerije Dzayer",
      AS: "American Samoa",
      AD: "Andorra",
      AO: "Angola",
      AI: "Anguilla",
      AQ: "Antarctica",
      AG: "Antigua and Barbuda",
      AR: "Argentina Argentinië",
      AM: "Armenia Armenië Hayastan",
      AW: "Aruba",
      AU: "Australia Australië",
      AT: "Austria Oostenrijk Österreich",
      AZ: "Azerbaijan Azerbeidzjan",
      BS: "Bahamas",
      BH: "Bahrain",
      BD: "Bangladesh",
      BB: "Barbados",
      BY: "Belarus Wit-Rusland",
      BE: "Belgium België Belgique",
      BZ: "Belize",
      BJ: "Benin",
      BM: "Bermuda",
      BT: "Bhutan",
      BO: "Bolivia",
      BQ: "Bonaire Sint Eustatius Saba",
      BA: "Bosnia and Herzegovina Bosnië",
      BW: "Botswana",
      BV: "Bouvet Island",
      BR: "Brazil Brazilië Brasil",
      IO: "British Indian Ocean Territory",
      BN: "Brunei",
      BG: "Bulgaria Bulgarije",
      BF: "Burkina Faso",
      BI: "Burundi",
      KH: "Cambodia Cambodja",
      CM: "Cameroon Kameroen",
      CA: "Canada",
      CV: "Cape Verde Kaapverdië",
      KY: "Cayman Islands",
      CF: "Central African Republic",
      TD: "Chad Tsjaad",
      CL: "Chile Chili",
      CN: "China",
      CX: "Christmas Island",
      CC: "Cocos Islands",
      CO: "Colombia",
      KM: "Comoros",
      CG: "Congo",
      CD: "Congo Democratic Republic",
      CK: "Cook Islands",
      CR: "Costa Rica",
      CI: "Côte d'Ivoire Ivoorkust",
      HR: "Croatia Kroatië Hrvatska",
      CU: "Cuba",
      CW: "Curaçao",
      CY: "Cyprus",
      CZ: "Czech Republic Tsjechië Česko",
      DK: "Denmark Denemarken Danmark",
      DJ: "Djibouti",
      DM: "Dominica",
      DO: "Dominican Republic Dominicaanse Republiek",
      EC: "Ecuador",
      EG: "Egypt Egypte",
      SV: "El Salvador",
      GQ: "Equatorial Guinea",
      ER: "Eritrea",
      EE: "Estonia Estland Eesti",
      ET: "Ethiopia",
      FK: "Falkland Islands",
      FO: "Faroe Islands Faeröer",
      FJ: "Fiji",
      FI: "Finland Suomi",
      FR: "France Frankrijk",
      GF: "French Guiana",
      PF: "French Polynesia",
      TF: "French Southern Territories",
      GA: "Gabon",
      GM: "Gambia",
      GE: "Georgia Georgië Sakartvelo",
      DE: "Germany Duitsland Deutschland",
      GH: "Ghana",
      GI: "Gibraltar",
      GR: "Greece Griekenland Hellas",
      GL: "Greenland Groenland",
      GD: "Grenada",
      GP: "Guadeloupe",
      GU: "Guam",
      GT: "Guatemala",
      GG: "Guernsey",
      GN: "Guinea",
      GW: "Guinea-Bissau",
      GY: "Guyana",
      HT: "Haiti Haïti",
      HM: "Heard Island",
      VA: "Vatican City Vaticaanstad",
      HN: "Honduras",
      HK: "Hong Kong",
      HU: "Hungary Hongarije Magyarország",
      IS: "Iceland IJsland Ísland",
      IN: "India",
      ID: "Indonesia Indonesië",
      IR: "Iran",
      IQ: "Iraq Irak",
      IE: "Ireland Ierland Éire",
      IM: "Isle of Man",
      IL: "Israel Israël",
      IT: "Italy Italië Italia",
      JM: "Jamaica",
      JP: "Japan Nihon",
      JE: "Jersey",
      JO: "Jordan Jordanië",
      KZ: "Kazakhstan Kazachstan",
      KE: "Kenya Kenia",
      KI: "Kiribati",
      KP: "North Korea Noord-Korea",
      KR: "South Korea Zuid-Korea",
      KW: "Kuwait Koeweit",
      KG: "Kyrgyzstan Kirgizië",
      LA: "Laos",
      LV: "Latvia Letland Latvija",
      LB: "Lebanon Libanon",
      LS: "Lesotho",
      LR: "Liberia",
      LY: "Libya Libië",
      LI: "Liechtenstein",
      LT: "Lithuania Litouwen Lietuva",
      LU: "Luxembourg Luxemburg",
      MO: "Macao",
      MK: "North Macedonia Macedonië",
      MG: "Madagascar Madagaskar",
      MW: "Malawi",
      MY: "Malaysia Maleisië",
      MV: "Maldives Malediven",
      ML: "Mali",
      MT: "Malta",
      MH: "Marshall Islands",
      MQ: "Martinique",
      MR: "Mauritania Mauritanië",
      MU: "Mauritius",
      YT: "Mayotte",
      MX: "Mexico México",
      FM: "Micronesia",
      MD: "Moldova Moldavië",
      MC: "Monaco",
      MN: "Mongolia Mongolië",
      ME: "Montenegro Crna Gora",
      MS: "Montserrat",
      MA: "Morocco Marokko Maghrib",
      MZ: "Mozambique",
      MM: "Myanmar Birma",
      NA: "Namibia Namibië",
      NR: "Nauru",
      NP: "Nepal",
      NL: "Netherlands Nederland Holland",
      NC: "New Caledonia",
      NZ: "New Zealand Nieuw-Zeeland",
      NI: "Nicaragua",
      NE: "Niger",
      NG: "Nigeria",
      NU: "Niue",
      NF: "Norfolk Island",
      MP: "Northern Mariana Islands",
      NO: "Norway Noorwegen Norge",
      OM: "Oman",
      PK: "Pakistan",
      PW: "Palau",
      PS: "Palestine Palestina",
      PA: "Panama Panamá",
      PG: "Papua New Guinea",
      PY: "Paraguay",
      PE: "Peru Perú",
      PH: "Philippines Filipijnen",
      PN: "Pitcairn",
      PL: "Poland Polen Polska",
      PT: "Portugal",
      PR: "Puerto Rico",
      QA: "Qatar",
      RE: "Réunion, Reunion",
      RO: "Romania Roemenië România",
      RU: "Russia Rusland Rossiya",
      RW: "Rwanda",
      BL: "Saint Barthélemy",
      SH: "Saint Helena",
      KN: "Saint Kitts and Nevis",
      LC: "Saint Lucia",
      MF: "Saint Martin",
      PM: "Saint Pierre and Miquelon",
      VC: "Saint Vincent",
      WS: "Samoa",
      SM: "San Marino",
      ST: "Sao Tome",
      SA: "Saudi Arabia Saudi-Arabië",
      SN: "Senegal",
      RS: "Serbia Servië Srbija",
      SC: "Seychelles Seychellen",
      SL: "Sierra Leone",
      SG: "Singapore",
      SX: "Sint Maarten",
      SK: "Slovakia Slowakije Slovensko",
      SI: "Slovenia Slovenië Slovenija",
      SB: "Solomon Islands",
      SO: "Somalia Somalië",
      ZA: "South Africa Zuid-Afrika",
      GS: "South Georgia",
      SS: "South Sudan",
      ES: "Spain Spanje España",
      LK: "Sri Lanka",
      SD: "Sudan",
      SR: "Suriname",
      SJ: "Svalbard Jan Mayen",
      SZ: "Eswatini Swaziland",
      SE: "Sweden Zweden Sverige",
      CH: "Switzerland Zwitserland Schweiz Suisse",
      SY: "Syria Syrië",
      TW: "Taiwan",
      TJ: "Tajikistan",
      TZ: "Tanzania",
      TH: "Thailand",
      TL: "Timor-Leste",
      TG: "Togo",
      TK: "Tokelau",
      TO: "Tonga",
      TT: "Trinidad and Tobago",
      TN: "Tunisia Tunesië",
      TR: "Turkey Turkije Türkiye",
      TM: "Turkmenistan",
      TC: "Turks and Caicos",
      TV: "Tuvalu",
      UG: "Uganda",
      UA: "Ukraine Oekraïne Ukrayina",
      AE: "United Arab Emirates VAE",
      GB: "United Kingdom UK Engeland England Britain",
      US: "United States USA Amerika America",
      UM: "United States Minor Outlying Islands",
      UY: "Uruguay",
      UZ: "Uzbekistan Oezbekistan",
      VU: "Vanuatu",
      VE: "Venezuela",
      VN: "Vietnam Viêt Nam",
      VG: "Virgin Islands British",
      VI: "Virgin Islands U.S.",
      WF: "Wallis and Futuna",
      EH: "Western Sahara",
      YE: "Yemen",
      ZM: "Zambia",
      ZW: "Zimbabwe"
  };

    const city = (show.city || "").toLowerCase();
    const venue = (show.venue || "").toLowerCase();
    const bandsList = show.bands ? show.bands.join(" ").toLowerCase() : "";
    const countryCode = (show.country || "").toUpperCase();
    const fullCountryName = countryNames[countryCode] || "";
    const countrySearchString = (countryCode + " " + fullCountryName).toLowerCase();

    return (
      city.includes(search) ||
      countrySearchString.includes(search) ||
      venue.includes(search) ||
      show.date.includes(search) ||
      bandsList.includes(search)
    );
  });

  return (
    <section id="history" className="py-20 bg-black text-white px-4 border-t border-zinc-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-bold uppercase tracking-tighter italic">Gig History</h2>
            <p className="text-gray-500 font-mono text-xs uppercase mt-1">
              {pastShows.length} Shows
            </p>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-white text-black px-6 py-2 font-black uppercase hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 active:scale-95"
          >
            {isOpen ? 'Close History' : `View All ${pastShows.length} Shows`}
          </button>
        </div>

        {/* De content klapt alleen uit als isOpen true is */}
        {isOpen && (
          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="SEARCH BY CITY, VENUE, BAND OR COUNTRY..."
                className="w-full p-4 bg-zinc-900 border-2 border-zinc-700 text-white focus:outline-none focus:border-red-600 transition font-mono uppercase"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <span className="absolute right-4 top-4 text-red-600 font-mono text-sm font-bold">
                  {filteredShows.length} MATCHES
                </span>
              )}
            </div>

            <div className="space-y-4">
              {filteredShows.length > 0 ? (
                filteredShows.map((show, index) => (
                  <div
                    key={`${show.date}-${index}`}
                    className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b border-zinc-800 pb-4 hover:bg-zinc-900/30 transition p-2"
                  >
                    <div className="text-red-600 font-mono text-sm">
                      {show.date.split('-').reverse().join('-')}
                    </div>
                    <div className="font-bold uppercase italic text-sm">{show.city} ({show.country})</div>
                    <div className="text-gray-300 text-sm">{show.venue}</div>
                    <div className="text-[10px] text-gray-500 italic uppercase leading-tight">
                      {show.bands && show.bands.length > 0 ? `w/ ${show.bands.join(', ')}` : ''}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-600 font-mono text-center py-10">NO MATCHES FOR "{searchTerm.toUpperCase()}"</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default History;
