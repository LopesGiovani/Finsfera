import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  console.log("ProtectedRoute - Estado inicial:", {
    isAuthenticated,
    loading,
    user,
  });

  useEffect(() => {
    console.log("ProtectedRoute - useEffect:", {
      isAuthenticated,
      loading,
      user,
    });

    // Se não estiver carregando e não estiver autenticado, redireciona para o login
    if (!loading && !isAuthenticated) {
      console.log("ProtectedRoute - Redirecionando para /login");
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, user]);

  // Enquanto estiver carregando, mostra uma tela de carregamento
  if (loading) {
    console.log("ProtectedRoute - Mostrando tela de carregamento");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderiza nada (aguardando redirecionamento)
  if (!isAuthenticated) {
    console.log("ProtectedRoute - Não autenticado, não renderizando nada");
    return null;
  }

  // Se estiver autenticado, renderiza os filhos
  console.log("ProtectedRoute - Autenticado, renderizando conteúdo");
  return <>{children}</>;
};

export default ProtectedRoute;
