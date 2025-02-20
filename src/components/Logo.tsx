interface LogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export function Logo({
  className = "",
  showText = true,
  textColor = "text-white",
}: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="bg-white rounded-lg p-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          {/* Círculo externo */}
          <circle cx="16" cy="16" r="16" fill="#0066FF" />
          {/* Símbolo F estilizado */}
          <path d="M12 8h10v3h-7v4h6v3h-6v6h-3V8z" fill="white" />
          {/* Elemento gráfico */}
          <path
            d="M22 16c0 3.314-2.686 6-6 6s-6-2.686-6-6"
            stroke="#00E6CA"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showText && (
        <span className={`ml-2 text-xl font-bold ${textColor}`}>Finsfera</span>
      )}
    </div>
  );
}
