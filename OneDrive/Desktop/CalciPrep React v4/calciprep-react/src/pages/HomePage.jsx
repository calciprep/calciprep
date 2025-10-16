import React from 'react';
import HeroSection from '../features/home/HeroSection';
import SubjectsSection from '../features/home/SubjectsSection';
import FeaturesSection from '../features/home/FeaturesSection';
import ContactSection from '../features/home/ContactSection';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <SubjectsSection />
      <FeaturesSection />
      <ContactSection />
    </>
  );
};

export default HomePage;

