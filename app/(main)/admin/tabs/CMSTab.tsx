'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  writeBatch, 
  doc, 
  deleteDoc, 
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';
import { 
  Loader2, 
  Database, 
  Tag, 
  BarChart2, 
  UploadCloud, 
  FileJson, 
  Trash2, 
  Search, 
  BookOpen, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Pencil, 
  X,
  Save,
  CheckSquare // <-- ADDED for bulk actions
} from 'lucide-react';

interface CloudPassage {
  id: string;
  docId: string;
  collectionName: string;
  environment: 'Normal' | 'Live';
  examType: 'HCM' | 'CGL' | 'CHSL';
  title: string;
  difficulty: string;
  text: string;
  keystrokes: number;
  uploadOrder?: number;
  createdAt?: any;
}

const ALL_COLLECTIONS: { env: 'Normal' | 'Live'; exam: 'HCM' | 'CGL' | 'CHSL'; name: string }[] = [
  { env: 'Normal', exam: 'HCM', name: 'passages_Normal_HCM' },
  { env: 'Live', exam: 'HCM', name: 'passages_Live_HCM' },
  { env: 'Normal', exam: 'CGL', name: 'passages_Normal_CGL' },
  { env: 'Live', exam: 'CGL', name: 'passages_Live_CGL' },
  { env: 'Normal', exam: 'CHSL', name: 'passages_Normal_CHSL' },
  { env: 'Live', exam: 'CHSL', name: 'passages_Live_CHSL' },
];

export default function CMSTab() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    environment: 'Normal', 
    examType: 'HCM',       
    title: '',
    difficulty: 'Medium',  
    text: '',
  });

  const [passagesList, setPassagesList] = useState<CloudPassage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filterEnv, setFilterEnv] = useState<'All' | 'Normal' | 'Live'>('All');
  const [filterExam, setFilterExam] = useState<'All' | 'HCM' | 'CGL' | 'CHSL'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [editingPassage, setEditingPassage] = useState<CloudPassage | null>(null);
  const [editForm, setEditForm] = useState({ title: '', difficulty: 'Medium', text: '' });
  const [updating, setUpdating] = useState(false);

  // --- NEW: BULK SELECTION STATE ---
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Clear selections when filters change to prevent accidental invisible deletions
  useEffect(() => {
    setSelectedIds([]);
  }, [filterEnv, filterExam, searchQuery]);

  useEffect(() => {
    setLoadingHistory(true);
    const unsubscribes: (() => void)[] = [];
    const collectionDataMap: Record<string, CloudPassage[]> = {};

    ALL_COLLECTIONS.forEach(({ env, exam, name }) => {
      try {
        const colRef = collection(db!, name);
        const unsub = onSnapshot(colRef, (snapshot) => {
          const items: CloudPassage[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id || d.id,
              docId: d.id,
              collectionName: name,
              environment: env,
              examType: exam,
              title: data.title || 'Untitled Passage',
              difficulty: data.difficulty || 'Medium',
              text: data.text || '',
              keystrokes: data.keystrokes || (data.text ? data.text.length : 0),
              uploadOrder: data.uploadOrder,
              createdAt: data.createdAt,
            };
          });

          collectionDataMap[name] = items;
          const combined = Object.values(collectionDataMap).flat();
          setPassagesList(combined);
          setLoadingHistory(false);
        }, (error) => {
          console.error(`Error listening to ${name}:`, error);
          setLoadingHistory(false);
        });

        unsubscribes.push(unsub);
      } catch (err) {
        console.error(`Listener setup failed for ${name}:`, err);
      }
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const handleSingleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const collectionName = `passages_${formData.environment}_${formData.examType}`;
      const generatedId = `${formData.examType.toLowerCase()}-cloud-${Date.now()}`;
      
      await addDoc(collection(db!, collectionName), {
        id: generatedId,
        title: formData.title.trim(),
        difficulty: formData.difficulty,
        text: formData.text.trim(),
        keystrokes: formData.text.trim().length,
        createdAt: serverTimestamp(),
        uploadOrder: Date.now() 
      });

      setSuccess(true);
      setUploadMessage('Single passage deployed successfully!');
      setFormData({ ...formData, title: '', text: '' }); 
      setTimeout(() => setSuccess(false), 3500);
    } catch (error) {
      console.error("Error saving passage:", error);
      alert("Failed to upload passage. Please check permissions.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) throw new Error("JSON must be an array of passages.");

        const collectionName = `passages_${formData.environment}_${formData.examType}`;
        const batch = writeBatch(db!);

        let count = 0;
        const baseTime = Date.now(); 

        json.forEach((passage: any) => {
          if (!passage.text || !passage.title) return; 
          
          const newDocRef = doc(collection(db!, collectionName));
          // Check if the passage has an ID. If not, generate one.
            const finalId = passage.id ? passage.id.trim() : `${formData.examType.toLowerCase()}-cloud-${Date.now()}-${count}`;

              batch.set(newDocRef, {
              id: finalId,
            title: passage.title.trim(),
            difficulty: passage.difficulty || formData.difficulty,
            text: passage.text.trim(),
            keystrokes: passage.text.trim().length,
            createdAt: serverTimestamp(),
            uploadOrder: baseTime + count 
          });
          count++;
        });

        await batch.commit();
        setSuccess(true);
        setUploadMessage(`Successfully bulk deployed ${count} passages in sequential order!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setSuccess(false), 5000);

      } catch (error) {
        console.error("Bulk upload error:", error);
        alert("Invalid JSON file format.");
      } finally {
        setSaving(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDeletePassage = async (passage: CloudPassage) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${passage.title}" from ${passage.collectionName}? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db!, passage.collectionName, passage.docId));
      setSelectedIds(prev => prev.filter(id => id !== passage.docId)); // Uncheck if selected
    } catch (err) {
      console.error("Error deleting passage:", err);
      alert("Failed to delete passage. Please check permissions.");
    }
  };

  // --- NEW: BULK DELETE HANDLER ---
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to PERMANENTLY DELETE ${selectedIds.length} passages? This cannot be undone.`
    );
    if (!confirmDelete) return;

    setIsDeletingBulk(true);
    try {
      // Find all passage objects matching selected IDs so we know which collection to delete from
      const passagesToDelete = passagesList.filter(p => selectedIds.includes(p.docId));
      
      // Execute all deletions concurrently
      await Promise.all(
        passagesToDelete.map(p => deleteDoc(doc(db!, p.collectionName, p.docId)))
      );

      setSuccess(true);
      setUploadMessage(`Successfully deleted ${passagesToDelete.length} passages!`);
      setSelectedIds([]); // Clear selections
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Failed to delete some passages. Check your permissions.");
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const openEditModal = (passage: CloudPassage) => {
    setEditingPassage(passage);
    setEditForm({
      title: passage.title,
      difficulty: passage.difficulty,
      text: passage.text
    });
  };

  const handleUpdatePassage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPassage) return;

    setUpdating(true);
    try {
      const docRef = doc(db!, editingPassage.collectionName, editingPassage.docId);
      await updateDoc(docRef, {
        title: editForm.title.trim(),
        difficulty: editForm.difficulty,
        text: editForm.text.trim(),
        keystrokes: editForm.text.trim().length
      });

      setSuccess(true);
      setUploadMessage(`Successfully updated "${editForm.title.trim()}"`);
      setTimeout(() => setSuccess(false), 3500);
      setEditingPassage(null); 
    } catch (error) {
      console.error("Error updating passage:", error);
      alert("Failed to update passage. Check your permissions.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredPassages = useMemo(() => {
    let list = [...passagesList];

    if (filterEnv !== 'All') list = list.filter((p) => p.environment === filterEnv);
    if (filterExam !== 'All') list = list.filter((p) => p.examType === filterExam);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.text.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (a.examType !== b.examType) return a.examType.localeCompare(b.examType);
      if (a.environment !== b.environment) return a.environment.localeCompare(b.environment);
      
      const orderA = a.uploadOrder ?? a.createdAt?.toMillis?.() ?? 0;
      const orderB = b.uploadOrder ?? b.createdAt?.toMillis?.() ?? 0;
      return orderA - orderB; 
    });

    return list;
  }, [passagesList, filterEnv, filterExam, searchQuery]);

  // --- NEW: CHECKBOX HANDLERS ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredPassages.map(p => p.docId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (docId: string) => {
    setSelectedIds(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recent';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-10 font-sans relative">
      
      {/* ===================== UPLOADER SECTION ===================== */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Cloud Passage Manager</h2>
            <p className="text-sm text-slate-500 font-medium">
              Upload passages to Firestore. Timers are automatically handled by the exam infrastructure.
            </p>
          </div>
          
          <div>
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleBulkUpload} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 text-sm"
            >
              <FileJson size={18} /> Bulk JSON Upload
            </button>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 font-bold flex items-center gap-2 border border-emerald-100 animate-in fade-in slide-in-from-top-4">
            <Database size={18} /> {uploadMessage}
          </div>
        )}

        <form onSubmit={handleSingleSave} className="space-y-6 max-w-4xl bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <UploadCloud className="text-fuchsia-600" size={20} />
            <h3 className="text-lg font-bold text-slate-800">Single Passage Upload</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Target Arena</label>
              <select value={formData.environment} onChange={(e) => setFormData({...formData, environment: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-fuchsia-500 text-sm">
                <option value="Normal">Normal Practice Arena</option>
                <option value="Live">Live Daily Exams</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Exam Category</label>
              <select value={formData.examType} onChange={(e) => setFormData({...formData, examType: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-fuchsia-500 text-sm">
                <option value="HCM">Delhi Police HCM</option>
                <option value="CGL">SSC CGL Tier-II</option>
                <option value="CHSL">SSC CHSL Tier-II</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><BarChart2 size={13} className="text-fuchsia-600" /> Difficulty Level</label>
              <select value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} className="w-full px-4 py-3 bg-fuchsia-50/60 border border-fuchsia-200 text-fuchsia-900 rounded-xl font-black focus:ring-2 focus:ring-fuchsia-500 text-sm">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Tag size={13} /> Passage Title</label>
            <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Passage 53 or Daily Live Set 1" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-fuchsia-500 text-sm" />
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Passage Content</label>
              <span className="text-[11px] font-black uppercase text-fuchsia-700 bg-fuchsia-100 px-2.5 py-1 rounded-md tracking-wider">{formData.text.length} Keystrokes</span>
            </div>
            <textarea required rows={8} value={formData.text} onChange={(e) => setFormData({...formData, text: e.target.value})} placeholder="Paste the official typing test passage here..." className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-medium text-slate-800 focus:ring-2 focus:ring-fuchsia-500 resize-none leading-relaxed text-sm shadow-inner" />
          </div>

          <button disabled={saving} type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-fuchsia-200 disabled:opacity-70 w-full md:w-auto text-sm">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
            {saving ? 'Uploading...' : 'Deploy Single Passage'}
          </button>
        </form>
      </div>

      {/* ===================== PASSAGE INVENTORY SECTION ===================== */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="text-[#0a738c]" size={22} />
              <h2 className="text-2xl font-black text-slate-900">Passage Inventory & History</h2>
              <span className="ml-2 text-xs font-black bg-teal-100 text-[#0a738c] px-3 py-1 rounded-lg">
                {passagesList.length} Total
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Browse, filter, preview, edit, and bulk-manage active Firestore passages.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by title or text..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pb-6 mb-4 border-b border-slate-100">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Layers size={14} /> Arena:
          </span>
          {(['All', 'Normal', 'Live'] as const).map((env) => (
            <button
              key={env}
              onClick={() => setFilterEnv(env)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterEnv === env 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {env === 'All' ? 'All Arenas' : env === 'Normal' ? 'Normal Practice' : 'Live Daily'}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-2 hidden sm:block"></div>

          <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">
            Exam:
          </span>
          {(['All', 'CGL', 'CHSL', 'HCM'] as const).map((ex) => (
            <button
              key={ex}
              onClick={() => setFilterExam(ex)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterExam === ex 
                  ? 'bg-[#0a738c] text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ex === 'All' ? 'All Exams' : ex}
            </button>
          ))}

          <div className="ml-auto text-xs font-bold text-slate-400">
            Showing {filteredPassages.length} of {passagesList.length}
          </div>
        </div>

        {/* --- DYNAMIC BULK ACTION TOOLBAR --- */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-indigo-800">
              <CheckSquare size={18} />
              <span className="font-bold text-sm">{selectedIds.length} Passages Selected</span>
            </div>
            <button 
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
            >
              {isDeletingBulk ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              {isDeletingBulk ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        )}

        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left whitespace-nowrap text-sm">
            <thead className="bg-[#0a738c] border-b border-[#085a6e]">
              <tr>
                {/* CHECKBOX HEADER */}
                <th className="px-5 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={filteredPassages.length > 0 && selectedIds.length === filteredPassages.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-2 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Exam</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Arena</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Keystrokes</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Date Added</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loadingHistory ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                    <Loader2 className="animate-spin inline mr-2 text-teal-600" size={18}/> 
                    Syncing Firestore passage collections...
                  </td>
                </tr>
              ) : filteredPassages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                    No passages found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredPassages.map((p) => {
                  const isExpanded = expandedId === p.docId;
                  const isSelected = selectedIds.includes(p.docId);

                  return (
                    <React.Fragment key={`${p.collectionName}_${p.docId}`}>
                      <tr className={`transition-colors group ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'}`}>
                        {/* CHECKBOX CELL */}
                        <td className="px-5 py-4 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            checked={isSelected}
                            onChange={() => handleSelectOne(p.docId)}
                          />
                        </td>
                        <td className="px-2 py-4">
                          <span className="font-black text-xs uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                            {p.examType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${
                            p.environment === 'Live' 
                              ? 'bg-rose-50 text-rose-700 border-rose-100' 
                              : 'bg-sky-50 text-sky-700 border-sky-100'
                          }`}>
                            {p.environment === 'Live' ? '● Live Daily' : 'Normal Arena'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 max-w-xs truncate">
                          {p.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${
                            p.difficulty === 'Hard' 
                              ? 'text-red-700 bg-red-50' 
                              : p.difficulty === 'Easy' 
                              ? 'text-emerald-700 bg-emerald-50' 
                              : 'text-amber-700 bg-amber-50'
                          }`}>
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-600">
                          {p.keystrokes} Keys
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : p.docId)}
                            className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                            title={isExpanded ? "Hide Preview" : "Show Preview"}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          <button
                            onClick={() => openEditModal(p)}
                            className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                            title="Edit Passage"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={() => handleDeletePassage(p)}
                            className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                            title="Delete Passage"
                          >
                            <Trash2 size={14} />
                          </button>

                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={8} className="px-6 py-4 border-b border-slate-100">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-inner">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                                <span>Collection: <code className="text-teal-700">{p.collectionName}</code></span>
                                <span>ID: <code className="text-slate-600">{p.id}</code></span>
                              </div>
                              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded-lg border border-slate-100 max-h-60 overflow-y-auto">
                                {p.text}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== EDIT PASSAGE MODAL ===================== */}
      {editingPassage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Pencil size={18} className="text-blue-600" /> Edit Passage
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Collection: <span className="text-blue-600">{editingPassage.collectionName}</span>
                </p>
              </div>
              <button 
                onClick={() => setEditingPassage(null)}
                className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePassage} className="p-6 overflow-y-auto flex-1 space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Passage Title</label>
                  <input 
                    required 
                    type="text" 
                    value={editForm.title} 
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Difficulty Level</label>
                  <select 
                    value={editForm.difficulty} 
                    onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Passage Content</label>
                  <span className="text-[11px] font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md tracking-wider">
                    {editForm.text.length} Keystrokes
                  </span>
                </div>
                <textarea 
                  required 
                  rows={10} 
                  value={editForm.text} 
                  onChange={(e) => setEditForm({...editForm, text: e.target.value})} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed text-sm shadow-inner" 
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingPassage(null)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  disabled={updating} 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-200 disabled:opacity-70 text-sm"
                >
                  {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}