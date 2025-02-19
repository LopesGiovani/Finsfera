import Image from "next/image";
import { Button } from "./Button";

export function Hero() {
  return (
    <section className="relative pt-32 lg:pt-36 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500">
        <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div className="mb-12 lg:mb-0 text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              A moderna
              <br />
              contabilidade
              <br />
              automatizada com IA
            </h1>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              Uma alternativa multi-moeda ao Quickbooks, Xero e Zoho Books,
              construída para pequenas empresas
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-primary-500 hover:bg-primary-50"
              >
                Comece grátis
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <span className="text-3xl font-bold">13+</span>
                <p className="text-sm opacity-90">Anos no mercado</p>
              </div>
              <div>
                <span className="text-3xl font-bold">50k+</span>
                <p className="text-sm opacity-90">Usuários ativos</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-white/10 rounded-3xl transform rotate-3 backdrop-blur-sm"></div>
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://placehold.co/800x600/0066FF/FFFFFF.png"
                alt="Finsfera Dashboard"
                width={800}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
