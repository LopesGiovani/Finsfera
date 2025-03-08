import React from "react";
import { User } from "@/contexts/AuthContext";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

interface ProfileCardProps {
  user: User | null;
}

export function ProfileCard({ user }: ProfileCardProps) {
  // Obter as iniciais do usuário para mostrar quando não há foto
  const getInitials = () => {
    if (!user?.name) return "?";
    return user.name.charAt(0).toUpperCase();
  };

  // Mapeia as funções para nomes mais amigáveis
  const getRoleName = (role?: string) => {
    const roleMap: Record<string, string> = {
      system_admin: "Administrador do Sistema",
      owner: "Proprietário",
      manager: "Gerente",
      technician: "Técnico",
      assistant: "Assistente",
    };

    return role ? roleMap[role] || role : "Usuário";
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-3xl font-medium mb-4 md:mb-0 md:mr-6">
          {getInitials()}
        </div>

        <div className="text-center md:text-left">
          <h2 className="text-xl font-medium">
            {user?.name || "Carregando..."}
          </h2>
          <p className="text-gray-500">
            {user?.email || "carregando@email.com"}
          </p>

          <div className="mt-3 flex items-center justify-center md:justify-start gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm inline-flex">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>{getRoleName(user?.role)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
