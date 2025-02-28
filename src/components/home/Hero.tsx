import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative z-10 pt-14 pb-8 sm:pt-24 sm:pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
          <div className="max-w-2xl md:mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Simplifique a gestão de</span>
              <span className="block text-blue-600">Ordens de Serviço</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 max-w-md mx-auto">
              Organize, acompanhe e gerencie todas as ordens de serviço da sua
              empresa em um só lugar, com eficiência e simplicidade.
            </p>
            <div className="mt-10 sm:flex sm:justify-center">
              <div className="rounded-md shadow">
                <Link
                  href="/dashboard/ordens-servico"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Começar agora
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link
                  href="#features"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Saiba mais
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative">
        <div
          className="absolute inset-0 flex justify-center"
          aria-hidden="true"
        >
          <div className="w-full h-full max-w-7xl px-4 sm:px-6">
            <div
              className="w-full h-full rounded-lg opacity-10"
              style={{
                backgroundImage: "url('/images/hero-background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
