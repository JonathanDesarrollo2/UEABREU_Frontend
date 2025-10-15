import React from 'react';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { BenefitsSection } from './components/BenefitsSection';
import { FeaturesSection } from './components/FeaturesSection';
import { FAQSection } from './components/FAQSection';

const HomeView: React.FC = () => {
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