import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import type { PublicRegisterPayload } from '../../../types/publicRegistration';
import { registerPublic, verifyEmailCode } from '../../../apis/publicRegistration';

type Step = 'form' | 'verify' | 'success';

export function usePublicRegistration() {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [planillaNumber, setPlanillaNumber] = useState<number | null>(null);

  const handleRegister = useCallback(async (payload: PublicRegisterPayload) => {
    setLoading(true);
    try {
      const response = await registerPublic(payload);
      toast.success('Registro exitoso. Revisa tu correo para el código de verificación.');
      setRegisteredEmail(payload.usermail);
      setPlanillaNumber(response.planillaNumber);
      setStep('verify');
    } catch (error: any) {
      toast.error(error.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVerify = useCallback(async (code: string): Promise<string | null> => {
  if (!code || code.length !== 5) {
    toast.error('Ingresa un código de 5 dígitos');
    return null;
  }
  setLoading(true);
  try {
    const { pdfBase64 } = await verifyEmailCode({ email: registeredEmail, code });
    toast.success('Correo verificado con éxito.');
    setStep('success');
    return pdfBase64;       // ← devuelve el base64
  } catch (error: any) {
    toast.error(error.message || 'Código incorrecto o expirado');
    return null;
  } finally {
    setLoading(false);
  }
}, [registeredEmail]);

  const reset = useCallback(() => {
    setStep('form');
    setRegisteredEmail('');
    setPlanillaNumber(null);
    setLoading(false);
  }, []);

  return {
    step,
    loading,
    registeredEmail,
    planillaNumber,
    handleRegister,
    handleVerify,
    reset,
  };
}
