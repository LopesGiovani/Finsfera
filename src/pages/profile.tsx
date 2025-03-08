import { useState, useEffect, FormEvent, useRef } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import { toast } from "react-hot-toast";
import {
  ProfileCard,
  PersonalInfoSection,
  PasswordChangeSection,
  ActivityHistory,
  UserStats,
} from "@/components/profile";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Profile() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Componentes filhos só devem ser montados quando confirmamos autenticação
  const [canRenderComponents, setCanRenderComponents] = useState(false);

  // Ref para o componente ActivityHistory
  const activityHistoryRef = useRef<{
    fetchActivities: () => Promise<void>;
  } | null>(null);

  // Estados para gerenciar os dados do formulário
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verificar autenticação assim que o componente montar
  useEffect(() => {
    // Quando a autenticação terminar de carregar
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        console.log("Usuário não autenticado, redirecionando para login");
        // Usuário não está autenticado, redirecionar para login
        router.push("/login?redirect=profile&reason=session_expired");
      } else {
        // Autenticação confirmada, permitir renderização dos componentes
        setCanRenderComponents(true);
        // Atualizar os campos de formulário
        setName(user.name || "");
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Função para atualizar o perfil
  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();

    // Verificar novamente se o usuário está autenticado antes de prosseguir
    if (!isAuthenticated) {
      toast.error("Sessão expirada. Faça login novamente.");
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      // Validar se os dados são válidos
      if (!name.trim()) {
        toast.error("Nome é obrigatório");
        setIsLoading(false);
        return;
      }

      // Dados a serem enviados
      const data: {
        name: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        name: name.trim(),
      };

      // Se estiver alterando a senha, adicionar os campos de senha
      if (error) {
        // Validar se senhas estão preenchidas
        if (!currentPassword) {
          toast.error("Senha atual é obrigatória");
          setIsLoading(false);
          return;
        }

        if (!newPassword) {
          toast.error("Nova senha é obrigatória");
          setIsLoading(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          toast.error("As senhas não conferem");
          setIsLoading(false);
          return;
        }

        // Incluir senhas no payload
        data.currentPassword = currentPassword;
        data.newPassword = newPassword;
      }

      // Enviar dados para a API
      const response = await userService.updateProfile(data);

      // Mostrar mensagem de sucesso
      toast.success(response.message || "Perfil atualizado com sucesso");

      // Atualizar o histórico de atividades
      if (activityHistoryRef.current) {
        setTimeout(() => {
          activityHistoryRef.current?.fetchActivities();
        }, 1000); // Pequeno delay para garantir que o backend registrou a atividade
      }

      // Limpar campos de senha
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
    } catch (error: any) {
      // Verificar se é erro de autenticação
      if (error.message && error.message.includes("Sessão expirada")) {
        // Redirecionar para página de login
        router.push("/login?redirect=profile&reason=session_expired");
      } else {
        toast.error(error.message || "Erro ao atualizar perfil");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Se autenticação ainda está carregando, mostrar spinner
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-xl">Verificando autenticação...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Se usuário não estiver autenticado, mostrar mensagem
  if (!isAuthenticated || !user) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="text-yellow-500 text-2xl mr-4">⚠️</div>
              <div>
                <h2 className="text-xl font-medium text-yellow-700 mb-2">
                  Sessão Expirada
                </h2>
                <p className="text-yellow-600 mb-4">
                  Sua sessão expirou ou você não está autenticado. Por favor,
                  faça login novamente para acessar seu perfil.
                </p>
                <Link href="/login">
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Ir para o Login
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Renderizar apenas quando confirmarmos que o usuário está realmente autenticado
  if (!canRenderComponents) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-xl">Preparando seu perfil...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-medium">Meu Perfil</h1>
        </div>

        <ProfileCard user={user} />

        <UserStats user={user} />

        <form onSubmit={handleUpdateProfile}>
          <PersonalInfoSection user={user} name={name} setName={setName} />

          <PasswordChangeSection
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            setCurrentPassword={setCurrentPassword}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            isPasswordChanging={!!error}
            setIsPasswordChanging={(value) =>
              setError(value ? "changing" : null)
            }
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </button>
          </div>
        </form>

        <ActivityHistory user={user} ref={activityHistoryRef} />
      </div>
    </DashboardLayout>
  );
}
