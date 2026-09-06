'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LeaderboardsTab() {
  const [lbExam, setLbExam] = useState("hcm");
  const [lbDate, setLbDate] = useState(() => {
    const today = new Date();
    today.setHours(today.getHours() - 4);
    return today.toLocaleDateString('en-CA');
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lbData, setLbData] = useState<any[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLbLoading(true);
    setLbData([]);
    try {
      const collectionName = `live_leaderboards_${lbExam}_${lbDate}`;
      const q = query(collection(db!, collectionName), orderBy('netWpm', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results: any[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      setLbData(results);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLbLoading(false);
    }
  };

  const downloadPDF = () => {
    const pdfDoc = new jsPDF('landscape');
    pdfDoc.setFontSize(16);
    pdfDoc.text(`CalciPrep Live Leaderboard Archive`, 14, 15);
    pdfDoc.setFontSize(11);
    pdfDoc.text(`Exam: ${lbExam.toUpperCase()} | Date: ${lbDate}`, 14, 22);

    const tableColumn = ["Rank", "User", "Gross WPM", "Net WPM", "Accuracy", "Marks"];
    const tableRows = lbData.map((entry, index) => [
      index + 1,
      entry.userName || 'Unknown',
      Number(entry.wpm).toFixed(1),
      Number(entry.netWpm).toFixed(1),
      `${Number(entry.accuracy).toFixed(1)}%`,
      Number(entry.marks || 0).toFixed(1)
    ]);

    autoTable(pdfDoc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: [10, 115, 140] },
    });

    pdfDoc.save(`CalciPrep_${lbExam.toUpperCase()}_Leaderboard_${lbDate}.pdf`);
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Leaderboard Explorer</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Retrieve, review, and export past test results.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <select 
            value={lbExam} 
            onChange={(e) => setLbExam(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 font-bold text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option value="hcm">Delhi Police HCM</option>
            <option value="cgl">SSC CGL Tier-II</option>
            <option value="chsl">SSC CHSL Tier-II</option>
          </select>
          
          <input 
            type="date" 
            value={lbDate} 
            onChange={(e) => setLbDate(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 font-bold text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />

          <button 
            onClick={fetchLeaderboard}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            Fetch
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 mb-6">
        <table className="w-full text-left whitespace-nowrap text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Gross WPM</th>
              <th className="px-6 py-4">Net WPM</th>
              <th className="px-6 py-4">Accuracy</th>
              <th className="px-6 py-4">Marks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium bg-white">
            {lbLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400"><Loader2 className="animate-spin inline mr-2" size={16}/> Fetching data...</td></tr>
            ) : lbData.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">No data found for this date and exam. Click Fetch to begin.</td></tr>
            ) : (
              lbData.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-800">#{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{entry.userName}</td>
                  <td className="px-6 py-4 text-slate-500">{Number(entry.wpm).toFixed(1)}</td>
                  <td className="px-6 py-4 text-indigo-600 font-black">{Number(entry.netWpm).toFixed(1)}</td>
                  <td className="px-6 py-4 text-slate-500">{Number(entry.accuracy).toFixed(1)}%</td>
                  <td className="px-6 py-4 text-slate-500">{Number(entry.marks || 0).toFixed(1)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {lbData.length > 0 && (
        <div className="flex justify-end border-t border-slate-100 pt-6">
          <button 
            onClick={downloadPDF}
            className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <Download size={18} /> Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}