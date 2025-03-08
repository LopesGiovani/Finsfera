import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Rotas que não precisam de autenticação
const publicPaths = ["/login", "/register", "/", "/forgot-password"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  // Esconde o conteúdo até verificar se o usuário tem permissão
  const hideContent = () => {
    setAuthorized(false);
  };

  useEffect(() => {
    // Função para verificar se o acesso à rota é permitido
    function authCheck(url: string) {
      // Se a rota estiver na lista de rotas públicas, permite o acesso
      const path = url.split("?")[0];
      if (publicPaths.includes(path)) {
        setAuthorized(true);
        return;
      }

      // Se estiver carregando, ainda não sabemos se o usuário está autenticado
      if (loading) {
        setAuthorized(false);
        return;
      }

      // Se não estiver autenticado e a rota não for pública, redireciona para login
      if (!isAuthenticated) {
        setAuthorized(false);
        router.push({
          pathname: "/login",
          query: { returnUrl: url },
        });
      } else {
        // Se estiver autenticado, permite o acesso
        setAuthorized(true);
      }
    }

    // Quando a rota terminar de mudar, verifica se o usuário tem permissão
    const routeChangeComplete = (url: string) => {
      authCheck(url);
    };

    // Escuta eventos de mudança de rota
    router.events.on("routeChangeStart", hideContent);
    router.events.on("routeChangeComplete", routeChangeComplete);

    // Verificar autenticação na primeira renderização
    authCheck(router.asPath);

    // Limpar event listeners ao desmontar
    return () => {
      router.events.off("routeChangeStart", hideContent);
      router.events.off("routeChangeComplete", routeChangeComplete);
    };
  }, [isAuthenticated, loading, router]);

  // Enquanto verifica a autenticação, mostra indicador de carregamento
  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Se autorizado, renderiza o conteúdo da página
  return <>{children}</>;
}
