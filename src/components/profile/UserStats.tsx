import React, { useState, useEffect } from "react";
import { User } from "@/contexts/AuthContext";
import { ChartBarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  userService,
  UserStats as UserStatsType,
} from "@/services/userService";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface UserStatsProps {
  user: User | null;
}

export function UserStats({ user }: UserStatsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStatsType>({
    osCreated: 0,
    osCompleted: 0,
    customersServed: 0,
    avgCompletionTime: "0.0",
  });

  // Função para buscar estatísticas
  const fetchStats = async () => {
    // Se não houver usuário, não faz sentido buscar
    if (!user) {
      setError("Usuário não autenticado");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await userService.getUserStats();
      setStats(data);
    } catch (error: any) {
      console.error("Erro ao carregar estatísticas:", error);

      // Verificar se é um erro de autenticação
      if (error.message && error.message.includes("Sessão expirada")) {
        setError("auth_error");
      } else {
        setError(error.message || "Erro ao carregar estatísticas");
        toast.error("Falha ao carregar estatísticas");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para carregar estatísticas quando o componente montar
  useEffect(() => {
    fetchStats();
  }, [user]);

  // Se houver um erro de autenticação, exibir mensagem específica
  if (error === "auth_error") {
    return (
      <div className="mt-6 mb-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow">
          <div className="flex">
            <div className="flex-shrink-0">
              <ChartBarIcon
                className="h-5 w-5 text-yellow-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Sessão Expirada
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Sua sessão expirou. Por favor, faça login novamente para ver
                  suas estatísticas.
                </p>
                <div className="mt-3">
                  <Link href="/login?redirect=profile">
                    <span className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Fazer Login
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Meus Indicadores</h2>
        <button
          onClick={() => fetchStats()}
          disabled={isLoading}
          className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
        >
          <ArrowPathIcon
            className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
          />
          Atualizar
        </button>
      </div>

      {error && error !== "auth_error" && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchStats}
                className="mt-2 text-sm text-red-700 underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OSs Criadas */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">OSs Criadas</p>
              <p className="text-2xl font-semibold mt-1">
                {isLoading ? "..." : stats.osCreated}
              </p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full h-10 w-10 flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* OSs Concluídas */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">OSs Concluídas</p>
              <p className="text-2xl font-semibold mt-1">
                {isLoading ? "..." : stats.osCompleted}
              </p>
            </div>
            <div className="bg-green-100 p-2 rounded-full h-10 w-10 flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Clientes Atendidos */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Clientes Atendidos</p>
              <p className="text-2xl font-semibold mt-1">
                {isLoading ? "..." : stats.customersServed}
              </p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full h-10 w-10 flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tempo Médio de Conclusão */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Tempo Médio (horas)</p>
              <p className="text-2xl font-semibold mt-1">
                {isLoading ? "..." : stats.avgCompletionTime}
              </p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-full h-10 w-10 flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
