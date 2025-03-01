import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  DocumentChartBarIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface StatData {
  total: number;
  active: number;
  inactive: number;
  cities: { city: string; count: number }[];
  states: { state: string; count: number }[];
}

export default function RelatoriosClientesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<StatData>({
    total: 0,
    active: 0,
    inactive: 0,
    cities: [],
    states: [],
  });

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

    // Função fictícia para obter estatísticas
    // Na implementação real, você faria uma chamada à API
    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        // Aqui você faria uma chamada à API para obter estatísticas reais
        // const response = await fetch("/api/customers/stats");
        // const data = await response.json();

        // Simulando dados para a demonstração
        const mockData: StatData = {
          total: 145,
          active: 132,
          inactive: 13,
          cities: [
            { city: "São Paulo", count: 42 },
            { city: "Rio de Janeiro", count: 35 },
            { city: "Belo Horizonte", count: 28 },
            { city: "Salvador", count: 15 },
            { city: "Outros", count: 25 },
          ],
          states: [
            { state: "SP", count: 52 },
            { state: "RJ", count: 38 },
            { state: "MG", count: 30 },
            { state: "BA", count: 18 },
            { state: "Outros", count: 7 },
          ],
        };

        setStats(mockData);
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
        setError(
          "Não foi possível carregar as estatísticas. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user, router]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/dashboard/clientes" className="mr-4">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">Relatórios de Clientes</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Carregando estatísticas...</div>
        ) : (
          <div className="space-y-6">
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-700 mb-2">
                  Total de Clientes
                </h2>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.total}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-700 mb-2">
                  Clientes Ativos
                </h2>
                <p className="text-3xl font-bold text-green-600">
                  {stats.active}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ({Math.round((stats.active / stats.total) * 100)}% do total)
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-700 mb-2">
                  Clientes Inativos
                </h2>
                <p className="text-3xl font-bold text-red-600">
                  {stats.inactive}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ({Math.round((stats.inactive / stats.total) * 100)}% do total)
                </p>
              </div>
            </div>

            {/* Distribuição geográfica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-700 mb-4">
                  Distribuição por Cidade
                </h2>
                <div className="space-y-4">
                  {stats.cities.map((item) => (
                    <div key={item.city} className="flex items-center">
                      <div className="w-32 font-medium text-gray-700">
                        {item.city}
                      </div>
                      <div className="flex-grow">
                        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-blue-500"
                            style={{
                              width: `${(item.count / stats.total) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-3 text-sm text-gray-600 w-16 text-right">
                        {item.count} (
                        {Math.round((item.count / stats.total) * 100)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-700 mb-4">
                  Distribuição por Estado
                </h2>
                <div className="space-y-4">
                  {stats.states.map((item) => (
                    <div key={item.state} className="flex items-center">
                      <div className="w-20 font-medium text-gray-700">
                        {item.state}
                      </div>
                      <div className="flex-grow">
                        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-green-500"
                            style={{
                              width: `${(item.count / stats.total) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-3 text-sm text-gray-600 w-16 text-right">
                        {item.count} (
                        {Math.round((item.count / stats.total) * 100)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end">
              <button
                onClick={() => alert("Função de exportação será implementada.")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <DocumentChartBarIcon className="w-5 h-5" />
                Exportar Relatório
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
