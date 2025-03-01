import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

// Interface para os dados do membro da equipe
interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  organizationId: number;
  canSeeAllOS: boolean;
  active: boolean;
  createdAt: string;
}

// Interface para os dados do formulário com senha opcional
interface FormData {
  name: string;
  email: string;
  role: string;
  canSeeAllOS: boolean;
  active: boolean;
  password?: string; // Tornando a senha opcional
}

export default function EditarMembroPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [memberData, setMemberData] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "",
    canSeeAllOS: false,
    active: true,
    password: "", // Para alterar a senha, se necessário
  });

  // Carregar dados do membro
  useEffect(() => {
    if (!id) return;

    // Verificar permissões do usuário
    if (
      user &&
      user.role !== "system_admin" &&
      user.role !== "owner" &&
      user.role !== "manager"
    ) {
      router.push("/dashboard");
      return;
    }

    const fetchMemberData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/team/${id}`);

        if (!response.ok) {
          throw new Error("Falha ao carregar dados do membro da equipe");
        }

        const data = await response.json();
        setMemberData(data);
        setFormData({
          name: data.name,
          email: data.email,
          role: data.role,
          canSeeAllOS: data.canSeeAllOS,
          active: data.active,
          password: "",
        });
      } catch (err) {
        console.error("Erro ao carregar membro da equipe:", err);
        setError("Não foi possível carregar os dados do membro da equipe.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [id, router, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Criar um novo objeto para enviar, excluindo senha vazia
      const payload: FormData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        canSeeAllOS: formData.canSeeAllOS,
        active: formData.active,
      };

      // Adicionar senha apenas se não estiver vazia
      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      const response = await fetch(`/api/team/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar membro da equipe");
      }

      setSuccess("Membro da equipe atualizado com sucesso!");

      // Limpar campo de senha após atualização bem-sucedida
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err: any) {
      console.error("Erro ao atualizar membro da equipe:", err);
      setError(
        err.message ||
          "Ocorreu um erro ao atualizar o membro da equipe. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  };

  // Função para formatar o nome da função/cargo
  const formatRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      owner: "Proprietário",
      system_admin: "Administrador do Sistema",
      manager: "Gerente",
      technician: "Técnico",
      assistant: "Assistente",
    };

    return roleNames[role] || role;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">Carregando dados do membro...</div>
      </DashboardLayout>
    );
  }

  if (!memberData) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Link href="/dashboard/time" className="mr-4">
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold">Editar Membro da Equipe</h1>
          </div>
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || "Membro da equipe não encontrado"}
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard/time"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voltar para Lista
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/time" className="mr-4">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">Editar Membro da Equipe</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>ID:</strong> {memberData.id}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Data de Criação:</strong>{" "}
                  {new Date(memberData.createdAt).toLocaleString("pt-BR")}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Função Atual:</strong>{" "}
                  {formatRoleName(memberData.role)}
                </p>
              </div>

              <div className="col-span-2 flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Membro Ativo</span>
                </label>
              </div>

              <div className="col-span-2">
                <h2 className="text-lg font-medium mb-4">
                  Informações do Membro
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={
                    memberData.role === "owner" && user?.role !== "system_admin"
                  }
                  required
                  className="w-full p-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {(user?.role === "system_admin" ||
                    memberData.role === "owner") && (
                    <option value="owner">Proprietário</option>
                  )}
                  <option value="manager">Gerente</option>
                  <option value="technician">Técnico</option>
                  <option value="assistant">Assistente</option>
                </select>
                {memberData.role === "owner" &&
                  user?.role !== "system_admin" && (
                    <p className="text-sm text-red-500 mt-1">
                      Apenas administradores do sistema podem alterar a função
                      de proprietários.
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha (opcional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Deixe em branco para manter a senha atual"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="canSeeAllOS"
                    checked={formData.canSeeAllOS}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">
                    Permitir visualizar todas as ordens de serviço
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Se não marcado, o usuário só verá as ordens de serviço
                  atribuídas a ele.
                </p>
              </div>

              <div className="col-span-2 mt-6">
                <div className="flex justify-end gap-4">
                  <Link
                    href="/dashboard/time"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
