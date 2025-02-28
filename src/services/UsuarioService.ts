import { Usuario, NivelAcesso, UsuarioSimplificado } from "@/types/usuario";

// Simula uma API em ambiente de desenvolvimento
const mockUsuarios: Usuario[] = [
  {
    id: 1,
    nome: "Administrador",
    email: "admin@finsfera.com",
    senha: "senha123", // Em produção seria um hash
    nivel: NivelAcesso.ADMINISTRADOR,
    dataCadastro: new Date(),
    ativo: true,
    cargo: "Gerente de TI",
    departamento: "Tecnologia",
  },
  {
    id: 2,
    nome: "Técnico",
    email: "tecnico@finsfera.com",
    senha: "senha123",
    nivel: NivelAcesso.PADRAO,
    dataCadastro: new Date(),
    ativo: true,
    cargo: "Técnico de Suporte",
    departamento: "Suporte",
  },
  {
    id: 3,
    nome: "Supervisor",
    email: "supervisor@finsfera.com",
    senha: "senha123",
    nivel: NivelAcesso.SUPERVISOR,
    dataCadastro: new Date(),
    ativo: true,
    cargo: "Supervisor de Operações",
    departamento: "Operações",
  },
];

export class UsuarioService {
  // Obter todos os usuários
  static async listarUsuarios(): Promise<UsuarioSimplificado[]> {
    // Simulação de delay de API
    await new Promise((resolve) => setTimeout(resolve, 500));

    return mockUsuarios.map((user) => ({
      id: user.id,
      nome: user.nome,
      nivel: user.nivel,
      avatar: user.avatar,
    }));
  }

  // Obter detalhes de um usuário específico
  static async obterUsuario(id: number): Promise<Usuario | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const usuario = mockUsuarios.find((user) => user.id === id);
    if (!usuario) return null;

    // Não retornar a senha na resposta
    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha as Usuario;
  }

  // Criar um novo usuário
  static async criarUsuario(
    dados: Omit<Usuario, "id" | "dataCadastro">
  ): Promise<Usuario> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const novoUsuario: Usuario = {
      ...dados,
      id: Math.max(...mockUsuarios.map((u) => u.id)) + 1,
      dataCadastro: new Date(),
    };

    mockUsuarios.push(novoUsuario);

    // Não retornar a senha na resposta
    const { senha, ...usuarioSemSenha } = novoUsuario;
    return usuarioSemSenha as Usuario;
  }

  // Atualizar um usuário existente
  static async atualizarUsuario(
    id: number,
    dados: Partial<Usuario>
  ): Promise<Usuario | null> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const index = mockUsuarios.findIndex((user) => user.id === id);
    if (index === -1) return null;

    // Atualizar dados mantendo outros campos
    mockUsuarios[index] = {
      ...mockUsuarios[index],
      ...dados,
    };

    // Não retornar a senha na resposta
    const { senha, ...usuarioSemSenha } = mockUsuarios[index];
    return usuarioSemSenha as Usuario;
  }

  // Desativar um usuário (não excluir)
  static async desativarUsuario(id: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const index = mockUsuarios.findIndex((user) => user.id === id);
    if (index === -1) return false;

    mockUsuarios[index].ativo = false;
    return true;
  }

  // Autenticar usuário (login)
  static async autenticar(
    email: string,
    senha: string
  ): Promise<Omit<Usuario, "senha"> | null> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const usuario = mockUsuarios.find(
      (user) => user.email === email && user.senha === senha && user.ativo
    );

    if (!usuario) return null;

    // Não retornar a senha na resposta
    const { senha: _, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }

  // Verificar se usuário tem acesso de administrador
  static async verificarAcessoAdmin(usuarioId: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const usuario = mockUsuarios.find((user) => user.id === usuarioId);
    return !!usuario && usuario.nivel === NivelAcesso.ADMINISTRADOR;
  }

  // Verificar se usuário tem acesso de supervisor
  static async verificarAcessoSupervisor(usuarioId: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const usuario = mockUsuarios.find((user) => user.id === usuarioId);
    return (
      !!usuario &&
      (usuario.nivel === NivelAcesso.SUPERVISOR ||
        usuario.nivel === NivelAcesso.ADMINISTRADOR)
    );
  }
}
