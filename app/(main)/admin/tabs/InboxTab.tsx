'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Loader2, Reply, CheckCircle2 } from 'lucide-react';

export default function InboxTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const q = query(collection(db!, 'support_queries'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    try {
      await updateDoc(doc(db!, 'support_queries', ticketId), {
        reply: replyText,
        status: 'Replied',
        repliedAt: new Date().toISOString()
      });
      
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, reply: replyText, status: 'Replied' } : t));
      setReplyText('');
      setActiveTicketId(null);
      alert("Reply sent successfully!");
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply.");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <h2 className="text-2xl font-black text-slate-900 mb-6">Support Inbox</h2>

      {loading ? (
        <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-10 text-slate-400 font-medium">Inbox is empty. All caught up!</div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className={`p-6 rounded-2xl border ${ticket.status === 'Open' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900">{ticket.name} <span className="font-normal text-slate-500 text-sm ml-2">{ticket.email}</span></h3>
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">{ticket.issueType}</span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${ticket.status === 'Replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-200 text-rose-800 animate-pulse'}`}>
                  {ticket.status}
                </span>
              </div>
              
              <p className="text-sm text-slate-700 mt-3 mb-4 bg-white p-4 rounded-xl border border-slate-200">
                "{ticket.message}"
              </p>

              {ticket.status === 'Replied' ? (
                <div className="bg-[#eef8fb] p-4 rounded-xl border border-[#bdedf4] flex gap-2 items-start">
                  <CheckCircle2 size={16} className="text-[#0a738c] mt-0.5" />
                  <p className="text-sm text-[#0a738c]"><strong>Your Reply:</strong> {ticket.reply}</p>
                </div>
              ) : (
                <div className="mt-4">
                  {activeTicketId === ticket.id ? (
                    <div className="flex flex-col gap-2 animate-in slide-in-from-top-2">
                      <textarea 
                        autoFocus
                        rows={3} 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)} 
                        placeholder="Type your response to the student..." 
                        className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setActiveTicketId(null)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                        <button onClick={() => handleReply(ticket.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm">Send Reply</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setActiveTicketId(ticket.id); setReplyText(''); }} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-100 px-4 py-2 rounded-lg transition-colors">
                      <Reply size={16} /> Write a Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}