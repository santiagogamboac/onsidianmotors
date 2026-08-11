import Hero from "../components/Hero";
import BrandTicker from "../components/BrandTicker";
import Fleet from "../components/Fleet";
import Pricing from "../components/Pricing";
import HowItWorks from "../components/HowItWorks";
import Experience from "../components/Experience";
import Reviews from "../components/Reviews";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandTicker />
      <Fleet />
      <Pricing />
      <HowItWorks />
      <Experience />
      <Reviews />
      <Contact />
    </>
  );
}
