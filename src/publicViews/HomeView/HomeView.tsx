import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { BenefitsSection } from './components/BenefitsSection';
import { FeaturesSection } from './components/FeaturesSection';
import { FAQSection } from './components/FAQSection';

const HomeView: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Si hay un hash en la URL (ej. #servicios), hacer scroll al elemento
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Pequeño retraso para asegurar que el DOM esté listo
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]); // Se ejecuta cada vez que cambia la ubicación (incluyendo hash)

  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ServicesSection />
        <BenefitsSection />
        <FeaturesSection />
        <FAQSection />
      </div>
    </div>
  );
};

export default HomeView;