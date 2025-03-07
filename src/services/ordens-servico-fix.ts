import api from "@/utils/api";
import { OS, ServiceOrderAPI } from "./ordens-servico";

// Função para mapear os status do backend para o frontend
function mapStatus(
  apiStatus: string
):
  | "novo"
  | "em_andamento"
  | "pausado"
  | "concluido"
  | "cancelado" {
  // Log para debug
  console.log(`[fix] Mapeando status da API: "${apiStatus}"`);
  
  // Normalizar o status (remover espaços, converter para minúsculas)
  const normalizedStatus = apiStatus?.toLowerCase()?.trim() || "";
  
  const statusMap: Record<string, any> = {
    pendente: "novo",
    em_andamento: "em_andamento",
    concluida: "concluido",
    reprovada: "cancelado"
  };
  
  // Se o status já estiver no formato do frontend, retorná-lo diretamente
  if (["novo", "em_andamento", "pausado", "concluido", "cancelado"].includes(normalizedStatus)) {
    console.log(`[fix]  - Status já está no formato do frontend: "${normalizedStatus}"`);
    return normalizedStatus as any;
  }
  
  // Adiciona log para debug
  const mappedStatus = statusMap[normalizedStatus] || "novo";
  console.log(`[fix]  - Status mapeado: "${normalizedStatus}" -> "${mappedStatus}"`);
  
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
