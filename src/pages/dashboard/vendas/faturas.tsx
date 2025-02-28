import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

export default function Faturas() {
  const [dateStart, setDateStart] = useState("2025-01-01");
  const [dateEnd, setDateEnd] = useState("2025-02-19");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-medium mb-8">Faturas</h1>

        <div className="bg-white rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Resumo</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Clientes</span>
                <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
                  Pagas
                </div>
                <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                  Em Aberto
                </div>
                <div className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs">
                  Atrasadas
                </div>
              </div>
              <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
                <span className="text-gray-400">Sem dados para exibir</span>
              </div>
            </div>

            <div className="w-64 space-y-6">
              <div>
                <h3 className="text-sm text-gray-500 mb-1">PAGAS</h3>
                <div className="text-2xl font-medium">R$0,00</div>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 mb-1">EM ABERTO</h3>
                <div className="text-2xl font-medium">R$0,00</div>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 mb-1">ATRASADAS</h3>
                <div className="text-2xl font-medium">R$0,00</div>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 mb-1">
                  MÉDIA DE DIAS EM ATRASO
                </h3>
                <div className="text-2xl font-medium">—</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Este Trimestre</option>
            </select>
            <input
              type="date"
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
            <input
              type="date"
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-200 rounded-lg">
              <FunnelIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 border border-gray-200 rounded-lg">
              <DocumentDuplicateIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 border border-gray-200 rounded-lg">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />
            </button>
            <Link href="/dashboard/vendas/faturas/novo">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
                Nova Fatura
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <DocumentDuplicateIcon className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ops, parece que não há nada aqui...
            </h3>
            <p className="text-sm text-gray-500">
              Adicione ou ajuste filtros para mais resultados
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
