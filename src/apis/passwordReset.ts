import { isAxiosError } from "axios";
import api from "../library/axios";

export interface PasswordResetApiResponse {
  result: boolean;
  content: { message?: string; remainingAttempts?: number } | [];
  error: string[];
}

// Paso 1: solicitar código al correo
export async function requestPasswordResetAPI(email: string): Promise<PasswordResetApiResponse> {
  try {
    const { data } = await api.post<PasswordResetApiResponse>("/public/login/forgot-password", { email });
    return data;
  } catch (error) {
    let mensaje = "Error al solicitar la recuperación";
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) mensaje = errores.join(", ");
    }
    throw new Error(mensaje);
  }
}

// Paso 2: verificar el código
export async function verifyResetCodeAPI(email: string, code: string): Promise<PasswordResetApiResponse> {
  try {
    const { data } = await api.post<PasswordResetApiResponse>("/public/login/verify-reset-code", { email, code });
    return data;
  } catch (error) {
    let mensaje = "Código inválido o expirado";
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) mensaje = errores.join(", ");
    }
    throw new Error(mensaje);
  }
}

// Paso 3: actualizar la contraseña
export async function resetPasswordAPI(
  email: string,
  code: string,
  newPassword: string,
  confirmPassword: string
): Promise<PasswordResetApiResponse> {
  try {
    const { data } = await api.post<PasswordResetApiResponse>("/public/login/reset-password", {
      email,
      code,
      newPassword,
      confirmPassword,
    });
    return data;
  } catch (error) {
    let mensaje = "Error al actualizar la contraseña";
    if (isAxiosError(error) && error.response) {
      const errores = error.response.data.error;
      if (errores && errores.length > 0) mensaje = errores.join(", ");
    }
    throw new Error(mensaje);
  }
}