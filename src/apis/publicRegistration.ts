import type { PublicRegisterPayload, VerifyEmailPayload } from "../types/publicRegistration";

const API_BASE = import.meta.env.VITE_API_BASE_LOCAL;

interface RegisterApiResponse {
  result: boolean;
  content?: {
    message?: string;
    planillaNumber?: number;
  };
  error?: string[];
}

interface VerifyApiResponse {
  result: boolean;
  content?: {
    message?: string;
    pdfBase64?: string | null;
  };
  error?: string[];
}

export async function registerPublic(payload: PublicRegisterPayload): Promise<{ planillaNumber: number }> {
  const res = await fetch(`${API_BASE}/public/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: RegisterApiResponse = await res.json();

  if (!res.ok || !data.result) {
    throw new Error(data.error?.[0] || 'Error en el registro');
  }

  const planillaNumber = data.content?.planillaNumber;
  if (!planillaNumber) {
    throw new Error('No se recibió el número de planilla');
  }

  return { planillaNumber };
}

export async function verifyEmailCode(payload: VerifyEmailPayload): Promise<{ pdfBase64: string | null }> {
  const res = await fetch(`${API_BASE}/public/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: VerifyApiResponse = await res.json();

  if (!res.ok || !data.result) {
    throw new Error(data.error?.[0] || 'Error en la verificación');
  }

  return { pdfBase64: data.content?.pdfBase64 || null };
}