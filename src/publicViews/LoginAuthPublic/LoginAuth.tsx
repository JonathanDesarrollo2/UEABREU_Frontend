import { useCallback, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { typeLogin_in } from "../../types/login";
import { userInLogin } from "./hooks/useInLogin";
import { useInLoginForm } from "./hooks/useInLoginForm";
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaGraduationCap } from 'react-icons/fa';

const StatusLight = ({ isActive }: { isActive: boolean }) => (
  <motion.div
    className={`h-3 w-3 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-400'} shadow-sm`}
    initial={{ scale: 0.8 }}
    animate={{ 
      scale: isActive ? [1, 1.2, 1] : 1,
      opacity: isActive ? 1 : 0.6
    }}
    transition={{ 
      duration: 0.6,
      repeat: isActive ? Infinity : 0,
      ease: "easeInOut"
    }}
  />
);

export default function LoginAuthPublic() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useInLoginForm();
  const { mutate, isPending } = userInLogin();
  
  const [showPassword, setShowPassword] = useState(false);
  const emailValue = watch('usermail');
  const passwordValue = watch('userpass');

  const onSubmit = useCallback(
    (formdata: typeLogin_in) => {
      if (!formdata.usermail?.trim()) {
        toast.error("El email es requerido");
        return;
      }
      if (!formdata.userpass?.trim()) {
        toast.error("La contraseña es requerida.");
        return;
      }

      mutate(formdata, {
        onSuccess: (dataAPI) => {
          if (dataAPI.result) {
            console.log('✅ Login exitoso, redirigiendo...');
            toast.success('¡Bienvenido!', {
              autoClose: 1000,
            });
            
            setTimeout(() => {
              console.log('🔄 Navegando a /app (ruta privada)');
              navigate('/app');
            }, 1200);
          } else {
            console.log('❌ Login fallido:', dataAPI.error);
          }
        },
        onError: (error) => {
          console.error('❌ Error en login:', error);
        }
      });
    },
    [mutate, navigate]
  );

  const handleCancel = useCallback(() => navigate('/'), [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 bg-blue-900/5 rounded-full"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-24 h-24 bg-blue-800/5 rounded-lg"
          animate={{
            y: [0, 15, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 relative overflow-hidden">
          
          {/* Efecto de acento decorativo */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-800 to-blue-900"></div>
          
          {/* Encabezado con animación */}
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
            <h1 className="text-2xl font-bold text-slate-800 mb-2">U.E. José Antonio Abreu</h1>
            <p className="text-slate-600">Plataforma Educativa</p>
            
            {/* Indicadores de estado */}
            <div className="flex justify-center gap-2 mt-4">
              <StatusLight isActive={!!emailValue} />
              <StatusLight isActive={!!passwordValue} />
            </div>
          </motion.div>

          {/* Formulario con animaciones escalonadas */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="text-slate-700 font-medium mb-2 flex items-center">
                <FaUser className="mr-2 text-blue-700" />
                Correo electrónico
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="usermail"
                  {...register('usermail', { 
                    required: "El email es requerido",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Email inválido"
                    }
                  })}
                  className={`w-full px-4 py-3 pl-10 border ${
                    errors.usermail ? "border-red-500" : "border-slate-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all duration-300 bg-slate-50`}
                  placeholder="tu@email.com"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  @
                </div>
              </div>
              {errors.usermail && (
                <span className="text-red-500 text-sm mt-1">{errors.usermail.message}</span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="text-slate-700 font-medium mb-2 flex items-center">
                <FaLock className="mr-2 text-blue-700" />
                Contraseña
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="userpass"
                  {...register('userpass', { 
                    required: "La contraseña es requerida",
                    minLength: {
                      value: 6,
                      message: "Mínimo 6 caracteres"
                    }
                  })}
                  className={`w-full px-4 py-3 pl-10 border ${
                    errors.userpass ? "border-red-500" : "border-slate-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all duration-300 pr-12 bg-slate-50`}
                  placeholder="••••••••"
                />
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.userpass && (
                <span className="text-red-500 text-sm mt-1">{errors.userpass.message}</span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={{ scale: isPending ? 1 : 1.02 }}
                whileTap={{ scale: isPending ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3.5 rounded-xl font-semibold hover:from-blue-900 hover:to-blue-950 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Iniciando sesión...' : 'Ingresar'}
              </motion.button>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full border border-slate-300 text-slate-700 py-3.5 rounded-xl font-medium hover:bg-slate-50 transition-all duration-300"
              >
                Cancelar
              </button>
            </motion.div>
          </form>

          {/* Sección Únete a Nosotros */}
          <motion.div 
            className="text-center mt-8 pt-6 border-t border-slate-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-slate-600 mb-3">¿Interesado en unirte a nuestra institución?</p>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link 
                to="/join-us" 
                className="inline-flex items-center text-blue-800 font-semibold hover:text-blue-900 transition-colors group"
              >
                Únete a Nosotros
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Mensaje decorativo inferior */}
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