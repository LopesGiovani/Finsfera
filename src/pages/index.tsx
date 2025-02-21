import Head from "next/head";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { FinsAI } from "@/components/FinsAI";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";
import { FeatureCards } from "@/components/FeatureCards";
import { InsightsAndCTA } from "@/components/InsightsAndCTA";

export default function Home() {
  return (
    <>
      <Head>
        <title>Finsfera - Contabilidade Automatizada com IA</title>
        <meta
          name="description"
          content="Simplifique suas finanças empresariais com nossa plataforma moderna de contabilidade automatizada com IA"
        />
      </Head>

      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Hero />
          <FeatureCards />
          <Features />
          <FinsAI />
          <Pricing />
          <InsightsAndCTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
