"use client";

import React, { useEffect, useRef, useContext, ElementType } from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
// Swapped Zap for RadioTower
import { Calculator, BookOpenText, Keyboard, ArrowRight, RadioTower } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LenisContext } from '@/components/common/LenisProvider';

// Import local assets
import mathsIllustration from '@/public/media/maths-card-illustration.svg';
import englishIllustration from '@/public/media/english-card-illustration.svg';
import typingIllustration from '@/public/media/typing-card-illustration.svg';
import liveTestsIllustration from '@/public/media/live-tests-card-illustration.svg';

type SubjectData = {
    link: string;
    bgColor: string;
    iconColor: string;
    Icon: ElementType; 
    title: string;
    desc: string;
    illustration: StaticImageData | string | any; 
};

const SubjectCard = ({ subject }: { subject: 'maths' | 'english' | 'typing' | 'livetests' }) => {
    const content: Record<'maths' | 'english' | 'typing' | 'livetests', SubjectData> = {
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
        },
        // UPDATED: Bright Red Colors and RadioTower Icon
        livetests: {
            link: "/live-tests",
            bgColor: "bg-red-100",
            iconColor: "text-red-600",
            Icon: RadioTower,
            title: "Live Tests",
            desc: "Compete in real-time with peers pan-India.",
            illustration: liveTestsIllustration 
        }
    };

    const item = content[subject];
    const IconComponent = item.Icon; 

    return (
        <div className="card-wrapper h-full">
            <Link href={item.link} className={`subject-card flex flex-col shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-hidden ${item.bgColor} h-full`}>
                <div className="p-8 text-center flex flex-col h-full">
                    <div className="flex-shrink-0">
                        <div className={`bg-white/50 ${item.iconColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto`}>
                            <IconComponent size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                        <p className="text-gray-600 text-sm font-sans">{item.desc}</p>
                    </div>
                    
                    <div className="mt-6 mb-4 flex-grow flex justify-center items-center">
                        <Image src={item.illustration} alt={`${item.title} Illustration`} className="max-h-32 w-auto drop-shadow-sm" />
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
    const sectionRef = useRef<HTMLElement>(null); 
    const lenis = useContext(LenisContext);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        if (lenis) {
            const updateScrollTrigger = () => ScrollTrigger.update();
            lenis.on('scroll', updateScrollTrigger);
            return () => {
                lenis.off('scroll', updateScrollTrigger);
            };
        }
    }, [lenis]); 

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray<Element>('.subject-card-grid .card-wrapper'); 

            cards.forEach((card, index) => {
                let side = index % 2 === 0 ? -1 : 1;
                
                gsap.fromTo(card, {
                    autoAlpha: 0,
                    scale: 0.85,
                    rotate: side * 3, // Slight alternating tilt
                    y: 40,
                    transformOrigin: '50% 100%',
                }, {
                    autoAlpha: 1,
                    scale: 1,
                    rotate: 0,
                    y: 0,
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 95%',
                        end: 'top 70%',
                        scrub: 1.5,
                    }
                });
            });
        }, section); 

        return () => ctx.revert();
    }, []); 

    return (
        <section id="subjects" ref={sectionRef} className="py-16 lg:py-24 bg-gray-50 overflow-x-clip">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900" style={{fontFamily: 'var(--font-oswald)'}}>
                        Explore Skill Based <span className="text-red-500">Subjects</span>
                    </h2>
                    <p className="text-gray-600 font-sans text-lg">
                        We have the best selection of subjects to study with our online gamified exercises.
                    </p>
                </div>

                <div className="subject-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    <SubjectCard subject="maths" />
                    <SubjectCard subject="english" />
                    <SubjectCard subject="typing" />
                    <SubjectCard subject="livetests" />
                </div>
            </div>
        </section>
    );
};

export default SubjectsSection;