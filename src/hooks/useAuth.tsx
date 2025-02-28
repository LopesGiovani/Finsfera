import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

// Definição do tipo User
export interface User {
  id: number;
  name: string;
  email: string;
  role: "owner" | "admin" | "user";
  status: "active" | "inactive" | "pending";
  createdAt: string;
  updatedAt: string;
}

// Interface do contexto de autenticação
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

// Criando o contexto com um valor inicial
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  fetchUser: async () => {},
});

// Props para o provedor de autenticação
interface AuthProviderProps {
  children: ReactNode;
}

// Componente provedor que gerencia o estado de autenticação
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Função para buscar dados do usuário atual
  const fetchUser = async () => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await axios.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
    } finally {
      setLoading(false);
    }
  };

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    fetchUser();
  }, []);

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post("/api/auth/login", { email, password });

      if (data.token) {
        Cookies.set("token", data.token);
        setUser(data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao fazer login");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);
