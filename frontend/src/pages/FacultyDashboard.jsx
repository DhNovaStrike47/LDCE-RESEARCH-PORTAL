import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import IncomingProposals from '../components/IncomingProposals'; 
import ApprovedTeams from '../components/ApprovedTeams'; 
import { Check, X, FileText, Eye, Search, Briefcase, Trash2, Inbox, Users } from 'lucide-react'; 
import API_URL from '../api'; 

const FacultyDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [labRequests, setLabRequests] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); 
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [activeTab, setActiveTab] = useState('projects'); 

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const fetchData = async () => {
        try {
            setLoading(true);
            const projRes = await axios.get(`${API_URL}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(projRes.data);

            const labRes = await axios.get(`${API_URL}/api/labs/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLabRequests(labRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Error:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleProjectAction = async (id, status) => {
        if(!window.confirm(`Confirm ${status} for this project?`)) return;
        setActionLoading(id);
        try {
            await axios.put(`${API_URL}/api/projects/approve/${id}`, 
                { status }, { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData(); 
        } catch (err) { alert("Status update failed"); } 
        finally { setActionLoading(null); }
    };

    const handleDeleteProject = async (id) => {
        if(!window.confirm("⚠️ Permanent Action: Remove project from repository?")) return;
        setActionLoading(id);
        try {
            await axios.delete(`${API_URL}/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) { alert("Delete failed"); }
        finally { setActionLoading(null); }
    };

    const handleLabAction = async (id, status) => {
        if(!window.confirm(`Confirm ${status} for this allocation?`)) return;
        setActionLoading(id);
        try {
            await axios.put(`${API_URL}/api/labs/approve/${id}`, 
                { status }, { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData(); 
        } catch (err) { alert("Status update failed"); } 
        finally { setActionLoading(null); }
    };

    const handleViewPdf = async (fileUrl) => {
        if (!fileUrl) return;
        const filename = fileUrl.replace(/^.*[\\\/]/, '');
        try {
            const response = await axios.get(`${API_URL}/api/projects/file/${filename}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' 
            });
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            setSelectedPdf(URL.createObjectURL(pdfBlob));
        } catch (err) { alert("Document access failed"); }
    };

    const filteredProjects = projects.filter(p => 
        (filterStatus === 'All' || p.status === filterStatus) &&
        (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (p.student && p.student.name && p.student.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const filteredLabs = labRequests.filter(l => 
        (filterStatus === 'All' || l.status === filterStatus) &&
        (l.labName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (l.student && l.student.name && l.student.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
            <div className="animate-pulse text-slate-400 font-medium uppercase tracking-[0.2em] text-xs">Syncing Workspace...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-10 font-sans">
            <Navbar />
            <div className="container mx-auto px-6 mt-10">
                
                {/* Refined Navigation Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#0B0F19] tracking-tight flex items-center gap-2">
                            <Briefcase size={24} className="text-[#6366F1]"/> Faculty Command Center
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Manage institutional research, resources, and scholar collaborations.</p>
                    </div>
                    
                    <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner border border-slate-300">
                        <button onClick={() => setActiveTab('projects')} className={`px-4 py-1.5 rounded-lg font-semibold text-[11px] uppercase tracking-wider transition-all ${activeTab === 'projects' ? 'bg-white text-[#0B0F19] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            Submissions ({projects.filter(p=>p.status==='Pending').length})
                        </button>
                        <button onClick={() => setActiveTab('labs')} className={`px-4 py-1.5 rounded-lg font-semibold text-[11px] uppercase tracking-wider transition-all ${activeTab === 'labs' ? 'bg-white text-[#0B0F19] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            Labs ({labRequests.filter(l=>l.status==='Pending').length})
                        </button>
                        <button onClick={() => setActiveTab('incoming')} className={`px-4 py-1.5 rounded-lg font-semibold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'incoming' ? 'bg-[#6366F1] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Inbox size={12}/> Incoming
                        </button>
                        <button onClick={() => setActiveTab('approved')} className={`px-4 py-1.5 rounded-lg font-semibold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'approved' ? 'bg-[#10B981] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Users size={12}/> My Team
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {(activeTab === 'projects' || activeTab === 'labs') && (
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-8 flex gap-3">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input type="text" placeholder="Search title or member..." className="w-full pl-10 pr-4 py-2 border-none rounded-xl outline-none bg-slate-50 text-sm font-medium focus:ring-1 focus:ring-[#6366F1]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>
                        <select className="px-4 py-2 border-none rounded-xl bg-slate-50 outline-none text-[11px] font-semibold uppercase tracking-wider cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="All">All Records</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                )}

                {/* Main Dynamic Workspace */}
                <div className="animate-in fade-in duration-500">
                    {activeTab === 'projects' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((p) => (
                                <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-[#6366F1] transition-all">
                                    <div className={`h-1 ${p.status === 'Approved' ? 'bg-[#10B981]' : p.status === 'Rejected' ? 'bg-red-400' : 'bg-[#F59E0B]'}`}></div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-base font-semibold text-slate-800 line-clamp-1 leading-tight">{p.title}</h3>
                                            <button onClick={() => handleDeleteProject(p._id)} disabled={actionLoading === p._id} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-[#6366F1] font-bold uppercase tracking-wider mb-4">{p.student ? p.student.name : "Member"} • {p.domain}</p>
                                        
                                        {p.fileUrl && (
                                            <button onClick={() => handleViewPdf(p.fileUrl)} className="w-full bg-slate-50 text-slate-600 py-2 rounded-lg font-semibold text-[11px] mb-6 hover:bg-indigo-50 hover:text-[#6366F1] transition-colors border border-slate-100 uppercase tracking-widest">
                                                <FileText size={12} className="inline mr-2"/> Review Synopsis
                                            </button>
                                        )}

                                        {p.status === 'Pending' && (
                                            <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-50">
                                                <button onClick={() => handleProjectAction(p._id, 'Approved')} disabled={actionLoading === p._id} className="bg-[#10B981] text-white py-2 rounded-lg font-semibold hover:bg-emerald-600 text-[11px] transition-colors uppercase">
                                                    {actionLoading === p._id ? '...' : 'Approve'}
                                                </button>
                                                <button onClick={() => handleProjectAction(p._id, 'Rejected')} disabled={actionLoading === p._id} className="bg-slate-100 text-slate-500 py-2 rounded-lg font-semibold hover:bg-red-50 hover:text-red-500 text-[11px] transition-colors uppercase">
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'labs' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredLabs.map((l) => (
                                <div key={l._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-[#6366F1] transition-all">
                                    <div className={`h-1 ${l.status === 'Approved' ? 'bg-[#10B981]' : l.status === 'Rejected' ? 'bg-red-400' : 'bg-[#F59E0B]'}`}></div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <h3 className="text-base font-semibold text-slate-800 mb-1">{l.labName}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mb-4">{l.student ? l.student.name : "Researcher"} • {l.date}</p>
                                        <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 mb-6 border border-slate-100 italic leading-relaxed">
                                            "{l.reason}"
                                        </div>
                                        
                                        {l.status === 'Pending' && (
                                            <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-50">
                                                <button onClick={() => handleLabAction(l._id, 'Approved')} disabled={actionLoading === l._id} className="bg-[#10B981] text-white py-2 rounded-lg font-semibold hover:bg-emerald-600 text-[11px] transition-colors uppercase">
                                                    Allocate
                                                </button>
                                                <button onClick={() => handleLabAction(l._id, 'Rejected')} disabled={actionLoading === l._id} className="bg-slate-100 text-slate-500 py-2 rounded-lg font-semibold hover:bg-red-50 hover:text-red-500 text-[11px] transition-colors uppercase">
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'incoming' && <IncomingProposals />}
                    {activeTab === 'approved' && <ApprovedTeams />}
                </div>
            </div>

            {/* Document Modal */}
            {selectedPdf && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0B0F19]/80 backdrop-blur-md p-4">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[32px] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-semibold text-[#0B0F19]">Document Review</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Digital Research Archive</p>
                            </div>
                            <button onClick={() => setSelectedPdf(null)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                        </div>
                        <iframe src={selectedPdf} className="w-full h-full" title="PDF Viewer"></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDashboard;