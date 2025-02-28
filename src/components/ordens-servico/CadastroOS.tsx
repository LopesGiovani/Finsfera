import { useState, useEffect, useRef } from "react";
import { StatusOS } from "@/types/ordem-servico";
import { UsuarioSimplificado } from "@/types/usuario";
import { OrdemServicoService } from "@/services/OrdemServicoService";
import { UsuarioService } from "@/services/UsuarioService";
import { useRouter } from "next/router";
import { PaperClipIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface CadastroOSProps {
  onSuccess?: () => void;
}

export function CadastroOS({ onSuccess }: CadastroOSProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioSimplificado[]>([]);
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    responsavelId: "",
    dataAgendada: "",
    prioridade: "media",
  });

  // Carregar lista de usuários
  useEffect(() => {
    UsuarioService.listarUsuarios()
      .then((listaUsuarios) => {
        setUsuarios(listaUsuarios);
      })
      .catch((error) => {
        console.error("Erro ao carregar usuários:", error);
        setErro("Erro ao carregar lista de usuários");
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arquivos = Array.from(e.target.files);
      setArquivosSelecionados((prev) => [...prev, ...arquivos]);
    }
  };

  const removerArquivo = (index: number) => {
    setArquivosSelecionados((prev) => prev.filter((_, i) => i !== index));
  };

  const validarFormulario = (): boolean => {
    if (!formData.titulo) {
      setErro("Título da OS é obrigatório");
      return false;
    }

    if (!formData.dataAgendada) {
      setErro("Data agendada é obrigatória");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setLoading(true);
    setErro(null);

    try {
      // Valores padrão para simulação
      const usuarioLogado = {
        id: 1,
        nome: "Administrador",
      };

      await OrdemServicoService.criarOrdem(
        {
          titulo: formData.titulo,
          descricao: formData.descricao,
          status: StatusOS.EM_ABERTO,
          dataAgendada: new Date(formData.dataAgendada),
          responsavelId: formData.responsavelId
            ? Number(formData.responsavelId)
            : undefined,
          responsavelNome: formData.responsavelId
            ? usuarios.find((u) => u.id === Number(formData.responsavelId))
                ?.nome
            : undefined,
          criadoPorId: usuarioLogado.id,
          criadoPorNome: usuarioLogado.nome,
          prioridade: formData.prioridade as
            | "baixa"
            | "media"
            | "alta"
            | "urgente",
        },
        arquivosSelecionados
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/ordens-servico");
      }
    } catch (error) {
      console.error(error);
      setErro("Erro ao criar ordem de serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Nova Ordem de Serviço</h2>

      {erro && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{erro}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsável
              </label>
              <select
                name="responsavelId"
                value={formData.responsavelId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                disabled={loading}
              >
                <option value="">Selecione um responsável</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Agendada <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dataAgendada"
                value={formData.dataAgendada}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                disabled={loading}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anexar Arquivos
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <PaperClipIcon className="h-6 w-6 mx-auto text-gray-400" />
              <p className="mt-1 text-sm text-gray-500">
                Clique para selecionar arquivos
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleArquivoChange}
                className="hidden"
                multiple
              />
            </div>

            {arquivosSelecionados.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Arquivos selecionados ({arquivosSelecionados.length}):
                </p>
                <ul className="space-y-1">
                  {arquivosSelecionados.map((arquivo, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm"
                    >
                      <div className="flex items-center">
                        <PaperClipIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="truncate max-w-xs">
                          {arquivo.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({(arquivo.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerArquivo(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Criando..." : "Criar OS"}
          </button>
        </div>
      </form>
    </div>
  );
}
