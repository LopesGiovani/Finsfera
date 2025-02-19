import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const paymentIntegrations = [
  {
    name: "Stripe",
    logo: (
      <svg viewBox="0 0 120 30" className="h-8">
        <path
          fill="currentColor"
          d="M8 13.9c0-.9.7-1.3 1.9-1.3 1.7 0 3.9.5 5.6 1.4V9.2c-1.9-.7-3.7-1-5.6-1-4.6 0-7.7 2.4-7.7 6 0 5.9 8.1 4.9 8.1 7.4 0 1-.8 1.3-2 1.3-1.7 0-4.2-.7-6.1-1.6v4.8c2.1.8 4.1 1.1 6.1 1.1 4.7 0 7.9-2.3 7.9-6 0-6.3-8.2-5.2-8.2-7.3z"
        />
      </svg>
    ),
    rate: "2.9%",
    rateExtra: "+ 30c",
    description: "per successful card charge",
    features: [
      "No setup, monthly or hidden fees",
      "Get paid easily, quickly and securely",
      "Pay as you go and turn on/off for each invoice",
    ],
    buttonText: "Connect to Stripe",
    buttonColor: "bg-blue-500",
    paymentMethods: [
      <svg key="visa" viewBox="0 0 50 16" className="h-5 w-auto">
        <path
          fill="#1A1F71"
          d="M19.13 1.105h-3.51L12.05 11.1l-.465-2.342c-.806-2.625-3.332-4.878-6.16-6.14H5.31v.88c2.005.465 3.775 1.53 4.93 2.83L12.75 15h3.72l5.815-13.895h-3.155z"
        />
      </svg>,
      <svg key="mastercard" viewBox="0 0 50 16" className="h-5 w-auto">
        <circle fill="#EB001B" cx="8" cy="8" r="8" />
        <circle fill="#F79E1B" cx="16" cy="8" r="8" />
      </svg>,
    ],
  },
  {
    name: "iDEAL",
    logo: (
      <div className="flex items-center">
        <span className="text-2xl font-bold">iDEAL</span>
        <span className="text-sm ml-1">stripe</span>
      </div>
    ),
    rate: "2.9%",
    rateExtra: "+ 30c",
    features: [
      "Get paid faster by your clients in the Netherlands",
      "iDEAL accounts for 57% of all online payments in NL",
      "Safest method of payment based on SEPA",
    ],
    buttonText: "Enable iDeal",
    buttonColor: "bg-cyan-400",
    note: "* Only enable iDeal if it's enabled in your Stripe account",
  },
  {
    name: "Bancontact",
    logo: (
      <div className="flex items-center">
        <span className="text-2xl font-bold">Bancontact</span>
        <span className="text-sm ml-1">stripe</span>
      </div>
    ),
    rate: "1.4%",
    rateExtra: "+ 30c",
    features: [
      "Get paid faster by your clients in Belgium",
      "Over 15 million cards in circulation in BE",
      "Safest method of payment based on SEPA",
    ],
    buttonText: "Enable Bancontact",
    buttonColor: "bg-cyan-400",
    note: "* Only enable Bancontact if it's enabled in your Stripe account",
  },
  {
    name: "PayPal",
    logo: (
      <svg viewBox="0 0 120 30" className="h-8">
        <path
          fill="#00457C"
          d="M18.9 8.3c0 3.3-1.4 6-4.2 8.1-2.8 2.1-6.5 3.1-11.1 3.1H0v11.2h6.3v-8.3h3.3c3.5 0 6.6-.8 9.2-2.3 2.6-1.5 3.9-3.7 3.9-6.6 0-2.9-1.3-5.1-3.9-6.6-2.6-1.5-5.7-2.3-9.2-2.3H0v8.3h6.3V8.3h3.3c2.5 0 4.6.5 6.3 1.6 1.7 1.1 2.6 2.5 2.6 4.2z"
        />
      </svg>
    ),
    features: [
      "Safe and protected",
      "Simple and convenient",
      "Take payment in 23 currencies",
    ],
    buttonText: "Connect to PayPal",
    buttonColor: "bg-blue-500",
    note: "PayPal fees vary by country and account.\nPlease check your PayPal account for your fees.",
  },
];

export default function Integracoes() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-medium mb-8">Integrações de Pagamento</h1>

        <div className="grid grid-cols-2 gap-6">
          {paymentIntegrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="h-12 mb-8">{integration.logo}</div>

              {integration.rate && (
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-medium text-blue-500">
                      {integration.rate}
                    </span>
                    <span className="text-blue-500">
                      {integration.rateExtra}
                    </span>
                    <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  {integration.description && (
                    <p className="text-sm text-gray-500">
                      {integration.description}
                    </p>
                  )}
                </div>
              )}

              {integration.paymentMethods && (
                <div className="flex gap-2 mb-6">
                  {integration.paymentMethods}
                </div>
              )}

              <ul className="space-y-3 mb-6">
                {integration.features.map((feature, index) => (
                  <li
                    key={index}
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

              {integration.note && (
                <p className="text-sm text-gray-500 mb-6 whitespace-pre-line">
                  {integration.note}
                </p>
              )}

              <button
                className={`w-full py-2 px-4 text-white rounded-lg text-sm ${integration.buttonColor}`}
              >
                {integration.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
