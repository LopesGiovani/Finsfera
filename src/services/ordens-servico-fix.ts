import api from "@/utils/api";
import { OS, ServiceOrderAPI } from "./ordens-servico";

// Função para mapear os status do backend para o frontend
function mapStatus(apiStatus: string): "novo" | "em_andamento" | "concluido" {
  // Normalizar o status (remover espaços, converter para minúsculas)
  const normalizedStatus = apiStatus?.toLowerCase()?.trim() || "";

  const statusMap: Record<string, any> = {
    pendente: "novo",
    em_andamento: "em_andamento",
    concluida: "concluido",
    reprovada: "novo",
  };

  // Se o status já estiver no formato do frontend, retorná-lo diretamente
  if (["novo", "em_andamento", "concluido"].includes(normalizedStatus)) {
    return normalizedStatus as any;
  }

  // Retornar o status mapeado ou "novo" como padrão
  const mappedStatus = statusMap[normalizedStatus] || "novo";
  return mappedStatus;
}

// Método corrigido para obter detalhes de uma ordem de serviço
export async function obterCorrigido(id: number) {
  try {
    const response = await api.get<ServiceOrderAPI>(`/service-orders/${id}`);

    // Mapear a resposta para o formato esperado pelo frontend
    const order = response.data;
    const mappedOrder: OS = {
      id: order.id,
      numero: `OS-${order.id.toString().padStart(4, "0")}`,
      titulo: order.title,
      descricao: order.description,
      status: mapStatus(order.status),
      prioridade: (order.priority as "baixa" | "alta" | "urgente") || "baixa",
      cliente: {
        id: order.customer?.id || 0,
        nome: order.customer?.name || "Cliente não atribuído",
        email: order.customer?.email || "",
        telefone: order.customer?.phone || "",
      },
      responsavel: order.assignedTo
        ? {
            id: order.assignedTo.id,
            nome: order.assignedTo.name,
            email: order.assignedTo.email,
            cargo: order.assignedTo.role,
          }
        : null,
      agendamento: new Date(order.scheduledDate).toLocaleDateString("pt-BR"),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return mappedOrder;
  } catch (error) {
    console.error("Erro ao obter detalhes da ordem de serviço:", error);
    throw error;
  }
}
