// src/hooks/useDetectedNivel.ts
import { useEffect, useState } from 'react';

/**
 * Extrae el "nivel" de un objeto, probando varias rutas comunes.
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
    const clean = token.startsWith('Bearer ') ? token.slice(7) : token;
    const parts = clean.split('.');
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
 * Heurística: ¿este string parece un JWT? (3 partes separadas por puntos,
 * primera parte empieza con "eyJ")
 */
function looksLikeJWT(s: string): boolean {
  if (!s || typeof s !== 'string') return false;
  const trimmed = s.startsWith('Bearer ') ? s.slice(7) : s;
  return trimmed.startsWith('eyJ') && trimmed.split('.').length === 3;
}

/**
 * Busca el nivel del usuario en:
 *  1) Claves conocidas → parsea JSON → busca `nivel`
 *  2) Escaneo TODAS las claves → si es JSON → busca `nivel`
 *  3) Escaneo TODAS las claves → si parece JWT → decodifica → busca `nivel`
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

      // ── PASO 1: claves conocidas con JSON ─────────────────────
      for (const storage of [localStorage, sessionStorage]) {
        for (const key of knownUserKeys) {
          const raw = storage.getItem(key);
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw);
            const n = extractNivel(parsed);
            if (typeof n === 'number') {
              console.log(`✅ useDetectedNivel: nivel ${n} en storage["${key}"]`);
              setNivel(n);
              return;
            }
          } catch { /* no es JSON */ }
        }
      }

      // ── PASO 2: escaneo de TODAS las claves ───────────────────
      for (const storage of [localStorage, sessionStorage]) {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (!key) continue;
          const raw = storage.getItem(key);
          if (!raw) continue;

          // a) Si el valor es un JWT → decodificar
          if (looksLikeJWT(raw)) {
            const payload = decodeJWT(raw);
            if (payload) {
              const n = extractNivel(payload);
              if (typeof n === 'number') {
                console.log(`✅ useDetectedNivel: nivel ${n} desde JWT en storage["${key}"]`);
                setNivel(n);
                return;
              }
            }
            continue;
          }

          // b) Si el valor contiene "nivel", intentar JSON parse
          if (raw.length < 20000 && raw.includes('nivel')) {
            try {
              const parsed = JSON.parse(raw);
              const n = extractNivel(parsed);
              if (typeof n === 'number') {
                console.log(`✅ useDetectedNivel: nivel ${n} escaneando storage["${key}"]`);
                setNivel(n);
                return;
              }
            } catch { /* no es JSON */ }
          }
        }
      }

      // ── PASO 3: window.__USER__ ──────────────────────────────
      const winUser = (window as any).__USER__;
      const wn = extractNivel(winUser);
      if (typeof wn === 'number') {
        console.log(`✅ useDetectedNivel: nivel ${wn} en window.__USER__`);
        setNivel(wn);
        return;
      }

      // ── No se pudo detectar → debug ──────────────────────────
      console.warn(
        '⚠️ useDetectedNivel: no se pudo detectar el nivel. ' +
        'Revisa la tabla de abajo con todas las claves del storage:'
      );
      const dump: Record<string, string> = {};
      for (const [label, storage] of [
        ['localStorage', localStorage],
        ['sessionStorage', sessionStorage],
      ] as const) {
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (!k) continue;
          const v = storage.getItem(k) || '';
          dump[`${label}::${k}`] =
            v.length > 200 ? `${v.slice(0, 200)}... (${v.length} chars)` : v;
        }
      }
      console.table(dump);
    } catch (e) {
      console.warn('useDetectedNivel error:', e);
    }
  }, []);

  return nivel;
}