import Hero from "../components/Hero";
import BrandTicker from "../components/BrandTicker";
import Stats from "../components/Stats";
import Fleet from "../components/Fleet";
import Pricing from "../components/Pricing";
import Journey from "../components/Journey";
import Reviews from "../components/Reviews";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandTicker />
      <Stats />
      <Fleet />
      <Pricing />
      <Journey />
      <Reviews />
      <Contact />
    </>
  );
}
