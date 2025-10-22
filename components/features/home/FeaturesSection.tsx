"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GraduationCap, BarChart3, Award } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

const FeaturesSection = () => {
  const cardLineRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const scannerCanvasRef = useRef<HTMLCanvasElement>(null);
  const featuresSectionRef = useRef<HTMLElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const featuresSection = featuresSectionRef.current;
    // Added null checks for refs
    if (!featuresSection || typeof THREE === 'undefined' || !cardLineRef.current || !particleCanvasRef.current || !scannerCanvasRef.current) return;

    const cleanupFuncs: (()=>void)[] = [];

    const cardData = [
        { icon: <GraduationCap size={24} color="#fda4af" />, title: "Maths Classes" },
        { icon: <BarChart3 size={24} color="#7dd3fc" />, title: "Advanced Analytics" },
        { icon: <Award size={24} color="#86efac" />, title: "Achievements & Badges" }
    ];

    const cardLine = cardLineRef.current;
    const particleCanvas = particleCanvasRef.current;
    const scannerCanvas = scannerCanvasRef.current;

    // --- Forward declare variables that will hold instances ---
    // We declare them here so they are accessible within the class methods' scope
    let particleScannerInstanceForMethods: ParticleScanner | null = null;

    class CardStreamController {
        cardLine: HTMLDivElement;
        position: number;
        velocity: number;
        direction: number;
        isAnimating: boolean;
        lastTime: number;
        cardLineWidth: number;

        constructor() {
            this.cardLine = cardLine;
            this.position = 0;
            this.velocity = 60;
            this.direction = -1;
            this.isAnimating = false;
            this.lastTime = 0;
            this.cardLineWidth = 0;
            this.init();
        }

        init() {
            this.populateCardLine();
            this.calculateDimensions();
            ScrollTrigger.create({
                trigger: "#features",
                start: "top bottom",
                end: "bottom top",
                onEnter: () => this.startAnimation(),
                onLeave: () => this.stopAnimation(),
                onEnterBack: () => this.startAnimation(),
                onLeaveBack: () => this.stopAnimation()
            });
            this.animate = this.animate.bind(this);
            const boundCalc = this.calculateDimensions.bind(this);
            window.addEventListener("resize", boundCalc);
            cleanupFuncs.push(() => window.removeEventListener("resize", boundCalc));
        }

        startAnimation() {
            this.isAnimating = true;
            this.lastTime = performance.now();
            // Use the instance variable assigned outside the class
            if (particleScannerInstanceForMethods) particleScannerInstanceForMethods.isAnimating = true;
        }

        stopAnimation() {
            this.isAnimating = false;
             // Use the instance variable assigned outside the class
            if (particleScannerInstanceForMethods) particleScannerInstanceForMethods.isAnimating = false;
        }

        calculateDimensions() {
            if (!this.cardLine.children[0]) return;
            this.cardLineWidth = (this.cardLine.children[0].getBoundingClientRect().width + 40) * this.cardLine.children.length;
        }

        animate() {
            if (this.isAnimating) {
                const now = performance.now();
                const dt = (now - this.lastTime) / 1000;
                this.lastTime = now;
                this.position += this.velocity * this.direction * dt;
                this.updateCardPosition();
            }
             // Always request the next frame to keep the loop going
            animationFrameId.current = requestAnimationFrame(this.animate);
        }

        updateCardPosition() {
            if (this.cardLineWidth === 0) return;
            // Loop the position
            if (this.position < -this.cardLineWidth / 2) this.position += this.cardLineWidth / 2;
            if (this.position > 0) this.position -= this.cardLineWidth / 2;
            this.cardLine.style.transform = `translateX(${this.position}px)`;
            this.updateCardClipping();
        }

        generateCode(w: number, h: number) {
            const c = "abcdefghijklmnopqrstuvwxyz0123456789{}[]<>;:._-+=!@#$*|";
            let o = "";
            const effectiveWidth = Math.floor(w / 2); // Characters per line approx
            const totalChars = effectiveWidth * h;
            for (let i = 0; i < totalChars; i++) {
                o += c[Math.floor(Math.random() * c.length)] + ' ';
                if ((i + 1) % effectiveWidth === 0 && i < totalChars - 1) {
                    o += '\n';
                }
            }
            return o;
        }

        createCardWrapper(i: number) {
            const info = cardData[i % cardData.length];
            const w = document.createElement("div");
            w.className = "beam-card-wrapper";
            const iconHtml = ReactDOMServer.renderToString(info.icon);
            w.innerHTML = `
              <div class="beam-card beam-card-normal p-6 flex flex-col">
                <div class="flex-shrink-0">
                  <div class="bg-gray-800/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    ${iconHtml}
                  </div>
                  <h3 class="text-xl font-bold mb-2 text-white">${info.title}</h3>
                </div>
                <div class="mt-auto pt-4 text-gray-500 font-semibold text-sm">Coming Soon</div>
              </div>
              <div class="beam-card beam-card-ascii">
                <pre class="ascii-content">${this.generateCode(66, 20)}</pre>
              </div>
            `;
            return w;
        }

        populateCardLine() {
          // Avoid duplicating cards if already populated (e.g., due to React StrictMode double render)
          if (this.cardLine.children.length > 0) return;
          const fragment = document.createDocumentFragment();
          // Create double the number needed to cover the screen for seamless looping
          for (let i = 0; i < 12; i++) { // Increased card count for better looping coverage
            fragment.appendChild(this.createCardWrapper(i));
          }
          this.cardLine.appendChild(fragment);
          this.calculateDimensions(); // Calculate width after population
        }

        updateCardClipping() {
            const scannerX = window.innerWidth / 2;
            let anyActive = false;
            this.cardLine.querySelectorAll<HTMLElement>(".beam-card-wrapper").forEach((w) => {
                const r = w.getBoundingClientRect();
                const nc = w.querySelector<HTMLElement>(".beam-card-normal");
                const ac = w.querySelector<HTMLElement>(".beam-card-ascii");
                if (!nc || !ac) return;

                const cardCenterX = r.left + r.width / 2;
                const distance = Math.abs(scannerX - cardCenterX);
                const isActive = distance < r.width / 2; // Check if scanner is within the card

                if (isActive) {
                    anyActive = true;
                    const clipPercent = Math.max(0, Math.min(100, ((scannerX - r.left) / r.width) * 100));
                    nc.style.setProperty("--clip-right", `${clipPercent}%`);
                    ac.style.setProperty("--clip-left", `${clipPercent}%`);
                } else if (r.right < scannerX) { // Card is fully to the left of scanner
                    nc.style.setProperty("--clip-right", "100%");
                    ac.style.setProperty("--clip-left", "100%");
                } else { // Card is fully to the right of scanner
                    nc.style.setProperty("--clip-right", "0%");
                    ac.style.setProperty("--clip-left", "0%");
                }
            });
             // Use the instance variable assigned outside the class
            if (particleScannerInstanceForMethods) particleScannerInstanceForMethods.setScanningActive(anyActive);
        }
    }

    class ParticleScanner {
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        w: number;
        h: number;
        lightBarX: number;
        scanningActive: boolean;
        isAnimating: boolean;
        glow: number;
        speed: number;

        constructor() {
            this.canvas = scannerCanvas;
            const context = this.canvas.getContext("2d");
            if (!context) throw new Error('Could not get 2d context');
            this.ctx = context;
            this.w = window.innerWidth;
            this.h = 300;
            this.lightBarX = this.w / 2;
            this.scanningActive = false;
            this.isAnimating = false; // Start paused
            this.glow = 1;
            this.speed = 0.05; // Smoothing factor for glow transition
            this.setupCanvas();
            this.animate = this.animate.bind(this);
            const boundResize = this.onResize.bind(this);
            window.addEventListener("resize", boundResize);
            cleanupFuncs.push(() => window.removeEventListener("resize", boundResize));
        }

        setupCanvas() {
            this.canvas.width = this.w;
            this.canvas.height = this.h;
        }

        onResize() {
            this.w = window.innerWidth;
            this.lightBarX = this.w / 2;
            this.setupCanvas();
        }

        setScanningActive(active: boolean) {
            this.scanningActive = active;
        }

        animate() {
            // Only render if animating
            if (this.isAnimating) {
                this.render();
            }
             // Always request the next frame to keep the loop going
            animationFrameId.current = requestAnimationFrame(this.animate);
        }

        render() {
            this.ctx.clearRect(0, 0, this.w, this.h);

            // Smoothly transition glow effect
            const targetGlow = this.scanningActive ? 3.5 : 1;
            this.glow += (targetGlow - this.glow) * this.speed;

            // Draw radial gradient for the glow
            const grad = this.ctx.createRadialGradient(this.lightBarX, this.h / 2, 0, this.lightBarX, this.h / 2, 40 * this.glow);
            grad.addColorStop(0, `rgba(167, 139, 250, ${0.4 * Math.min(1, this.glow / 2)})`); // Adjusted opacity
            grad.addColorStop(0.5, `rgba(167, 139, 250, ${0.1 * Math.min(1, this.glow / 2)})`); // Adjusted opacity
            grad.addColorStop(1, "rgba(167, 139, 250, 0)");
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(this.lightBarX - 40 * this.glow, 0, 80 * this.glow, this.h);

            // Draw the core light bar
            const coreGrad = this.ctx.createLinearGradient(this.lightBarX - 1, 0, this.lightBarX + 1, 0);
            coreGrad.addColorStop(0, "rgba(255,255,255,0)");
            coreGrad.addColorStop(0.5, `rgba(255,255,255,${this.scanningActive ? Math.min(1, 0.6 * this.glow) : 0.5})`); // Adjusted opacity
            coreGrad.addColorStop(1, "rgba(255,255,255,0)");
            this.ctx.fillStyle = coreGrad;
            this.ctx.fillRect(this.lightBarX - 1.5, 0, 3, this.h);
        }
    }

    class ParticleSystem {
        scene: THREE.Scene;
        camera: THREE.OrthographicCamera;
        renderer: THREE.WebGLRenderer;
        pCount: number;
        vel: Float32Array;
        particles: THREE.Points | null = null;

        constructor() {
            this.scene = new THREE.Scene();
            const initialWidth = featuresSection?.offsetWidth || window.innerWidth;
            const initialHeight = featuresSection?.offsetHeight || window.innerHeight;

            this.camera = new THREE.OrthographicCamera(initialWidth / -2, initialWidth / 2, initialHeight / 2, initialHeight / -2, 1, 1000);
            this.camera.position.z = 100; // Position camera further back

            this.renderer = new THREE.WebGLRenderer({ canvas: particleCanvas, alpha: true });
            this.renderer.setSize(initialWidth, initialHeight);
            this.renderer.setClearColor(0x000000, 0); // Transparent background

            this.pCount = 5000;
            this.vel = new Float32Array(this.pCount);
            this.createParticles();
            this.animate = this.animate.bind(this);
            const boundResize = this.onResize.bind(this);
            window.addEventListener("resize", boundResize);
            cleanupFuncs.push(() => window.removeEventListener("resize", boundResize));
        }

        createParticles() {
            if (!featuresSection) return;
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array(this.pCount * 3);
            const opacities = new Float32Array(this.pCount); // For varying opacity

            // FIX: Remove unused variables
            // const halfWidth = featuresSection.offsetWidth / 2;
            // const halfHeight = featuresSection.offsetHeight / 2;

            for (let i = 0; i < this.pCount; i++) {
                // Distribute particles across a wider horizontal area initially
                pos[i * 3] = (Math.random() - 0.5) * featuresSection.offsetWidth * 1.5;
                pos[i * 3 + 1] = (Math.random() - 0.5) * featuresSection.offsetHeight;
                pos[i * 3 + 2] = 0; // z-position
                this.vel[i] = Math.random() * 0.3 + 0.1; // Random speed
                opacities[i] = Math.random() * 0.4 + 0.1; // Random initial opacity (0.1 to 0.5)
            }

            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('alpha', new THREE.BufferAttribute(opacities, 1)); // Add alpha attribute

            // Use ShaderMaterial for more control
             const vertexShader = `
                attribute float alpha;
                varying float vAlpha;
                void main() {
                    vAlpha = alpha;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 1.0; // Smaller points
                }
            `;
            const fragmentShader = `
                varying float vAlpha;
                void main() {
                    gl_FragColor = vec4(0.54, 0.17, 0.89, vAlpha); // Violet color (0x8A2BE2)
                }
            `;

            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                transparent: true,
                depthWrite: false, // Don't write to depth buffer for transparency
                blending: THREE.AdditiveBlending // Additive blending for glow effect
            });


            this.particles = new THREE.Points(geo, material);
            this.scene.add(this.particles);
        }

        animate() {
             // Always request the next frame
            animationFrameId.current = requestAnimationFrame(this.animate);
            if (!this.particles || !this.renderer || !featuresSection) return;

            const pos = this.particles.geometry.attributes.position.array as Float32Array;
            const sectionWidth = featuresSection.offsetWidth;
            const wrapThreshold = sectionWidth / 2 + 50; // Point to wrap around

            for (let i = 0; i < this.pCount; i++) {
                pos[i * 3] += this.vel[i]; // Move particle
                // Wrap particle around if it goes off screen
                if (pos[i * 3] > wrapThreshold) {
                    pos[i * 3] = -wrapThreshold; // Move to the left edge
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
            this.renderer.render(this.scene, this.camera);
        }

        onResize() {
            if (!this.renderer || !featuresSection) return;
            const { offsetWidth, offsetHeight } = featuresSection;
            // Update camera projection based on new dimensions
            this.camera.left = offsetWidth / -2;
            this.camera.right = offsetWidth / 2;
            this.camera.top = offsetHeight / 2;
            this.camera.bottom = offsetHeight / -2;
            this.camera.updateProjectionMatrix();
            // Resize renderer
            this.renderer.setSize(offsetWidth, offsetHeight);
        }
    }

    // --- Instantiate classes using const ---
    const cardStreamControllerInstance = new CardStreamController();
    const particleSystemInstance = new ParticleSystem();
    const particleScannerInstance = new ParticleScanner();

    // Assign to the forward-declared variable so class methods can access it
    particleScannerInstanceForMethods = particleScannerInstance;

    // --- Start animation loops ---
    cardStreamControllerInstance.animate();
    particleSystemInstance.animate();
    particleScannerInstance.animate();

    // GSAP animation for text intro
    gsap.set("#features-text-wrapper > *", { opacity: 1, y: 0, x: 0 }); // Ensure initial state is correct if re-running
    const featuresTl = gsap.timeline({
        scrollTrigger: {
            trigger: featuresSection,
            start: "top 70%",
            toggleActions: "play none none reverse"
        }
    });
    featuresTl.from("#features-text-wrapper > *", {
        y: 50,
        x: -50, // Added slight x movement
        opacity: 0,
        stagger: 0.1,
        ease: "power2.out",
        duration: 0.6
    });

    // Cleanup function
    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        cleanupFuncs.forEach(func => func()); // Run all cleanup functions (event listeners etc.)
        ScrollTrigger.getAll().forEach(trigger => trigger.kill()); // Kill GSAP ScrollTriggers
        // Optional: Dispose Three.js resources if needed
        particleSystemInstance?.renderer?.dispose();
        particleSystemInstance?.particles?.geometry?.dispose();
        (particleSystemInstance?.particles?.material as THREE.Material)?.dispose();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <section ref={featuresSectionRef} id="features" className="py-20 relative overflow-hidden bg-black text-white">
      {/* Styles remain the same */}
      <style>{`
         #features .gradient-text { background: linear-gradient(90deg, #A78BFA, #38BDF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;}
         #features p { color: #a1a1aa; }
         .beam-container { position: relative; width: 100vw; height: 500px; display: flex; align-items: center; justify-content: center; margin-left: 50%; transform: translateX(-50%); }
         .card-stream { position: absolute; width: 100%; height: 250px; display: flex; align-items: center; overflow: visible; }
         .card-line { display: flex; align-items: center; gap: 40px; white-space: nowrap; will-change: transform; }
         .beam-card-wrapper { position: relative; width: 90vw; max-width: 400px; height: 250px; flex-shrink: 0; perspective: 1000px; }
         .beam-card { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 15px; overflow: hidden; transform-style: preserve-3d; transition: transform 0.5s ease; }
         .beam-card-wrapper:hover .beam-card { transform: rotateY(10deg) rotateX(5deg); }
         .beam-card-normal { background: #18181b; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1); color: white; z-index: 2; clip-path: inset(0 calc(100% - var(--clip-right, 100%)) 0 0); transition: clip-path 0.1s linear; } /* Updated clip-path logic and added transition */
         .beam-card-ascii { background: transparent; z-index: 1; clip-path: inset(0 0 0 var(--clip-left, 0%)); transition: clip-path 0.1s linear; } /* Updated clip-path logic and added transition */
         .ascii-content { letter-spacing: 1px; line-height: 14px; position: absolute; top: 0; left: 0; width: 100%; height: 100%; padding: 1rem; color: #ffffff; font-family: 'Roboto Mono', monospace; font-size: 10px; overflow: hidden; white-space: pre; -webkit-mask-image: linear-gradient(to right, black 70%, transparent 100%); mask-image: linear-gradient(to right, black 70%, transparent 100%); }
         #particleCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
         #scannerCanvas { position: absolute; top: 50%; left: 0; transform: translateY(-50%); width: 100vw; height: 300px; z-index: 5; pointer-events: none; }
      `}</style>
      <canvas ref={particleCanvasRef} id="particleCanvas"></canvas>
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-12 text-center" id="features-text-wrapper">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">The <span className="gradient-text">Future of Prep</span> is Here</h2>
          <p className="max-w-2xl mx-auto font-sans">We are constantly working on new tools to supercharge your preparation.</p>
        </div>
      </div>
      <div className="beam-container relative">
        <canvas ref={scannerCanvasRef} id="scannerCanvas"></canvas>
        <div className="card-stream">
          <div className="card-line" ref={cardLineRef}>
            {/* Cards populated by script */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
