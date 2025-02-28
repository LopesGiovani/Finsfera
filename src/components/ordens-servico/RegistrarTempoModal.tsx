import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";

interface RegistrarTempoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrar: (dados: {
    horas: number;
    minutos: number;
    descricao: string;
  }) => void;
}

export function RegistrarTempoModal({
  isOpen,
  onClose,
  onRegistrar,
}: RegistrarTempoModalProps) {
  const [horas, setHoras] = useState(0);
  const [minutos, setMinutos] = useState(0);
  const [descricao, setDescricao] = useState("");

  const handleSubmit = () => {
    onRegistrar({ horas, minutos, descricao });
    setHoras(0);
    setMinutos(0);
    setDescricao("");
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
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    Registrar Tempo
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Horas
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={horas}
                        onChange={(e) => setHoras(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Minutos
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={minutos}
                        onChange={(e) => setMinutos(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Descrição da Atividade
                    </label>
                    <textarea
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      placeholder="Descreva o que foi realizado..."
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
                    Registrar
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
