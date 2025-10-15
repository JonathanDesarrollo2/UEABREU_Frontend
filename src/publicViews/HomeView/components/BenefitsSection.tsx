import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiShield, FiUsers, FiTool, FiHeart, FiGlobe } from 'react-icons/fi';

export const BenefitsSection: React.FC = () => {
  const advantages = [
    {
      text: "Instalaciones modernas y seguras",
      icon: <FiShield className="w-8 h-8" />
    },
    {
      text: "Profesores altamente calificados",
      icon: <FiUsers className="w-8 h-8" />
    },
    {
      text: "Atención personalizada a cada estudiante",
      icon: <FiTool className="w-8 h-8" />
    },
    {
      text: "Tecnología integrada en el aprendizaje",
      icon: <FiCheck className="w-8 h-8" />
    },
    {
      text: "Programas de valores y desarrollo humano",
      icon: <FiHeart className="w-8 h-8" />
    },
    {
      text: "Preparación para universidades nacionales e internacionales",
      icon: <FiGlobe className="w-8 h-8" />
    }
  ];

  return (
    <section className="w-screen left-1/2 -translate-x-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 py-24">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ventajas Competitivas
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Descubre por qué somos la mejor opción educativa para el futuro de tus hijos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
              }}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
                  <div className="text-white">
                    {advantage.icon}
                  </div>
                </div>
                <p className="text-white text-lg font-medium leading-relaxed">
                  {advantage.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};