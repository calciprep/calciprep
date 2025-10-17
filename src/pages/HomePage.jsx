import React from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSection from '../features/home/HeroSection';
import SubjectsSection from '../features/home/SubjectsSection';
import FeaturesSection from '../features/home/FeaturesSection';
import ContactSection from '../features/home/ContactSection';

const HomePage = () => {
  return (
    <>
       <Helmet>
        <title>CalciPrep - Gamified Learning for Competitive Exams</title>
        <meta name="description" content="Practice smarter for competitive exams with CalciPrep. Master Maths, English vocabulary, and typing with gamified challenges and progress tracking to solve faster and achieve more." />
      </Helmet>
      <HeroSection />
      <SubjectsSection />
      <FeaturesSection />
      <ContactSection />
    </>
  );
};

export default HomePage;

