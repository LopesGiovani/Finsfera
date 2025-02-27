import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface GerarFaturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGerar: (dados: {
    vencimento: string;
    condicaoPagamento: string;
    observacoes: string;
  }) => void;
  totalOS: number;
}

export function GerarFaturaModal({
  isOpen,
  onClose,
  onGerar,
  totalOS,
}: GerarFaturaModalProps) {
  const [vencimento, setVencimento] = useState("");
  const [condicaoPagamento, setCondicaoPagamento] = useState("avista");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = () => {
    onGerar({
      vencimento,
      condicaoPagamento,
      observacoes,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-medium flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                    Gerar Fatura
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Valor Total
                    </label>
                    <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                      R$ {totalOS.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Data de Vencimento
                    </label>
                    <input
                      type="date"
                      value={vencimento}
                      onChange={(e) => setVencimento(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Condição de Pagamento
                    </label>
                    <select
                      value={condicaoPagamento}
                      onChange={(e) => setCondicaoPagamento(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="avista">À Vista</option>
                      <option value="30dias">30 Dias</option>
                      <option value="2x">2x Sem Juros</option>
                      <option value="3x">3x Sem Juros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Observações
                    </label>
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                  >
                    Gerar Fatura
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
