import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useComentariosOS } from "@/hooks/useOrdensServico";
import dynamic from "next/dynamic";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Importação dinâmica do editor para evitar erros de SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface ComentariosOSProps {
  osId: number;
}

export function ComentariosOS({ osId }: ComentariosOSProps) {
  const { user } = useAuth();
  const [comentario, setComentario] = useState("");
  const {
    data: comentarios,
    isLoading,
    refetch,
    adicionarComentario,
    isAdicionando,
  } = useComentariosOS(osId);

  // Configurações do Quill Editor
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
    ],
  };

  const formats = ["bold", "italic", "underline", "list", "bullet", "link"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comentario.trim()) return;

    try {
      // Enviamos o comentário usando o hook
      adicionarComentario(comentario, {
        onSuccess: () => {
          console.log("Comentário adicionado com sucesso");
          setComentario("");
          refetch();
        },
        onError: (error) => {
          console.error("Erro ao adicionar comentário:", error);
          alert("Não foi possível adicionar o comentário. Tente novamente.");
        },
      });
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
  };

  const formatarData = (data: string) => {
    try {
      // Converter a string de data para um objeto Date
      const dataComentario = new Date(data);
      
      // Obter a data atual
      const agora = new Date();
      
      // Calcular a diferença em segundos
      // Usamos Math.floor para garantir que diferenças negativas (devido a diferenças de fuso horário)
      // sejam tratadas corretamente
      const diferencaEmSegundos = Math.floor((agora.getTime() - dataComentario.getTime()) / 1000);
      
      // Se a diferença for negativa ou menor que 60 segundos, mostrar "agora"
      if (diferencaEmSegundos < 60) {
        return "agora";
      }
      
      // Se a diferença for menor que 5 minutos, mostrar "há poucos minutos"
      if (diferencaEmSegundos < 300) {
        return "há poucos minutos";
      }
      
      // Para outros casos, usar formatDistanceToNow
      return formatDistanceToNow(dataComentario, {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (error) {
      return data;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-medium mb-6">Comentários e Atualizações</h3>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
          <p className="text-gray-500">Carregando comentários...</p>
        </div>
      ) : (
        <>
          <div className="mb-6 space-y-6">
            {comentarios && comentarios.length > 0 ? (
              comentarios.map((comentario: any) => (
                <div key={comentario.id} className="border-b pb-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm flex-shrink-0">
                      {comentario.usuario.nome.charAt(0)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                          {comentario.usuario.nome}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatarData(comentario.createdAt)}
                        </span>
                      </div>
                      <div
                        className="mt-1 text-sm text-gray-700 comentario-conteudo"
                        dangerouslySetInnerHTML={{ __html: comentario.texto }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="mb-4">
              <ReactQuill
                theme="snow"
                value={comentario}
                onChange={setComentario}
                modules={modules}
                formats={formats}
                placeholder="Escreva seu comentário..."
                className="rounded-lg border border-gray-200"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!comentario.trim() || isAdicionando}
                className={`px-4 py-2 rounded-lg text-white text-sm ${
                  !comentario.trim() || isAdicionando
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isAdicionando ? "Enviando..." : "Adicionar Comentário"}
              </button>
            </div>
          </form>
        </>
      )}

      <style jsx global>{`
        .comentario-conteudo p {
          margin-bottom: 0.5rem;
        }
        .comentario-conteudo ul,
        .comentario-conteudo ol {
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .quill {
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f9fafb;
        }
        .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          min-height: 120px;
        }
      `}</style>
    </div>
  );
}
