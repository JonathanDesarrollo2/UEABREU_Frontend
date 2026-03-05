import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiUsers, FiAward, FiHome } from 'react-icons/fi';

export const ServicesSection: React.FC = () => {
  const services = [
    {
      title: "Educación Básica",
      description: "Formación integral desde primaria hasta bachillerato con énfasis en valores y disciplina.",
      icon: <FiBookOpen className="w-12 h-12" />
    },
    {
      title: "Formación en Valores",
      description: "Desarrollo del carácter y principios éticos para formar buenos ciudadanos.",
      icon: <FiUsers className="w-12 h-12" />
    },
    {
      title: "Preparación Universitaria",
      description: "Orientación vocacional y nivelación académica para ingresar a la educación superior.",
      icon: <FiAward className="w-12 h-12" />
    },
    {
      title: "Ambiente Familiar",
      description: "Espacios seguros y atención personalizada en un entorno de respeto y confianza.",
      icon: <FiHome className="w-12 h-12" />
    }
  ];

  return (
    <section id="servicios" className="py-16 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Nuestra Oferta Educativa
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Formación académica de calidad con valores y atención personalizada
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -5,
              }}
              className="bg-white p-6 rounded-xl border border-slate-200 text-center hover:shadow-md transition-all duration-300"
            >
              <div className="text-blue-700 mb-4 flex justify-center">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">{service.title}</h3>
              <p className="text-slate-600 leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};