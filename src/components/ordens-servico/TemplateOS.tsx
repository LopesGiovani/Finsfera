import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { OrdensServicoService } from "@/services/ordens-servico";
import { useRouter } from "next/router";
import { Template } from "@/types/ordens-servico";

export function TemplateOS() {
  const router = useRouter();
  const osId = Number(router.query.id);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const { data: templates } = useQuery<Template[]>({
    queryKey: ["templates-os"],
    queryFn: () => OrdensServicoService.listarTemplates(),
  });

  const { mutate: aplicarTemplate } = useMutation({
    mutationFn: (templateId: number) =>
      OrdensServicoService.aplicarTemplate(osId, templateId),
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Templates</h3>
      <div className="grid grid-cols-3 gap-4">
        {templates?.map((template: Template) => (
          <div
            key={template.id}
            className="border rounded-lg p-4 cursor-pointer hover:border-blue-500"
            onClick={() => setSelectedTemplate(template.id)}
          >
            <h4 className="font-medium">{template.nome}</h4>
            <p className="text-sm text-gray-500">{template.descricao}</p>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <button
          onClick={() => aplicarTemplate(selectedTemplate)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Aplicar Template
        </button>
      )}
    </div>
  );
}
