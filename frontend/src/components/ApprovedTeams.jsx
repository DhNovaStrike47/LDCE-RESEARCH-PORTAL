import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { Mail, Building, Briefcase, CheckCircle, Search, Send } from 'lucide-react';

const ApprovedTeams = ({ onDirectiveClick }) => {
    const [approvedList, setApprovedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        if (token) {
            axios.get(`${API_URL}/api/collaboration/my-requests/${user.email}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                const approved = res.data.filter(req => req.status === 'Approved' && req.receiverEmail === user.email);
                setApprovedList(approved);
            })
            .catch(err => console.error("Error loading team:", err))
            .finally(() => setLoading(false));
        }
    }, [user.email, token]);

    if (loading) return <div className="text-center p-10 text-slate-400 font-medium uppercase tracking-widest text-xs animate-pulse">Syncing Official Team...</div>;

    return (
        <div className="space-y-8 font-sans">
            <div className="flex justify-between items-end border-b border-slate-200 pb-5">
                <div>
                    <h2 className="text-xl font-semibold text-[#0B0F19] tracking-tight flex items-center gap-2">
                        <CheckCircle size={24} className="text-[#10B981]"/> Institutional Research Team
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Verified Active Collaborators</p>
                </div>
                <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider border border-emerald-100">
                    {approvedList.length} Scholars
                </span>
            </div>

            {approvedList.length === 0 ? (
                <div className="bg-slate-50 py-20 rounded-2xl text-center border border-dashed border-slate-300">
                    <Search className="mx-auto text-slate-300 mb-4" size={40}/>
                    <p className="text-sm font-medium text-slate-400">No approved collaborations found in the repository.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {approvedList.map(member => (
                        <div key={member._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#6366F1] transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xl border border-emerald-100 shadow-sm">
                                    {member.senderName ? member.senderName.charAt(0) : 'S'}
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-800 tracking-tight">{member.senderName}</h3>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.15em] mt-0.5">{member.senderRole || 'STUDENT'}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="bg-slate-50 p-3.5 rounded-xl flex items-center gap-3 border border-slate-100">
                                    <Building size={16} className="text-slate-400"/>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                                        <p className="text-xs font-semibold text-slate-700">{member.senderDepartment || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-xl flex items-center gap-3 border border-slate-100">
                                    <Mail size={16} className="text-slate-400"/>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
                                        <p className="text-xs font-semibold text-slate-700 truncate">{member.senderEmail}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <Briefcase size={12}/> Collaboration Assignment
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                                        {member.projectTitle}
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => onDirectiveClick(member)}
                                className="w-full py-3 bg-[#0B0F19] text-white rounded-xl text-[11px] font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                            >
                                <Send size={14}/> Issue Official Directive
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApprovedTeams;