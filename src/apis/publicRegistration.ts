import type { PublicRegisterPayload, PublicApiResponse, VerifyEmailPayload } from "../types/publicRegistration";

const API_BASE = import.meta.env.VITE_API_BASE_LOCAL;

export async function registerPublic(payload: PublicRegisterPayload): Promise<{ planillaNumber: number }> {
  const res = await fetch(`${API_BASE}/api/public/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: PublicApiResponse = await res.json();

  if (!res.ok || !data.result) {
    throw new Error(data.error?.[0] || 'Error en el registro');
  }

  const planillaNumber = (data.content as any)?.planillaNumber;
  if (!planillaNumber) {
    throw new Error('No se recibió el número de planilla');
  }

  return { planillaNumber };
}

export async function verifyEmailCode(payload: VerifyEmailPayload): Promise<PublicApiResponse> {
  const res = await fetch(`${API_BASE}/api/public/verify-email`, {
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