import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiUsers, FiDollarSign, FiClock, FiAlertTriangle, FiArrowUp } from 'react-icons/fi';

export const TermsAndConditions: React.FC = () => {
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
      icon: <FiBook className="w-6 h-6" />,
      title: "Matrícula y Admisión",
      content: "La matrícula está sujeta a disponibilidad de cupos. La institución se reserva el derecho de admisión. El proceso de inscripción requiere la documentación completa y el cumplimiento de los requisitos académicos."
    },
    {
      icon: <FiDollarSign className="w-6 h-6" />,
      title: "Pagos y Finanzas",
      content: "Los pagos deben realizarse en las fechas establecidas. Se aplicarán recargos por mora. La mensualidad incluye los servicios educativos básicos. Actividades extracurriculares pueden tener costos adicionales."
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: "Derechos y Deberes",
      content: "Los estudiantes tienen derecho a un ambiente educativo seguro y respetuoso. Los padres y representantes deben participar activamente en el proceso educativo y cumplir con las normas de convivencia."
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Asistencia y Puntualidad",
      content: "La asistencia regular es obligatoria. Las ausencias deben ser justificadas. La puntualidad es fundamental para el aprovechamiento académico."
    },
    {
      icon: <FiAlertTriangle className="w-6 h-6" />,
      title: "Normas de Conducta",
      content: "Se espera comportamiento respetuoso hacia todos los miembros de la comunidad educativa. El incumplimiento de las normas puede resultar en medidas disciplinarias."
    }
  ];

  return (
    <section className="w-screen left-1/2 -translate-x-1/2 relative overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50 py-24">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div ref={topRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-xl text-gray-600">
            Vigentes a partir de: {new Date().toLocaleDateString('es-VE')}
          </p>
        </motion.div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bienvenido a Nuestra Institución</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al formar parte de nuestra comunidad educativa, usted acepta cumplir con los siguientes 
              términos y condiciones que rigen nuestra relación académica y administrativa.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Estos términos están diseñados para garantizar un ambiente educativo óptimo para todos 
              nuestros estudiantes y familias.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-6 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-xl flex-shrink-0">
                  <div className="text-green-600">
                    {section.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
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
          className="bg-green-50/50 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Aceptación de Términos
          </h3>
          <p className="text-gray-700 mb-6">
            Al completar el proceso de matrícula, usted acepta automáticamente estos términos y condiciones. 
            Recomendamos leer detenidamente toda la información antes de proceder.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Descargar PDF Completo
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors font-semibold"
            >
              Solicitar Clarificación
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              className="flex items-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              <FiArrowUp className="mr-2" />
              Volver al Inicio
            </motion.button>
          </div>
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