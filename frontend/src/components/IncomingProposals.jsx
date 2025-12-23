import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { User, Building, Hash, Award, CheckCircle, XCircle, Eye, Github, Linkedin, Briefcase, FileText } from 'lucide-react';

const IncomingProposals = () => {
    const [proposals, setProposals] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const fetchProposals = () => {
        setLoading(true);
        axios.get(`${API_URL}/api/collaboration/my-requests/${user.email}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const incoming = res.data.filter(req => req.receiverEmail === user.email && req.status === 'Pending');
            setProposals(incoming);
        })
        .catch(err => console.error("Error fetching proposals:", err))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (token && user.email) {
            fetchProposals();
        }
    }, [user.email, token]);

    const handleAction = async (id, status) => {
        try {
            await axios.put(`${API_URL}/api/collaboration/approve/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposals(proposals.filter(p => p._id !== id));
            alert(`✅ Proposal ${status} successfully!`);
        } catch (err) {
            alert("❌ Action failed");
        }
    };

    if (loading) return <div className="text-center py-10 text-slate-400 font-medium uppercase tracking-widest text-xs animate-pulse">Syncing Incoming Proposals...</div>;

    return (
        <div className="space-y-6 font-sans">
            {proposals.length === 0 ? (
                <div className="bg-white py-20 rounded-2xl text-center border border-dashed border-slate-200">
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">No pending research inquiries found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {proposals.map((prop) => (
                        <div key={prop._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center group hover:border-[#6366F1] transition-all gap-6">
                            <div className="flex items-center gap-5 flex-grow">
                                {/* Refined Avatar */}
                                <div className="w-14 h-14 bg-[#0B0F19] rounded-xl flex items-center justify-center text-white text-xl font-semibold shadow-sm">
                                    {prop.senderName.charAt(0)}
                                </div>
                                
                                <div>
                                    <h3 className="text-base font-semibold text-slate-800 tracking-tight">{prop.senderName}</h3>
                                    <div className="flex flex-wrap gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-[#6366F1] font-bold text-[9px] uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                                            <Building size={10}/> {prop.senderDepartment}
                                        </span>
                                        <span className="flex items-center gap-1 text-slate-400 font-bold text-[9px] uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                            <Hash size={10}/> {prop.senderEnrollment}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-slate-500 font-medium text-xs">Targeting Project: <span className="text-[#0B0F19] font-semibold italic">"{prop.projectTitle}"</span></p>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <button 
                                    onClick={() => setSelectedStudent(prop)}
                                    className="flex-1 md:flex-none p-2.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-[#6366F1] transition-colors flex items-center justify-center gap-2 font-semibold text-[10px] uppercase tracking-widest"
                                    title="View Full Dossier"
                                >
                                    <Eye size={16}/> Dossier
                                </button>
                                <button 
                                    onClick={() => handleAction(prop._id, 'Approved')}
                                    className="flex-1 md:flex-none px-6 py-2.5 bg-[#10B981] text-white rounded-lg font-semibold hover:bg-emerald-600 shadow-sm transition-colors text-[10px] uppercase tracking-widest"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleAction(prop._id, 'Rejected')}
                                    className="flex-1 md:flex-none px-6 py-2.5 bg-white text-slate-400 rounded-lg font-semibold hover:bg-red-50 hover:text-red-500 transition-colors border border-slate-100 text-[10px] uppercase tracking-widest"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FULL DETAIL MODAL: RESTYLED */}
            {selectedStudent && (
                <div className="fixed inset-0 z-[150] bg-[#0B0F19]/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-200">
                        {/* Modal Header */}
                        <div className="bg-[#0B0F19] p-8 text-white flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-400 mb-2">Detailed Applicant Dossier</p>
                                <h3 className="text-3xl font-semibold tracking-tight">{selectedStudent.senderName}</h3>
                                <div className="mt-4">
                                    <a href={selectedStudent.senderLinkedIn} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition text-[10px] font-semibold uppercase tracking-widest border border-white/10">
                                        <Linkedin size={14} className="text-[#0077b5]"/> LinkedIn Profile
                                    </a>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="p-2 bg-white/10 rounded-full hover:bg-red-500 transition-colors">
                                <XCircle size={24}/>
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6 max-h-[55vh] overflow-y-auto custom-scrollbar">
                            {/* Academic Identity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Institutional ID</p>
                                    <p className="text-lg font-semibold text-slate-800 font-mono tracking-tight">{selectedStudent.senderEnrollment}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Department</p>
                                    <p className="text-lg font-semibold text-slate-800 tracking-tight">{selectedStudent.senderDepartment}</p>
                                </div>
                            </div>

                            {/* Achievements Dossier */}
                            <div className="p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">
                                    <Award size={16}/> Research Achievements & Focus
                                </label>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                                    "{selectedStudent.senderAchievements || "No profile achievements listed."}"
                                </p>
                            </div>

                            {/* Technical Project Details */}
                            <div className="p-6 bg-white rounded-2xl border border-slate-200">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    <Briefcase size={16}/> Linked Research: {selectedStudent.projectTitle}
                                </label>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Abstract Summary</p>
                                        <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{selectedStudent.projectDescription || "No description provided."}"</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 pt-3">
                                        <a href={selectedStudent.projectGithub} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:bg-indigo-50 transition-colors">
                                            <Github size={14}/> Repository
                                        </a>
                                        <a href={selectedStudent.researchPaperLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:bg-indigo-50 transition-colors">
                                            <FileText size={14}/> Synopsis / DOI
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Note */}
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Researcher Statement</p>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed">"{selectedStudent.message}"</p>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button 
                                onClick={() => { handleAction(selectedStudent._id, 'Approved'); setSelectedStudent(null); }}
                                className="flex-1 py-3.5 bg-[#10B981] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95"
                            >
                                Accept Scholar
                            </button>
                            <button 
                                onClick={() => setSelectedStudent(null)}
                                className="flex-1 py-3.5 bg-white text-slate-400 text-[11px] font-bold uppercase tracking-widest rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomingProposals;