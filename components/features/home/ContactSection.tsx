"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Mail, Phone, Loader2 } from 'lucide-react';
import Image from 'next/image';
import contactIllustration from '@/public/media/contact-illustration.svg';
import { useAuth } from '@/contexts/AuthContext'; // To show notifications

type FormInputs = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const ContactSection = () => {
    const { showNotification } = useAuth();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Your message has been sent successfully!', 'success');
                reset();
            } else {
                showNotification(result.error || 'Failed to send message. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showNotification('An unexpected error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="contact" className="py-20 bg-gray-50 relative overflow-hidden">
             <style jsx>{`.gradient-text { background: linear-gradient(90deg, #8B5CF6, #6366F1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }`}</style>
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">Get in <span className="gradient-text">Touch</span></h2>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 font-sans">Have questions? We would love to hear from you. Send us a message and we will respond as soon as possible.</p>
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 justify-center lg:justify-start">
                                <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900" style={{fontFamily: "var(--font-oswald)"}}>Email</h3>
                                    <p className="text-gray-500 font-sans">contact@calciprep.online</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 justify-center lg:justify-start">
                                <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900" style={{fontFamily: "var(--font-oswald)"}}>Phone</h3>
                                    <p className="text-gray-500 font-sans">+91-XXXXXXXXXX</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-lg">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-5">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 font-sans">Your Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    placeholder="John Doe" 
                                    {...register('name', { required: 'Name is required' })}
                                    className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-sans" 
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>
                            <div className="mb-5">
                                <label htmlFor="email-contact" className="block text-sm font-medium text-gray-700 mb-1 font-sans">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email-contact" 
                                    placeholder="john@example.com" 
                                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })}
                                    className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-sans" 
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                            <div className="mb-5">
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1 font-sans">Subject</label>
                                <input 
                                    type="text" 
                                    id="subject" 
                                    placeholder="What is this about?" 
                                    {...register('subject', { required: 'Subject is required' })}
                                    className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-sans" 
                                />
                                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                            </div>
                            <div className="mb-6">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 font-sans">Message</label>
                                <textarea 
                                    id="message" 
                                    placeholder="How can we help?" 
                                    rows={4} 
                                    {...register('message', { required: 'Message is required' })}
                                    className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-sans"
                                ></textarea>
                                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold transition-opacity hover:opacity-90 font-sans flex items-center justify-center disabled:opacity-50">
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-0 hidden lg:block w-full max-w-6xl">
                <Image src={contactIllustration} alt="Contact Illustration" className="w-full h-auto" />
            </div>
        </section>
    );
};

export default ContactSection;
