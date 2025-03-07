import TimelineEvent from "@/models/TimelineEvent";
import User from "@/models/User";

export const TimelineEventService = {
  /**
   * Cria um novo evento na timeline
   */
  async createEvent(data: {
    serviceOrderId: number;
    userId: number;
    eventType: string;
    description: string;
    metadata?: any;
  }) {
    try {
      const event = await TimelineEvent.create(data);
      return event;
    } catch (error) {
      console.error("Erro ao criar evento na timeline:", error);
      throw new Error("Não foi possível registrar o evento na timeline");
    }
  },

  /**
   * Lista todos os eventos de uma OS, ordenados por data (mais recentes primeiro)
   */
  async listEvents(serviceOrderId: number) {
    try {
      const events = await TimelineEvent.findAll({
        where: { serviceOrderId },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "role"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      // Transformar para o formato esperado pelo frontend
      return events.map((event) => {
        const plainEvent = event.get({ plain: true });

        // Verificar se o user existe antes de acessar suas propriedades
        const usuario = plainEvent.user
          ? {
              id: plainEvent.user.id,
              nome: plainEvent.user.name,
            }
          : {
              id: 0,
              nome: "Sistema",
            };

        return {
          id: plainEvent.id,
          tipo: plainEvent.eventType,
          descricao: plainEvent.description,
          data: plainEvent.createdAt,
          usuario: usuario,
          metadados: plainEvent.metadata || {},
        };
      });
    } catch (error) {
      console.error(`Erro ao listar eventos da OS ${serviceOrderId}:`, error);
      throw new Error("Não foi possível listar os eventos da timeline");
    }
  },

  /**
   * Registra um evento de mudança de status
   */
  async registerStatusChange({
    serviceOrderId,
    userId,
    oldStatus,
    newStatus,
    reason,
  }: {
    serviceOrderId: number;
    userId: number;
    oldStatus: string;
    newStatus: string;
    reason?: string;
  }) {
    try {
      // Determinar o tipo de evento baseado na mudança de status
      let eventType = "status";
      let description = "alterou o status para";

      if (newStatus === "concluida") {
        eventType = "fechamento";
        description = "concluiu a ordem de serviço";
      } else if (oldStatus === "concluida" && newStatus === "pendente") {
        eventType = "reabertura";
        description = "reabriu a ordem de serviço";
      } else if (newStatus === "reprovada") {
        eventType = "rejeicao";
        description = "rejeitou a ordem de serviço";
      }

      console.log(
        `[TimelineEvent] Registrando evento: ${eventType} - Status: ${newStatus} (anterior: ${oldStatus})`
      );

      // Criar o evento
      return await this.createEvent({
        serviceOrderId,
        userId,
        eventType,
        description,
        metadata: {
          statusAnterior: oldStatus,
          status: newStatus,
          ...(reason ? { texto: reason } : {}),
        },
      });
    } catch (error) {
      console.error("Erro ao registrar mudança de status:", error);
      throw error;
    }
  },

  /**
   * Registra um evento de comentário
   */
  async registerComment({
    serviceOrderId,
    userId,
    text,
  }: {
    serviceOrderId: number;
    userId: number;
    text: string;
  }) {
    try {
      return await this.createEvent({
        serviceOrderId,
        userId,
        eventType: "comentario",
        description: "adicionou um comentário",
        metadata: {
          texto: text,
        },
      });
    } catch (error) {
      console.error("Erro ao registrar comentário:", error);
      throw error;
    }
  },

  /**
   * Registra um evento de criação de OS
   */
  async registerCreation({
    serviceOrderId,
    userId,
  }: {
    serviceOrderId: number;
    userId: number;
  }) {
    try {
      return await this.createEvent({
        serviceOrderId,
        userId,
        eventType: "criacao",
        description: "criou a ordem de serviço",
      });
    } catch (error) {
      console.error("Erro ao registrar criação de OS:", error);
      throw error;
    }
  },

  /**
   * Registra um evento de atribuição de responsável
   */
  async registerAssignment({
    serviceOrderId,
    userId,
    assignedToId,
    assignedToName,
  }: {
    serviceOrderId: number;
    userId: number;
    assignedToId: number;
    assignedToName: string;
  }) {
    try {
      return await this.createEvent({
        serviceOrderId,
        userId,
        eventType: "atribuicao",
        description: "atribuiu a ordem de serviço para",
        metadata: {
          responsavel: {
            id: assignedToId,
            nome: assignedToName,
          },
        },
      });
    } catch (error) {
      console.error("Erro ao registrar atribuição de responsável:", error);
      throw error;
    }
  },

  /**
   * Registra um evento de registro de tempo
   */
  async registerTimeLog({
    serviceOrderId,
    userId,
    hours,
    minutes,
    description,
  }: {
    serviceOrderId: number;
    userId: number;
    hours: number;
    minutes: number;
    description: string;
  }) {
    try {
      const timeText = `${hours}h ${minutes}min`;

      return await this.createEvent({
        serviceOrderId,
        userId,
        eventType: "tempo",
        description: "registrou tempo na ordem de serviço",
        metadata: {
          tempo: timeText,
          descricao: description,
        },
      });
    } catch (error) {
      console.error("Erro ao registrar tempo:", error);
      throw error;
    }
  },

  /**
   * Registra um evento de transferência de OS entre funcionários
   */
  async registerTransfer({
    serviceOrderId,
    userId,
    fromUserId,
    fromUserName,
    toUserId,
    toUserName,
    reason,
  }: {
    serviceOrderId: number;
    userId: number;
    fromUserId: number;
    fromUserName: string;
    toUserId: number;
    toUserName: string;
    reason: string;
  }) {
    try {
      return await this.createEvent({
        serviceOrderId,
        userId,
        eventType: "transferencia",
        description: "transferiu a ordem de serviço para",
        metadata: {
          de: {
            id: fromUserId,
            nome: fromUserName,
          },
          para: {
            id: toUserId,
            nome: toUserName,
          },
          texto: reason,
        },
      });
    } catch (error) {
      console.error("Erro ao registrar transferência:", error);
      throw error;
    }
  },
};
