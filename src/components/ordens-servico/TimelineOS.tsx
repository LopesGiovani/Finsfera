import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ClockIcon,
  UserIcon,
  PaperClipIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface Evento {
  id: number;
  tipo: string;
  descricao: string;
  data: string;
  usuario: {
    id: number;
    nome: string;
  };
  metadados?: any;
}

interface TimelineOSProps {
  eventos: Evento[];
  isLoading?: boolean;
}

// Função para obter o ícone e a cor com base no tipo de evento
function getIconoEvento(tipo: string) {
  switch (tipo) {
    case "criacao":
      return { icone: DocumentTextIcon, cor: "bg-blue-100 text-blue-600" };
    case "atribuicao":
      return { icone: UserIcon, cor: "bg-indigo-100 text-indigo-600" };
    case "status":
      return { icone: ArrowPathIcon, cor: "bg-yellow-100 text-yellow-600" };
    case "comentario":
      return {
        icone: ChatBubbleLeftRightIcon,
        cor: "bg-purple-100 text-purple-600",
      };
    case "tempo":
      return { icone: ClockIcon, cor: "bg-green-100 text-green-600" };
    case "arquivo":
      return { icone: PaperClipIcon, cor: "bg-teal-100 text-teal-600" };
    case "fechamento":
      return { icone: CheckCircleIcon, cor: "bg-emerald-100 text-emerald-600" };
    case "faturamento":
      return { icone: BanknotesIcon, cor: "bg-orange-100 text-orange-600" };
    case "cancelamento":
      return { icone: XCircleIcon, cor: "bg-red-100 text-red-600" };
    default:
      return { icone: DocumentTextIcon, cor: "bg-gray-100 text-gray-600" };
  }
}

// Função para formatar data para exibição
function formatarData(data: string) {
  try {
    return format(parseISO(data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  } catch (e) {
    return data;
  }
}

export function TimelineOS({
  eventos = [],
  isLoading = false,
}: TimelineOSProps) {
  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
        <p className="text-gray-500">Carregando histórico...</p>
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        Nenhum evento registrado para esta ordem de serviço.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {eventos.map((evento, idx) => {
          const { icone: Icone, cor } = getIconoEvento(evento.tipo);
          const dataFormatada = formatarData(evento.data);
          const ultimo = idx === eventos.length - 1;

          return (
            <li key={evento.id}>
              <div className="relative pb-8">
                {!ultimo && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex items-start space-x-3">
                  <div>
                    <div className={`relative px-2 py-2 rounded-full ${cor}`}>
                      <Icone className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 py-0">
                    <div className="text-sm leading-8 text-gray-500">
                      <span className="mr-0.5 font-medium text-gray-900">
                        {evento.usuario.nome}
                      </span>{" "}
                      {evento.descricao}
                      {evento.tipo === "status" && evento.metadados?.status && (
                        <span
                          className={`mx-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${
                            evento.metadados.status === "concluido"
                              ? "bg-green-100 text-green-800"
                              : evento.metadados.status === "em_andamento"
                              ? "bg-blue-100 text-blue-800"
                              : evento.metadados.status === "cancelado"
                              ? "bg-red-100 text-red-800"
                              : evento.metadados.status === "faturado"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {evento.metadados.status === "concluido"
                            ? "Concluído"
                            : evento.metadados.status === "em_andamento"
                            ? "Em Andamento"
                            : evento.metadados.status === "cancelado"
                            ? "Cancelado"
                            : evento.metadados.status === "faturado"
                            ? "Faturado"
                            : "Em Aberto"}
                        </span>
                      )}
                      {evento.tipo === "tempo" && evento.metadados?.tempo && (
                        <span className="mx-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {evento.metadados.tempo}
                        </span>
                      )}
                      {evento.tipo === "arquivo" &&
                        evento.metadados?.arquivo && (
                          <a
                            href={evento.metadados.arquivo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mx-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            {evento.metadados.arquivo.nome}
                          </a>
                        )}
                      <span className="whitespace-nowrap text-xs text-gray-400 pl-1">
                        {dataFormatada}
                      </span>
                    </div>

                    {evento.tipo === "comentario" &&
                      evento.metadados?.texto && (
                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {evento.metadados.texto}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
