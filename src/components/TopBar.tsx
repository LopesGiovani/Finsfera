import { useState } from "react";
import { BellIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { FinsAIChat } from "./FinsAIChat";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";

export function TopBar() {
  const [isFinsAIOpen, setIsFinsAIOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Lado Esquerdo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <span className="text-gray-700">Bem vindo {user?.name || ""}!</span>
          </div>

          {/* Lado Direito */}
          <div className="flex items-center gap-4">
            {/* Fins AI */}
            <button
              onClick={() => setIsFinsAIOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
              <span className="text-sm text-gray-700">Fins AI</span>
            </button>

            {/* Ajuda */}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
              <QuestionMarkCircleIcon className="w-5 h-5" />
            </button>

            {/* Notificações */}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
              <BellIcon className="w-5 h-5" />
            </button>

            {/* Menu do Usuário */}
            <div className="flex items-center gap-2">
              <UserMenu />
            </div>

            {/* Menu de Configurações */}
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
              <span className="text-lg">⚙️</span>
            </button>
          </div>
        </div>
      </div>

      <FinsAIChat
        isOpen={isFinsAIOpen}
        onClose={() => setIsFinsAIOpen(false)}
      />
    </>
  );
}
