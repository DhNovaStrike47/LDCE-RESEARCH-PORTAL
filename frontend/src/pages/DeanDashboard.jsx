import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../api';
import { LayoutDashboard, FileText, Beaker, Users as UsersIcon, Award } from 'lucide-react';

const DeanDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentLabs, setRecentLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) { setError("Login required."); setLoading(false); return; }
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
                setStats(res.data.stats);
                setRecentProjects(res.data.recentProjects);
                setRecentLabs(res.data.recentLabs);
                setLoading(false);
            } catch (err) { setError("Access Error"); setLoading(false); }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center mt-20 text-sm font-medium text-slate-400 uppercase tracking-widest animate-pulse">Consulting Principal's Desk...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-10 font-sans">
            <Navbar />
            <div className="container mx-auto px-6 py-10">
                <div className="mb-10 border-b border-slate-200 pb-5 flex items-center gap-3">
                    <h1 className="text-2xl font-semibold text-[#0B0F19] tracking-tight">Principal's Command Center</h1>
                    <span className="text-[10px] bg-[#6366F1] text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest">Admin</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-[#6366F1]">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Research Projects</p>
                        <p className="text-3xl font-semibold text-[#0B0F19] mt-1">{stats?.totalProjects}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-[#10B981]">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Grant Total</p>
                        <p className="text-3xl font-semibold text-slate-800 mt-1">₹{stats?.totalGrant}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-indigo-300">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Student Researchers</p>
                        <p className="text-3xl font-semibold text-slate-800 mt-1">{stats?.totalStudents}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-amber-400">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Faculty Chairs</p>
                        <p className="text-3xl font-semibold text-slate-800 mt-1">{stats?.totalFaculty}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-slate-800">
                            <FileText size={18} className="text-[#6366F1]"/>
                            <h3 className="font-semibold text-sm uppercase tracking-wide">Recent Submissions</h3>
                        </div>
                        <div className="space-y-4">
                            {recentProjects.map(p => (
                                <div key={p._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="font-semibold text-sm text-slate-800 line-clamp-1">{p.title}</p>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">{p.student?.name} • {p.domain}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-slate-800">
                            <Beaker size={18} className="text-[#10B981]"/>
                            <h3 className="font-semibold text-sm uppercase tracking-wide">Lab Allocations</h3>
                        </div>
                        <div className="space-y-4">
                            {recentLabs.map(l => (
                                <div key={l._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div>
                                        <p className="font-semibold text-sm text-slate-800">{l.labName}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{l.date} • {l.student?.name}</p>
                                    </div>
                                    <span className={`text-[9px] px-3 py-1 rounded font-bold uppercase tracking-wider ${l.status==='Approved'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>
                                        {l.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeanDashboard;