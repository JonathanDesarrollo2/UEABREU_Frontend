// src/hooks/useDetectedNivel.ts
import { useEffect, useState } from 'react';

/**
 * Extrae el "nivel" de un objeto, probando varias rutas comunes:
 *   { nivel: 2 }
 *   { user: { nivel: 2 } }
 *   { data: { nivel: 2 } }
 *   { usuario: { nivel: 2 } }
 *   { userData: { nivel: 2 } }
 *   { userLogin: { nivel: 2 } }
 *   { data: { user: { nivel: 2 } } }
 *   { login: { user: { nivel: 2 } } }
 *   { tokenData: { nivel: 2 } }
 *   etc.
 */
function extractNivel(obj: any): number | null {
  if (!obj || typeof obj !== 'object') return null;

  const candidates = [
    obj.nivel,
    obj.user?.nivel,
    obj.usuario?.nivel,
    obj.userData?.nivel,
    obj.userLogin?.nivel,
    obj.currentUser?.nivel,
    obj.authUser?.nivel,
    obj.tokenData?.nivel,
    obj.data?.nivel,
    obj.data?.user?.nivel,
    obj.data?.usuario?.nivel,
    obj.data?.tokenData?.nivel,
    obj.login?.user?.nivel,
    obj.login?.nivel,
    obj.payload?.nivel,
    obj.user?.userlogin?.nivel,
  ];

  for (const c of candidates) {
    if (typeof c === 'number') return c;
    if (typeof c === 'string' && c.trim() !== '' && !isNaN(Number(c))) return Number(c);
  }
  return null;
}

/**
 * Decodifica un JWT sin verificar firma. Devuelve el payload o null.
 */
function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Busca el nivel del usuario en:
 *  1) Un conjunto de claves comunes de localStorage / sessionStorage
 *  2) TODAS las claves de localStorage / sessionStorage escaneando objetos que contengan "nivel"
 *  3) Decodificando el JWT guardado bajo claves comunes de token
 *  4) window.__USER__
 */
export function useDetectedNivel(): number | null {
  const [nivel, setNivel] = useState<number | null>(null);

  useEffect(() => {
    try {
      const knownUserKeys = [
        'user', 'userData', 'authUser', 'usuario', 'currentUser',
        'usuarioLogeado', 'userLogin', 'auth', 'session', 'sesion',
        'loggedUser', 'usuarioAutenticado',
      ];

      // ── PASO 1: probar claves conocidas ────────────────────────
      for (const storage of [localStorage, sessionStorage]) {
        for (const key of knownUserKeys) {
          const raw = storage.getItem(key);
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw);
            const n = extractNivel(parsed);
            if (typeof n === 'number') {
              console.log(`✅ useDetectedNivel: nivel ${n} detectado en storage["${key}"]`);
              setNivel(n);
              return;
            }
          } catch { /* no es JSON */ }
        }
      }

      // ── PASO 2: escanear TODAS las claves buscando "nivel" ────
      for (const storage of [localStorage, sessionStorage]) {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (!key) continue;
          const raw = storage.getItem(key);
          if (!raw || raw.length > 20000) continue;
          if (!raw.includes('nivel')) continue;

          try {
            const parsed = JSON.parse(raw);
            const n = extractNivel(parsed);
            if (typeof n === 'number') {
              console.log(`✅ useDetectedNivel: nivel ${n} detectado escaneando storage["${key}"]`);
              setNivel(n);
              return;
            }
          } catch { /* no es JSON */ }
        }
      }

      // ── PASO 3: intentar decodificar JWT ──────────────────────
      const tokenKeys = [
        'token', 'accessToken', 'authToken', 'jwt', 'bearer',
        'access_token', 'id_token', 'userToken', 'tokenJWT', 'sessionToken',
      ];
      for (const storage of [localStorage, sessionStorage]) {
        for (const key of tokenKeys) {
          const raw = storage.getItem(key);
          if (!raw) continue;
          // Puede venir con prefijo "Bearer "
          const clean = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
          const payload = decodeJWT(clean);
          if (payload) {
            const n = extractNivel(payload);
            if (typeof n === 'number') {
              console.log(`✅ useDetectedNivel: nivel ${n} detectado en JWT["${key}"]`);
              setNivel(n);
              return;
            }
          }
        }
      }

      // ── PASO 4: window.__USER__ ──────────────────────────────
      const winUser = (window as any).__USER__;
      const wn = extractNivel(winUser);
      if (typeof wn === 'number') {
        console.log(`✅ useDetectedNivel: nivel ${wn} detectado en window.__USER__`);
        setNivel(wn);
        return;
      }

      // ── No se pudo detectar ──────────────────────────────────
      console.warn(
        '⚠️ useDetectedNivel: no se pudo detectar el nivel del usuario.\n' +
        'Abre F12 → Application → Local Storage y dime qué claves aparecen, ' +
        'o revisa F12 → Console los logs de abajo con TODAS las claves guardadas:'
      );

      // 🔎 Debug: imprime todas las claves guardadas para diagnóstico
      const dump: Record<string, string> = {};
      for (const [label, storage] of [['localStorage', localStorage], ['sessionStorage', sessionStorage]] as const) {
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (!k) continue;
          const v = storage.getItem(k) || '';
          dump[`${label}::${k}`] = v.length > 200 ? `${v.slice(0, 200)}... (${v.length} chars)` : v;
        }
      }
      console.table(dump);
    } catch (e) {
      console.warn('useDetectedNivel error:', e);
    }
  }, []);

  return nivel;
}