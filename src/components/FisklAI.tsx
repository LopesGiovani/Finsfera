import Image from "next/image";
import { Button } from "./Button";

export function FisklAI() {
  return (
    <section id="fiskl-ai" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div className="mb-12 lg:mb-0">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Potencialize sua contabilidade com{" "}
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Nossa IA avançada automatiza tarefas repetitivas, reduz erros e
              oferece insights valiosos para seu negócio.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "Reconhecimento automático de documentos",
                "Categorização inteligente de transações",
                "Previsões financeiras baseadas em dados",
                "Reconciliação bancária automatizada",
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg
                      className="w-4 h-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:opacity-90"
            >
              Experimente a IA
            </Button>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl transform -rotate-3"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://placehold.co/800x600/0066FF/FFFFFF.png"
                alt="Fiskl AI Dashboard"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
