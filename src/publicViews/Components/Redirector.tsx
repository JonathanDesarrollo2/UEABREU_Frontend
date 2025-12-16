// publicViews/Components/Redirector.tsx
import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Spinner from '../../layouts/components/spinnerGeneral';

interface SessionContext {
  sesionUser?: string;
  sesionEmail?: string;
  userStatus?: boolean;
  nivel?: number;
  studentInfo?: {
    name?: string;
    status?: boolean;
  } | null;
}

export default function AuthRedirector() {
  const navigate = useNavigate();
  const sessionContext = useOutletContext<SessionContext>();

  useEffect(() => {
    console.log('🔍 AuthRedirector - Contexto recibido:', sessionContext);
    console.log('🔍 AuthRedirector - Nivel:', sessionContext.nivel);
    
    if (sessionContext.nivel !== undefined) {
      if (sessionContext.nivel === 1) {
        console.log('🎯 Redirigiendo a /representante');
        navigate('/representante', { replace: true });
      } else if (sessionContext.nivel === 2) {
        console.log('🎯 Redirigiendo a /admin');
        navigate('/admin', { replace: true });
      } else {
        console.warn('⚠️ Nivel no reconocido:', sessionContext.nivel);
      }
    } else {
      console.log('⏳ Esperando datos del usuario...');
    }
  }, [sessionContext.nivel, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner />
      <p className="ml-4">Redirigiendo según tu rol...</p>
    </div>
  );
}