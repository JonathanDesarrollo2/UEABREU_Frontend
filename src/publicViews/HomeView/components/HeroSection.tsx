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
      image: "../../../../wp1.png", 
      title: "Excelencia Educativa", 
      subtitle: "Formando líderes del mañana"
    },
    { 
      image: "../../../../wp2.png", 
      title: "Inscripciones Abiertas", 
      subtitle: "Únete a nuestra familia educativa"
    },
    { 
      image: "../../../../wp3.png", 
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
      className="relative w-full h-[80vh] min-h-[600px] -mt-28 border-t-4 border-slate-200"
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
              className="w-full h-full"
              style={{
                flex: `0 0 ${100 / slides.length}%`
              }}
            >
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/1200x600/1e3a8a/ffffff?text=Imagen+No+Disponible';
                }}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-slate-800/40"></div>
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-4 sm:px-6 lg:px-8 pt-32">
        <motion.div
          key={currentSlide}
          className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8"
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0] }}
          transition={{
            duration: 2,
            times: [0, 0.5, 1],
          }}
        >
          <h1 className="inline-block px-6 py-4 bg-black/40 rounded-lg text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white drop-shadow-2xl leading-tight backdrop-blur-sm">
            {slides[currentSlide].title}
            {slides[currentSlide].subtitle && (
              <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-blue-200 mt-4 sm:mt-6 drop-shadow-lg">
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
            className="absolute left-4 sm:left-6 top-1/2 z-20 -translate-y-1/2 p-3 rounded-full bg-white/40 backdrop-blur-sm hover:bg-white/60 shadow-lg h-10 w-10 sm:h-14 sm:w-14 flex items-center justify-center transition-all border border-white/30"
            aria-label="Slide anterior"
          >
            <FiArrowLeft className="w-5 h-5 sm:w-7 sm:h-7 text-slate-900" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-6 top-1/2 z-20 -translate-y-1/2 p-3 rounded-full bg-white/40 backdrop-blur-sm hover:bg-white/60 shadow-lg h-10 w-10 sm:h-14 sm:w-14 flex items-center justify-center transition-all border border-white/30"
            aria-label="Slide siguiente"
          >
            <FiArrowRight className="w-5 h-5 sm:w-7 sm:h-7 text-slate-900" />
          </button>
          <div className="absolute bottom-8 sm:bottom-12 left-1/2 z-20 flex -translate-x-1/2 gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-3 sm:h-4 transition-all duration-300 rounded-full ${
                  idx === currentSlide ? "bg-blue-500 w-8 sm:w-10 shadow-lg" : "bg-white/80 w-3 sm:w-4 hover:bg-white"
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