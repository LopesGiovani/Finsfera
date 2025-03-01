// Método corrigido para obter detalhes de uma ordem de serviço
async function obterCorrigido(id: number) {
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
