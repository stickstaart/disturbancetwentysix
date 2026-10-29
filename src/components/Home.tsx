import React from "react";

// Geïmporteerde componenten uit dezelfde map (src/components/)
import Nav from "./Nav";
import Hero from "./Hero";
import Video from "./Video";
import Tour from "./Tour";
import Discography from "./Discography";
import Bio from "./Bio";
import Contact from "./Contact";
import Footer from "./Footer";
import History from "./History";

// Documentatie: Verzameling van alle losse homepage onderdelen
const Home: React.FC = () => {
  return (
    <div className="bg-black text-white">
      <Nav />
      <Hero />
      <Video />
      <Tour />
      <Discography />
      <Bio />
      <Contact />
      <Footer />
      <History />
    </div>
  );
};

export default Home;
