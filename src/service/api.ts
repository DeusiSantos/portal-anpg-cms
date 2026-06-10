import axios from "axios";

/** API JSON + ficheiros (documentação interactiva: /index.html) */
const BASE_URL = "https://mwangobrainsa-001-site6.mtempurl.com";
// URL relativa sempre: Vite proxy (dev) e Vercel rewrite (prod) tratam o encaminhamento.
// Necessário para iOS — o Safari/WebKit bloqueia cookies SameSite=None de origens cruzadas.
const API_URL = "/api/";

export const API_SWAGGER_URL = `${BASE_URL}/index.html`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enviar cookies para autenticação baseada em sessão
});

// Exportar a URL base para usar em imagens
export const BASE_IMAGE_URL = BASE_URL;

// Função utilitária para obter URL completa de imagem
export const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  
  // Se o caminho já começar com /api/files, usa diretamente
  if (imagePath.startsWith('/api/')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // Se for apenas o caminho do arquivo
  return `${BASE_URL}/api/files/${imagePath}`;
};

// Função para obter URL de thumbnail (se necessário)
export const getThumbnailUrl = (imagePath: string | null | undefined): string => {
  // Pode implementar lógica de thumbnail se a API suportar
  return getFullImageUrl(imagePath);
};

export default api;