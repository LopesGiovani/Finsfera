import {
  OrdemServico,
  StatusOS,
  FiltrosOS,
  Justificativa,
  Arquivo,
} from "@/types/ordem-servico";
import { NivelAcesso } from "@/types/usuario";

// Dados mock para desenvolvimento
const mockOrdens: OrdemServico[] = [
  {
    id: 1,
    titulo: "Manutenção de servidor",
    descricao: "Realizar manutenção preventiva no servidor principal",
    status: StatusOS.EM_ABERTO,
    dataCriacao: new Date(),
    dataAgendada: new Date(),
    responsavelId: 2,
    responsavelNome: "Técnico",
    criadoPorId: 3,
    criadoPorNome: "Supervisor",
    prioridade: "alta",
    arquivos: [],
    justificativas: [],
  },
  {
    id: 2,
    titulo: "Instalação de software",
    descricao: "Instalar pacote Office em 10 computadores",
    status: StatusOS.EM_ANDAMENTO,
    dataCriacao: new Date(Date.now() - 86400000), // 1 dia atrás
    dataAgendada: new Date(),
    dataInicio: new Date(),
    responsavelId: 2,
    responsavelNome: "Técnico",
    criadoPorId: 3,
    criadoPorNome: "Supervisor",
    prioridade: "media",
    arquivos: [],
    justificativas: [],
  },
  {
    id: 3,
    titulo: "Configuração de rede",
    descricao: "Configurar nova rede no setor administrativo",
    status: StatusOS.CONCLUIDA,
    dataCriacao: new Date(Date.now() - 172800000), // 2 dias atrás
    dataAgendada: new Date(Date.now() - 86400000),
    dataInicio: new Date(Date.now() - 86400000),
    dataFim: new Date(),
    responsavelId: 2,
    responsavelNome: "Técnico",
    criadoPorId: 1,
    criadoPorNome: "Administrador",
    prioridade: "baixa",
    arquivos: [],
    justificativas: [],
    linkEvidencia: "https://evidencias.finsfera.com/3",
  },
];

const mockJustificativas: Justificativa[] = [];
const mockArquivos: Arquivo[] = [];

export class OrdemServicoService {
  // Listar todas as OS com filtros
  static async listarOrdens(
    filtros: FiltrosOS = {},
    usuarioId: number,
    nivelAcesso: NivelAcesso
  ): Promise<OrdemServico[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    let ordens = [...mockOrdens];

    // Filtrar por acesso do usuário
    if (nivelAcesso === NivelAcesso.PADRAO) {
      ordens = ordens.filter((os) => os.responsavelId === usuarioId);
    }

    // Filtrar por data agendada (só mostrar OS da data atual ou passadas)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    ordens = ordens.filter((os) => {
      const dataAgendada = new Date(os.dataAgendada);
      dataAgendada.setHours(0, 0, 0, 0);
      return dataAgendada <= hoje;
    });

    // Aplicar filtros
    if (filtros.status && filtros.status.length) {
      ordens = ordens.filter((os) => filtros.status?.includes(os.status));
    }

    if (filtros.responsavelId) {
      ordens = ordens.filter(
        (os) => os.responsavelId === filtros.responsavelId
      );
    }

    if (filtros.dataDe) {
      const dataDe = new Date(filtros.dataDe);
      ordens = ordens.filter((os) => new Date(os.dataAgendada) >= dataDe);
    }

    if (filtros.dataAte) {
      const dataAte = new Date(filtros.dataAte);
      ordens = ordens.filter((os) => new Date(os.dataAgendada) <= dataAte);
    }

    if (filtros.prioridade && filtros.prioridade.length) {
      ordens = ordens.filter((os) =>
        filtros.prioridade?.includes(os.prioridade)
      );
    }

    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      ordens = ordens.filter(
        (os) =>
          os.titulo.toLowerCase().includes(busca) ||
          os.descricao.toLowerCase().includes(busca)
      );
    }

    if (filtros.pendentesJustificativa) {
      ordens = ordens.filter(
        (os) =>
          (os.status === StatusOS.EM_ABERTO ||
            os.status === StatusOS.EM_ANDAMENTO) &&
          os.justificativas.length === 0
      );
    }

    return ordens;
  }

  // Obter resumo para dashboard (contadores)
  static async obterResumo(
    usuarioId: number,
    nivelAcesso: NivelAcesso
  ): Promise<Record<StatusOS, number>> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    let ordens = [...mockOrdens];

    // Filtrar por acesso do usuário
    if (nivelAcesso === NivelAcesso.PADRAO) {
      ordens = ordens.filter((os) => os.responsavelId === usuarioId);
    }

    // Filtrar por data agendada
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    ordens = ordens.filter((os) => {
      const dataAgendada = new Date(os.dataAgendada);
      dataAgendada.setHours(0, 0, 0, 0);
      return dataAgendada <= hoje;
    });

    // Contar por status
    const resumo = {
      [StatusOS.EM_ABERTO]: 0,
      [StatusOS.EM_ANDAMENTO]: 0,
      [StatusOS.CONCLUIDA]: 0,
      [StatusOS.FATURADA]: 0,
      [StatusOS.REPROVADA]: 0,
    };

    ordens.forEach((os) => {
      resumo[os.status]++;
    });

    return resumo;
  }

  // Obter detalhes de uma OS específica
  static async obterOrdem(
    id: number,
    usuarioId: number,
    nivelAcesso: NivelAcesso
  ): Promise<OrdemServico | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const ordem = mockOrdens.find((os) => os.id === id);
    if (!ordem) return null;

    // Verificar acesso
    if (
      nivelAcesso === NivelAcesso.PADRAO &&
      ordem.responsavelId !== usuarioId
    ) {
      return null; // Usuário não tem acesso a esta OS
    }

    // Verificar data agendada
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataAgendada = new Date(ordem.dataAgendada);
    dataAgendada.setHours(0, 0, 0, 0);

    if (dataAgendada > hoje) {
      return null; // OS para data futura, ainda não visível
    }

    return ordem;
  }

  // Criar uma nova OS
  static async criarOrdem(
    dados: Omit<
      OrdemServico,
      "id" | "dataCriacao" | "arquivos" | "justificativas"
    >,
    arquivos: File[]
  ): Promise<OrdemServico> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Processar arquivos (simulado)
    const arquivosProcessados: Arquivo[] = arquivos.map((file, index) => ({
      id: mockArquivos.length + index + 1,
      nome: file.name,
      url: `https://storage.finsfera.com/${file.name}`,
      tipo: file.type,
      tamanho: file.size,
      dataUpload: new Date(),
    }));

    // Adicionar arquivos ao mock
    mockArquivos.push(...arquivosProcessados);

    // Criar nova OS
    const novaOS: OrdemServico = {
      ...dados,
      id: Math.max(...mockOrdens.map((os) => os.id), 0) + 1,
      dataCriacao: new Date(),
      arquivos: arquivosProcessados,
      justificativas: [],
    };

    mockOrdens.push(novaOS);
    return novaOS;
  }

  // Atualizar status da OS
  static async atualizarStatus(
    id: number,
    novoStatus: StatusOS,
    dadosAdicionais: {
      linkEvidencia?: string;
      motivoReprovacao?: string;
    } = {}
  ): Promise<OrdemServico | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockOrdens.findIndex((os) => os.id === id);
    if (index === -1) return null;

    const agora = new Date();

    // Validar transição de status
    switch (novoStatus) {
      case StatusOS.EM_ANDAMENTO:
        mockOrdens[index].dataInicio = mockOrdens[index].dataInicio || agora;
        break;

      case StatusOS.CONCLUIDA:
        // Verificar se tem link de evidência
        if (
          !dadosAdicionais.linkEvidencia &&
          !mockOrdens[index].linkEvidencia
        ) {
          throw new Error("Link de evidência é obrigatório para concluir a OS");
        }

        mockOrdens[index].dataFim = agora;
        if (dadosAdicionais.linkEvidencia) {
          mockOrdens[index].linkEvidencia = dadosAdicionais.linkEvidencia;
        }
        break;

      case StatusOS.REPROVADA:
        // Verificar se tem motivo de reprovação
        if (!dadosAdicionais.motivoReprovacao) {
          throw new Error("Motivo da reprovação é obrigatório");
        }

        mockOrdens[index].motivoReprovacao = dadosAdicionais.motivoReprovacao;
        mockOrdens[index].status = StatusOS.EM_ABERTO; // Volta para aberto
        break;
    }

    mockOrdens[index].status = novoStatus;
    return mockOrdens[index];
  }

  // Adicionar justificativa para OS em aberto ou em andamento
  static async adicionarJustificativa(
    osId: number,
    texto: string,
    usuarioId: number,
    usuarioNome: string
  ): Promise<Justificativa> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const index = mockOrdens.findIndex((os) => os.id === osId);
    if (index === -1) {
      throw new Error("Ordem de serviço não encontrada");
    }

    const novaJustificativa: Justificativa = {
      id: Math.max(...mockJustificativas.map((j) => j.id), 0) + 1,
      texto,
      dataRegistro: new Date(),
      usuarioId,
      usuarioNome,
    };

    mockJustificativas.push(novaJustificativa);
    mockOrdens[index].justificativas.push(novaJustificativa);

    return novaJustificativa;
  }

  // Upload de arquivos para uma OS existente
  static async adicionarArquivos(
    osId: number,
    arquivos: File[]
  ): Promise<Arquivo[]> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const index = mockOrdens.findIndex((os) => os.id === osId);
    if (index === -1) {
      throw new Error("Ordem de serviço não encontrada");
    }

    // Processar arquivos (simulado)
    const arquivosProcessados: Arquivo[] = arquivos.map((file, i) => ({
      id: mockArquivos.length + i + 1,
      nome: file.name,
      url: `https://storage.finsfera.com/${file.name}`,
      tipo: file.type,
      tamanho: file.size,
      dataUpload: new Date(),
    }));

    // Adicionar arquivos
    mockArquivos.push(...arquivosProcessados);
    mockOrdens[index].arquivos.push(...arquivosProcessados);

    return arquivosProcessados;
  }

  // Verificar OS pendentes para um usuário (ao deslogar)
  static async verificarOSPendentes(
    usuarioId: number
  ): Promise<OrdemServico[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Filtrar OS em aberto ou em andamento atribuídas ao usuário
    return mockOrdens.filter(
      (os) =>
        os.responsavelId === usuarioId &&
        (os.status === StatusOS.EM_ABERTO ||
          os.status === StatusOS.EM_ANDAMENTO)
    );
  }
}
