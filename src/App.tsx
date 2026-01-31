import "./index.css";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Video from "./components/Video";
import Tour from "./components/Tour";
import Discography from "./components/Discography";
import Bio from "./components/Bio";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import History from "./components/History";
import { Analytics } from "@vercel/analytics/react"; // <--- Regel 1: Import

function App() {
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
      <Analytics /> {/* <--- Regel 2: De tracker */}
    </div>
  );
}

export default App;
