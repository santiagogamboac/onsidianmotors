import Nav from "./components/Nav";
import Hero from "./components/Hero";
import BrandTicker from "./components/BrandTicker";
import Fleet from "./components/Fleet";
import HowItWorks from "./components/HowItWorks";
import Experience from "./components/Experience";
import Reviews from "./components/Reviews";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <Hero />
      <BrandTicker />
      <Fleet />
      <HowItWorks />
      <Experience />
      <Reviews />
      <Contact />
      <Footer />
    </div>
  );
}
