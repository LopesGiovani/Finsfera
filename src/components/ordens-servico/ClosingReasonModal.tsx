import { useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ClosingReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function ClosingReasonModal({
  isOpen,
  onClose,
  onConfirm,
}: ClosingReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // Referências para elementos focáveis
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Reset o estado quando o modal abre/fecha
  useEffect(() => {
    console.log(
      "Modal de motivo de fechamento " + (isOpen ? "aberto" : "fechado")
    );

    // Limpar os campos quando o modal é fechado
    if (!isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    console.log("Tentando confirmar com motivo:", reason);

    if (!reason.trim()) {
      console.log("Erro: motivo em branco");
      setError("O motivo de fechamento é obrigatório");
      // Colocar foco de volta no textarea quando há erro
      textareaRef.current?.focus();
      return;
    }

    console.log("Confirmado com motivo:", reason);
    onConfirm(reason);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={textareaRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* Full-screen container for centering */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold">
                    Motivo do Fechamento da OS
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100"
                    aria-label="Fechar"
                    tabIndex={0}
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <Dialog.Description className="mb-4 text-sm text-gray-600">
                  Por favor, informe o motivo pelo qual esta ordem de serviço
                  está sendo concluída. Esta informação é importante para o
                  histórico e acompanhamento dos serviços.
                </Dialog.Description>

                <div className="mb-4">
                  <label
                    htmlFor="closingReason"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Motivo do fechamento
                  </label>
                  <textarea
                    id="closingReason"
                    ref={textareaRef}
                    className={`w-full px-3 py-2 border ${
                      error ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    rows={4}
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (e.target.value.trim()) {
                        setError("");
                      }
                    }}
                    placeholder="Descreva o motivo do fechamento da OS..."
                    tabIndex={0}
                    required
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    tabIndex={0}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    ref={confirmButtonRef}
                    onClick={handleConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    tabIndex={0}
                  >
                    Confirmar
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
