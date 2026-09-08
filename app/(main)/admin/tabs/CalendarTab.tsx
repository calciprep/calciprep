'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Loader2, 
  Calendar as CalendarIcon, 
  Trash2, 
  PlusCircle, 
  ExternalLink, 
  Tag, 
  Bell, 
  CheckCircle2,
  AlignLeft,
  Pencil,
  X,
  Save
} from 'lucide-react';

interface ExamNotification {
  id: string;
  board: string;
  examName: string;
  title: string;
  summary?: string | null;
  type: string;
  date: string;
  link: string;
}

export default function CalendarTab() {
  // --- CREATE FORM STATES ---
  const [board, setBoard] = useState('SSC');
  const [examName, setExamName] = useState('');
  const [title, setTitle] = useState('');
  const [includeSummary, setIncludeSummary] = useState('No');
  const [summary, setSummary] = useState('');
  const [type, setType] = useState('Admit Card');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  );
  const [link, setLink] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // --- EDIT MODAL STATES ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBoard, setEditBoard] = useState('SSC');
  const [editExamName, setEditExamName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editIncludeSummary, setEditIncludeSummary] = useState('No');
  const [editSummary, setEditSummary] = useState('');
  const [editType, setEditType] = useState('Admit Card');
  const [editDate, setEditDate] = useState('');
  const [editLink, setEditLink] = useState('');
  const [updating, setUpdating] = useState(false);

  // --- DATABASE STATES ---
  const [notifications, setNotifications] = useState<ExamNotification[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Real-time listener for current notifications
  useEffect(() => {
    setLoadingList(true);
    const q = query(collection(db!, 'calendar_notifications'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: ExamNotification[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ExamNotification, 'id'>)
      }));
      setNotifications(items);
      setLoadingList(false);
    }, (error) => {
      console.error('Error fetching calendar notifications:', error);
      setLoadingList(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      await addDoc(collection(db!, 'calendar_notifications'), {
        board,
        examName: examName.trim(),
        title: title.trim(),
        summary: includeSummary === 'Yes' ? summary.trim() : null,
        type,
        date: date.trim(),
        link: link.trim(),
        createdAt: serverTimestamp()
      });

      setSuccessMsg('Notification published live to the website!');
      setExamName('');
      setTitle('');
      setSummary('');
      setIncludeSummary('No');
      setLink('');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Error publishing notification:', err);
      alert('Failed to publish. Please check database permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${itemTitle}"?`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db!, 'calendar_notifications', id));
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification.');
    }
  };

  // --- EDIT HANDLERS ---
  const openEditModal = (notif: ExamNotification) => {
    setEditingId(notif.id);
    setEditBoard(notif.board);
    setEditExamName(notif.examName);
    setEditTitle(notif.title);
    setEditType(notif.type);
    setEditDate(notif.date);
    setEditLink(notif.link);
    
    if (notif.summary && notif.summary.trim() !== '') {
      setEditIncludeSummary('Yes');
      setEditSummary(notif.summary);
    } else {
      setEditIncludeSummary('No');
      setEditSummary('');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setUpdating(true);
    setSuccessMsg('');

    try {
      await updateDoc(doc(db!, 'calendar_notifications', editingId), {
        board: editBoard,
        examName: editExamName.trim(),
        title: editTitle.trim(),
        summary: editIncludeSummary === 'Yes' ? editSummary.trim() : null,
        type: editType,
        date: editDate.trim(),
        link: editLink.trim()
      });

      setSuccessMsg('Notification updated successfully!');
      setEditingId(null);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Error updating notification:', err);
      alert('Failed to update notification. Please check database permissions.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-10 font-sans relative">
      
      {/* 1. PUBLISH NEW NOTIFICATION FORM */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="text-amber-500" size={24} />
          <h2 className="text-2xl font-black text-slate-900">Post Exam Notification</h2>
        </div>
        <p className="text-sm text-slate-500 font-medium mb-6">
          Publish notifications that immediately appear on the public Exam Calendar page.
        </p>

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 font-bold flex items-center gap-2 border border-emerald-100">
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        <form onSubmit={handlePublish} className="space-y-6 max-w-4xl bg-slate-50 p-6 rounded-2xl border border-slate-100">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                Exam Board / Category
              </label>
              <select 
                value={board} 
                onChange={(e) => setBoard(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="SSC">SSC</option>
                <option value="Delhi Police">Delhi Police</option>
                <option value="Railway">Railway</option>
                <option value="Banking">Banking</option>
                <option value="UPSC">UPSC</option>
                <option value="State Exams">State Exams</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag size={13} /> Update Type
              </label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="Admit Card">Admit Card</option>
                <option value="Apply Notification">Apply Notification</option>
                <option value="Corrigendum">Corrigendum</option>
                <option value="Reschedule">Reschedule</option>
                <option value="Vacancies">Vacancies</option>
                <option value="City Intimation">City Intimation</option>
                <option value="Answer Key">Answer Key</option>
                <option value="Result">Result</option>
                <option value="General Update">General Update</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                Exam Name (e.g. SSC CGL 2026)
              </label>
              <input 
                required 
                type="text" 
                value={examName} 
                onChange={(e) => setExamName(e.target.value)} 
                placeholder="e.g. SSC CGL 2026, DP HCM"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                Display Date
              </label>
              <input 
                required 
                type="text" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                placeholder="e.g. 08 Sept 2026"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Notification Title / Heading
            </label>
            <input 
              required 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Tier 1 City Intimation Slip Live"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlignLeft size={13} /> Include Summary?
            </label>
            <select 
              value={includeSummary} 
              onChange={(e) => setIncludeSummary(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none mb-4"
            >
              <option value="No">No Summary</option>
              <option value="Yes">Yes, Add Summary</option>
            </select>

            {includeSummary === 'Yes' && (
              <textarea 
                required
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Briefly explain the key points of the notification..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 resize-none text-sm outline-none shadow-inner"
              />
            )}
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Official Link (URL)
            </label>
            <input 
              required 
              type="url" 
              value={link} 
              onChange={(e) => setLink(e.target.value)} 
              placeholder="https://ssc.gov.in/..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <button 
            disabled={saving} 
            type="submit" 
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60 text-sm"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
            {saving ? 'Publishing...' : 'Publish Update'}
          </button>
        </form>
      </div>

      {/* 2. ACTIVE NOTIFICATIONS INVENTORY TABLE */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Bell className="text-[#0a738c]" size={22} />
              Published Notifications
              <span className="ml-2 text-xs font-black bg-teal-100 text-[#0a738c] px-3 py-1 rounded-lg">
                {notifications.length} Total
              </span>
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Active updates live on the website. Edit or delete any outdated or incorrect notices here.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left whitespace-nowrap text-sm">
            <thead className="bg-[#0a738c] border-b border-[#085a6e]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Board</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Exam</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Link</th>
                <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loadingList ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                    <Loader2 className="animate-spin inline mr-2 text-teal-600" size={18} />
                    Loading updates...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                    No notifications published yet. Use the form above to add one.
                  </td>
                </tr>
              ) : (
                notifications.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 font-medium text-xs">{item.date}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                        {item.board}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{item.examName}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 max-w-sm truncate">
                      {item.title}
                      {item.summary && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-amber-400" title="Has Summary"></span>}
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-semibold text-xs"
                      >
                        Visit <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit notification"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete notification"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. EDIT MODAL WINDOW (OPENS WHEN PENCIL ICON IS CLICKED) */}
      {/* ============================================================== */}
      {editingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Pencil size={18} className="text-blue-600" /> Edit Notification
              </h3>
              <button 
                onClick={() => setEditingId(null)}
                className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 overflow-y-auto flex-1 space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Exam Board</label>
                  <select 
                    value={editBoard} 
                    onChange={(e) => setEditBoard(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="SSC">SSC</option>
                    <option value="Delhi Police">Delhi Police</option>
                    <option value="Railway">Railway</option>
                    <option value="Banking">Banking</option>
                    <option value="UPSC">UPSC</option>
                    <option value="State Exams">State Exams</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Update Type</label>
                  <select 
                    value={editType} 
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Admit Card">Admit Card</option>
                    <option value="Apply Notification">Apply Notification</option>
                    <option value="Corrigendum">Corrigendum</option>
                    <option value="Reschedule">Reschedule</option>
                    <option value="Vacancies">Vacancies</option>
                    <option value="City Intimation">City Intimation</option>
                    <option value="Answer Key">Answer Key</option>
                    <option value="Result">Result</option>
                    <option value="General Update">General Update</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Exam Name</label>
                  <input 
                    required type="text" value={editExamName} onChange={(e) => setEditExamName(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Display Date</label>
                  <input 
                    required type="text" value={editDate} onChange={(e) => setEditDate(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Title</label>
                <input 
                  required type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Include Summary?</label>
                <select 
                  value={editIncludeSummary} 
                  onChange={(e) => setEditIncludeSummary(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                >
                  <option value="No">No Summary</option>
                  <option value="Yes">Yes, Add Summary</option>
                </select>

                {editIncludeSummary === 'Yes' && (
                  <textarea 
                    required rows={3} value={editSummary} onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 resize-none text-sm outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Link</label>
                <input 
                  required type="url" value={editLink} onChange={(e) => setEditLink(e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditingId(null)}
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