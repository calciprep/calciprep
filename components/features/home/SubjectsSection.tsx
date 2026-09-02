"use client";

import React, { useEffect, useRef, useContext, ElementType } from 'react'; // Added ElementType
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image'; // Import StaticImageData
import { Calculator, BookOpenText, Keyboard, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LenisContext } from '@/components/common/LenisProvider';

// Import local assets
import mathsIllustration from '@/public/media/maths-card-illustration.svg';
import englishIllustration from '@/public/media/english-card-illustration.svg';
import typingIllustration from '@/public/media/typing-card-illustration.svg';
import subjectsIllustration from '@/public/media/subjects-illustration.svg';

// Specify Icon type more precisely and illustration type
type SubjectData = {
    link: string;
    bgColor: string;
    iconColor: string;
    Icon: ElementType; // Use ElementType for component types
    title: string;
    desc: string;
    illustration: StaticImageData | string; // Use StaticImageData or string for src
};

const SubjectCard = ({ subject }: { subject: 'maths' | 'english' | 'typing' }) => {
    // Explicitly type the content object
    const content: Record<'maths' | 'english' | 'typing', SubjectData> = {
        maths: {
            link: "/maths",
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600",
            Icon: Calculator,
            title: "Maths Arena",
            desc: "Sharpen your calculation speed and accuracy.",
            illustration: mathsIllustration
        },
        english: {
            link: "/english",
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
            Icon: BookOpenText,
            title: "English Mastery",
            desc: "Master vocabulary with interactive quizzes.",
            illustration: englishIllustration
        },
        typing: {
            link: "/typing",
            bgColor: "bg-amber-100",
            iconColor: "text-amber-600",
            Icon: Keyboard,
            title: "Typing Arena",
            desc: "Improve typing speed with guided lessons.",
            illustration: typingIllustration
        }
    };

    const item = content[subject];
    const IconComponent = item.Icon; // Store component type in a variable

    return (
        <div className="card-wrapper">
            <Link href={item.link} className={`subject-card block shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-hidden ${item.bgColor}`}>
                <div className="p-8 text-center flex flex-col h-full">
                    <div className="flex-shrink-0">
                        <div className={`bg-white/50 ${item.iconColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto`}>
                            {/* Render the icon component */}
                            <IconComponent size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                        <p className="text-gray-600 text-sm font-sans">{item.desc}</p>
                    </div>
                    <div className="mt-4 flex-grow flex justify-center items-center">
                        <Image src={item.illustration} alt={`${item.title} Illustration`} className="max-h-28 w-auto" />
                    </div>
                    <div className="mt-auto pt-6 bg-white -m-8 px-8 py-6 flex justify-between items-center flex-shrink-0">
                        <span className="font-semibold text-gray-800">Explore</span>
                        <ArrowRight className="text-gray-600" />
                    </div>
                </div>
            </Link>
        </div>
    );
};

const SubjectsSection = () => {
    const sectionRef = useRef<HTMLElement>(null); // Type the ref
    const lenis = useContext(LenisContext);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Add null check for lenis
        if (lenis) {
            // Function to update ScrollTrigger on Lenis scroll
            const updateScrollTrigger = () => ScrollTrigger.update();
            lenis.on('scroll', updateScrollTrigger);
            // Cleanup function to remove listener
            return () => {
                lenis.off('scroll', updateScrollTrigger);
            };
        }
    }, [lenis]); // Re-run effect if lenis instance changes


    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        // Ensure GSAP context for proper cleanup
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray<Element>('.subject-card-grid .card-wrapper'); // Type the array elements

            cards.forEach((card, index) => {
                let side = index % 2 === 0 ? -1 : 1;
                let originX = '0%';
                if(cards.length > 1) {
                    originX = index === 0 ? '25vw' : (index === cards.length - 1 ? '-25vw' : '0%');
                    if(index === 0) side = -1;
                    if(index === cards.length -1) side = 1;
                }

                gsap.fromTo(card, {
                    autoAlpha: 0,
                    scale: 0.85,
                    rotate: side * 5,
                    y: 30,
                    transformOrigin: `${originX} 100%`,
                }, {
                    autoAlpha: 1,
                    scale: 1,
                    rotate: 0,
                    y: 0,
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 95%',
                        end: 'top 60%',
                        scrub: 1.5,
                    }
                });
            });
        }, section); // Scope animations to the section

        // Cleanup GSAP context and ScrollTriggers
        return () => ctx.revert();

    }, []); // Run only once on mount


    return (
        <section id="subjects" ref={sectionRef} className="py-12 lg:py-20 bg-gray-50 overflow-x-clip">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">Explore Skill Based  <span className="text-red-500">subjects</span></h2>
                    <p className="text-gray-600 font-sans">We have the best selection of subjects to study with our online gamified exercises.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="hidden lg:flex justify-center items-center">
                        <Image src={subjectsIllustration} alt="Subjects illustration" className="w-full max-w-lg h-auto" />
                    </div>

                    <div className="subject-card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <SubjectCard subject="maths" />
                        <SubjectCard subject="english" />
                        <SubjectCard subject="typing" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SubjectsSection;

