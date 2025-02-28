import Image from "next/image";
import GlobalIcon from "@/icons/global.svg";
import AiIcon from "@/icons/ai.svg";
import FinanceIcon from "@/icons/finance.svg";
import ReportsIcon from "@/icons/reports.svg";

export function Features() {
  const features = [
    {
      title: "Contabilidade Global",
      description:
        "Suporte multi-moeda e integração com mais de 21.000 bancos mundialmente",
      Icon: GlobalIcon,
    },
    {
      title: "Automatização com IA",
      description:
        "Reconhecimento automático de documentos e categorização inteligente",
      Icon: AiIcon,
    },
    {
      title: "Gestão Financeira",
      description:
        "Controle de despesas, faturas e pagamentos em uma única plataforma",
      Icon: FinanceIcon,
    },
    {
      title: "Relatórios Avançados",
      description:
        "Insights em tempo real e relatórios personalizados para seu negócio",
      Icon: ReportsIcon,
    },
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Recursos <span className="text-primary-500">Poderosos</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar suas finanças em um só lugar
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 mb-4 bg-primary-50 rounded-xl p-2">
                <feature.Icon className="w-full h-full text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
