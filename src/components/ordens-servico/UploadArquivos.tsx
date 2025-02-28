import { useState, useRef } from "react";
import {
  DocumentIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

interface Arquivo {
  id: string;
  nome: string;
  tamanho: string;
  tipo: string;
  data: string;
}

export function UploadArquivos() {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processarArquivos(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processarArquivos(files);
  };

  const processarArquivos = (files: File[]) => {
    const novosArquivos = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      nome: file.name,
      tamanho: formatarTamanho(file.size),
      tipo: file.type,
      data: new Date().toLocaleString(),
    }));

    setArquivos([...arquivos, ...novosArquivos]);
  };

  const formatarTamanho = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removerArquivo = (id: string) => {
    setArquivos(arquivos.filter((arquivo) => arquivo.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Arraste arquivos aqui ou
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-500 hover:text-blue-600 mx-1"
          >
            selecione do computador
          </button>
        </p>
        <p className="text-sm text-gray-500">Suporta arquivos de até 10MB</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />
      </div>

      {arquivos.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium">Arquivos ({arquivos.length})</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {arquivos.map((arquivo) => (
              <div key={arquivo.id} className="p-4 flex items-center gap-4">
                <DocumentIcon className="w-8 h-8 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">{arquivo.nome}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{arquivo.tamanho}</span>
                    <span>•</span>
                    <span>{arquivo.data}</span>
                  </div>
                </div>
                <button
                  onClick={() => removerArquivo(arquivo.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
