// library/axios.ts
import axios from 'axios';

let BaseURL: string = import.meta.env.VITE_NODE_ENV !== 'development' 
  ? window.env?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL 
  : import.meta.env.VITE_API_BASE_LOCAL;

const api = axios.create({
  baseURL: BaseURL,
  validateStatus: (status) => status >= 200 && status < 300
});

api.interceptors.request.use(config => {
  const jwToken = localStorage.getItem('tokcattleraising_inCattleRanchCloud');
  if (jwToken) {
    config.headers.Authorization = `Bearer ${jwToken}`;
  }
  return config;
});

api.interceptors.response.use(
  response => {
    // Verificar si la respuesta es de login exitoso y tiene token en el body
    if (response.config.url?.includes('/privateauth') && response.data.result) {
      const newToken = response.data.content;
      
      if (newToken && typeof newToken === 'string') {
        const parts = newToken.split('.');
        const isValidStructure = parts.length === 3;

        if (isValidStructure) {
          localStorage.setItem('tokcattleraising_inCattleRanchCloud', newToken);
          console.log('✅ Token guardado en localStorage');
        }
      }
    }

    return response;
  },
  error => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('tokcattleraising_inCattleRanchCloud');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;