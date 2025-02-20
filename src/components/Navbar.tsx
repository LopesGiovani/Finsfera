import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0066FF] to-[#00E6CA]">
      {/* Wave Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/wave-pattern.svg')] opacity-10" />

      <div className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            {/* Logo Finsfera */}
            <div className="bg-white rounded-lg p-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                {/* Círculo externo */}
                <circle cx="16" cy="16" r="16" fill="#0066FF" />
                {/* Símbolo F estilizado */}
                <path d="M12 8h10v3h-7v4h6v3h-6v6h-3V8z" fill="white" />
                {/* Elemento gráfico */}
                <path
                  d="M22 16c0 3.314-2.686 6-6 6s-6-2.686-6-6"
                  stroke="#00E6CA"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="ml-2 text-xl font-bold text-white">Finsfera</span>
          </Link>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="text-white font-medium">Produto</span>
              <ChevronDownIcon className="w-4 h-4 text-white" />
            </div>
            <Link href="/fins-ai" className="text-white font-medium">
              Fins AI
            </Link>
            <Link href="/pricing" className="text-white font-medium">
              Preços
            </Link>
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="text-white font-medium">Contadores</span>
              <ChevronDownIcon className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-6 py-2 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/pricing"
            className="px-6 py-2 bg-white text-[#0066FF] font-medium rounded-full hover:bg-opacity-90 transition-opacity"
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </nav>
  );
}
