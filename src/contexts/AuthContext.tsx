import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { configureApiToken } from "@/lib/api";

// Interface para o usuário autenticado
export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provedor do contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  // Função para verificar localmente se o token está expirado
  const isTokenExpired = (token: string): boolean => {
    try {
      // Decodificar o token (somente para leitura local)
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

      return Date.now() >= expTimestamp;
    } catch (e) {
      console.error("Erro ao decodificar token:", e);
      return true; // Se houver erro na decodificação, considerar token inválido/expirado
    }
  };

  // Verificar se há uma sessão ativa ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Verificando autenticação...");
        // Verifica se existe um token no localStorage
        const token = localStorage.getItem("token");

        console.log("Token encontrado:", !!token);

        if (!token) {
          // Não há token, usuário não está autenticado
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Verificar localmente se o token está expirado antes de fazer uma chamada à API
        if (isTokenExpired(token)) {
          console.log("Token expirado localmente, limpando dados");
          clearAuthData();
          setLoading(false);
          return;
        }

        // Configura o token no cabeçalho padrão
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("Token configurado no cabeçalho");

        // Configurar token na instância da API
        configureApiToken(token);

        // Busca os dados do usuário
        console.log("Buscando dados do usuário...");
        try {
          const response = await axios.get("/api/auth/me");
          console.log("Resposta da API /me:", response.data);

          if (response.data.success) {
            console.log("Usuário autenticado:", response.data.user);
            setUser(response.data.user);
            setIsAuthenticated(true);

            // Renovar o token a cada autenticação bem-sucedida
            if (response.data.token) {
              localStorage.setItem("token", response.data.token);
              configureApiToken(response.data.token);
              console.log("Token renovado");
            }
          } else {
            console.log("Resposta não indica sucesso, limpando dados");
            // Se a resposta não for bem-sucedida, limpa os dados
            clearAuthData();
          }
        } catch (apiError: any) {
          console.error("Erro ao chamar API /me:", apiError.message);

          // Verificar se é erro de autenticação (401)
          if (apiError.response && apiError.response.status === 401) {
            console.log("Erro 401 detectado, sessão expirada");
          }

          // Erro ao verificar token, limpa os dados
          clearAuthData();
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        // Em caso de erro, limpa os dados
        clearAuthData();
      } finally {
        console.log("Finalizando verificação de autenticação");
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função para limpar dados de autenticação
  const clearAuthData = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    configureApiToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Iniciando login com:", { email });

      // Logs adicionais para depuração
      console.log("Enviando requisição para /api/auth/login com:", {
        email,
        senha: password.substring(0, 3) + "...", // Mostra apenas parte da senha por segurança
      });

      const response = await axios.post("/api/auth/login", { email, password });

      console.log("Resposta do servidor:", response.data);

      if (response.data.success) {
        // Salva o token no localStorage
        const token = response.data.token;
        localStorage.setItem("token", token);
        console.log("Token salvo no localStorage");

        // Configura o token na instância da API
        configureApiToken(token);

        // Configura cabeçalho padrão com o token
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("Token configurado em cabeçalhos padrão");

        // Atualiza o estado com os dados do usuário
        setUser(response.data.user);
        setIsAuthenticated(true);

        // Redireciona para a página inicial (dashboard)
        router.push("/dashboard");
      } else {
        console.log("Resposta não indica sucesso:", response.data);
        setError(response.data.message || "Erro desconhecido");
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.error("Erro ao fazer login:", err);
      const errorMessage =
        err.response?.data?.message || "Erro ao conectar com o servidor";
      setError(errorMessage);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      setLoading(true);
      // Chamada para o endpoint de logout
      await axios.post("/api/auth/logout");

      // Limpa os dados de autenticação
      clearAuthData();

      // Redireciona para a página de login
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, limpa os dados locais
      clearAuthData();
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  // Valor do contexto a ser provido
  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};
