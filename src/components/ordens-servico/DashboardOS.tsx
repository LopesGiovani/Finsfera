import { useState, useEffect } from "react";
import { StatusOS } from "@/types/ordem-servico";
import { OrdemServicoService } from "@/services/OrdemServicoService";
import { NivelAcesso } from "@/types/usuario";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export function DashboardOS() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [resumo, setResumo] = useState<Record<StatusOS, number>>({
    [StatusOS.EM_ABERTO]: 0,
    [StatusOS.EM_ANDAMENTO]: 0,
    [StatusOS.CONCLUIDA]: 0,
    [StatusOS.FATURADA]: 0,
    [StatusOS.REPROVADA]: 0,
  });

  // Simulando usuário logado para development
  const usuarioLogado = {
    id: 1,
    nivel: NivelAcesso.ADMINISTRADOR,
  };

  useEffect(() => {
    const carregarResumo = async () => {
      setLoading(true);
      setErro(null);

      try {
        const resumoOS = await OrdemServicoService.obterResumo(
          usuarioLogado.id,
          usuarioLogado.nivel
        );

        setResumo(resumoOS);
      } catch (error) {
        console.error(error);
        setErro("Erro ao carregar resumo das OS");
      } finally {
        setLoading(false);
      }
    };

    carregarResumo();
  }, []);

  const cards = [
    {
      titulo: "Em Aberto",
      valor: resumo[StatusOS.EM_ABERTO],
      cor: "bg-yellow-50 border-yellow-200",
      textoCor: "text-yellow-700",
      icone: ClipboardDocumentListIcon,
      iconeCor: "text-yellow-500",
      href: `/dashboard/ordens-servico?status=${StatusOS.EM_ABERTO}`,
    },
    {
      titulo: "Em Andamento",
      valor: resumo[StatusOS.EM_ANDAMENTO],
      cor: "bg-blue-50 border-blue-200",
      textoCor: "text-blue-700",
      icone: ClockIcon,
      iconeCor: "text-blue-500",
      href: `/dashboard/ordens-servico?status=${StatusOS.EM_ANDAMENTO}`,
    },
    {
      titulo: "Concluídas",
      valor: resumo[StatusOS.CONCLUIDA],
      cor: "bg-green-50 border-green-200",
      textoCor: "text-green-700",
      icone: ClipboardDocumentCheckIcon,
      iconeCor: "text-green-500",
      href: `/dashboard/ordens-servico?status=${StatusOS.CONCLUIDA}`,
    },
    {
      titulo: "Faturadas",
      valor: resumo[StatusOS.FATURADA],
      cor: "bg-purple-50 border-purple-200",
      textoCor: "text-purple-700",
      icone: BanknotesIcon,
      iconeCor: "text-purple-500",
      href: `/dashboard/ordens-servico?status=${StatusOS.FATURADA}`,
    },
    {
      titulo: "Reprovadas",
      valor: resumo[StatusOS.REPROVADA],
      cor: "bg-red-50 border-red-200",
      textoCor: "text-red-700",
      icone: ExclamationTriangleIcon,
      iconeCor: "text-red-500",
      href: `/dashboard/ordens-servico?status=${StatusOS.REPROVADA}`,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Resumo</h2>

      {erro ? (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">{erro}</div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-100 border border-gray-200 rounded-lg p-6 h-28 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {cards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className={`${card.cor} border rounded-lg p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-medium ${card.textoCor}`}>
                    {card.titulo}
                  </h3>
                  <p className="text-3xl font-bold mt-2">{card.valor}</p>
                </div>
                <card.icone className={`h-8 w-8 ${card.iconeCor}`} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
