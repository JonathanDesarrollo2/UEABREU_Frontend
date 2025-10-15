import React from 'react';
import { motion } from 'framer-motion';

export const FeaturesSection: React.FC = () => {
  const teachers = [
    {
      name: "María González",
      position: "Directora Académica",
      bio: "Más de 20 años de experiencia en educación con especialización en pedagogía infantil.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
    },
    {
      name: "Carlos Rodríguez",
      position: "Coordinador de Secundaria",
      bio: "Magister en Ciencias de la Educación con enfoque en innovación pedagógica.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
    },
    {
      name: "Ana Martínez",
      position: "Especialista en Inglés",
      bio: "Certificación internacional en enseñanza de inglés como segunda lengua.",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
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
          Nuestro Equipo Docente
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Contamos con profesionales altamente capacitados comprometidos con la excelencia educativa
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {teachers.map((teacher, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ 
              y: -10,
            }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="h-64 overflow-hidden">
              <img
                src={teacher.image}
                alt={teacher.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">{teacher.name}</h3>
              <p className="text-blue-600 text-lg font-medium mb-4">{teacher.position}</p>
              <p className="text-gray-600 text-lg leading-relaxed">{teacher.bio}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};