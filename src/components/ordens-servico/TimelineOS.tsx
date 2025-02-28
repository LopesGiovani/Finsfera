import {
  ClockIcon,
  CheckIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

export function TimelineOS() {
  const timeline = [
    {
      data: "19/02/2025 14:30",
      tipo: "status",
      texto: "OS iniciada",
      icon: ClockIcon,
      cor: "bg-blue-500",
    },
    {
      data: "19/02/2025 15:45",
      tipo: "tempo",
      texto: "2h 30min registradas por João Silva",
      icon: ClockIcon,
      cor: "bg-green-500",
    },
    {
      data: "19/02/2025 16:00",
      tipo: "arquivo",
      texto: "Arquivo anexado: documento.pdf",
      icon: DocumentIcon,
      cor: "bg-purple-500",
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="space-y-6">
        {timeline.map((item, index) => (
          <div key={index} className="flex gap-4">
            <div
              className={`w-10 h-10 ${item.cor} rounded-full flex items-center justify-center text-white flex-shrink-0`}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{item.data}</p>
              <p className="font-medium">{item.texto}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
