import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

// Interface para o usuário autenticado
interface User {
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
  const router = useRouter();

  // Verificar se há uma sessão ativa ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Verificando autenticação...");
        // Verifica se existe um token no localStorage
        const token = localStorage.getItem("token");

        console.log("Token encontrado:", !!token);

        if (token) {
          // Configura o token no cabeçalho padrão
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          console.log("Token configurado no cabeçalho");

          // Busca os dados do usuário
          console.log("Buscando dados do usuário...");
          const response = await axios.get("/api/auth/me");
          console.log("Resposta da API /me:", response.data);

          if (response.data.success) {
            console.log("Usuário autenticado:", response.data.user);
            setUser(response.data.user);
          } else {
            console.log("Resposta não indica sucesso, limpando dados");
            // Se a resposta não for bem-sucedida, limpa os dados
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
          }
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        // Em caso de erro, limpa os dados
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        console.log("Finalizando verificação de autenticação");
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

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
        localStorage.setItem("token", response.data.token);
        console.log(
          "Token salvo no localStorage:",
          response.data.token.substring(0, 20) + "..."
        );

        // Configura o token no cabeçalho padrão
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
        console.log("Token configurado no cabeçalho");

        // Atualiza o estado com os dados do usuário
        setUser(response.data.user);
        console.log("Usuário definido no estado:", response.data.user);

        // Log para debug
        console.log("Verificando estado atual antes de redirecionar:");
        console.log("- User:", !!response.data.user);
        console.log("- isAuthenticated status:", !!response.data.user);
        console.log("- Token presente:", !!response.data.token);

        // Redireciona para a página inicial
        console.log("Tentando redirecionar para /dashboard...");

        // Pequeno delay para garantir que o estado foi atualizado
        setTimeout(() => {
          // Forçar redirecionamento com window.location
          console.log("Redirecionando com window.location.href");
          window.location.href = "/dashboard";
        }, 500);
      } else {
        console.log("Falha no login:", response.data.message);
        setError(response.data.message || "Erro ao fazer login");
      }
    } catch (err: any) {
      console.error("Erro durante o login:", err);
      console.error("Detalhes do erro:", err.response?.data);
      console.error("Status do erro:", err.response?.status);
      console.error("Headers da resposta:", err.response?.headers);

      // Mensagem de erro mais detalhada
      let errorMsg = "Ocorreu um erro durante o login";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      setLoading(true);

      // Chama a API de logout
      await axios.post("/api/auth/logout");

      // Limpa os dados locais
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);

      // Redireciona para a página de login
      router.push("/login");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    } finally {
      setLoading(false);
    }
  };

  // Valor do contexto
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};
