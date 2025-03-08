import axios from "axios";
import api from "@/lib/api";

interface UpdateProfileParams {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UserActivity {
  id: number;
  userId: number;
  action: string;
  entityType?: string;
  entityId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserStats {
  osCreated: number;
  osCompleted: number;
  customersServed: number;
  avgCompletionTime: string;
}

// Função para verificar se um erro é de autenticação
const isAuthError = (error: any): boolean => {
  if (!error) return false;

  // Verifica código de status
  if (error.response?.status === 401) return true;

  // Verifica mensagem
  const errorMessage = error.message || "";
  return (
    errorMessage.includes("Token inválido") ||
    errorMessage.includes("Não autorizado") ||
    errorMessage.includes("Sessão expirada") ||
    errorMessage.includes("401")
  );
};

export const userService = {
  // Atualizar o perfil do usuário
  updateProfile: async (data: UpdateProfileParams) => {
    try {
      console.debug("[userService] Atualizando perfil do usuário");
      const response = await api.put("/auth/update-profile", data);
      return response.data;
    } catch (error: any) {
      console.error("[userService] Erro ao atualizar perfil:", error);

      if (isAuthError(error)) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      if (error.response) {
        throw new Error(
          error.response.data.message || "Erro ao atualizar perfil"
        );
      }
      throw new Error("Erro de conexão ao atualizar perfil");
    }
  },

  // Obter dados do usuário atual
  getProfile: async () => {
    try {
      console.debug("[userService] Obtendo perfil do usuário");
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error: any) {
      console.error("[userService] Erro ao obter perfil:", error);

      if (isAuthError(error)) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      if (error.response) {
        throw new Error(error.response.data.message || "Erro ao obter perfil");
      }
      throw new Error("Erro de conexão ao obter perfil");
    }
  },

  // Obter atividades do usuário
  getUserActivities: async (page: number = 1, limit: number = 10) => {
    try {
      console.debug("[userService] Obtendo atividades do usuário", {
        page,
        limit,
      });
      const response = await api.get(
        `/user/activities?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      console.error("[userService] Erro ao obter atividades:", error);

      if (isAuthError(error)) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      if (error.response) {
        throw new Error(
          error.response.data.message || "Erro ao obter atividades"
        );
      }
      throw new Error("Erro de conexão ao obter atividades");
    }
  },

  // Registrar uma nova atividade do usuário
  logActivity: async (
    action: string,
    entityType?: string,
    entityId?: number,
    details?: any
  ) => {
    try {
      console.debug("[userService] Registrando atividade", {
        action,
        entityType,
        entityId,
      });
      const response = await api.post("/user/log-activity", {
        action,
        entityType,
        entityId,
        details,
      });
      return response.data;
    } catch (error: any) {
      console.error("[userService] Erro ao registrar atividade:", error);
      // Não lançamos o erro para não interromper o fluxo principal
    }
  },

  // Obter estatísticas do usuário
  getUserStats: async (): Promise<UserStats> => {
    try {
      console.debug("[userService] Obtendo estatísticas do usuário");
      const response = await api.get("/user/stats");

      if (response.data.success) {
        return response.data.stats;
      }

      throw new Error(
        response.data.message || "Erro ao obter estatísticas do usuário"
      );
    } catch (error: any) {
      console.error("[userService] Erro ao obter estatísticas:", error);

      // Se for erro de autenticação, propagar para o componente tratar
      if (isAuthError(error)) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      // Retornar valores padrão em caso de outros erros
      return {
        osCreated: 0,
        osCompleted: 0,
        customersServed: 0,
        avgCompletionTime: "0.0",
      };
    }
  },
};
