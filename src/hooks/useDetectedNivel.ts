// src/hooks/useDetectedNivel.ts
import { useEffect, useState } from 'react';

/**
 * Intenta detectar el nivel del usuario logueado desde distintas fuentes comunes.
 * Devuelve null si no logra encontrarlo.
 *
 * Fuentes que revisa (en orden):
 *  - localStorage / sessionStorage con keys: 'user', 'userData', 'authUser', 'usuario', 'currentUser', 'usuarioLogeado'
 *  - window.__USER__ (por si algún script lo expone)
 *
 * Si tu app usa Context o Redux, mejor pasa `canDeletePayments` como prop.
 * Este hook es solo un fallback.
 */
export function useDetectedNivel(): number | null {
  const [nivel, setNivel] = useState<number | null>(null);

  useEffect(() => {
    try {
      const keys = [
        'user',
        'userData',
        'authUser',
        'usuario',
        'currentUser',
        'usuarioLogeado',
        'userLogin',
      ];

      for (const key of keys) {
        const raw =
          localStorage.getItem(key) || sessionStorage.getItem(key);
        if (!raw) continue;

        let parsed: any;
        try {
          parsed = JSON.parse(raw);
        } catch {
          continue;
        }

        const n =
          parsed?.nivel ??
          parsed?.user?.nivel ??
          parsed?.data?.nivel ??
          parsed?.usuario?.nivel ??
          parsed?.userData?.nivel ??
          parsed?.userLogin?.nivel;

        if (typeof n === 'number') {
          console.log(`✅ useDetectedNivel: nivel ${n} detectado en storage key "${key}"`);
          setNivel(n);
          return;
        }
      }

      // Fallback: window.__USER__
      const winUser = (window as any).__USER__;
      const wn = winUser?.nivel ?? winUser?.user?.nivel;
      if (typeof wn === 'number') {
        console.log(`✅ useDetectedNivel: nivel ${wn} detectado en window.__USER__`);
        setNivel(wn);
        return;
      }

      console.warn(
        '⚠️ useDetectedNivel: no se pudo detectar el nivel del usuario. ' +
        'El botón de eliminar permanecerá oculto. ' +
        'Pásale canDeletePayments={true} desde el padre si ya sabes que es nivel 2.'
      );
    } catch (e) {
      console.warn('useDetectedNivel error:', e);
    }
  }, []);

  return nivel;
}