import { useState } from "react";
import { toast } from "react-toastify";
import {
  requestPasswordResetAPI,
  verifyResetCodeAPI,
  resetPasswordAPI,
} from "../../../apis/passwordReset";

export type ForgotStep = 1 | 2 | 3;

export const useForgotPassword = () => {
  const [step, setStep] = useState<ForgotStep>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const goToStep = (s: ForgotStep) => setStep(s);

  // ── Paso 1: solicitar código ─────────────────────────────────────
  const requestCode = async (emailInput: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await requestPasswordResetAPI(emailInput);
      if (res.result) {
        setEmail(emailInput.trim().toLowerCase());
        const msg =
          (res.content && "message" in res.content && res.content.message) ||
          "Si el correo está registrado, recibirás un código.";
        toast.success(msg);
        setStep(2);
        return true;
      }
      const errMsg = res.error?.[0] || "No se pudo enviar el código";
      toast.error(errMsg);
      return false;
    } catch (err: any) {
      toast.error(err?.message || "Error al solicitar recuperación");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Paso 2: verificar código ─────────────────────────────────────
  const verifyCode = async (codeInput: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await verifyResetCodeAPI(email, codeInput);
      if (res.result) {
        setCode(codeInput);
        toast.success("Código verificado");
        setStep(3);
        return true;
      }
      const errMsg = res.error?.[0] || "Código incorrecto";
      toast.error(errMsg);
      return false;
    } catch (err: any) {
      toast.error(err?.message || "Código inválido");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Paso 3: nueva contraseña ─────────────────────────────────────
  const submitNewPassword = async (
    newPassword: string,
    confirmPassword: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await resetPasswordAPI(email, code, newPassword, confirmPassword);
      if (res.result) {
        toast.success("Contraseña actualizada correctamente");
        return true;
      }
      const errMsg = res.error?.[0] || "Error al actualizar la contraseña";
      toast.error(errMsg);
      return false;
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar la contraseña");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código (vuelve al paso 1 con el email precargado)
  const resendCode = () => {
    setStep(1);
    setCode("");
  };

  return {
    step,
    email,
    setEmail,
    code,
    setCode,
    loading,
    goToStep,
    requestCode,
    verifyCode,
    submitNewPassword,
    resendCode,
  };
};