import axios from 'axios';
const BaseURL = import.meta.env.VITE_API_BASE_LOCAL;
const api = axios.create({
  baseURL: BaseURL, 
  timeout: 15000,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const jwToken = localStorage.getItem('tokcattleraising_inCattleRanchCloud');
  if (jwToken) {
    config.headers.Authorization = `Bearer ${jwToken}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});


api.interceptors.response.use(
  response => {
    // Verificar si la respuesta es de login exitoso y tiene token
    if (response.config.url?.includes('/privateauth') && response.data?.result) {
      const newToken = response.data.content;
      
      if (newToken && typeof newToken === 'string') {
        const parts = newToken.split('.');
        if (parts.length === 3) { // JWT válido tiene 3 partes
          localStorage.setItem('tokcattleraising_inCattleRanchCloud', newToken);
        }
      }
    }
    return response;
  },
  error => {
    console.error('❌ [AXIOS DEBUG] Error en petición:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('tokcattleraising_inCattleRanchCloud');
      // Redirigir al login solo si no estamos ya en la página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;