'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getCountFromServer, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Loader2, Power, Bell, Settings, Activity, CalendarClock, AlertTriangle, Link as LinkIcon } from 'lucide-react';

// Accept the state props from page.tsx
export default function OverviewTab({ 
  setSaveState, 
  setSaveMsg 
}: { 
  setSaveState: (val: boolean) => void, 
  setSaveMsg: (msg: string) => void 
}) {
  const [loading, setLoading] = useState(true);

  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [todaySubmissions, setTodaySubmissions] = useState(0);
  const [topSpeed, setTopSpeed] = useState(0);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [tickerText, setTickerText] = useState("");
  const [tickerLink, setTickerLink] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:50");
  
  const [cglActive, setCglActive] = useState(false);
  const [chslActive, setChslActive] = useState(false);
  const [hcmActive, setHcmActive] = useState(false);
  
  const [cglLaunchDate, setCglLaunchDate] = useState("");
  const [cglPauseDate, setCglPauseDate] = useState("");
  const [chslLaunchDate, setChslLaunchDate] = useState("");
  const [chslPauseDate, setChslPauseDate] = useState("");
  const [hcmLaunchDate, setHcmLaunchDate] = useState("");
  const [hcmPauseDate, setHcmPauseDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // STRICT db! ENFORCEMENT
        const docRef = doc(db!, 'app_settings', 'live_tests');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMaintenanceMode(data.maintenanceMode || false);
          setTickerText(data.tickerText || '');
          setTickerLink(data.tickerLink || '/live-tests/typing/delhi_police_hcm');
          setStartTime(data.startTime || "10:00");
          setEndTime(data.endTime || "11:50");
          setCglActive(data.cglActive || false);
          setChslActive(data.chslActive || false);
          setHcmActive(data.hcmActive || false);
          setCglLaunchDate(data.cglLaunchDate || "");
          setCglPauseDate(data.cglPauseDate || "");
          setChslLaunchDate(data.chslLaunchDate || "");
          setChslPauseDate(data.chslPauseDate || "");
          setHcmLaunchDate(data.hcmLaunchDate || "");
          setHcmPauseDate(data.hcmPauseDate || "");
        }

        // STRICT db! ENFORCEMENT
        const usersSnap = await getCountFromServer(collection(db!, 'users'));
        setTotalUsersCount(usersSnap.data().count);

        const now = new Date();
        now.setHours(now.getHours() - 4);
        const dateStr = now.toLocaleDateString('en-CA');
        
        // STRICT db! ENFORCEMENT
        const hcmCount = await getCountFromServer(collection(db!, `live_leaderboards_hcm_${dateStr}`));
        const cglCount = await getCountFromServer(collection(db!, `live_leaderboards_cgl_${dateStr}`));
        const chslCount = await getCountFromServer(collection(db!, `live_leaderboards_chsl_${dateStr}`));
        setTodaySubmissions(hcmCount.data().count + cglCount.data().count + chslCount.data().count);

        // STRICT db! ENFORCEMENT
        const speedQuery = query(collection(db!, `live_leaderboards_cgl_${dateStr}`), orderBy('netWpm', 'desc'), limit(1));
        const speedSnap = await getDocs(speedQuery);
        if (!speedSnap.empty) setTopSpeed(speedSnap.docs[0].data().netWpm);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePauseDateChange = (exam: 'cgl' | 'chsl' | 'hcm', dateValue: string) => {
    const now = new Date();
    now.setHours(now.getHours() - 4);
    const dateString = now.toLocaleDateString('en-CA');
    const isFuturePause = dateValue && dateValue > dateString;

    if (exam === 'hcm') { setHcmPauseDate(dateValue); if (isFuturePause) setHcmActive(false); }
    else if (exam === 'cgl') { setCglPauseDate(dateValue); if (isFuturePause) setCglActive(false); }
    else if (exam === 'chsl') { setChslPauseDate(dateValue); if (isFuturePause) setChslActive(false); }
  };

  const handleSave = async () => {
    setSaveState(true);
    setSaveMsg('');
    try {
      // STRICT db! ENFORCEMENT
      await setDoc(doc(db!, 'app_settings', 'live_tests'), {
        maintenanceMode, tickerText, tickerLink, startTime, endTime,
        cglActive, chslActive, hcmActive,
        cglLaunchDate, cglPauseDate, chslLaunchDate, chslPauseDate, hcmLaunchDate, hcmPauseDate,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      setSaveMsg('Settings updated successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMsg('Error saving settings.');
    } finally {
      setSaveState(false);
    }
  };

  const BentoToggle = ({ label, isActive, onChange }: { label: string, isActive: boolean, onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        <Power size={16} className={isActive ? "text-emerald-500" : "text-slate-300"} />
        <span className="font-bold text-sm text-slate-900">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-black uppercase ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>{isActive ? 'Active' : 'Offline'}</span>
        <button onClick={onChange} className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}>
          <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-300 ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div>;

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* THIS IS THE INVISIBLE TRIGGER BUTTON */}
      <button id="hidden-save-btn" onClick={handleSave} className="hidden" aria-hidden="true">Save</button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* PLATFORM STATUS */}
        <div className={`rounded-[1.5rem] p-6 shadow-sm border ${maintenanceMode ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-700' : 'bg-gradient-to-br from-[#7DF2CE] to-[#34D399] border-black/10'} flex flex-col justify-between relative overflow-hidden h-[220px] transition-all`}>
          <div className="absolute top-4 right-4 bg-white/30 p-2 rounded-full">
            {maintenanceMode ? <AlertTriangle className="text-white" size={18} /> : <Activity className="text-slate-900" size={18} />}
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-1 mt-2 z-10 leading-tight">
              {maintenanceMode ? 'Maintenance' : 'System'}<br/>{maintenanceMode ? 'Mode ON' : 'Online'}
            </h2>
            <p className="text-slate-800 font-bold text-xs z-10 max-w-[80%] opacity-80">
              {maintenanceMode ? 'Website is currently locked down.' : 'All server routes are operational.'}
            </p>
          </div>
          <div className="flex items-center justify-between bg-black/10 p-2 rounded-xl backdrop-blur-sm z-10">
            <span className="font-bold text-xs text-slate-900 ml-2">Master Kill Switch</span>
            <button onClick={() => setMaintenanceMode(!maintenanceMode)} className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${maintenanceMode ? 'bg-red-900' : 'bg-white/50'}`}>
              <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-300 ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* TEST CONTROLS */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200 h-[220px] flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Live Toggles</h2>
            <Settings size={16} className="text-slate-900" />
          </div>
          <div className="flex flex-col flex-1 justify-center">
            <BentoToggle label="Delhi Police HCM" isActive={hcmActive} onChange={() => setHcmActive(!hcmActive)} />
            <BentoToggle label="SSC CGL Tier-II" isActive={cglActive} onChange={() => setCglActive(!cglActive)} />
            <BentoToggle label="SSC CHSL Tier-II" isActive={chslActive} onChange={() => setChslActive(!chslActive)} />
          </div>
        </div>

        {/* TIME AUTOMATION */}
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200 h-[220px] flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Time Automation</h2>
            <CalendarClock size={16} className="text-slate-900" />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-bold text-xs text-slate-600">Start Time</span>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-transparent text-emerald-600 font-bold outline-none text-sm" />
            </div>
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-bold text-xs text-slate-600">End Time</span>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-transparent text-emerald-600 font-bold outline-none text-sm" />
            </div>
          </div>
        </div>

        {/* ADVANCED SCHEDULER */}
        <div className="bg-[#111111] rounded-[1.5rem] p-6 shadow-sm border border-black lg:col-span-2 text-white flex flex-col h-full min-h-[260px]">
          <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-6">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Advanced Exam Scheduler</h2>
            <Activity size={16} className="text-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4"><div className="w-3 h-3 rounded-full bg-[#A3E635]"></div><h3 className="text-sm font-bold text-white">DP HCM</h3></div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Launch Date</label>
              <input type="date" value={hcmLaunchDate} onChange={(e) => setHcmLaunchDate(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs text-white outline-none mb-3" />
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Pause Date</label>
              <input type="date" value={hcmPauseDate} onChange={(e) => handlePauseDateChange('hcm', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs text-white outline-none" />
            </div>
            <div className="flex flex-col border-t border-white/10 pt-4 md:pt-0 md:border-t-0 md:border-l md:border-white/10 md:pl-6">
              <div className="flex items-center gap-2 mb-4"><div className="w-3 h-3 rounded-full bg-[#A3E635]"></div><h3 className="text-sm font-bold text-white">SSC CGL</h3></div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Launch Date</label>
              <input type="date" value={cglLaunchDate} onChange={(e) => setCglLaunchDate(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs text-white outline-none mb-3" />
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Pause Date</label>
              <input type="date" value={cglPauseDate} onChange={(e) => handlePauseDateChange('cgl', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs text-white outline-none" />
            </div>
            <div className="flex flex-col border-t border-white/10 pt-4 md:pt-0 md:border-t-0 md:border-l md:border-white/10 md:pl-6">
              <div className="flex items-center gap-2 mb-4"><div className="w-3 h-3 rounded-full bg-[#A3E635]"></div><h3 className="text-sm font-bold text-white">SSC CHSL</h3></div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Launch Date</label>
              <input type="date" value={chslLaunchDate} onChange={(e) => setChslLaunchDate(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs text-white outline-none mb-3" />
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Pause Date</label>
              <input type="date" value={chslPauseDate} onChange={(e) => handlePauseDateChange('chsl', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs text-white outline-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-1 h-full">
          {/* TICKER */}
          <div className="bg-[#D9F99D] rounded-[1.5rem] p-5 shadow-sm border border-[#bef264] flex-1 flex flex-col min-h-[140px]">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1"><Bell size={12}/> Global Ticker</h2>
            <textarea value={tickerText} onChange={(e) => setTickerText(e.target.value)} className="w-full flex-1 p-2 bg-black/5 border-none rounded-lg text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-black transition-all outline-none resize-none text-xs leading-relaxed mb-2" placeholder="Enter announcement text..." />
            <div className="flex items-center gap-2 bg-white/40 p-2 rounded-lg border border-black/10">
              <LinkIcon size={12} className="text-slate-700" />
              <select value={tickerLink} onChange={(e) => setTickerLink(e.target.value)} className="bg-transparent w-full outline-none text-xs font-bold text-slate-900 cursor-pointer">
                <option value="/live-tests/typing/delhi_police_hcm">Delhi Police HCM</option>
                <option value="/live-tests/typing/ssc_cgl">SSC CGL Tier-II</option>
                <option value="/live-tests/typing/ssc_chsl">SSC CHSL Tier-II</option>
                <option value="/live-tests">General Arena Main Page</option>
              </select>
            </div>
          </div>

          {/* PLATFORM STATS */}
          <div className="bg-[#A5F3FC] rounded-[1.5rem] p-5 shadow-sm border border-[#67E8F9] flex-1 min-h-[100px] flex flex-col justify-center relative">
            <h2 className="text-xs font-black text-cyan-900 uppercase tracking-wider mb-3 flex items-center gap-1">Live Database Stats</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-cyan-200/50 pb-1">
                <span className="text-xs font-bold text-cyan-800">Total Users</span>
                <span className="text-sm font-black text-slate-900">{totalUsersCount}</span>
              </div>
              <div className="flex items-center justify-between border-b border-cyan-200/50 pb-1">
                <span className="text-xs font-bold text-cyan-800">Today's Tests</span>
                <span className="text-sm font-black text-slate-900">{todaySubmissions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-800">Today's Top Speed</span>
                <span className="text-sm font-black text-slate-900">{topSpeed ? `${topSpeed} WPM` : '--'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}