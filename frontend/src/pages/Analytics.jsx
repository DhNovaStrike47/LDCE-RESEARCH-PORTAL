import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
    PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { Filter, TrendingUp, DollarSign, PieChart as PieIcon, FileText, Calendar } from 'lucide-react';
import API_URL from '../api';

const Analytics = () => {
    const [allProjects, setAllProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startYear, setStartYear] = useState(2020);
    const [endYear, setEndYear] = useState(2025);

    const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        axios.get(`${API_URL}/api/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setAllProjects(res.data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Analytics Fetch Error:", err);
            setLoading(false);
        });
    }, []);

    const data = useMemo(() => {
        const filtered = allProjects.filter(p => {
            const y = parseInt(p.projectYear || (p.createdAt && p.createdAt.substring(0, 4)));
            return y >= startYear && y <= endYear;
        });

        const domains = {};
        const fundsByYear = {};
        const statuses = { Approved: 0, Pending: 0, Rejected: 0 };
        const programs = {};
        let grantTotal = 0;

        filtered.forEach(p => {
            domains[p.domain] = (domains[p.domain] || 0) + 1;
            if (p.isFunded) {
                fundsByYear[p.projectYear] = (fundsByYear[p.projectYear] || 0) + (p.amountGranted || 0);
                grantTotal += (p.amountGranted || 0);
            }
            if (statuses[p.status] !== undefined) statuses[p.status]++;
            const prog = p.program || 'Unknown';
            programs[prog] = (programs[prog] || 0) + 1;
        });

        return {
            filteredProjects: filtered,
            domainData: Object.keys(domains).map(k => ({ name: k, value: domains[k] })),
            fundData: Object.keys(fundsByYear).map(k => ({ year: k, amount: fundsByYear[k] })).sort((a,b) => a.year - b.year),
            statusData: Object.keys(statuses).map(k => ({ name: k, value: statuses[k] })),
            programData: Object.keys(programs).map(k => ({ name: k, count: programs[k] })),
            totalGrant: grantTotal
        };
    }, [allProjects, startYear, endYear]);

    // 🟢 Preserved original colors from your favorite design
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#6366F1'];

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
            <div className="animate-pulse text-slate-400 font-medium uppercase tracking-[0.2em] text-xs">Syncing Analytics Engine...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
            <Navbar />
            <div className="container mx-auto px-6 py-10">
                
                {/* Refined Technical Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-slate-200 pb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#0B0F19] tracking-tight flex items-center gap-2">
                            <TrendingUp className="text-[#6366F1]" size={24}/> Institutional Data Analytics
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Research Output Oversight</p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                        <Calendar size={14} className="text-slate-400" />
                        <select value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className="outline-none text-[11px] font-bold bg-transparent cursor-pointer uppercase">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <span className="text-slate-300 mx-1">—</span>
                        <select value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} className="outline-none text-[11px] font-bold bg-transparent cursor-pointer uppercase">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* Summary Cards with Reduced Typography Weights */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-[#6366F1]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Projects</p>
                        <p className="text-3xl font-semibold text-[#0B0F19] mt-1">{data.filteredProjects.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-[#10B981]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grant Volume</p>
                        <p className="text-2xl font-semibold text-[#10B981] mt-1">₹{data.totalGrant.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-indigo-300">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Domains</p>
                        <p className="text-3xl font-semibold text-slate-800 mt-1">{data.domainData.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-amber-400">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutional Yield</p>
                        <p className="text-3xl font-semibold text-slate-800 mt-1">
                            {((data.statusData.find(s=>s.name==='Approved')?.value || 0) / (data.filteredProjects.length || 1) * 100).toFixed(0)}%
                        </p>
                    </div>
                </div>

                {/* 🟢 GRAPHS PRESERVED EXACTLY AS PER YOUR FAVORITE DESIGN */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-96">
                        <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <PieIcon size={18}/> Domain Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie data={data.domainData} innerRadius={60} outerRadius={100} dataKey="value" label>
                                    {data.domainData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-96">
                        <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <DollarSign size={18}/> Funding Trends
                        </h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <AreaChart data={data.fundData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                                <Area type="monotone" dataKey="amount" stroke="#10B981" fill="#D1FAE5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 🟢 BAR CHART PRESERVED AS PER SCREENSHOT */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-96">
                        <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <TrendingUp size={18}/> Program Participation
                        </h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={data.programData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-96">
                        <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <FileText size={18}/> Project Status Overview
                        </h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie data={data.statusData} innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value">
                                    <Cell fill="#10B981" /> {/* Approved */}
                                    <Cell fill="#F59E0B" /> {/* Pending */}
                                    <Cell fill="#EF4444" /> {/* Rejected */}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

               
               {/* 🟢 REPOSITORY CENSUS: strictly filtered by selected range */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={16}/> Repository Census Listing
                        </h3>
                        <span className="text-[10px] font-bold text-[#6366F1] bg-indigo-50 px-2 py-0.5 rounded-md">
                            SHOWING YEARS: {startYear} - {endYear}
                        </span>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Nomenclature</th>
                                <th className="px-6 py-4">Researcher</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Grant Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {data.filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-medium italic">
                                        No research entries found for this temporal range.
                                    </td>
                                </tr>
                            ) : (
                                data.filteredProjects.map(p => (
                                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{p.title}</td>
                                        <td className="px-6 py-4 text-slate-500">{p.student?.name || "Faculty Member"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${
                                                p.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                p.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-[#10B981]">
                                            {p.isFunded ? `₹${p.amountGranted.toLocaleString()}` : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div> 


            
            </div>
        </div>
    );
};

export default Analytics;