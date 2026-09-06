'use client';

import React, { useState, useEffect } from 'react';
// ADDED: Imported useRouter to enable actual navigation
import { useRouter } from 'next/navigation'; 
import { db } from '@/lib/firebase';
import { collection, query, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Search, Loader2, Trash2, LayoutDashboard, Shield, Activity, CalendarDays, Clock } from 'lucide-react';

export default function UsersTab() {
  // ADDED: Initialize the Next.js router
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const q = query(collection(db!, 'users'), limit(500)); 
      const querySnapshot = await getDocs(q);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users: any[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setUsersList(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const confirmDelete = window.confirm(`Are you absolutely sure you want to delete the database profile for ${userEmail}? This will erase their history forever.`);
    if (!confirmDelete) return;
    
    try {
      await deleteDoc(doc(db!, 'users', userId));
      setUsersList(usersList.filter(user => user.id !== userId));
      alert("User profile deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Check permissions.");
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 animate-in fade-in duration-300">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">User management <span className="ml-2 text-sm bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg">{usersList.length}</span></h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage your students and their account permissions here.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* MODERN DATA TABLE */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
        <table className="w-full text-left whitespace-nowrap text-sm">
          {/* UPDATED: Colorful Teal Header matching your website's primary theme! */}
          <thead className="bg-[#0a738c] border-b border-[#085a6e]">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">Full name</th>
              <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider">@ Email</th>
              <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider flex items-center gap-1"><Shield size={14}/> Role</th>
              <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider"><span className="flex items-center gap-1"><Activity size={14}/> Status</span></th>
              <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider"><span className="flex items-center gap-1"><CalendarDays size={14}/> Joined</span></th>
              <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider"><span className="flex items-center gap-1"><Clock size={14}/> Last Login</span></th>
              <th className="px-6 py-4 text-xs font-bold text-white/90 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {usersLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-medium"><Loader2 className="animate-spin inline mr-2" size={16}/> Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-medium">No users found matching your search.</td></tr>
            ) : (
              filteredUsers.map(user => {
                const isAdmin = user.email === 'calciprep@gmail.com';
                const initials = (user.name || user.displayName || user.email || '?')[0].toUpperCase();
                
                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* AVATAR & NAME */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 border shadow-sm ${isAdmin ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-[#e6f7fa] text-[#0a738c] border-[#bdedf4]'}`}>
                          {initials}
                        </div>
                        <span className="font-bold text-slate-900">{user.name || user.displayName || 'Unknown User'}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-slate-500 font-medium">{user.email}</td>
                    
                    <td className="px-6 py-4">
                      <span className={`font-bold ${isAdmin ? 'text-indigo-600' : 'text-slate-600'}`}>
                        {isAdmin ? 'Admin' : 'Student'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isAdmin ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                        Active
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-slate-500 font-medium">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{formatDate(user.lastLogin || user.createdAt)}</td>
                    
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      {/* FIXED: The Dashboard Button now routes to the actual user! */}
                      <button 
                        onClick={() => router.push(`/admin/user/${user.id}`)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 opacity-90 group-hover:opacity-100"
                      >
                        <LayoutDashboard size={14} /> Dashboard
                      </button>
                      
                      {!isAdmin && (
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100 opacity-90 group-hover:opacity-100"
                          title="Delete User Profile"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}