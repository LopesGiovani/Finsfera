import { Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HomeIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  BanknotesIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  {
    name: "Ordens de Serviço",
    href: "/dashboard/ordens-servico",
    icon: WrenchScrewdriverIcon,
    children: [
      { name: "Lista de OS", href: "/dashboard/ordens-servico" },
      { name: "Nova OS", href: "/dashboard/ordens-servico/nova" },
      { name: "Relatórios", href: "/dashboard/ordens-servico/relatorios" },
    ],
  },
  {
    name: "Clientes",
    href: "/dashboard/clientes",
    icon: UserGroupIcon,
    children: [
      { name: "Lista de Clientes", href: "/dashboard/clientes" },
      { name: "Novo Cliente", href: "/dashboard/clientes/novo" },
    ],
  },
  // Comentando páginas que ainda não foram implementadas
  // { name: "Financeiro", href: "/dashboard/financeiro", icon: BanknotesIcon },
  // { name: "Documentos", href: "/dashboard/documentos", icon: DocumentTextIcon },
  // {
  //   name: "Configurações",
  //   href: "/dashboard/configuracoes",
  //   icon: Cog6ToothIcon,
  // },
];

export function Sidebar() {
  const router = useRouter();

  const isActive = (href: string) => router.pathname === href;
  const isActiveParent = (href: string) => router.pathname.startsWith(href);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Logo</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
          <Fragment key={item.name}>
            {item.children ? (
              <div className="space-y-1">
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
                    isActiveParent(item.href)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
                <div className="pl-8 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={`block px-3 py-2 text-sm rounded-lg ${
                        isActive(child.href)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )}
          </Fragment>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            US
          </div>
          <div>
            <div className="font-medium">Usuário</div>
            <div className="text-sm text-gray-500">usuario@email.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
