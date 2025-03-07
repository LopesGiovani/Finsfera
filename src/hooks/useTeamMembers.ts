import { useState, useEffect } from "react";
import api from "@/utils/api";

interface TeamMember {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  ativo: boolean;
}

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        setIsLoading(true);
        const response = await api.get("/team");

        // Converter dados da API para o formato esperado pelo componente
        const formattedMembers = response.data.map((member: any) => ({
          id: member.id,
          nome: member.name,
          email: member.email,
          cargo: member.role,
          ativo: member.active,
        }));

        // Filtrar apenas membros ativos
        const activeMembers = formattedMembers.filter(
          (m: TeamMember) => m.ativo
        );

        setTeamMembers(activeMembers);
      } catch (error) {
        console.error("Erro ao buscar membros da equipe:", error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

  return { teamMembers, isLoading, error };
}
