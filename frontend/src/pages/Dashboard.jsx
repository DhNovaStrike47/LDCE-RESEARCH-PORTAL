import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import StudentStatusTracker from '../components/StudentStatusTracker';
// 🟢 FIX: Changed from named import { StudentApprovedCollaborations } to default import
import StudentApprovedCollaborations from '../components/StudentApprovedCollaborations';
import API_URL from '../api';
import { BookOpen, Users, DollarSign, LayoutDashboard, Search, Filter } from 'lucide-react';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 🔍 Filter States Preserved
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [deptFilter, setDeptFilter] = useState('All');

    const userString = sessionStorage.getItem('user') || localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        
        axios.get(`${API_URL}/api/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setProjects(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error fetching projects:", err);
            setLoading(false);
        });
    }, []);

    // 🔍 Filtering Logic Preserved
    const filteredProjects = projects.filter(proj => {
        const matchesSearch = proj.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (proj.student?.name && proj.student.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || proj.status === statusFilter;
        const matchesDept = deptFilter === 'All' || proj.department === deptFilter;
        return matchesSearch && matchesStatus && matchesDept;
    });

    if (!user) return <div className="min-h-screen bg-slate-50 font-sans"><Navbar /><div className="text-center py-20 font-medium">Please login.</div></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-10 font-sans">
            <Navbar />
            <div className="container mx-auto px-6 py-10">
                {user.role === 'student' && (
                    <div className="space-y-8 mb-10 animate-in fade-in duration-500">
                        <StudentStatusTracker />
                        <StudentApprovedCollaborations studentName={user.name} />
                        <hr className="border-slate-200" />
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#0B0F19] tracking-tight flex items-center gap-2">
                            <LayoutDashboard className="text-[#6366F1]" size={24}/> Institutional Repository
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Live technical database of LDCE academic research.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-xs font-semibold text-[#6366F1] flex items-center gap-2">
                        <BookOpen size={16}/> Entries: {projects.length}
                    </div>
                </div>

                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-wrap gap-3 items-center">
                    <div className="relative flex-grow min-w-[250px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Filter by title or researcher..." 
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-[#6366F1]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                        <Filter size={14} className="text-slate-400"/>
                        <select 
                            className="bg-transparent border-none text-[11px] font-semibold text-slate-600 outline-none uppercase tracking-wider cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p className="text-center text-slate-400 font-medium py-20 animate-pulse uppercase tracking-widest text-xs">Syncing Repository...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((proj) => (
                            <div key={proj._id} className="bg-white rounded-2xl border border-slate-200 hover:border-[#6366F1] transition-all duration-300 flex flex-col group overflow-hidden shadow-sm">
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-semibold text-[#6366F1] bg-indigo-50 px-3 py-1 rounded text-center uppercase tracking-wider">
                                            {proj.domain}
                                        </span>
                                        <div className={`w-2 h-2 rounded-full ${proj.status === 'Approved' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}></div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 leading-snug mb-3 group-hover:text-[#6366F1] transition-colors line-clamp-2">
                                        {proj.title}
                                    </h3>
                                    <p className="text-slate-500 text-xs font-medium line-clamp-3 leading-relaxed mb-6 italic">
                                        "{proj.description}"
                                    </p>
                                    <div className="flex items-center text-[10px] font-semibold text-slate-400 mt-auto pt-4 border-t border-slate-50 gap-2 uppercase tracking-widest">
                                        <Users size={12} />
                                        <span>{proj.student?.name || "Member"}</span>
                                    </div>
                                </div>
                                <div className={`px-6 py-3 text-[9px] font-semibold uppercase tracking-wider flex justify-between items-center ${proj.isFunded ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                                    <span className="flex items-center gap-2">
                                        <DollarSign size={12}/>
                                        {proj.isFunded ? `Grant: ${proj.fundingAgency}` : "Self Financed"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;