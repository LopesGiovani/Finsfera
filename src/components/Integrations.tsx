import Image from "next/image";

export function Integrations() {
  const partners = [
    {
      name: "Partner 1",
      logo: "https://placehold.co/120x40/0066FF/FFFFFF.png",
    },
    {
      name: "Partner 2",
      logo: "https://placehold.co/120x40/0066FF/FFFFFF.png",
    },
    // Adicione mais parceiros conforme necessário
  ];

  return (
    <section className="py-16 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Integrações Perfeitas
        </h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center p-4"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={40}
                className="opacity-60 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
