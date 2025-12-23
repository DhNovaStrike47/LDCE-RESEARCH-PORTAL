import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { User, Building, Hash, Award, CheckCircle, XCircle, Eye, Briefcase } from 'lucide-react';

const FacultyPanel = () => {
    const [proposals, setProposals] = useState([]);
    const [selectedProp, setSelectedProp] = useState(null); 
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        if (token) {
            axios.get(`${API_URL}/api/collaboration/my-requests/${user.email}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                const incoming = res.data.filter(req => req.status === 'Pending' && req.receiverEmail === user.email);
                setProposals(incoming);
            })
            .catch(err => console.error("Error loading proposals", err));
        }
    }, [user.email, token]);

    const handleAction = async (id, status) => {
        try {
            await axios.put(`${API_URL}/api/collaboration/approve/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposals(proposals.filter(p => p._id !== id));
            alert(`Proposal ${status} Successfully!`);
        } catch (err) { alert("Failed to update status"); }
    };

    return (
        <div className="space-y-6 font-sans">
            <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-semibold text-[#0B0F19] tracking-tight">
                    Incoming Scholar Proposals
                </h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Pending Collaboration Inquiries</p>
            </div>

            {proposals.length === 0 ? (
                <div className="bg-slate-50 py-16 rounded-2xl text-center border border-dashed border-slate-300">
                    <p className="text-sm font-medium text-slate-400">No new research proposals currently in queue.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {proposals.map(prop => (
                        <div key={prop._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center group hover:border-[#6366F1] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-[#6366F1] font-semibold text-lg border border-indigo-100">
                                    {prop.senderName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-base font-semibold text-slate-800">{prop.senderName}</h4>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                        <Building size={12}/> {prop.senderDepartment}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4 md:mt-0">
                                <button 
                                    onClick={() => setSelectedProp(prop)}
                                    className="bg-slate-50 text-slate-500 p-2.5 rounded-lg hover:bg-indigo-50 hover:text-[#6366F1] transition-colors border border-slate-100"
                                    title="View Dossier"
                                >
                                    <Eye size={18}/>
                                </button>
                                <button onClick={() => handleAction(prop._id, 'Approved')} className="bg-[#10B981] text-white px-5 py-2 rounded-lg font-semibold text-[11px] uppercase tracking-wider shadow-sm hover:bg-emerald-600 transition-colors">Approve</button>
                                <button onClick={() => handleAction(prop._id, 'Rejected')} className="bg-white text-slate-400 px-5 py-2 rounded-lg font-semibold text-[11px] uppercase tracking-wider hover:bg-red-50 hover:text-red-500 transition-colors border border-slate-100">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detailed Dossier Modal */}
            {selectedProp && (
                <div className="fixed inset-0 z-[100] bg-[#0B0F19]/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                        <div className="bg-[#0B0F19] p-8 text-white">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-400 mb-2">Detailed Applicant Dossier</p>
                            <h3 className="text-3xl font-semibold tracking-tight">{selectedProp.senderName}</h3>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Institutional ID</p>
                                    <p className="text-lg font-semibold text-slate-800 font-mono tracking-tight">{selectedProp.senderEnrollment}</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Academic Department</p>
                                    <p className="text-lg font-semibold text-slate-800 tracking-tight">{selectedProp.senderDepartment}</p>
                                </div>
                            </div>

                            <div className="bg-indigo-50/30 p-6 rounded-xl border border-indigo-100">
                                <label className="flex items-center gap-2 text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-3">
                                    <Briefcase size={14}/> Linked Research Publication
                                </label>
                                <h4 className="text-base font-semibold text-slate-800 mb-2">{selectedProp.projectTitle}</h4>
                                <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                                    "{selectedProp.message || "No project abstract provided."}"
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => { handleAction(selectedProp._id, 'Approved'); setSelectedProp(null); }}
                                    className="flex-1 py-3 bg-[#6366F1] text-white text-xs font-semibold uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                >
                                    Confirm Acceptance
                                </button>
                                <button 
                                    onClick={() => setSelectedProp(null)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyPanel;