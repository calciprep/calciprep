import React from 'react';
import { Mail, Phone } from 'lucide-react';

const ContactSection = () => {
    return (
        <section id="contact" className="py-20 bg-gray-50 relative overflow-hidden">
             <style>{`.gradient-text { background: linear-gradient(90deg, #8B5CF6, #6366F1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }`}</style>
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">Get in <span className="gradient-text">Touch</span></h2>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 font-sans">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 justify-center lg:justify-start">
                                <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900" style={{fontFamily: "'Work Sans', sans-serif"}}>Email</h3>
                                    <p className="text-gray-500 font-sans">contact@calciprep.online</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 justify-center lg:justify-start">
                                <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900" style={{fontFamily: "'Work Sans', sans-serif"}}>Phone</h3>
                                    <p className="text-gray-500 font-sans">+91-XXXXXXXXXX</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-lg">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="mb-5">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 font-sans">Your Name</label>
                                <input type="text" id="name" placeholder="John Doe" className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-sans" />
                            </div>
                            <div className="mb-5">
                                <label htmlFor="email-contact" className="block text-sm font-medium text-gray-700 mb-1 font-sans">Email Address</label>
                                <input type="email" id="email-contact" placeholder="john@example.com" className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-sans" />
                            </div>
                            <div className="mb-5">
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1 font-sans">Subject</label>
                                <input type="text" id="subject" placeholder="What is this about?" className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-sans" />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 font-sans">Message</label>
                                <textarea id="message" placeholder="How can we help?" rows="4" className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-sans"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold transition-opacity hover:opacity-90 font-sans">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-0 hidden lg:block w-full max-w-6xl">
                <img src="/media/contact-illustration.svg" alt="Contact Illustration" className="w-full h-auto" />
            </div>
        </section>
    );
};

export default ContactSection;

