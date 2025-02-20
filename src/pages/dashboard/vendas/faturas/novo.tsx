import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PlusIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

export default function NovaFatura() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/vendas/faturas"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-medium">Invoice INV-0001</h1>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Detalhes da Fatura</h2>

              <div className="flex gap-8">
                <div className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Image
                    src="/logo-icon.png"
                    alt="Logo"
                    width={64}
                    height={64}
                    className="rounded-lg"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Número da Fatura
                    </label>
                    <div className="text-gray-900">#INV-0001</div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Nome da Fatura
                    </label>
                    <input
                      type="text"
                      value="Finsfera Invoice"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Template Padrão
                    </span>
                    <button className="text-blue-500 text-sm">Adicionar</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Itens da Fatura</h2>

              <table className="w-full mb-4">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-2 font-normal">TIPO</th>
                    <th className="pb-2 font-normal">NOME</th>
                    <th className="pb-2 font-normal">CONTA</th>
                    <th className="pb-2 font-normal">UNIDADE</th>
                    <th className="pb-2 font-normal">QTD</th>
                    <th className="pb-2 font-normal">PREÇO/TAXA</th>
                    <th className="pb-2 font-normal">SUBTOTAL</th>
                    <th className="pb-2 font-normal">IMPOSTO</th>
                    <th className="pb-2 font-normal">TOTAL</th>
                    <th className="pb-2 font-normal w-8"></th>
                  </tr>
                </thead>
              </table>

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" /> Novo
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
                  Adicionar Existente
                </button>
              </div>
            </div>

            <div>
              <button className="text-blue-500 text-sm">
                Adicionar Cronograma de Pagamento
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Faturar para</h2>
              <button className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-blue-500 flex items-center justify-center gap-2">
                <PlusIcon className="w-4 h-4" /> Adicionar Cliente
              </button>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Datas</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Data da Fatura
                  </label>
                  <input
                    type="date"
                    value="2025-02-19"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value="2025-02-26"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Data de Venda
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Notas da Fatura</h2>
              <textarea
                className="w-full px-3 py-2 border border-gray-200 rounded-lg h-32 resize-none"
                placeholder="Adicione notas à fatura..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 border-t pt-4">
          <Link
            href="/dashboard/vendas/faturas"
            className="px-4 py-2 text-gray-600 text-sm"
          >
            Voltar
          </Link>
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm">
            Salvar & Revisar
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
