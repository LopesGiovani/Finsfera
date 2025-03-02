import axios from "axios";
import { OS, ServiceOrderAPI } from "./ordens-servico";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Função para mapear os status do backend para o frontend
function mapStatus(
  apiStatus: string
):
  | "novo"
  | "em_andamento"
  | "pausado"
  | "concluido"
  | "cancelado"
  | "faturado" {
  const statusMap: Record<string, any> = {
    pendente: "novo",
    em_andamento: "em_andamento",
    concluida: "concluido",
    reprovada: "cancelado",
    faturado: "faturado",
  };
  return statusMap[apiStatus] || "novo";
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
      prazo: new Date(order.scheduledDate).toLocaleDateString("pt-BR"),
      valorTotal: 0, // Este valor não está disponível na API atual
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return mappedOrder;
  } catch (error) {
    console.error("Erro ao obter detalhes da ordem de serviço:", error);
    throw error;
  }
}
