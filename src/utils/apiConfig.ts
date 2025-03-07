/**
 * Configuração para URLs da API
 * 
 * Este arquivo fornece a configuração correta para URLs da API em diferentes ambientes:
 * - Em desenvolvimento local: usa o host atual com prefixo '/api'
 * - Em produção (Vercel): usa o host atual com prefixo '/api'
 */

// Determina se estamos em ambiente de servidor ou cliente
const isServer = typeof window === "undefined";

// Função para obter a URL base da API
export function getApiBaseUrl(): string {
  // Sempre usar o prefixo '/api' para as rotas da API
  return "/api";
}

// URL base da API
export const API_BASE_URL = getApiBaseUrl(); 