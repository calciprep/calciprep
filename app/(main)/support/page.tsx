'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { Headset, History, Loader2, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function CustomerSupportPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser, showNotification, setLoginMode, openModal } = useAuth() as any;
  
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [queries, setQueries] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: '',
    message: ''
  });

  // Fetch User's Support History (Only if logged in)
  useEffect(() => {
    if (!currentUser) {
      setHistoryLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db!, 'support_queries'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQueries(fetched);
      } catch (error) {
        console.error("Error fetching queries:", error);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser]);

  // Pre-fill email and name if available
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || '',
        name: currentUser.displayName || prev.name
      }));
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Send via your existing Zoho API logic
      const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              subject: formData.issueType,
              message: formData.message
          }),
      });

      if (!emailResponse.ok) {
          const result = await emailResponse.json();
          throw new Error(result.error || 'Failed to dispatch email to Zoho.');
      }

      // 2. Save into Firestore for Admin Inbox & User History
      const newQuery = {
        userId: currentUser ? currentUser.uid : 'guest',
        name: formData.name,
        email: formData.email,
        issueType: formData.issueType,
        message: formData.message,
        status: 'Open',
        reply: null,
        createdAt: serverTimestamp(),
      };
      
      // STRICT db! ENFORCEMENT
      const docRef = await addDoc(collection(db!, 'support_queries'), newQuery);
      
      // Update local state immediately if logged in
      if (currentUser) {
        setQueries([{ id: docRef.id, ...newQuery, createdAt: new Date() }, ...queries]);
      }
      
      setSuccess(true);
      if (showNotification) showNotification('Your query has been submitted successfully!', 'success');
      
      // Clear specific form inputs
      setFormData({ ...formData, issueType: '', message: '' });
      setTimeout(() => setSuccess(false), 4000);

    } catch (error) {
      console.error("Error submitting query:", error);
      if (showNotification) showNotification('Failed to submit. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    if (setLoginMode) setLoginMode(true); 
    if (openModal) openModal(); 
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-[120px] pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-800 mb-2">Customer Support</h1>
          <p className="text-slate-500 font-medium">We're here to help with any questions or issues you may have.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: SUBMIT FORM */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 h-max">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Headset className="text-indigo-600" size={24} /> Submit a New Query
            </h2>

            {success && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 font-bold flex items-center gap-2 border border-emerald-100">
                <CheckCircle2 size={18} /> Query submitted successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Issue Type <span className="text-red-500">*</span></label>
                <select required value={formData.issueType} onChange={(e) => setFormData({...formData, issueType: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800 cursor-pointer">
                  <option value="" disabled>Select Issue Type</option>
                  <option value="Exam Issue">Exam Issue</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Message</label>
                <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Describe your issue or question in detail..." className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-medium text-slate-800"></textarea>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-70 flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : null} Submit Query
              </button>
            </form>
          </div>

          {/* RIGHT: SUPPORT HISTORY */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col h-full">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <History className="text-indigo-600" size={24} /> Your Support History
            </h2>

            <div className="space-y-4 flex-1">
              {!currentUser ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                    <Lock size={30} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Login Required</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-xs">You must be logged in to track the status of your queries and view admin replies.</p>
                  <button onClick={handleLoginClick} className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                    Login to view history
                  </button>
                </div>
              ) : historyLoading ? (
                <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>
              ) : queries.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-100">
                  You have no past queries.
                </div>
              ) : (
                queries.map((q) => (
                  <div key={q.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold text-slate-500">
                        {q.createdAt?.toDate ? q.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider ${q.status === 'Replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {q.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-700 mb-4">
                      <p><strong className="text-slate-900">Issue Type:</strong> {q.issueType}</p>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      <strong className="text-slate-900">You wrote:</strong> {q.message}
                    </p>

                    {q.reply && (
                      <div className="bg-[#eef8fb] p-4 rounded-xl border border-[#bdedf4] mt-2">
                        <p className="text-sm text-[#0a738c] leading-relaxed">
                          <strong className="text-[#085a6e]">Support replied:</strong> {q.reply}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}