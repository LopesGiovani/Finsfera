import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ChevronLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ItemServico } from "@/components/ordens-servico/ItemServico";
import { AtribuirResponsavelModal } from "@/components/ordens-servico/AtribuirResponsavelModal";

export default function NovaOS() {
  const [itens, setItens] = useState<number[]>([]);
  const [isAtribuirModalOpen, setIsAtribuirModalOpen] = useState(false);
  const [responsavel, setResponsavel] = useState<string | null>(null);

  const adicionarItem = () => {
    setItens([...itens, itens.length]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleAtribuirResponsavel = (userId: string) => {
    setResponsavel(userId);
    setIsAtribuirModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard/ordens-servico"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-medium">Nova Ordem de Serviço</h1>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Informações Básicas</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Cliente
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                    <option>Selecione um cliente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    placeholder="Digite o título da OS"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Descrição
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    rows={4}
                    placeholder="Descreva o serviço a ser realizado"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Itens do Serviço</h2>
                <button
                  onClick={adicionarItem}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Adicionar Item
                </button>
              </div>

              {itens.map((item, index) => (
                <ItemServico key={index} index={index} onRemove={removerItem} />
              ))}

              {itens.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Nenhum item adicionado
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Atribuição</h2>
              {responsavel ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    FN
                  </div>
                  <div>
                    <div className="font-medium">Funcionário {responsavel}</div>
                    <div className="text-sm text-gray-500">
                      Departamento {responsavel}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAtribuirModalOpen(true)}
                    className="ml-auto text-sm text-blue-500"
                  >
                    Alterar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAtribuirModalOpen(true)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-blue-500"
                >
                  Atribuir Responsável
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Datas</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Prazo
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Previsão de Horas
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-4 border-t">
          <Link
            href="/dashboard/ordens-servico"
            className="px-4 py-2 text-gray-600 text-sm"
          >
            Cancelar
          </Link>
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm">
            Criar OS
          </button>
        </div>

        <AtribuirResponsavelModal
          isOpen={isAtribuirModalOpen}
          onClose={() => setIsAtribuirModalOpen(false)}
          onAtribuir={handleAtribuirResponsavel}
        />
      </div>
    </DashboardLayout>
  );
}
