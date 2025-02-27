import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface StatusOSProps {
  status: string;
  onChangeStatus: (novoStatus: string) => void;
}

const statusConfig = {
  novo: { cor: "bg-gray-100 text-gray-800", texto: "Novo" },
  em_andamento: { cor: "bg-yellow-100 text-yellow-800", texto: "Em Andamento" },
  pausado: { cor: "bg-orange-100 text-orange-800", texto: "Pausado" },
  concluido: { cor: "bg-green-100 text-green-800", texto: "Concluído" },
  cancelado: { cor: "bg-red-100 text-red-800", texto: "Cancelado" },
  faturado: { cor: "bg-blue-100 text-blue-800", texto: "Faturado" },
};

export function StatusOS({ status, onChangeStatus }: StatusOSProps) {
  const statusAtual = statusConfig[status as keyof typeof statusConfig];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusAtual.cor}`}
      >
        {statusAtual.texto}
        <ChevronDownIcon className="w-4 h-4" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {Object.entries(statusConfig).map(([key, value]) => (
              <Menu.Item key={key}>
                {({ active }) => (
                  <button
                    onClick={() => onChangeStatus(key)}
                    className={`${
                      active ? "bg-gray-50" : ""
                    } w-full text-left px-4 py-2 text-sm`}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${value.cor}`}
                    />
                    {value.texto}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
