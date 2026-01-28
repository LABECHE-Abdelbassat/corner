import Navbar from "@/components/navbar/Navbar";
import styles from "./page.module.scss";
import Hero from "@/components/landing/hero/Hero";
import Numbers from "@/components/landing/numbers/Numbers";
import Services from "@/components/landing/services/Services";
import Businesses from "@/components/landing/businesses/Businesses";
import HowItWorks from "@/components/landing/how-it-works/HowItWorks";
import Benefits from "@/components/landing/benefits/Benefits";
import CTA from "@/components/landing/cta/CTA";
import Contact from "@/components/landing/contact/Contact";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Numbers />
      <Services />
      <Businesses />
      <HowItWorks />
      <Benefits />
      <CTA />
      <Contact />
      <Footer />
    </main>
  );
}
