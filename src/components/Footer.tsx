import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-white text-2xl font-bold mb-4">Finsfera</div>
            <p className="text-sm">
              Simplificando a contabilidade para pequenas e médias empresas
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Produto</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="hover:text-white">
                  Recursos
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-white">
                  Preços
                </Link>
              </li>
            </ul>
          </div>
          {/* Adicione mais seções conforme necessário */}
        </div>
      </div>
    </footer>
  );
}
