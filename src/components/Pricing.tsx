import { Button } from "./Button";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "R$ 49",
      description: "Perfeito para freelancers e pequenos negócios",
      features: [
        "Até 100 transações/mês",
        "1 usuário",
        "Integração bancária básica",
        "Relatórios essenciais",
        "Suporte por email",
      ],
    },
    {
      name: "Professional",
      price: "R$ 99",
      description: "Ideal para empresas em crescimento",
      popular: true,
      features: [
        "Até 1000 transações/mês",
        "3 usuários",
        "Integração bancária completa",
        "Relatórios avançados",
        "Suporte prioritário",
        "Acesso à IA",
      ],
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      description: "Para grandes empresas com necessidades específicas",
      features: [
        "Transações ilimitadas",
        "Usuários ilimitados",
        "API completa",
        "Relatórios personalizados",
        "Suporte 24/7",
        "IA avançada",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Planos e <span className="text-primary-500">Preços</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para o seu negócio
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                plan.popular ? "ring-2 ring-primary-500" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 text-primary-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
                    : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                }`}
              >
                Começar agora
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
