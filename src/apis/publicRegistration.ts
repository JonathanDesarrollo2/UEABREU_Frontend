// src/apis/publicRegistration.ts
import type { PublicRegisterPayload, PublicApiResponse, VerifyEmailPayload } from "../types/publicRegistration";

const API_BASE = import.meta.env.VITE_API_URL || 'https://appservices.ueabreu.com';

/**
 * Registra un nuevo representante con sus estudiantes.
 * Retorna la respuesta del backend.
 */
export async function registerPublic(payload: PublicRegisterPayload): Promise<PublicApiResponse> {
  const res = await fetch(`${API_BASE}/api/public/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: PublicApiResponse = await res.json();

  if (!res.ok || !data.result) {
    throw new Error(data.error?.[0] || 'Error en el registro');
  }

  return data;
}

/**
 * Verifica el código de 5 dígitos enviado al correo.
 */
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