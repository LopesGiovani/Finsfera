import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

// Interface para os dados do formulário
interface FormData {
  name: string;
  email: string;
  role: string;
  canSeeAllOS: boolean;
}

export default function NovoMembroPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "technician",
    canSeeAllOS: false,
  });

  // Verificar permissões na montagem do componente
  if (
    user &&
    user.role !== "system_admin" &&
    user.role !== "owner" &&
    user.role !== "manager"
  ) {
    router.push("/dashboard");
    return null;
  }

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
    setLoading(true);
    setError("");
    setTempPassword("");

    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao adicionar membro da equipe");
      }

      // Exibir senha temporária
      if (data.tempPassword) {
        setTempPassword(data.tempPassword);
      } else {
        // Redirecionar para a lista de membros da equipe
        router.push({
          pathname: "/dashboard/time",
          query: { success: "Membro da equipe adicionado com sucesso" },
        });
      }
    } catch (err: any) {
      console.error("Erro ao adicionar membro da equipe:", err);
      setError(
        err.message ||
          "Ocorreu um erro ao adicionar o membro da equipe. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/time" className="mr-4">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">
            Adicionar Novo Membro da Equipe
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {tempPassword ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
              <p className="font-bold">
                Membro da equipe adicionado com sucesso!
              </p>
              <p className="mt-2">
                Senha temporária gerada:{" "}
                <span className="font-mono font-bold">{tempPassword}</span>
              </p>
              <p className="mt-2 text-sm">
                Por favor, anote esta senha e compartilhe com o novo membro. Ele
                deverá alterá-la no primeiro acesso.
              </p>
            </div>
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => {
                  setTempPassword("");
                  setFormData({
                    name: "",
                    email: "",
                    role: "technician",
                    canSeeAllOS: false,
                  });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Adicionar Outro Membro
              </button>
              <Link
                href="/dashboard/time"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Voltar para Lista
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    required
                    className="w-full p-2 border rounded-lg"
                  >
                    {user?.role === "system_admin" && (
                      <option value="owner">Proprietário</option>
                    )}
                    <option value="manager">Gerente</option>
                    <option value="technician">Técnico</option>
                    <option value="assistant">Assistente</option>
                  </select>
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
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Adicionando..." : "Adicionar Membro"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
