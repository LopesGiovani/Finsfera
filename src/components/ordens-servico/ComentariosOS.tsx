import { useState } from "react";
import { Avatar } from "@/components/Avatar";

interface Comentario {
  id: number;
  usuario: string;
  texto: string;
  data: string;
}

export function ComentariosOS() {
  const [comentarios, setComentarios] = useState<Comentario[]>([
    {
      id: 1,
      usuario: "João Silva",
      texto: "Iniciando os trabalhos...",
      data: "19/02/2025 14:30",
    },
  ]);
  const [novoComentario, setNovoComentario] = useState("");

  const adicionarComentario = () => {
    if (!novoComentario.trim()) return;

    const comentario: Comentario = {
      id: Date.now(),
      usuario: "Usuário Atual",
      texto: novoComentario,
      data: new Date().toLocaleString(),
    };

    setComentarios([...comentarios, comentario]);
    setNovoComentario("");
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="space-y-6 mb-6">
        {comentarios.map((comentario) => (
          <div key={comentario.id} className="flex gap-4">
            <Avatar name={comentario.usuario} color="bg-blue-500" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{comentario.usuario}</span>
                <span className="text-sm text-gray-500">{comentario.data}</span>
              </div>
              <p className="text-gray-600">{comentario.texto}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Avatar name="Usuário Atual" color="bg-blue-500" />
        <div className="flex-1">
          <textarea
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Adicione um comentário..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2"
            rows={3}
          />
          <button
            onClick={adicionarComentario}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
          >
            Comentar
          </button>
        </div>
      </div>
    </div>
  );
}
