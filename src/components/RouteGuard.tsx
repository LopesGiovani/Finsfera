import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Rotas que não precisam de autenticação
const publicPaths = ["/login", "/register", "/", "/forgot-password"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  console.log("RouteGuard inicializado - Path atual:", router.asPath);
  console.log("Estado da autenticação:", {
    isAuthenticated,
    loading,
    hasUser: !!user,
  });

  useEffect(() => {
    // Função para verificar se o acesso à rota é permitido
    function authCheck(url: string) {
      console.log("RouteGuard - Verificando rota:", {
        url,
        isAuthenticated,
        loading,
        hasUser: !!user,
      });

      // Se a rota estiver na lista de rotas públicas, permite o acesso
      const path = url.split("?")[0];
      if (publicPaths.includes(path)) {
        console.log("RouteGuard - Rota pública, acesso permitido");
        setAuthorized(true);
        return;
      }

      // Se estiver carregando, ainda não sabemos se o usuário está autenticado
      if (loading) {
        console.log("RouteGuard - Carregando, aguardando...");
        return;
      }

      // Se não estiver autenticado e a rota não for pública, redireciona para o login
      if (!isAuthenticated) {
        console.log(
          "RouteGuard - Usuário não autenticado, redirecionando para login"
        );
        setAuthorized(false);

        console.log("Redirecionando para:", {
          pathname: "/login",
          query: { returnUrl: router.asPath },
        });

        router.push({
          pathname: "/login",
          query: { returnUrl: router.asPath },
        });
      } else {
        console.log("RouteGuard - Usuário autenticado, acesso permitido");
        console.log("Detalhes do usuário:", user);
        setAuthorized(true);
      }
    }

    // Evento para quando a rota mudar
    const hideContent = () => {
      console.log("RouteGuard - Mudança de rota iniciada, ocultando conteúdo");
      setAuthorized(false);
    };
    router.events.on("routeChangeStart", hideContent);

    // Verifica a autenticação quando a rota mudar
    const routeChangeComplete = (url: string) => {
      console.log("RouteGuard - Rota alterada para:", url);
      authCheck(url);
    };
    router.events.on("routeChangeComplete", routeChangeComplete);

    // Verificação inicial
    console.log("RouteGuard - Verificação inicial da rota:", router.asPath);
    authCheck(router.asPath);

    // Limpeza dos eventos
    return () => {
      console.log("RouteGuard - Limpando eventos");
      router.events.off("routeChangeStart", hideContent);
      router.events.off("routeChangeComplete", routeChangeComplete);
    };
  }, [isAuthenticated, loading, router, user]);

  // Enquanto estiver carregando ou não autorizado, mostra um indicador de carregamento
  if (loading) {
    console.log("RouteGuard - Mostrando indicador de carregamento");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Se não estiver autorizado, não renderiza nada
  if (!authorized) {
    console.log("RouteGuard - Não autorizado, não renderizando conteúdo");
    return null;
  }

  // Se estiver autorizado, renderiza a página
  console.log("RouteGuard - Autorizado, renderizando conteúdo");
  return <>{children}</>;
}
