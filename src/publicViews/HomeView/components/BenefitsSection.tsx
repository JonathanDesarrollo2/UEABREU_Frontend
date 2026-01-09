import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiUser, FiBook, FiHeart, FiAward, FiHome } from 'react-icons/fi';

export const BenefitsSection: React.FC = () => {
  const advantages = [
    {
      text: "Educación basada en valores cristianos",
      icon: <FiHeart className="w-6 h-6" />
    },
    {
      text: "Profesores comprometidos y capacitados",
      icon: <FiUser className="w-6 h-6" />
    },
    {
      text: "Plan de estudios actualizado y completo",
      icon: <FiBook className="w-6 h-6" />
    },
    {
      text: "Atención personalizada a cada estudiante",
      icon: <FiCheck className="w-6 h-6" />
    },
    {
      text: "Ambiente seguro y familiar",
      icon: <FiHome className="w-6 h-6" />
    },
    {
      text: "Preparación para la educación superior",
      icon: <FiAward className="w-6 h-6" />
    }
  ];

  return (
    <section className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-gradient-to-br from-blue-800 to-blue-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Por Qué Elegirnos?
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">
            Más de 20 años formando jóvenes íntegros y preparados para el futuro
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0 mt-1">
                  <div className="text-white">
                    {advantage.icon}
                  </div>
                </div>
                <p className="text-white text-base font-medium leading-relaxed">
                  {advantage.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-blue-100 text-lg italic">
            "Formando líderes del mañana con educación de calidad y valores cristianos"
          </p>
        </motion.div>
      </div>
    </section>
  );
};