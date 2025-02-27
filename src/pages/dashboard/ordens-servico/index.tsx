import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useOrdensServico } from "@/hooks/useOrdensServico";
import { StatusOS } from "@/components/ordens-servico/StatusOS";
import { formatarMoeda } from "@/utils/formatters";
import { OS } from "@/services/ordens-servico";

export default function OrdensServico() {
  const { data: ordensServico, isLoading } = useOrdensServico();
  const [dateStart, setDateStart] = useState("2025-01-01");
  const [dateEnd, setDateEnd] = useState("2025-02-19");
  const [searchQuery, setSearchQuery] = useState("");

  const resumo = {
    emAberto:
      ordensServico?.filter((os: OS) => os.status === "novo").length || 0,
    emAndamento:
      ordensServico?.filter((os: OS) => os.status === "em_andamento").length ||
      0,
    concluidas:
      ordensServico?.filter((os: OS) => os.status === "concluido").length || 0,
    faturadas:
      ordensServico?.filter((os: OS) => os.status === "faturado").length || 0,
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-medium">Ordens de Serviço</h1>
          <Link href="/dashboard/ordens-servico/nova">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Nova OS
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Resumo</h2>

          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm text-gray-500 mb-1">EM ABERTO</h3>
              <div className="text-2xl font-medium">{resumo.emAberto}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm text-gray-500 mb-1">EM ANDAMENTO</h3>
              <div className="text-2xl font-medium">{resumo.emAndamento}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm text-gray-500 mb-1">CONCLUÍDAS</h3>
              <div className="text-2xl font-medium">{resumo.concluidas}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm text-gray-500 mb-1">FATURADAS</h3>
              <div className="text-2xl font-medium">{resumo.faturadas}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Este Mês</option>
              <option>Último Mês</option>
              <option>Este Trimestre</option>
              <option>Este Ano</option>
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
                placeholder="Buscar OS"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <button className="p-2 border border-gray-200 rounded-lg">
            <FunnelIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="bg-white rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-500">
                <th className="py-4 px-6 font-medium">Nº OS</th>
                <th className="py-4 px-6 font-medium">Cliente</th>
                <th className="py-4 px-6 font-medium">Responsável</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Prazo</th>
                <th className="py-4 px-6 font-medium">Valor</th>
                <th className="py-4 px-6 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-4 px-6">
                    <div className="text-center">Carregando...</div>
                  </td>
                </tr>
              ) : ordensServico?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-6">
                    <div className="text-center text-gray-500 py-8">
                      Nenhuma ordem de serviço encontrada
                    </div>
                  </td>
                </tr>
              ) : (
                ordensServico?.map((os: OS) => (
                  <tr key={os.id} className="text-sm">
                    <td className="py-4 px-6">
                      <Link
                        href={`/dashboard/ordens-servico/${os.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {os.numero}
                      </Link>
                    </td>
                    <td className="py-4 px-6">{os.cliente.nome}</td>
                    <td className="py-4 px-6">
                      {os.responsavel?.nome || "Não atribuído"}
                    </td>
                    <td className="py-4 px-6">
                      <StatusOS status={os.status} onChangeStatus={() => {}} />
                    </td>
                    <td className="py-4 px-6">{os.prazo}</td>
                    <td className="py-4 px-6">
                      {formatarMoeda(os.valorTotal)}
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        href={`/dashboard/ordens-servico/${os.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
