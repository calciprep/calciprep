import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { Link } from 'react-router-dom';
import { Calculator, BookOpenText, Keyboard, ArrowRight } from 'lucide-react';


const SubjectsSection = () => {
    const cardsWrapperRef = useRef(null);
    const illustrationRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger, Draggable);
        let cleanupFuncs = [];
        
        // Use a timeout to ensure the DOM is fully ready
        const timeoutId = setTimeout(() => {
            const container = containerRef.current;
            if (!container) return;
            
            let cards = gsap.utils.toArray(".subject-card");
            if(cards.length === 0) return;

            if (window.innerWidth < 1024) {
                // --- Mobile Swipe Animation using GSAP Draggable for smoothness ---
                let currentIndex = 0;
                const totalCards = cards.length;
                const topCardRotation = -4;

                const positionCards = (animated = true) => {
                    cards.forEach((card, i) => {
                        const positionIndex = (i - currentIndex + totalCards) % totalCards;
                        const isVisible = positionIndex < 3;
                        
                        if (!isVisible) {
                            gsap.set(card, { opacity: 0, scale: 0.8 });
                        }

                        gsap.to(card, {
                            y: positionIndex * 20,
                            rotation: positionIndex === 0 ? topCardRotation : (positionIndex === 1 ? 0 : 4),
                            zIndex: totalCards - positionIndex,
                            opacity: isVisible ? 1 : 0,
                            scale: 1 - positionIndex * 0.05,
                            duration: animated ? 0.4 : 0,
                            ease: 'power2.out'
                        });
                    });
                };

                positionCards(false);

                const draggables = cards.map((card) => Draggable.create(card, {
                    type: "x",
                    edgeResistance: 0.8,
                    onPress: function() {
                        this.wasDragged = false;
                    },
                    onDrag: function() {
                        this.wasDragged = true;
                        gsap.set(this.target, {
                            rotation: topCardRotation + (this.x / 20)
                        });
                    },
                    onDragEnd: function() {
                        const swipeThreshold = this.target.offsetWidth * 0.3;
                        
                        if (Math.abs(this.x) > swipeThreshold) {
                            this.disable();
                            const direction = this.x > 0 ? 1 : -1;

                            gsap.to(this.target, {
                                x: direction * (window.innerWidth / 2 + this.target.offsetWidth / 2),
                                opacity: 0,
                                rotation: direction * 25,
                                duration: 0.3,
                                ease: 'power2.in',
                                onComplete: () => {
                                    gsap.set(this.target, { x: 0, opacity: 1, rotation: 0 });

                                    if (direction < 0) { // Swiped left (next)
                                        currentIndex = (currentIndex + 1) % totalCards;
                                    } else { // Swiped right (previous)
                                        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
                                    }
                                    
                                    positionCards(true);

                                    if (draggables[currentIndex]) {
                                        draggables[currentIndex].enable();
                                    }
                                }
                            });
                        } else {
                            gsap.to(this.target, { x: 0, rotation: topCardRotation, duration: 0.4, ease: 'back.out(1.7)' });
                        }
                    },
                    allowEventDefault: true
                })[0]);

                draggables.forEach((d, i) => {
                    if (i !== currentIndex) d.disable();
                });

                const links = container.querySelectorAll('a.subject-card');
                links.forEach((link, i) => {
                    const clickHandler = (e) => {
                        if (draggables[i] && draggables[i].wasDragged) {
                            e.preventDefault();
                        }
                    };
                    link.addEventListener('click', clickHandler);
                    cleanupFuncs.push(() => link.removeEventListener('click', clickHandler));
                });

                cleanupFuncs.push(() => {
                    draggables.forEach(d => d.kill());
                });

            } else {
                // --- Desktop Hover Animation ---
                const illustration = illustrationRef.current;
                
                gsap.set(cards, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, margin: 'auto' });
                gsap.set(cards[0], { y: 0, rotation: -6, zIndex: 3 });
                gsap.set(cards[1], { y: 20, rotation: 2, zIndex: 2 });
                gsap.set(cards[2], { y: 40, rotation: 7, zIndex: 1 });
                if(illustration) gsap.set(illustration, { opacity: 1 });

                const tl = gsap.timeline({ paused: true, defaults: { ease: "back.out(1.4)", duration: 0.7 } });
                
                tl.to(illustration, { opacity: 0.2, duration: 0.5, ease: "power2.inOut" }, 0)
                  .to(cards, { x: (i) => (i - 1) * 380, y: -20, rotation: (i) => (i - 1) * -8 }, 0);
                  
                const enterHandler = () => tl.play();
                const leaveHandler = () => tl.reverse();
                container.addEventListener("mouseenter", enterHandler);
                container.addEventListener("mouseleave", leaveHandler);

                cards.forEach(card => {
                    const cardEnter = () => { if (tl.progress() > 0.9) gsap.to(card, { y: -40, scale: 1.05, duration: 0.3, ease: "power2.out" }); };
                    const cardLeave = () => { if (tl.progress() > 0.9) gsap.to(card, { y: -20, scale: 1, duration: 0.3, ease: "power2.out" }); };
                    card.addEventListener("mouseenter", cardEnter);
                    card.addEventListener("mouseleave", cardLeave);
                    cleanupFuncs.push(() => {
                        card.removeEventListener("mouseenter", cardEnter);
                        card.removeEventListener("mouseleave", cardLeave);
                    });
                });
                cleanupFuncs.push(() => {
                    if (container) {
                        container.removeEventListener("mouseenter", enterHandler);
                        container.removeEventListener("mouseleave", leaveHandler);
                    }
                });
            }
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            cleanupFuncs.forEach(func => func());
            gsap.killTweensOf(".subject-card");
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <section id="subjects" className="py-12 lg:py-20 bg-gray-50 overflow-hidden">
             <style>{`
                .subject-card { border: 1px solid #F3F4F6; border-radius: 1.5rem; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; }
                .subject-card[data-card="1"] { background-color: #F3E8FF; }
                .subject-card[data-card="2"] { background-color: #E0E7FF; }
                .subject-card[data-card="3"] { background-color: #FEF3C7; }
                @media (max-width: 1023px) { #cards-wrapper { position: relative; width: 100%; max-width: 340px; min-height: 520px; margin: 2rem auto 0; touch-action: pan-y; } #cards-wrapper .subject-card { position: absolute; transform-origin: bottom center; width: 100%; height: 450px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); } }
                @media (min-width: 1024px) { #subjects-interactive-container { position: relative; min-height: 500px; } #illustration-wrapper { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 100vw; height: 450px; z-index: 1; pointer-events: none; } #cards-wrapper { position: relative; z-index: 2; display: flex; justify-content: center; align-items: center; min-height: 450px; } #cards-wrapper .subject-card { position: absolute; width: 320px; height: 450px; box-shadow: 0 10px 20px rgba(0,0,0,0.08); transform-origin: center center; } }
            `}</style>
            <div className="container mx-auto px-6">
                <div id="subjects-interactive-container" ref={containerRef}>
                    <div ref={illustrationRef} id="illustration-wrapper" className="hidden lg:block">
                        <img id="subjects-illustration" src="/media/subjects-illustration.svg" alt="Subjects background illustration" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-20">
                        <div className="text-center max-w-2xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">Explore top <span className="text-red-500">subjects</span></h2>
                            <p className="text-gray-600 font-sans">We have the largest selection of subjects to study with our online gamified exercises.</p>
                        </div>
                        <div ref={cardsWrapperRef} id="cards-wrapper">
                            <Link to="/maths.html" className="subject-card" data-card="1">
                                <div className="p-8 text-center flex flex-col flex-grow">
                                    <div className="flex-shrink-0">
                                        <div className="bg-white/50 text-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                            <Calculator size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 text-gray-900">Maths Arena</h3>
                                        <p className="text-gray-600 text-sm font-sans">Sharpen your calculation speed and accuracy.</p>
                                    </div>
                                    <div className="mt-4 flex-grow flex justify-center items-center">
                                        <img src="/media/maths-card-illustration.svg" alt="Maths Arena Illustration" className="max-h-28 w-auto" />
                                    </div>
                                </div>
                                <div className="p-6 bg-white flex justify-between items-center flex-shrink-0">
                                    <span className="font-semibold text-gray-800">Explore</span>
                                    <ArrowRight />
                                </div>
                            </Link>
                            <Link to="/english.html" className="subject-card" data-card="2">
                                <div className="p-8 text-center flex flex-col flex-grow">
                                    <div className="flex-shrink-0">
                                        <div className="bg-white/50 text-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                            <BookOpenText size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 text-gray-900">English Mastery</h3>
                                        <p className="text-gray-600 text-sm font-sans">Master vocabulary with interactive quizzes.</p>
                                    </div>
                                    <div className="mt-4 flex-grow flex justify-center items-center">
                                        <img src="/media/english-card-illustration.svg" alt="English Mastery Illustration" className="max-h-28 w-auto" />
                                    </div>
                                </div>
                                <div className="p-6 bg-white flex justify-between items-center flex-shrink-0">
                                    <span className="font-semibold text-gray-800">Explore</span>
                                    <ArrowRight />
                                </div>
                            </Link>
                            <Link to="/typing-selection.html" className="subject-card" data-card="3">
                                <div className="p-8 text-center flex flex-col flex-grow">
                                    <div className="flex-shrink-0">
                                        <div className="bg-white/50 text-amber-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                            <Keyboard size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 text-gray-900">Typing Arena</h3>
                                        <p className="text-gray-600 text-sm font-sans">Improve typing speed with guided lessons.</p>
                                    </div>
                                    <div className="mt-4 flex-grow flex justify-center items-center">
                                        <img src="/media/typing-card-illustration.svg" alt="Typing Arena Illustration" className="max-h-28 w-auto" />
                                    </div>
                                </div>
                                <div className="p-6 bg-white flex justify-between items-center flex-shrink-0">
                                    <span className="font-semibold text-gray-800">Explore</span>
                                    <ArrowRight />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SubjectsSection;
