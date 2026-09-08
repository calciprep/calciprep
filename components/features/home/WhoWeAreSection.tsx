import React from 'react';

export default function WhoWeAreSection() {
  return (
    <section className="px-4 py-16 max-w-6xl mx-auto">
      <div className="bg-[#ADD8E6] border-[3px] border-black rounded-[2rem] p-10 md:p-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-8 font-serif text-slate-900">
          Who We Are
        </h2>
        
        <div className="space-y-6 text-slate-900 font-medium text-base md:text-lg leading-relaxed">
          <p>
            Calciprep is a student-first education ecosystem built to simplify and strengthen preparation for SSC, Banking, and other government examinations. What started as a simple updates channel has evolved into a trusted multi-platform learning network used daily by thousands of aspirants across India.
          </p>
          <p>
            Our flagship platform helps candidates master typing skills required for SSC CGL, CHSL, and RRB exams through real-exam simulations, accuracy tracking, and speed analytics.
          </p>
          <p>
            Our mission is simple: reduce confusion, save time, and help aspirants focus only on what truly matters for success.
          </p>
        </div>
      </div>
    </section>
  );
}