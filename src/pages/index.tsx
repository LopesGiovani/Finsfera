import Head from "next/head";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { FisklAI } from "@/components/FisklAI";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";

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
          <Features />
          <FisklAI />
          <Pricing />
        </main>
        <Footer />
      </div>
    </>
  );
}
