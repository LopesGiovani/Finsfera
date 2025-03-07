import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

// Cliente axios configurado para uso em toda a aplicação
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    // Verificar se estamos no navegador
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 