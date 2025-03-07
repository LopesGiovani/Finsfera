import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import api from "@/utils/api";

interface TeamMember {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  ativo: boolean;
}

interface TransferirOSProps {
  osId: number;
  currentAssigneeId?: number;
  onSuccess?: () => void;
}

export function TransferirOS({
  osId,
  currentAssigneeId,
  onSuccess,
}: TransferirOSProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [assignedToId, setAssignedToId] = useState<number | undefined>(
    undefined
  );
  const [reason, setReason] = useState("");
  const { teamMembers, isLoading: isLoadingTeam } = useTeamMembers();

  // Filtrar membros da equipe para não mostrar o responsável atual
  const filteredTeamMembers = teamMembers.filter(
    (member: TeamMember) => member.id !== currentAssigneeId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignedToId) {
      toast.error("Selecione um novo responsável");
      return;
    }

    if (!reason) {
      toast.error("Informe o motivo da transferência");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post(`/service-orders/${osId}/transfer`, {
        assignedToId,
        reason,
      });

      toast.success("Ordem de serviço transferida com sucesso!");

      // Limpar o formulário
      setAssignedToId(undefined);
      setReason("");

      // Callback de sucesso
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Erro ao transferir OS:", error);
      toast.error(
        error.response?.data?.message ||
          "Não foi possível transferir a ordem de serviço"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Transferir Ordem de Serviço
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="assignedToId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Novo Responsável
          </label>
          <select
            id="assignedToId"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={assignedToId || ""}
            onChange={(e) =>
              setAssignedToId(Number(e.target.value) || undefined)
            }
            required
            disabled={isLoading || isLoadingTeam}
          >
            <option value="">Selecione um responsável</option>
            {filteredTeamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.nome} ({member.cargo})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Motivo da Transferência
          </label>
          <textarea
            id="reason"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Explique o motivo da transferência..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading || isLoadingTeam}
          >
            {isLoading ? "Transferindo..." : "Transferir OS"}
          </button>
        </div>
      </form>
    </div>
  );
}
