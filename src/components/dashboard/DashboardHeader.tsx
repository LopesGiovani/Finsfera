import {
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../Button";

export function DashboardHeader() {
  const progress = 33;

  return (
    <header className="bg-white border-b border-gray-200 py-6 px-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <h1 className="text-2xl font-medium">Olá giovani oliveira!</h1>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <span>
              Você completou {progress}% da revisão das configurações da
              empresa!
            </span>
            <a href="#" className="text-blue-500 ml-2">
              Revisar configurações da empresa e faturamento
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <BellIcon className="w-6 h-6" />
          </button>
          <div className="relative">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
              1
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
