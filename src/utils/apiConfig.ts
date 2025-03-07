/**
 * Configuração para URLs da API
 * 
 * Este arquivo fornece a configuração correta para URLs da API em diferentes ambientes:
 * - Em desenvolvimento local: usa o host atual sem prefixo adicional
 * - Em produção (Vercel): usa o host atual com prefixo '/api'
 */

// Determina se estamos em ambiente de servidor ou cliente
const isServer = typeof window === "undefined";

// Função para obter a URL base da API
export function getApiBaseUrl(): string {
  // Se estiver no servidor, não temos informações sobre a URL do cliente
  if (isServer) {
    // Em produção (Vercel), as rotas da API estão sob /api
    if (process.env.VERCEL) {
      return "/api";
    }
    
    // Em desenvolvimento local, a API é servida diretamente
    return "";
  }
  
  // No cliente, usamos a URL atual
  const isProduction = window.location.hostname !== "localhost";
  
  // Em produção (Vercel), as rotas da API estão sob /api
  if (isProduction) {
    return "/api";
  }
  
  // Em desenvolvimento local, a API é servida diretamente
  return "";
}

// URL base da API
export const API_BASE_URL = getApiBaseUrl(); 