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

// Interface para o tipo de cliente
interface Customer {
  id: number;
  name: string;
  document: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  active: boolean;
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(true);
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

    loadCustomers();
  }, [user, router, searchTerm, activeFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      // Construir query params
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (activeFilter !== null) params.append("active", String(activeFilter));

      const response = await fetch(`/api/customers?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Falha ao carregar clientes");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setError(
        "Não foi possível carregar a lista de clientes. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja desativar este cliente?")) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao desativar cliente");
      }

      // Atualiza a lista de clientes
      loadCustomers();
    } catch (err) {
      console.error("Erro ao desativar cliente:", err);
      alert(
        "Não foi possível desativar o cliente. Tente novamente mais tarde."
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Clientes</h1>
          <Link
            href="/dashboard/clientes/novo"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Cliente
          </Link>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Buscar por nome, documento ou e-mail..."
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
        </div>

        {/* Tabela de clientes */}
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum cliente encontrado.
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
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
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
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {customer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.document}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{customer.email}</div>
                      <div className="text-sm text-gray-500">
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.city}/{customer.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {customer.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/dashboard/clientes/${customer.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
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
