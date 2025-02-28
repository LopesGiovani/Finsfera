import { useState, useEffect } from "react";
import { NivelAcesso, Usuario } from "@/types/usuario";
import { UsuarioService } from "@/services/UsuarioService";
import { useRouter } from "next/router";

interface CadastroUsuarioProps {
  usuarioId?: number; // Para edição de usuário existente
  onSuccess?: () => void;
}

export function CadastroUsuario({
  usuarioId,
  onSuccess,
}: CadastroUsuarioProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    nivel: NivelAcesso.PADRAO,
    cargo: "",
    departamento: "",
    telefone: "",
    ativo: true,
  });

  // Carregar dados do usuário para edição
  useEffect(() => {
    if (usuarioId) {
      setLoading(true);
      UsuarioService.obterUsuario(usuarioId)
        .then((usuario) => {
          if (usuario) {
            setFormData({
              nome: usuario.nome,
              email: usuario.email,
              senha: "", // Não carregamos a senha por segurança
              confirmarSenha: "",
              nivel: usuario.nivel,
              cargo: usuario.cargo || "",
              departamento: usuario.departamento || "",
              telefone: usuario.telefone || "",
              ativo: usuario.ativo,
            });
          }
        })
        .catch((err) => {
          setErro("Erro ao carregar dados do usuário");
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [usuarioId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const validarFormulario = (): boolean => {
    if (!formData.nome || !formData.email) {
      setErro("Nome e e-mail são obrigatórios");
      return false;
    }

    if (!usuarioId && (!formData.senha || formData.senha.length < 6)) {
      setErro("Senha deve ter pelo menos 6 caracteres");
      return false;
    }

    if (!usuarioId && formData.senha !== formData.confirmarSenha) {
      setErro("Senhas não conferem");
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
      if (usuarioId) {
        // Atualização de usuário existente
        const { confirmarSenha, ...dadosAtualizacao } = formData;

        // Remover senha se estiver vazia
        if (!dadosAtualizacao.senha) {
          delete dadosAtualizacao.senha;
        }

        await UsuarioService.atualizarUsuario(usuarioId, dadosAtualizacao);
      } else {
        // Criação de novo usuário
        const { confirmarSenha, ...dadosNovoUsuario } = formData;
        await UsuarioService.criarUsuario(
          dadosNovoUsuario as Omit<Usuario, "id" | "dataCadastro">
        );
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/usuarios");
      }
    } catch (error) {
      console.error(error);
      setErro("Erro ao salvar usuário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">
        {usuarioId ? "Editar Usuário" : "Novo Usuário"}
      </h2>

      {erro && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{erro}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {usuarioId && "(deixe em branco para manter)"}
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nível de Acesso
            </label>
            <select
              name="nivel"
              value={formData.nivel}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            >
              <option value={NivelAcesso.PADRAO}>Usuário Padrão</option>
              <option value={NivelAcesso.SUPERVISOR}>Supervisor</option>
              <option value={NivelAcesso.ADMINISTRADOR}>Administrador</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.nivel === NivelAcesso.PADRAO &&
                "Acesso apenas às OS designadas para este usuário"}
              {formData.nivel === NivelAcesso.SUPERVISOR &&
                "Pode criar OS e aprovar/reprovar trabalhos concluídos"}
              {formData.nivel === NivelAcesso.ADMINISTRADOR &&
                "Acesso completo a todas as OS do sistema"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <input
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
          </div>

          {usuarioId && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
                id="ativo"
                className="mr-2"
                disabled={loading}
              />
              <label
                htmlFor="ativo"
                className="text-sm font-medium text-gray-700"
              >
                Usuário Ativo
              </label>
            </div>
          )}
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
            {loading ? "Salvando..." : usuarioId ? "Atualizar" : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
