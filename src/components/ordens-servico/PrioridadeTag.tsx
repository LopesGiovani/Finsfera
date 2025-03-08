import React from "react";

interface PrioridadeTagProps {
  prioridade: "baixa" | "alta" | "urgente";
}

export function PrioridadeTag({ prioridade }: PrioridadeTagProps) {
  const getStyle = () => {
    switch (prioridade) {
      case "baixa":
        return "bg-green-100 text-green-800";
      case "alta":
        return "bg-yellow-100 text-yellow-800";
      case "urgente":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLabel = () => {
    switch (prioridade) {
      case "baixa":
        return "Baixa";
      case "alta":
        return "Alta";
      case "urgente":
        return "Urgente";
      default:
        return prioridade;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStyle()}`}
    >
      {getLabel()}
    </span>
  );
}
