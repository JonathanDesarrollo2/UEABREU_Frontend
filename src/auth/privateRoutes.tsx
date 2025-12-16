// PrivateRoutes.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Spinner from '../layouts/components/spinnerGeneral';
import { useUserActive } from './hooks/useUserActive';
import type { TypeApiResponseLoginActive } from '../types/login';

export default function PrivateRoutes() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [apiResult, setApiResult] = useState<TypeApiResponseLoginActive | null>(null);
  const [apiError, setApiError] = useState<Error | null>(null);
  const { mutateAsync } = useUserActive();

  useEffect(() => {
    const token = localStorage.getItem('tokcattleraising_inCattleRanchCloud');
    const auth = !!token;
    setIsAuth(auth);

    if (auth) {
      console.log('🔐 Token encontrado, verificando sesión...');
      mutateAsync()
        .then((data) => {
          console.log('✅ Datos de usuario recibidos:', data);
          setApiResult(data);
        })
        .catch((error) => {
          console.error('❌ Error obteniendo datos de usuario:', error);
          setApiError(error);
        });
    }
  }, [mutateAsync]);

  // Estado inicial de validación
  if (isAuth === null) {
    return <Spinner />;
  }

  // Token no existe
  if (!isAuth) {
    console.log('❌ No hay token, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Esperando respuesta de la API
  if (!apiResult && !apiError) {
    console.log('⏳ Esperando datos del usuario...');
    return <Spinner />;
  }

  // Error en API o sesión inválida
  if (apiError || (apiResult && !apiResult.result)) {
    console.log('❌ Error de autenticación, limpiando token');
    localStorage.removeItem('tokcattleraising_inCattleRanchCloud');
    return <Navigate to="/login" replace />;
  }

  // Sesión válida
  console.log('✅ Sesión válida, nivel:', apiResult?.content.nivel);
  return (
    <Outlet
      context={{
        sesionUser: apiResult?.content.sesionUser,
        sesionEmail: apiResult?.content.sesionEmail,
        userStatus: apiResult?.content.userStatus,
        nivel: apiResult?.content.nivel,
        studentInfo: apiResult?.content.studentInfo
      }}
    />
  );
}