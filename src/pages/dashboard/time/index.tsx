import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

// Interface para o tipo de membro da equipe
interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  canSeeAllOS: boolean;
  active: boolean;
}

export default function TimePage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(true);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
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

    loadTeamMembers();
  }, [user, router, searchTerm, activeFilter, roleFilter]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      setError("");

      // Buscar membros da equipe na API
      const response = await fetch(`/api/team`);

      if (!response.ok) {
        throw new Error("Falha ao carregar membros da equipe");
      }

      const data = await response.json();

      // Filtrar dados se necessário
      let filteredData = data;

      if (searchTerm) {
        filteredData = filteredData.filter(
          (member: TeamMember) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (activeFilter !== null) {
        filteredData = filteredData.filter(
          (member: TeamMember) => member.active === activeFilter
        );
      }

      if (roleFilter) {
        filteredData = filteredData.filter(
          (member: TeamMember) => member.role === roleFilter
        );
      }

      setTeamMembers(filteredData);
    } catch (err) {
      console.error("Erro ao carregar membros da equipe:", err);
      setError(
        "Não foi possível carregar a lista de membros da equipe. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja desativar este membro da equipe?")) {
      return;
    }

    try {
      const response = await fetch(`/api/team/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao desativar membro da equipe");
      }

      // Atualiza a lista de membros
      loadTeamMembers();
    } catch (err) {
      console.error("Erro ao desativar membro da equipe:", err);
      alert(
        "Não foi possível desativar o membro da equipe. Tente novamente mais tarde."
      );
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

  // Função para obter a cor do cargo
  const getRoleColorClass = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "system_admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "technician":
        return "bg-green-100 text-green-800";
      case "assistant":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Equipe</h1>
          <Link
            href="/dashboard/time/novo"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Membro
          </Link>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          </div>

          <select
            value={activeFilter === null ? "" : String(activeFilter)}
            onChange={(e) => {
              const value = e.target.value;
              setActiveFilter(value === "" ? null : value === "true");
            }}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Todos os status</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>

          <select
            value={roleFilter || ""}
            onChange={(e) => {
              const value = e.target.value;
              setRoleFilter(value === "" ? null : value);
            }}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Todas as funções</option>
            <option value="owner">Proprietário</option>
            <option value="system_admin">Administrador do Sistema</option>
            <option value="manager">Gerente</option>
            <option value="technician">Técnico</option>
            <option value="assistant">Assistente</option>
          </select>
        </div>

        {/* Tabela de membros da equipe */}
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum membro da equipe encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissões
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {member.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColorClass(
                          member.role
                        )}`}
                      >
                        {formatRoleName(member.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.canSeeAllOS ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
                          Acesso a todas as OSs
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full">
                          Acesso restrito
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {member.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/time/${member.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        {member.role !== "owner" && (
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
