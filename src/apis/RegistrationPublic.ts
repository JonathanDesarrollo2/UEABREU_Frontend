import type { PublicRegisterPayload, PublicApiResponse, VerifyEmailPayload } from "../types/publicRegistration";

const API_BASE = import.meta.env.VITE_API_BASE_LOCAL;

/**
 * Registra un nuevo representante con sus estudiantes.
 * Ahora retorna además el número de planilla.
 */
export async function registerPublic(payload: PublicRegisterPayload): Promise<{ planillaNumber: number }> {
  const res = await fetch(`${API_BASE}/public/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: PublicApiResponse = await res.json();

  if (!res.ok || !data.result) {
    throw new Error(data.error?.[0] || 'Error en el registro');
  }

  // content viene como { planillaNumber: number } según tu controlador
  const planillaNumber = (data.content as { planillaNumber?: number })?.planillaNumber;
  if (planillaNumber === undefined || planillaNumber === null) {
    throw new Error('No se recibió el número de planilla');
  }

  return { planillaNumber };
}

/**
 * Verifica el código de 5 dígitos enviado al correo.
 */
export async function verifyEmailCode(payload: VerifyEmailPayload): Promise<PublicApiResponse> {
  const res = await fetch(`${API_BASE}/public/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: PublicApiResponse = await res.json();

  if (!res.ok || !data.result) {
    throw new Error(data.error?.[0] || 'Error en la verificación');
  }

  return data;
}