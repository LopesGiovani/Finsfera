import { useState, useEffect } from "react";
import { UsuarioSimplificado, NivelAcesso } from "@/types/usuario";
import { UsuarioService } from "@/services/UsuarioService";
import Link from "next/link";
import {
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioSimplificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const carregarUsuarios = async () => {
    setLoading(true);
    setErro(null);

    try {
      const listaUsuarios = await UsuarioService.listarUsuarios();
      setUsuarios(listaUsuarios);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar a lista de usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const desativarUsuario = async (id: number) => {
    if (!confirm("Tem certeza que deseja desativar este usuário?")) return;

    try {
      await UsuarioService.desativarUsuario(id);
      carregarUsuarios(); // Recarregar lista
    } catch (error) {
      console.error(error);
      setErro("Erro ao desativar usuário");
    }
  };

  const getNivelAcessoLabel = (nivel: NivelAcesso) => {
    switch (nivel) {
      case NivelAcesso.PADRAO:
        return "Usuário Padrão";
      case NivelAcesso.SUPERVISOR:
        return "Supervisor";
      case NivelAcesso.ADMINISTRADOR:
        return "Administrador";
      default:
        return nivel;
    }
  };

  const getNivelAcessoColor = (nivel: NivelAcesso) => {
    switch (nivel) {
      case NivelAcesso.PADRAO:
        return "bg-gray-100 text-gray-800";
      case NivelAcesso.SUPERVISOR:
        return "bg-blue-100 text-blue-800";
      case NivelAcesso.ADMINISTRADOR:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Membros da Equipe</h2>

        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuário..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <Link
            href="/dashboard/usuarios/novo"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <span className="mr-1">+</span> Novo Usuário
          </Link>
        </div>
      </div>

      {erro && <div className="p-3 bg-red-50 text-red-600">{erro}</div>}

      {loading ? (
        <div className="p-8 text-center text-gray-500">
          Carregando usuários...
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {busca
            ? "Nenhum usuário encontrado para a busca"
            : "Nenhum usuário cadastrado"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acesso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {usuario.avatar ? (
                          <img
                            src={usuario.avatar}
                            alt={usuario.nome}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <UserIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nome}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getNivelAcessoColor(
                        usuario.nivel
                      )}`}
                    >
                      {getNivelAcessoLabel(usuario.nivel)}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/usuarios/editar/${usuario.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <PencilSquareIcon className="h-5 w-5 inline" />
                    </Link>

                    <button
                      onClick={() => desativarUsuario(usuario.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
