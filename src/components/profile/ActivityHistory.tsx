import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { User } from "@/contexts/AuthContext";
import {
  ClockIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { userService, UserActivity } from "@/services/userService";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface ActivityHistoryProps {
  user: User | null;
}

// Função para obter o ícone da atividade com base na ação
const getActivityIcon = (activity: UserActivity): string => {
  const action = activity.action.toLowerCase();

  if (action.includes("login")) return "🔐";
  if (action.includes("logout")) return "🚪";
  if (action.includes("perfil") || action.includes("profile")) return "👤";
  if (action.includes("senha") || action.includes("password")) return "🔑";
  if (action.includes("ordem") || action.includes("order")) return "📋";
  if (action.includes("cliente") || action.includes("customer")) return "🧑‍💼";
  if (action.includes("serviço") || action.includes("service")) return "🔧";

  return "📝"; // Ícone genérico para outras atividades
};

// Função para formatar a data/hora relativa
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  // Formatação da data em PT-BR
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // String formatada da data (ex: 25/10/2023 14:30)
  const formattedDate = formatter.format(date);

  if (diffInMinutes < 1) return "Agora";
  if (diffInMinutes < 60) return `Há ${diffInMinutes} minutos`;
  if (diffInHours < 24) return `Há ${diffInHours} horas`;
  if (diffInDays === 1)
    return `Ontem às ${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}`;

  return formattedDate;
};

// Alterar a definição do componente para usar forwardRef
export const ActivityHistory = forwardRef<
  { fetchActivities: () => Promise<void> },
  ActivityHistoryProps
>(({ user }, ref) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);

  const fetchActivities = async () => {
    if (!user) {
      setError("Usuário não autenticado");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.getUserActivities(page, 5);

      if (response.success) {
        setActivities(response.activities || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalActivities(response.pagination?.total || 0);
      } else {
        setError(response.message || "Erro ao buscar atividades");
      }
    } catch (error: any) {
      console.error("Erro ao buscar atividades:", error);

      if (error.message && error.message.includes("Sessão expirada")) {
        setError("auth_error");
      } else {
        setError(error.message || "Erro ao buscar atividades");
        toast.error("Falha ao carregar atividades. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Expor o método fetchActivities para o componente pai
  useImperativeHandle(ref, () => ({
    fetchActivities,
  }));

  // Carregar atividades quando o componente montar ou quando a página mudar
  useEffect(() => {
    fetchActivities();
  }, [user, page]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  if (error === "auth_error") {
    return (
      <div className="mt-12">
        <h2 className="text-lg font-medium mb-4">Histórico de Atividades</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Sessão Expirada
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Sua sessão expirou. Por favor, faça login novamente para ver
                  seu histórico de atividades.
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
    <div className="mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Histórico de Atividades</h2>
        <button
          onClick={fetchActivities}
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
                onClick={fetchActivities}
                className="mt-2 text-sm text-red-700 underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {totalActivities === 0 && !isLoading && !error ? (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
          <p>Nenhuma atividade registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading
            ? // Estado de carregamento - placeholders
              Array(3)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={`loading-${idx}`}
                    className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse"
                  >
                    <div className="flex items-start">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="ml-3 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))
            : // Lista de atividades
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start">
                    <div className="text-2xl mr-3 mt-1">
                      {getActivityIcon(activity)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      {activity.details && (
                        <p className="text-sm text-gray-500 mt-1">
                          {typeof activity.details === "string"
                            ? activity.details
                            : JSON.stringify(activity.details)}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                </div>
              ))}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1 || isLoading}
                className={`flex items-center text-sm ${
                  page === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-500 hover:text-blue-700"
                }`}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Anterior
              </button>
              <span className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages || isLoading}
                className={`flex items-center text-sm ${
                  page === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-500 hover:text-blue-700"
                }`}
              >
                Próxima
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ActivityHistory.displayName = "ActivityHistory";
