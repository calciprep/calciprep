import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GraduationCap, BarChart3, Award } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

const FeaturesSection = () => {
  const cardLineRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const scannerCanvasRef = useRef(null);
  const featuresSectionRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const featuresSection = featuresSectionRef.current;
    if (!featuresSection || typeof THREE === 'undefined' || !cardLineRef.current || !particleCanvasRef.current || !scannerCanvasRef.current) return;

    let cleanupFuncs = [];
    
    const cardData = [
        { icon: <GraduationCap size={24} color="#fda4af" />, title: "Maths Classes" },
        { icon: <BarChart3 size={24} color="#7dd3fc" />, title: "Advanced Analytics" },
        { icon: <Award size={24} color="#86efac" />, title: "Achievements & Badges" }
    ];

    const cardLine = cardLineRef.current;
    const particleCanvas = particleCanvasRef.current;
    const scannerCanvas = scannerCanvasRef.current;
    
    let cardStreamController, particleSystem, particleScanner;

    class CardStreamController {
        constructor() { this.cardLine = cardLine; this.position = 0; this.velocity = 60; this.direction = -1; this.isAnimating = false; this.lastTime = 0; this.cardLineWidth = 0; this.init(); }
        init() { this.populateCardLine(); this.calculateDimensions(); ScrollTrigger.create({ trigger: "#features", start: "top bottom", end: "bottom top", onEnter: ()=>this.startAnimation(), onLeave: ()=>this.stopAnimation(), onEnterBack: ()=>this.startAnimation(), onLeaveBack: ()=>this.stopAnimation() }); this.animate = this.animate.bind(this); this.animate(); const boundCalc = this.calculateDimensions.bind(this); window.addEventListener("resize", boundCalc); cleanupFuncs.push(() => window.removeEventListener("resize", boundCalc)); }
        startAnimation() { this.isAnimating = true; this.lastTime = performance.now(); if (particleScanner) particleScanner.isAnimating = true; }
        stopAnimation() { this.isAnimating = false; if (particleScanner) particleScanner.isAnimating = false; }
        calculateDimensions() { if (!this.cardLine.children[0]) return; this.cardLineWidth = (this.cardLine.children[0].offsetWidth + 40) * this.cardLine.children.length; }
        animate() { if (this.isAnimating) { const dt = (performance.now() - this.lastTime) / 1000; this.lastTime = performance.now(); this.position += this.velocity * this.direction * dt; this.updateCardPosition(); } animationFrameId.current = requestAnimationFrame(this.animate); }
        updateCardPosition() { if (this.cardLineWidth === 0) return; if(this.position < -this.cardLineWidth / 2) this.position += this.cardLineWidth / 2; if(this.position > 0) this.position -= this.cardLineWidth / 2; this.cardLine.style.transform = `translateX(${this.position}px)`; this.updateCardClipping(); }
        
        generateCode(w, h) { 
            const c = "abcdefghijklmnopqrstuvwxyz0123456789{}[]<>;:._-+=!@#$*|"; 
            let o = "";
            const effectiveWidth = Math.floor(w / 2);
            for (let i = 0; i < effectiveWidth * h; i++) {
                o += c[Math.floor(Math.random() * c.length)] + ' ';
                if ((i + 1) % effectiveWidth === 0 && i < effectiveWidth * h - 1) {
                    o += '\n';
                }
            }
            return o;
        }

        createCardWrapper(i) {
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
          if (this.cardLine.children.length > 0) return; 
          for (let i = 0; i < 12; i++) {
            this.cardLine.appendChild(this.createCardWrapper(i));
          }
        }
        updateCardClipping() {
            const scannerX = window.innerWidth / 2; let anyActive = false;
            this.cardLine.querySelectorAll(".beam-card-wrapper").forEach((w) => {
                const r = w.getBoundingClientRect(); const nc = w.querySelector(".beam-card-normal"); const ac = w.querySelector(".beam-card-ascii");
                if (r.left < scannerX && r.right > scannerX) { anyActive = true; const clip = ((scannerX - r.left) / r.width) * 100; nc.style.setProperty("--clip-right", `${clip}%`); ac.style.setProperty("--clip-left", `${clip}%`); }
                else if (r.right < scannerX) { nc.style.setProperty("--clip-right", "100%"); ac.style.setProperty("--clip-left", "100%"); }
                else { nc.style.setProperty("--clip-right", "0%"); ac.style.setProperty("--clip-left", "0%"); }
            });
            if (particleScanner) particleScanner.setScanningActive(anyActive);
        }
    }
    class ParticleScanner {
        constructor() { this.canvas = scannerCanvas; this.ctx = this.canvas.getContext("2d"); this.w = window.innerWidth; this.h = 300; this.lightBarX = this.w / 2; this.scanningActive = false; this.isAnimating = false; this.glow = 1; this.speed = 0.05; this.setupCanvas(); this.animate = this.animate.bind(this); this.animate(); const boundResize = this.onResize.bind(this); window.addEventListener("resize", boundResize); cleanupFuncs.push(() => window.removeEventListener("resize", boundResize)); }
        setupCanvas() { this.canvas.width = this.w; this.canvas.height = this.h; }
        onResize() { this.w = window.innerWidth; this.lightBarX = this.w / 2; this.setupCanvas(); }
        setScanningActive(a) { this.scanningActive = a; }
        animate() { if (this.isAnimating) this.render(); animationFrameId.current = requestAnimationFrame(this.animate); }
        render() {
            this.ctx.clearRect(0, 0, this.w, this.h);
            const targetGlow = this.scanningActive ? 3.5 : 1;
            this.glow += (targetGlow - this.glow) * this.speed;
            
            const grad = this.ctx.createRadialGradient(this.lightBarX, this.h / 2, 0, this.lightBarX, this.h / 2, 40 * this.glow);
            grad.addColorStop(0, `rgba(167, 139, 250, ${0.4 * this.glow})`);
            grad.addColorStop(0.5, `rgba(167, 139, 250, ${0.1 * this.glow})`);
            grad.addColorStop(1, "rgba(167, 139, 250, 0)");
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(this.lightBarX - 40 * this.glow, 0, 80 * this.glow, this.h);
            
            const coreGrad = this.ctx.createLinearGradient(this.lightBarX - 1, 0, this.lightBarX + 1, 0);
            coreGrad.addColorStop(0,"rgba(255,255,255,0)");
            coreGrad.addColorStop(0.5,`rgba(255,255,255,${this.scanningActive ? 1 * this.glow : 0.5})`);
            coreGrad.addColorStop(1,"rgba(255,255,255,0)");
            this.ctx.fillStyle = coreGrad;
            this.ctx.fillRect(this.lightBarX - 1.5, 0, 3, this.h);
        }
    }
    class ParticleSystem {
        constructor() { this.scene = new THREE.Scene(); this.camera = new THREE.OrthographicCamera(featuresSection.offsetWidth / -2, featuresSection.offsetWidth / 2, featuresSection.offsetHeight / 2, featuresSection.offsetHeight / -2, 1, 1000); this.camera.position.z = 100; this.renderer = new THREE.WebGLRenderer({ canvas: particleCanvas, alpha: true }); this.renderer.setSize(featuresSection.offsetWidth, featuresSection.offsetHeight); this.renderer.setClearColor(0x000000, 0); this.pCount = 5000; this.createParticles(); this.animate = this.animate.bind(this); this.animate(); const boundResize = this.onResize.bind(this); window.addEventListener("resize", boundResize); cleanupFuncs.push(() => window.removeEventListener("resize", boundResize)); }
        createParticles() {
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array(this.pCount * 3);
            this.vel = new Float32Array(this.pCount);
            for (let i = 0; i < this.pCount; i++) {
                pos[i * 3] = (Math.random() - 0.5) * featuresSectionRef.current.offsetWidth * 2;
                pos[i * 3 + 1] = (Math.random() - 0.5) * featuresSectionRef.current.offsetHeight;
                this.vel[i] = Math.random() * 0.3 + 0.1;
            }
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            this.particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x8A2BE2, size: 0.5, transparent: true, opacity: 0.5 }));
            this.scene.add(this.particles);
        }
        animate() { animationFrameId.current = requestAnimationFrame(this.animate); if (!this.particles || !this.renderer) return; const pos = this.particles.geometry.attributes.position.array; for (let i = 0; i < this.pCount; i++) { pos[i * 3] += this.vel[i]; if (pos[i * 3] > featuresSectionRef.current.offsetWidth / 2 + 50) pos[i * 3] = -featuresSectionRef.current.offsetWidth / 2 - 50; } this.particles.geometry.attributes.position.needsUpdate = true; this.renderer.render(this.scene, this.camera); }
        onResize() {
            if (!this.renderer || !featuresSectionRef.current) return;
            const { offsetWidth, offsetHeight } = featuresSectionRef.current;
            this.camera.left = offsetWidth / -2;
            this.camera.right = offsetWidth / 2;
            this.camera.top = offsetHeight / 2;
            this.camera.bottom = offsetHeight / -2;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(offsetWidth, offsetHeight);
        }
    }

    cardStreamController = new CardStreamController();
    particleSystem = new ParticleSystem();
    particleScanner = new ParticleScanner();
    
    // Text animation - set initial state first
    gsap.set("#features-text-wrapper > *", { opacity: 1, y: 0, x: 0 });
    const featuresTl = gsap.timeline({ scrollTrigger: { trigger: featuresSection, start: "top 70%", toggleActions: "play none none reverse" } });
    featuresTl.from("#features-text-wrapper > *", { y: 50, x: -50, opacity: 0, stagger: 0.1, ease: "power2.out", duration: 0.6 });
    
    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        cleanupFuncs.forEach(func => func());
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={featuresSectionRef} id="features" className="py-20 relative overflow-hidden bg-black text-white">
      <style>{`
         #features .gradient-text { background: linear-gradient(90deg, #A78BFA, #38BDF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;} 
         #features p { color: #a1a1aa; } 
         .beam-container { position: relative; width: 100vw; height: 500px; display: flex; align-items: center; justify-content: center; margin-left: 50%; transform: translateX(-50%); } 
         .card-stream { position: absolute; width: 100%; height: 250px; display: flex; align-items: center; overflow: visible; } 
         .card-line { display: flex; align-items: center; gap: 40px; white-space: nowrap; will-change: transform; } 
         .beam-card-wrapper { position: relative; width: 90vw; max-width: 400px; height: 250px; flex-shrink: 0; perspective: 1000px; } 
         .beam-card { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 15px; overflow: hidden; transform-style: preserve-3d; transition: transform 0.5s ease; } 
         .beam-card-wrapper:hover .beam-card { transform: rotateY(10deg) rotateX(5deg); } 
         .beam-card-normal { background: #18181b; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1); color: white; z-index: 2; clip-path: inset(0 0 0 var(--clip-right, 0%)); } 
         .beam-card-ascii { background: transparent; z-index: 1; clip-path: inset(0 calc(100% - var(--clip-left, 0%)) 0 0); } 
         .ascii-content { letter-spacing: 1px; line-height: 14px; position: absolute; top: 0; left: 0; width: 100%; height: 100%; padding: 1rem; color: #ffffff; font-family: 'Roboto Mono', monospace; font-size: 10px; overflow: hidden; white-space: pre; -webkit-mask-image: linear-gradient(to right, black 70%, transparent 100%); mask-image: linear-gradient(to right, black 70%, transparent 100%); }
         #particleCanvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
         #scannerCanvas { position: absolute; top: 50%; left: 0; transform: translateY(-50%); width: 100vw; height: 300px; z-index: 5; pointer-events: none; }
      `}</style>
      <canvas ref={particleCanvasRef} id="particleCanvas"></canvas>
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-12 text-center" id="features-text-wrapper">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">The <span className="gradient-text">Future of Prep</span> is Here</h2>
          <p className="max-w-2xl mx-auto font-sans">We're constantly working on new tools to supercharge your preparation.</p>
        </div>
      </div>
      <div className="beam-container relative">
        <canvas ref={scannerCanvasRef} id="scannerCanvas"></canvas>
        <div className="card-stream">
          <div className="card-line" ref={cardLineRef}>
            {/* Cards will be populated here */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

