import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
}

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const slides: Slide[] = [
    { 
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80", 
      title: "Excelencia Educativa", 
      subtitle: "Formando líderes del mañana"
    },
    { 
      image: "https://images.unsplash.com/photo-1584697964358-3e14ca57658b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80", 
      title: "Inscripciones Abiertas", 
      subtitle: "Únete a nuestra familia educativa"
    },
    { 
      image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80", 
      title: "Instalaciones de Vanguardia", 
      subtitle: "Ambientes optimizados para el aprendizaje"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide();
    }
    if (touchStart - touchEnd < -50) {
      prevSlide();
    }
  };

  return (
    <div 
      className="relative w-full h-[60vh] min-h-[500px] -mt-28"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={containerRef}
    >
      <div className="absolute inset-0 z-0 w-full overflow-hidden">
        <div
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${currentSlide * (100 / slides.length)}%)`
          }}
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${slide.image}')`,
                flex: `0 0 ${100 / slides.length}%`
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-indigo-800/50"></div>
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-4 sm:px-6 lg:px-8 pt-32">
        <motion.div
          key={currentSlide}
          className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6"
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0] }}
          transition={{
            duration: 2,
            times: [0, 0.5, 1],
          }}
        >
          <h1 className="inline-block px-4 py-2 bg-black/50 rounded-md text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-2xl leading-tight">
            {slides[currentSlide].title}
            {slides[currentSlide].subtitle && (
              <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl text-blue-200 mt-2 sm:mt-4 drop-shadow-lg">
                {slides[currentSlide].subtitle}
              </span>
            )}
          </h1>
        </motion.div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 z-20 -translate-y-1/2 p-2 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/40 shadow-md h-8 w-8 sm:h-12 sm:w-12 flex items-center justify-center transition-all"
            aria-label="Slide anterior"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-900/80" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 z-20 -translate-y-1/2 p-2 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/40 shadow-md h-8 w-8 sm:h-12 sm:w-12 flex items-center justify-center transition-all"
            aria-label="Slide siguiente"
          >
            <FiArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-900/80" />
          </button>
          <div className="absolute bottom-8 sm:bottom-16 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 sm:h-3 transition-all duration-300 rounded-full ${
                  idx === currentSlide ? "bg-blue-400 w-4 sm:w-6" : "bg-white w-2 sm:w-3"
                }`}
                aria-label={`Ir al slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};