import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { UserCircle, ShieldCheck } from 'lucide-react';
import AccountProfile from '../features/account/AccountProfile';
import AccountSecurity from '../features/account/AccountSecurity';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 sm:py-32">
      <Helmet>
            <title>My Account - CalciPrep</title>
            <meta name="description" content="Manage your CalciPrep account. Update your profile, change your password, and track your progress on your journey to mastering competitive exams." />
        </Helmet>
        <style>{`
            .nav-link.active {
                background-color: #eef2ff; /* indigo-50 */
                color: #4338ca; /* indigo-700 */
                font-weight: 600;
            }
            .account-panel {
                animation: fadeIn 0.4s ease-in-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
        {/* Sidebar Navigation */}
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}
              className={`nav-link group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-900 hover:bg-slate-100 ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <UserCircle className="text-slate-500 mr-3 flex-shrink-0 h-6 w-6" />
              <span className="truncate">Profile</span>
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveTab('security'); }}
              className={`nav-link group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-900 hover:bg-slate-100 ${activeTab === 'security' ? 'active' : ''}`}
            >
              <ShieldCheck className="text-slate-500 mr-3 flex-shrink-0 h-6 w-6" />
              <span className="truncate">Security</span>
            </a>
          </nav>
        </aside>

        {/* Main Content Panels */}
        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
            {activeTab === 'profile' && <AccountProfile />}
            {activeTab === 'security' && <AccountSecurity />}
        </div>
      </div>
    </main>
  );
};

export default AccountPage;

