// library/axios.ts - VERSIÓN CORREGIDA Y COMPLETA
import axios from 'axios';

// 🔍 DIAGNÓSTICO COMPLETO - Aparecerá en la consola del navegador
console.log('🔍 [AXIOS DEBUG] ================================');
console.log('🔍 import.meta.env.VITE_API_BASE_LOCAL:', import.meta.env.VITE_API_BASE_LOCAL);
console.log('🔍 import.meta.env.MODE:', import.meta.env.MODE);
console.log('🔍 import.meta.env.PROD:', import.meta.env.PROD);
console.log('🔍 import.meta.env.DEV:', import.meta.env.DEV);
console.log('🔍 window.location.host:', window.location.host);

// ✅ SOLUCIÓN DEFINITIVA: Usar SIEMPRE la variable que ya está en el build
const BaseURL = import.meta.env.VITE_API_BASE_LOCAL;

// 🚨 VERIFICACIÓN CRÍTICA
if (!BaseURL) {
  console.error('❌ [AXIOS DEBUG] ERROR: VITE_API_BASE_LOCAL está VACÍA o UNDEFINED');
  console.error('   Esto significa que la variable no se inyectó en el build de Vite');
  console.error('   A pesar de que Docker la recibió correctamente.');
} else {
  console.log('✅ [AXIOS DEBUG] BaseURL configurada correctamente:', BaseURL);
}

console.log('🔍 =============================================');

// Crear instancia de axios con la BaseURL (si es undefined, axios usará la URL actual)
const api = axios.create({
  baseURL: BaseURL, // Esto DEBE ser: "https://appservices.ueabreu.com/api"
  timeout: 15000,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor de request (para agregar token automáticamente)
api.interceptors.request.use(config => {
  const jwToken = localStorage.getItem('tokcattleraising_inCattleRanchCloud');
  if (jwToken) {
    config.headers.Authorization = `Bearer ${jwToken}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor de response (para manejar tokens y errores)
api.interceptors.response.use(
  response => {
    // Verificar si la respuesta es de login exitoso y tiene token
    if (response.config.url?.includes('/privateauth') && response.data?.result) {
      const newToken = response.data.content;
      
      if (newToken && typeof newToken === 'string') {
        const parts = newToken.split('.');
        if (parts.length === 3) { // JWT válido tiene 3 partes
          localStorage.setItem('tokcattleraising_inCattleRanchCloud', newToken);
          console.log('✅ [AXIOS DEBUG] Token JWT guardado en localStorage');
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
      console.log('🔐 [AXIOS DEBUG] Token removido por error 401');
      // Redirigir al login solo si no estamos ya en la página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;