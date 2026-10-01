import { isAxiosError } from "axios";
import api from "../library/axios";
import type { PublicRegisterPayload } from "../types/publicRegistration";

export interface RegisterResponse {
  planillaNumber: number;
  message: string;
}

export interface VerifyResponse {
  pdfBase64?: string | null;
  message: string;
}

// POST /api/public/register — registro público (representante + estudiantes)
export async function registerPublic(
  payload: PublicRegisterPayload
): Promise<{ planillaNumber: number }> {
  try {
    const { data } = await api.post<{
      result: boolean;
      content: { message: string; planillaNumber: number };
      error: string[];
    }>("/public/register", payload);

    if (!data.result) {
      throw new Error(data.error?.[0] || "Error en el registro");
    }
    return data.content;
  } catch (error) {
    let mensaje = "Error en el registro";
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data?.error;
      if (errores && errores.length > 0) mensaje = errores.join(", ");
    } else if (error instanceof Error) {
      mensaje = error.message;
    }
    throw new Error(mensaje);
  }
}

// POST /api/public/verify-email — verifica el código enviado por correo
export async function verifyEmailCode({
  email,
  code,
}: {
  email: string;
  code: string;
}): Promise<VerifyResponse> {
  try {
    const { data } = await api.post<{
      result: boolean;
      content: { message: string; pdfBase64?: string | null };
      error: string[];
    }>("/public/verify-email", { email, code });

    if (!data.result) {
      throw new Error(data.error?.[0] || "Código incorrecto o expirado");
    }
    return data.content;
  } catch (error) {
    let mensaje = "Código incorrecto o expirado";
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data?.error;
      if (errores && errores.length > 0) mensaje = errores.join(", ");
    } else if (error instanceof Error) {
      mensaje = error.message;
    }
    throw new Error(mensaje);
  }
}
