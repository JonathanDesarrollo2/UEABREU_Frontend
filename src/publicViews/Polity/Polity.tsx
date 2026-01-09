import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiUserCheck, FiEye, FiDatabase, FiArrowUp } from 'react-icons/fi';

export const PrivacyPolicy: React.FC = () => {
  const topRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Scroll al inicio cuando el componente se monta
  useEffect(() => {
    scrollToTop();
  }, []);

  const sections = [
    {
      icon: <FiShield className="w-6 h-6" />,
      title: "Protección de Datos",
      content: "En nuestra institución educativa, nos comprometemos a proteger la información personal de nuestros estudiantes, padres y representantes. Todos los datos recopilados son utilizados exclusivamente para fines educativos y administrativos."
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: "Seguridad de la Información",
      content: "Implementamos medidas de seguridad técnicas y organizativas para proteger su información contra accesos no autorizados, pérdida o alteración. Utilizamos sistemas encriptados y controles de acceso estrictos."
    },
    {
      icon: <FiUserCheck className="w-6 h-6" />,
      title: "Consentimiento",
      content: "Solicitamos su consentimiento explícito para el tratamiento de datos personales. Usted tiene derecho a acceder, rectificar y cancelar sus datos en cualquier momento."
    },
    {
      icon: <FiEye className="w-6 h-6" />,
      title: "Transparencia",
      content: "Informamos claramente sobre el uso que damos a la información recopilada. No compartimos datos con terceros sin autorización, excepto cuando sea requerido por ley."
    },
    {
      icon: <FiDatabase className="w-6 h-6" />,
      title: "Almacenamiento",
      content: "Los datos se almacenan en servidores seguros dentro de Venezuela, cumpliendo con la Ley Orgánica de Protección de Datos Personales."
    }
  ];

  return (
    <section className="w-screen left-1/2 -translate-x-1/2 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 py-24">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div ref={topRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-slate-600">
            Última actualización: {new Date().toLocaleDateString('es-VE')}
          </p>
        </motion.div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Compromiso con su Privacidad</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              En nuestra institución educativa, valoramos y respetamos su privacidad. Esta política 
              describe cómo recopilamos, usamos y protegemos la información personal de nuestros 
              estudiantes, padres y representantes.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-6 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-blue-50 p-3 rounded-xl flex-shrink-0 border border-blue-200">
                  <div className="text-blue-700">
                    {section.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-blue-50/50 rounded-2xl p-8 text-center border border-blue-200"
        >
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            ¿Tiene preguntas sobre nuestra política de privacidad?
          </h3>
          <p className="text-slate-700 mb-6">
            Contáctenos en: <strong>uejantonioabre@gmail.com</strong>
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors font-semibold flex items-center justify-center mx-auto"
          >
            <FiArrowUp className="mr-2" />
            Volver al Inicio
          </motion.button>
        </motion.div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};