import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Tab } from "@headlessui/react";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";

const plans = [
  {
    name: "Solo",
    icon: "🏢",
    price: "12",
    discount: "70% discount",
    period: "/month",
    info: "with 3 months remaining, then R$40/month.",
    features: [
      "Multi-currency accounting (170 currencies)",
      "Super transaction categorization",
      "Cash flow & Financial ratios",
      "Multi-currency Accounts Receivable/Payable",
      "Full accounting on mobile",
      "Global Tax reporting",
      "Multi-currency invoices (60+ languages)",
      "Mobile & card payments (170+ currencies)",
      "Global Banking integrations up to 2 banks (unlimited accounts)",
      "Members included in the plan 1 user",
    ],
  },
  {
    name: "Pro",
    icon: "🚀",
    price: "20.1",
    discount: "70% discount",
    period: "/month",
    info: "for 3 months, then R$67/month.",
    popular: true,
    features: [
      "Multi-currency accounting (170 currencies)",
      "Super transaction categorization",
      "Cash flow & Financial ratios",
      "Multi-currency Accounts Receivable/Payable",
      "Full accounting on mobile",
      "Global Tax reporting",
      "Multi-currency invoices (60+ languages)",
      "Mobile & card payments (170+ currencies)",
      "Global Banking integrations up to 4 banks (unlimited accounts)",
      "Members included in the plan 5 users (+ user/R$13 month)",
      "Custom domain for emails",
      "Multiple brands 4",
      "Custom email templates with dynamic fields",
    ],
  },
  {
    name: "Prime",
    icon: "🚀",
    price: "27.9",
    discount: "70% discount",
    period: "/month",
    info: "for 3 months, then R$93/month.",
    features: [
      "Multi-currency accounting (170 currencies)",
      "Super transaction categorization",
      "Cash flow & Financial ratios",
      "Multi-currency Accounts Receivable/Payable",
      "Full accounting on mobile",
      "Global Tax reporting",
      "Multi-currency invoices (60+ languages)",
      "Mobile & card payments (170+ currencies)",
      "Global Banking integrations Unlimited banks and accounts",
      "Members included in the plan 10 users (+ user/R$13 month)",
      "Custom domain for emails",
      "Multiple brands Unlimited",
      "Custom email templates with dynamic fields",
      "Advanced FX management (Coming Soon)",
    ],
  },
];

export default function Assinaturas() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        <Tab.Group>
          <Tab.List className="flex space-x-4 border-b border-gray-200">
            <Tab
              className={({ selected }) =>
                `px-4 py-2 text-sm font-medium ${
                  selected
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              Planos
            </Tab>
            <Tab
              className={({ selected }) =>
                `px-4 py-2 text-sm font-medium ${
                  selected
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              Histórico
            </Tab>
            <Tab
              className={({ selected }) =>
                `px-4 py-2 text-sm font-medium ${
                  selected
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              Alterações de Usuário
            </Tab>
            <Tab
              className={({ selected }) =>
                `px-4 py-2 text-sm font-medium ${
                  selected
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              Cobrança
            </Tab>
          </Tab.List>

          <Tab.Panels className="mt-8">
            <Tab.Panel>
              <div className="grid grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`bg-white rounded-lg p-6 border ${
                      plan.popular ? "border-blue-500" : "border-gray-200"
                    }`}
                  >
                    {plan.popular && (
                      <div className="text-blue-500 text-sm font-medium mb-4">
                        MAIS POPULAR
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{plan.icon}</span>
                      <h3 className="text-xl font-medium">{plan.name}</h3>
                    </div>
                    <div className="mb-4">
                      <div className="text-sm text-green-500">
                        {plan.discount}
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-gray-400 text-sm">R$</span>
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-gray-500">{plan.period}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {plan.info}
                      </div>
                      <div className="text-xs text-gray-400">
                        local taxes may apply
                      </div>
                    </div>
                    <button
                      className={`w-full py-2 px-4 rounded-lg mb-6 ${
                        plan.popular
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {plan.name === "Solo"
                        ? "Plano Atual"
                        : `Upgrade to ${plan.name}`}
                    </button>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <svg
                            className="w-5 h-5 text-green-500 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#"
                      className="block text-blue-500 text-sm mt-4 hover:underline"
                    >
                      {`See all ${plan.name} features`}
                    </a>
                  </div>
                ))}
              </div>
            </Tab.Panel>
            <Tab.Panel>Conteúdo do Histórico</Tab.Panel>
            <Tab.Panel>Conteúdo das Alterações de Usuário</Tab.Panel>
            <Tab.Panel>Conteúdo da Cobrança</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </DashboardLayout>
  );
}
