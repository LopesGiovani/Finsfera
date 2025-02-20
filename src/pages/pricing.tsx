import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import {
  GooglePlayIcon,
  AppStoreIcon,
  TrustpilotIcon,
  CapterraIcon,
  G2Icon,
} from "@/components/icons";
import { Avatar } from "@/components/Avatar";

interface PlanProps {
  name: string;
  icon: string;
  price: string;
  period: string;
  discount: string;
  regularPrice: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

const plans: PlanProps[] = [
  {
    name: "Solo",
    icon: "🚀",
    price: "R$0",
    period: "/15 days",
    discount: "R$12/month (70% discount) for 3 months",
    regularPrice: "then R$40/month",
    features: [
      "Multi-currency accounting (170 currencies)",
      "Super transaction categorization",
      "Unlimited invoices",
      "Bank reconciliation",
    ],
    buttonText: "Get Solo",
  },
  {
    name: "Pro",
    icon: "🚀",
    price: "R$0",
    period: "/15 days",
    discount: "R$20.1/month (70% discount) for 3 months",
    regularPrice: "then R$67/month",
    features: [
      "Multi-currency accounting (170 currencies)",
      "Super transaction categorization",
      "Unlimited invoices",
      "Bank reconciliation",
      "Advanced reporting",
    ],
    buttonText: "Get Pro",
    isPopular: true,
  },
  {
    name: "Prime",
    icon: "🚀",
    price: "R$0",
    period: "/15 days",
    discount: "R$27.9/month (70% discount) for 3 months",
    regularPrice: "then R$93/month",
    features: [
      "Multi-currency accounting (170 currencies)",
      "Super transaction categorization",
      "Unlimited invoices",
      "Bank reconciliation",
      "Advanced reporting",
      "Priority support",
    ],
    buttonText: "Get Prime",
  },
];

function PlanCard({ plan }: { plan: PlanProps }) {
  return (
    <div
      className={`relative bg-white rounded-2xl p-8 border ${
        plan.isPopular ? "border-blue-500" : "border-gray-200"
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0066FF] to-[#00E6CA] text-white px-4 py-1 rounded-full text-sm font-medium">
          MOST POPULAR
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">{plan.name}</span>
        <span className="text-2xl">{plan.icon}</span>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-gray-500 text-lg">R$</span>
          <span className="text-5xl font-bold">0</span>
        </div>
        <div className="text-gray-500">{plan.period}</div>
        <div className="text-sm mt-2">
          <div>then {plan.discount},</div>
          <div>{plan.regularPrice}.</div>
        </div>
        <div className="text-xs text-gray-400 mt-1">local taxes may apply</div>
      </div>

      <button className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#00E6CA] to-[#0066FF] text-white font-medium hover:opacity-90 transition-opacity mb-8">
        {plan.buttonText}
      </button>

      <ul className="space-y-4">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#00E6CA]"
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
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-20 pb-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-8">
            <span className="text-gray-800">Fiskl</span>{" "}
            <span className="text-[#0066FF]">Pricing Plans</span>
          </h1>

          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex -space-x-2">
              <Avatar name="João Silva" color="bg-blue-500" />
              <Avatar name="Maria Santos" color="bg-purple-500" />
              <Avatar name="Pedro Costa" color="bg-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {"★★★★★".split("").map((star, i) => (
                  <span key={i} className="text-yellow-400">
                    {star}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span>Rated</span>
                <span className="font-semibold">4.8/5</span>
                <span>stars in</span>
                <span className="font-semibold">10,000+</span>
                <span>reviews</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <GooglePlayIcon />
            <AppStoreIcon />
            <TrustpilotIcon />
            <CapterraIcon />
            <G2Icon />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
