import { useState, useRef, useCallback } from "react";
import {
  PaperClipIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useArquivosOS, useUploadArquivoOS } from "@/hooks/useOrdensServico";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UploadArquivosProps {
  osId: number;
}

function getIconeArquivo(tipo: string) {
  if (tipo.includes("image")) {
    return PhotoIcon;
  } else if (tipo.includes("pdf")) {
    return DocumentIcon;
  } else if (tipo.includes("word") || tipo.includes("doc")) {
    return DocumentTextIcon;
  } else if (tipo.includes("excel") || tipo.includes("spreadsheet")) {
    return DocumentChartBarIcon;
  } else {
    return DocumentIcon;
  }
}

function formatarTamanho(bytes: number) {
  if (bytes < 1024) {
    return bytes + " B";
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  }
}

function formatarData(data: string) {
  try {
    return formatDistanceToNow(new Date(data), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch (e) {
    return data;
  }
}

export function UploadArquivos({ osId }: UploadArquivosProps) {
  const { data: arquivos, isLoading, refetch } = useArquivosOS(osId);
  const { mutateAsync: uploadArquivo, isLoading: isUploading } =
    useUploadArquivoOS();

  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler para arrastar e soltar arquivos
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Converter FileList para array e adicionar aos arquivos selecionados
      const arquivosArray = Array.from(e.dataTransfer.files);
      setArquivosSelecionados((prev) => [...prev, ...arquivosArray]);
      e.dataTransfer.clearData();
    }
  }, []);

  // Handler para selecionar arquivos via input
  const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const arquivosArray = Array.from(e.target.files);
      setArquivosSelecionados((prev) => [...prev, ...arquivosArray]);

      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handler para remover arquivo da lista
  const handleRemoverArquivo = (index: number) => {
    setArquivosSelecionados((prev) => prev.filter((_, i) => i !== index));
  };

  // Handler para enviar arquivos
  const handleEnviarArquivos = async () => {
    if (arquivosSelecionados.length === 0) return;

    try {
      // Enviar arquivos um por um
      for (const arquivo of arquivosSelecionados) {
        await uploadArquivo({ id: osId, arquivo });
      }

      // Limpar lista de arquivos e atualizar
      setArquivosSelecionados([]);
      refetch();
    } catch (error) {
      console.error("Erro ao enviar arquivos:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-medium mb-6">Arquivos</h3>

      {/* Área de dropzone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center mb-6 transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          onChange={handleArquivoChange}
          className="hidden"
          multiple
          ref={fileInputRef}
        />

        <div className="flex flex-col items-center">
          <ArrowUpTrayIcon
            className={`w-12 h-12 mb-3 ${
              isDragActive ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Clique para selecionar</span> ou
            arraste e solte
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, PDF, DOCX ou XLSX até 10MB
          </p>
        </div>
      </div>

      {/* Lista de arquivos selecionados para upload */}
      {arquivosSelecionados.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Arquivos Selecionados</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setArquivosSelecionados([])}
                className="text-xs text-red-600 hover:text-red-800"
                disabled={isUploading}
              >
                Limpar todos
              </button>
              <button
                onClick={handleEnviarArquivos}
                disabled={isUploading}
                className={`flex items-center px-3 py-1 text-xs rounded-md ${
                  isUploading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="w-3 h-3 mr-1" />
                    Enviar {arquivosSelecionados.length} arquivo
                    {arquivosSelecionados.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto p-1">
            {arquivosSelecionados.map((arquivo, index) => {
              const Icone = getIconeArquivo(arquivo.type);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-white">
                      <Icone className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                        {arquivo.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatarTamanho(arquivo.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoverArquivo(index);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full"
                    disabled={isUploading}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de arquivos já enviados */}
      <div>
        <h4 className="text-sm font-medium mb-3">Arquivos anexados</h4>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Carregando arquivos...</p>
          </div>
        ) : arquivos?.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <DocumentIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhum arquivo anexado</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {arquivos?.map((arquivo: any) => {
              const Icone = getIconeArquivo(arquivo.tipo);
              return (
                <div
                  key={arquivo.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Icone className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                        {arquivo.nome}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-3">
                          {formatarTamanho(arquivo.tamanho)}
                        </span>
                        <span className="text-gray-400">
                          {formatarData(arquivo.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <a
                      href={arquivo.url}
                      download
                      className="p-1.5 text-gray-400 hover:text-blue-500 rounded-full"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </a>
                    <button
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-full"
                      onClick={() => {
                        // Lógica para excluir arquivo
                        if (
                          confirm(
                            "Tem certeza que deseja excluir este arquivo?"
                          )
                        ) {
                          // deleteArquivo(arquivo.id)
                        }
                      }}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
