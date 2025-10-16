import React from 'react';
import { Link } from 'react-router-dom';
import { X, Send, Youtube } from 'lucide-react';

const Footer = () => {

  const handleSmoothScroll = (e, targetId) => {
    const targetElement = document.getElementById(targetId);
    
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
      // Let the Link component handle navigation to home page first
      return; 
    }
    
    e.preventDefault();
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else if (targetId === 'home') {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 text-gray-600">
          <div>
            <img src="/media/New-logo.svg" alt="CalciPrep Logo" className="h-8 mb-4" />
            <p className="text-sm font-sans">
              Gamified learning for competitive exams. Solve faster, achieve more.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800" style={{fontFamily: "'Work Sans', sans-serif"}}>Quick Links</h3>
            <ul className="space-y-2 text-sm font-sans">
              <li><Link to="/#home" onClick={(e) => handleSmoothScroll(e, 'home')} className="hover:text-gray-900">Home</Link></li>
              <li><Link to="/#subjects" onClick={(e) => handleSmoothScroll(e, 'subjects')} className="hover:text-gray-900">Subjects</Link></li>
              <li><Link to="/#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="hover:text-gray-900">Features</Link></li>
              <li><Link to="/#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800" style={{fontFamily: "'Work Sans', sans-serif"}}>Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://x.com/calciprep?s=21" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900"><X /></a>
              <a href="https://t.me/+ROdUqD-NYTkyMTY1" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900"><Send /></a>
              <a href="#" className="hover:text-gray-900"><Youtube /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-8 pt-6 text-center text-gray-500 text-sm font-sans">
          <p>&copy; 2024 CalciPrep. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

