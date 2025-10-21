import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-6 pt-28 pb-12 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm">
        <h1 className="text-4xl font-bold mb-6 text-gray-900" style={{ fontFamily: "var(--font-serif)"}}>Privacy Policy for CalciPrep</h1>
        <p className="text-gray-500 mb-8">Last updated: October 21, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800" style={{ fontFamily: "var(--font-serif)"}}>Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to CalciPrep ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at contact@calciprep.online.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800" style={{ fontFamily: "var(--font-serif)"}}>1. What Information Do We Collect?</h2>
          <p className="text-gray-700 leading-relaxed">
            We collect personal information that you voluntarily provide to us when you register on the website. The personal information we collect includes the following:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
            <li><strong>Name and Contact Data:</strong> We collect your name and email address.</li>
            <li><strong>Credentials:</strong> We collect passwords used for authentication and account access.</li>
            <li><strong>Social Logins:</strong> If you choose to register or log in to our services using a third-party account (like Google), we may have access to certain information from that account, such as your name and email address.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800" style={{ fontFamily: "var(--font-serif)"}}>2. How Do We Use Your Information?</h2>
          <p className="text-gray-700 leading-relaxed">
            We use the information we collect or receive to:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
            <li>Facilitate account creation and logon process.</li>
            <li>Manage user accounts.</li>
            <li>Send administrative information to you.</li>
            <li>Respond to your inquiries and offer support.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800" style={{ fontFamily: "var(--font-serif)"}}>3. Will Your Information Be Shared With Anyone?</h2>
          <p className="text-gray-700 leading-relaxed">
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal data.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800" style={{ fontFamily: "var(--font-serif)"}}>4. How Do We Keep Your Information Safe?</h2>
          <p className="text-gray-700 leading-relaxed">
            We aim to protect your personal information through a system of organizational and technical security measures. We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800" style={{ fontFamily: "var(--font-serif)"}}>5. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have questions or comments about this notice, you may email us at contact@calciprep.online.
          </p>
        </section>
      </div>
    </main>
  );
}
