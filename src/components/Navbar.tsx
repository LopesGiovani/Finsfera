import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Logo } from "./Logo";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0066FF] to-[#00E6CA]">
      {/* Wave Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/wave-pattern.svg')] opacity-10" />

      <div className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Logo />
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
