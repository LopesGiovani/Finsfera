import axios from "axios";
import { InternalAxiosRequestConfig } from "axios";
import Router from "next/router";

// Estende a interface InternalAxiosRequestConfig para permitir _isApiInstance
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _isApiInstance?: boolean;
  }
}

// Cria uma instância personalizada do Axios com configuração específica para nossa aplicação
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  // Define um timeout para evitar solicitações penduradas
  timeout: 15000,
});

// Função auxiliar para obter token a partir do localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Função para verificar se o token está expirado (sem precisar chamar o backend)
const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    const expTimestamp = payload.exp * 1000; // Converter para milissegundos
    const now = Date.now();

    // Considerar expirado 30 segundos antes para evitar problemas de timing
    return now >= expTimestamp - 30000;
  } catch (e) {
    console.error("[API] Erro ao decodificar token:", e);
    return true; // Se houver erro na decodificação, considerar token inválido
  }
};

// Limpa qualquer configuração anterior para garantir uma inicialização limpa
api.interceptors.request.clear();
api.interceptors.response.clear();

// Variável para evitar múltiplos redirecionamentos ao mesmo tempo
let isRedirecting = false;

// Interceptador para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Verificar se estamos no navegador (client-side)
    if (typeof window !== "undefined") {
      const token = getToken();

      // Log para depuração (remover em produção)
      console.debug("[API] Configurando requisição:", {
        url: config.url,
        hasToken: !!token,
      });

      // Se temos token, verificar se não está expirado
      if (token) {
        if (isTokenExpired(token)) {
          console.warn("[API] Token expirado localmente, limpando...");
          localStorage.removeItem("token");

          // Redirecionar para login se não estivermos já redirecionando
          if (
            typeof window !== "undefined" &&
            !isRedirecting &&
            window.location.pathname !== "/login"
          ) {
            isRedirecting = true;
            Router.push("/login?reason=session_expired");
          }

          // Não adicionar o token expirado à requisição
          return config;
        }

        // Token válido, adicionar aos headers
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error("[API] Erro na configuração da requisição:", error);
    return Promise.reject(error);
  }
);

// Interceptador para lidar com erros de resposta
api.interceptors.response.use(
  (response) => {
    // Log para depuração (remover em produção)
    console.debug("[API] Resposta recebida:", {
      url: response.config.url,
      status: response.status,
      success: response.data?.success,
    });

    return response;
  },
  (error) => {
    // Tratar erros específicos
    if (error.response) {
      const { status, config } = error.response;

      // Log para depuração
      console.warn(
        `[API] Erro ${status} em ${config.url}:`,
        error.response.data
      );

      // Erro 401 - Não Autorizado
      if (status === 401) {
        console.warn(
          "[API] Sessão expirada ou token inválido - redirecionar para login"
        );

        // Limpar token expirado
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");

          // Redirecionar para login se não estivermos já redirecionando
          if (!isRedirecting && window.location.pathname !== "/login") {
            isRedirecting = true;
            Router.push("/login?reason=session_expired").then(() => {
              // Reset após completar o redirecionamento
              setTimeout(() => {
                isRedirecting = false;
              }, 1000);
            });
          }
        }
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error("[API] Sem resposta do servidor:", error.request);
    } else {
      // Algo aconteceu na configuração da requisição que gerou um erro
      console.error("[API] Erro de configuração:", error.message);
    }

    return Promise.reject(error);
  }
);

// Configura axios global para usar a mesma configuração de token
// Isso é importante porque alguns componentes podem estar usando axios diretamente
axios.interceptors.request.use((config) => {
  // Não aplicar ao axios global requisições já feitas por nossa instância api
  if (config._isApiInstance) {
    return config;
  }

  const token = getToken();
  if (token && !isTokenExpired(token)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Função de utilidade para atualizar o token quando o AuthContext o obtém
export const configureApiToken = (token: string | null) => {
  if (!token) {
    console.warn("[API] Configurando API sem token");
    return;
  }

  console.debug("[API] Token atualizado");
  localStorage.setItem("token", token);
};

// Marcar requisições da nossa instância personalizada
api.interceptors.request.use((config) => {
  config._isApiInstance = true;
  return config;
});

export default api;
