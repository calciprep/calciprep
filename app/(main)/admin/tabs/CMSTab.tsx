'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Database, Tag, BarChart2 } from 'lucide-react';

export default function CMSTab() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    environment: 'Normal', // 'Normal' or 'Live'
    examType: 'HCM',       // 'HCM', 'CGL', 'CHSL'
    title: '',
    difficulty: 'Medium',  // 'Easy' | 'Medium' | 'Hard'
    text: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const collectionName = `passages_${formData.environment}_${formData.examType}`;
      
      // Auto-generate a clean, unique ID so you don't have to!
      const generatedId = `${formData.examType.toLowerCase()}-cloud-${Date.now()}`;
      
      // STRICT db! ENFORCEMENT
      await addDoc(collection(db!, collectionName), {
        id: generatedId,
        title: formData.title.trim(),
        difficulty: formData.difficulty,
        text: formData.text.trim(),
        keystrokes: formData.text.trim().length,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setFormData({ ...formData, title: '', text: '' }); // Clear only text/title
      setTimeout(() => setSuccess(false), 3500);
    } catch (error) {
      console.error("Error saving passage:", error);
      alert("Failed to upload passage. Please check permissions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 animate-in fade-in duration-300 font-sans">
      <h2 className="text-2xl font-black text-slate-900 mb-2">Cloud Passage Manager</h2>
      <p className="text-sm text-slate-500 font-medium mb-8">
        Upload new passages directly into Firestore. IDs are generated automatically and exam timers are handled by the core platform.
      </p>

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 font-bold flex items-center gap-2 border border-emerald-100">
          <Database size={18} /> Passage successfully deployed to database!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        
        {/* ROW 1: Target Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Target Arena</label>
            <select 
              value={formData.environment} 
              onChange={(e) => setFormData({...formData, environment: e.target.value})} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm"
            >
              <option value="Normal">Normal Practice Arena</option>
              <option value="Live">Live Daily Exams</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Exam Category</label>
            <select 
              value={formData.examType} 
              onChange={(e) => setFormData({...formData, examType: e.target.value})} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm"
            >
              <option value="HCM">Delhi Police HCM</option>
              <option value="CGL">SSC CGL Tier-II</option>
              <option value="CHSL">SSC CHSL Tier-II</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BarChart2 size={13} className="text-fuchsia-600" /> Difficulty Level
            </label>
            <select 
              value={formData.difficulty} 
              onChange={(e) => setFormData({...formData, difficulty: e.target.value})} 
              className="w-full px-4 py-3 bg-fuchsia-50/60 border border-fuchsia-200 text-fuchsia-900 rounded-xl font-black focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* ROW 2: Title */}
        <div>
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag size={13} /> Passage Title
          </label>
          <input 
            required 
            type="text" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            placeholder="e.g. Passage 53 or Daily Live Set 1" 
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm" 
          />
        </div>

        {/* ROW 3: Content */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Passage Content</label>
            <span className="text-[11px] font-black uppercase text-fuchsia-700 bg-fuchsia-100 px-2.5 py-1 rounded-md tracking-wider">
              {formData.text.length} Keystrokes
            </span>
          </div>
          <textarea 
            required 
            rows={10} 
            value={formData.text} 
            onChange={(e) => setFormData({...formData, text: e.target.value})} 
            placeholder="Paste the official typing test passage here..." 
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none leading-relaxed text-sm shadow-inner"
          />
        </div>

        <button 
          disabled={saving} 
          type="submit" 
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-fuchsia-200 disabled:opacity-70 w-full md:w-auto text-sm"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
          {saving ? 'Uploading...' : 'Deploy Passage to Database'}
        </button>
      </form>
    </div>
  );
}