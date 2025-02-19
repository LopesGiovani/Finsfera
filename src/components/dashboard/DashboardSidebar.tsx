import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import {
  HomeIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  ClockIcon,
  MapIcon,
  CubeIcon,
  BuildingLibraryIcon,
  CalculatorIcon,
  CalendarIcon,
  UsersIcon,
  UserGroupIcon,
  CreditCardIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
  { name: "Home", icon: HomeIcon, href: "/dashboard" },
  {
    name: "Vendas",
    icon: DocumentTextIcon,
    href: "/dashboard/vendas",
    subItems: [
      { name: "Faturas", href: "/dashboard/vendas/faturas" },
      { name: "Faturas Recorrentes", href: "/dashboard/vendas/recorrentes" },
      { name: "Orçamentos", href: "/dashboard/vendas/orcamentos" },
    ],
  },
  {
    name: "Compras",
    icon: ShoppingCartIcon,
    href: "/dashboard/compras",
    subItems: [
      { name: "Despesas", href: "/dashboard/compras/despesas" },
      { name: "Contas", href: "/dashboard/compras/contas" },
    ],
  },
  { name: "Tempo", icon: ClockIcon, href: "/dashboard/tempo" },
  { name: "Quilometragem", icon: MapIcon, href: "/dashboard/quilometragem" },
  {
    name: "Produtos & Serviços",
    icon: CubeIcon,
    href: "/dashboard/produtos",
  },
  { name: "Bancos", icon: BuildingLibraryIcon, href: "/dashboard/bancos" },
  {
    name: "Contabilidade",
    icon: CalculatorIcon,
    href: "/dashboard/contabilidade",
    subItems: [
      { name: "Transações", href: "/dashboard/contabilidade/transacoes" },
      { name: "Relatórios", href: "/dashboard/contabilidade/relatorios" },
      {
        name: "Plano de Contas",
        href: "/dashboard/contabilidade/plano-contas",
      },
      {
        name: "Multi Lançamentos",
        href: "/dashboard/contabilidade/lancamentos",
      },
    ],
  },
  { name: "Calendário", icon: CalendarIcon, href: "/dashboard/calendario" },
  {
    name: "Clientes & Fornecedores",
    icon: UsersIcon,
    href: "/dashboard/clientes",
  },
  {
    name: "Membros do Time",
    icon: UserGroupIcon,
    href: "/dashboard/time",
  },
  {
    name: "Assinaturas & Cobranças",
    icon: CreditCardIcon,
    href: "/dashboard/assinaturas",
  },
  {
    name: "Integrações",
    icon: CogIcon,
    href: "/dashboard/integracoes",
  },
];

export function DashboardSidebar() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const activeItem = menuItems.find((item) =>
      router.pathname.startsWith(item.href)
    );
    if (activeItem?.subItems && !expandedSections.includes(activeItem.name)) {
      setExpandedSections((current) => [...current, activeItem.name]);
    }
  }, [router.pathname]);

  const toggleSection = (sectionName: string, hasSubItems: boolean) => {
    if (!hasSubItems) return;

    setExpandedSections((current) =>
      current.includes(sectionName)
        ? current.filter((name) => name !== sectionName)
        : [...current, sectionName]
    );
  };

  const isActiveLink = (href: string) => {
    if (href === "/dashboard" && router.pathname === "/dashboard") {
      return true;
    }
    return router.pathname.startsWith(href) && href !== "/dashboard";
  };

  const isActiveSubLink = (href: string) => router.pathname.startsWith(href);

  const isExpandedSection = (item: (typeof menuItems)[0]) => {
    return (
      expandedSections.includes(item.name) ||
      (item.subItems?.some((subItem) => isActiveSubLink(subItem.href)) ?? false)
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-gray-200 overflow-y-auto">
      <div className="flex flex-col min-h-full">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon.png"
              alt="Fiskl"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className="text-xl font-semibold">Fiskeclone</span>
          </div>
        </div>

        <nav className="flex-1">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.name}>
                <div
                  className={`flex items-center justify-between px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer relative ${
                    isActiveLink(item.href) ? "text-blue-600 bg-blue-50" : ""
                  }`}
                  onClick={() => toggleSection(item.name, !!item.subItems)}
                >
                  {isActiveLink(item.href) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                  )}
                  <Link
                    href={item.href}
                    className="flex items-center flex-1"
                    onClick={(e) => {
                      if (item.subItems) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <item.icon
                      className={`w-5 h-5 mr-3 ${
                        isActiveLink(item.href) ? "text-blue-600" : ""
                      }`}
                    />
                    {item.name}
                  </Link>
                  {item.subItems && (
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${
                        isExpandedSection(item) ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
                {item.subItems && isExpandedSection(item) && (
                  <div className="ml-14 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`block py-2 text-sm ${
                          isActiveSubLink(subItem.href)
                            ? "text-blue-600 font-medium"
                            : "text-gray-500 hover:text-blue-600"
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        <div className="p-6 space-y-4 border-t border-gray-100">
          <Link
            href="/dashboard/assinaturas"
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <span className="text-sm font-medium">S</span>
            </div>
            <span className="text-sm font-medium text-gray-600">Solo</span>
          </Link>

          <div className="block">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Finsfera
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
