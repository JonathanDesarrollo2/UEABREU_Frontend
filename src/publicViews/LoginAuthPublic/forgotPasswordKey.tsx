import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaGraduationCap, FaEnvelope, FaKey, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useForgotPassword } from "./hooks/useForgotPassword";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    step,
    email,
    loading,
    goToStep,
    requestCode,
    verifyCode,
    submitNewPassword,
    resendCode,
  } = useForgotPassword();

  // Estados locales de cada paso
  const [emailInput, setEmailInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // ─── Validaciones locales ─────────────────────────────────────────
  const emailValid = /^\S+@\S+\.\S+$/.test(emailInput.trim());
  const codeValid = /^\d{6}$/.test(codeInput);
  const passwordValid = newPassword.length >= 6;
  const confirmValid = newPassword === confirmPassword && confirmPassword.length > 0;

  // ─── Handlers ────────────────────────────────────────────────────
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!emailValid) {
      setLocalError("Ingresa un correo válido");
      return;
    }
    await requestCode(emailInput.trim());
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!codeValid) {
      setLocalError("El código debe tener 6 dígitos");
      return;
    }
    await verifyCode(codeInput.trim());
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!passwordValid) {
      setLocalError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!confirmValid) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }
    const ok = await submitNewPassword(newPassword, confirmPassword);
    if (ok) {
      setTimeout(() => navigate("/login"), 1200);
    }
  };

  // ─── UI ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-blue-900/5 rounded-full"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 bg-blue-800/5 rounded-lg"
          animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-800 to-blue-900"></div>

          {/* Encabezado */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaGraduationCap className="text-2xl text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Recuperar Contraseña</h1>
            <p className="text-slate-600 text-sm">
              {step === 1 && "Ingresa tu correo para recibir un código de recuperación"}
              {step === 2 && "Ingresa el código de 6 dígitos que enviamos a tu correo"}
              {step === 3 && "Crea tu nueva contraseña"}
            </p>
          </motion.div>

          {/* Indicador de progreso */}
          <div className="flex justify-center items-center gap-2 mb-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step >= n
                      ? "bg-blue-800 text-white shadow-md"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {n}
                </div>
                {n < 3 && (
                  <div
                    className={`w-6 h-0.5 transition-colors duration-300 ${
                      step > n ? "bg-blue-800" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Pasos */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleStep1}
                className="space-y-5"
              >
                <div>
                  <label className="text-slate-700 font-medium mb-2 flex items-center">
                    <FaEnvelope className="mr-2 text-blue-700" />
                    Correo electrónico
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setLocalError(null);
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all duration-300 bg-slate-50"
                    placeholder="tu@email.com"
                    autoFocus
                  />
                </div>

                {localError && <p className="text-red-500 text-sm">{localError}</p>}

                <button
                  type="submit"
                  disabled={loading || !emailValid}
                  className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3.5 rounded-xl font-semibold hover:from-blue-900 hover:to-blue-950 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Enviando..." : "Enviar código"}
                </button>

                <Link
                  to="/login"
                  className="block text-center text-slate-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Volver al inicio de sesión
                </Link>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleStep2}
                className="space-y-5"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800 text-center">
                  Código enviado a <strong>{email}</strong>
                </div>

                <div>
                  <label className="text-slate-700 font-medium mb-2 flex items-center">
                    <FaKey className="mr-2 text-blue-700" />
                    Código de 6 dígitos
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value.replace(/\D/g, ""));
                      setLocalError(null);
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all duration-300 bg-slate-50"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                {localError && <p className="text-red-500 text-sm">{localError}</p>}

                <button
                  type="submit"
                  disabled={loading || !codeValid}
                  className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3.5 rounded-xl font-semibold hover:from-blue-900 hover:to-blue-950 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verificando..." : "Verificar código"}
                </button>

                <div className="flex justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      goToStep(1);
                      setCodeInput("");
                      setLocalError(null);
                    }}
                    className="text-slate-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    ← Cambiar correo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resendCode();
                      setCodeInput("");
                      setLocalError(null);
                    }}
                    className="text-blue-800 hover:text-blue-900 font-medium transition-colors"
                  >
                    Reenviar código
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleStep3}
                className="space-y-5"
              >
                <div>
                  <label className="text-slate-700 font-medium mb-2 flex items-center">
                    <FaLock className="mr-2 text-blue-700" />
                    Nueva contraseña
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setLocalError(null);
                      }}
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all duration-300 bg-slate-50"
                      placeholder="••••••••"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-medium mb-2 flex items-center">
                    <FaLock className="mr-2 text-blue-700" />
                    Confirmar contraseña
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setLocalError(null);
                      }}
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all duration-300 bg-slate-50"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showConfirm ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                {localError && <p className="text-red-500 text-sm">{localError}</p>}

                {newPassword && confirmPassword && (
                  <div
                    className={`text-sm rounded-lg p-2 text-center ${
                      confirmValid
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {confirmValid ? "✓ Las contraseñas coinciden" : "Las contraseñas aún no coinciden"}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !passwordValid || !confirmValid}
                  className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3.5 rounded-xl font-semibold hover:from-blue-900 hover:to-blue-950 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Actualizando..." : "Actualizar contraseña"}
                </button>

                <Link
                  to="/login"
                  className="block text-center text-slate-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Cancelar
                </Link>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <motion.p
          className="text-center text-slate-500 mt-6 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Formando líderes del mañana
        </motion.p>
      </motion.div>
    </div>
  );
}