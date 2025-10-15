import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiUsers, FiAward, FiStar } from 'react-icons/fi';

export const ServicesSection: React.FC = () => {
  const services = [
    {
      title: "Educación Primaria",
      description: "Programa integral con enfoque en valores y desarrollo de habilidades básicas.",
      icon: <FiBookOpen className="w-12 h-12" />
    },
    {
      title: "Educación Secundaria",
      description: "Preparación académica sólida para estudios superiores y vida profesional.",
      icon: <FiUsers className="w-12 h-12" />
    },
    {
      title: "Actividades Extracurriculares",
      description: "Deportes, arte, música y clubes académicos para desarrollo integral.",
      icon: <FiAward className="w-12 h-12" />
    },
    {
      title: "Programas Especializados",
      description: "Enfoques pedagógicos innovadores y atención personalizada.",
      icon: <FiStar className="w-12 h-12" />
    }
  ];

  return (
    <section className="py-20">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Nuestros Servicios Educativos
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Ofrecemos una educación integral que prepara a los estudiantes para los desafíos del futuro
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ 
              y: -10,
              scale: 1.02,
            }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300"
          >
            <div className="text-blue-700 mb-6 flex justify-center">
              {service.icon}
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">{service.title}</h3>
            <p className="text-gray-600 text-lg leading-relaxed">{service.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};