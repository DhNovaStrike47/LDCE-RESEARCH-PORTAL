import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { Clock, CheckCircle, XCircle, Briefcase, User, Mail, Calendar } from 'lucide-react';

const StudentStatusTracker = () => {
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        if (token && user.email) {
            axios.get(`${API_URL}/api/collaboration/my-requests/${user.email}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                // 🟢 Preserved Logic: Filter for requests where this student is the sender
                const sent = res.data.filter(req => req.senderEmail === user.email);
                setMyRequests(sent);
            })
            .catch(err => console.error("Error fetching status:", err))
            .finally(() => setLoading(false));
        }
    }, [user.email, token]);

    if (loading) return <div className="p-10 text-center text-slate-400 font-medium uppercase tracking-widest text-xs animate-pulse">Syncing Collaboration Log...</div>;

    return (
        <div className="space-y-8 font-sans">
            <div className="border-b border-slate-200 pb-5">
                <h2 className="text-xl font-semibold text-[#0B0F19] tracking-tight flex items-center gap-2">
                    <Briefcase size={24} className="text-[#6366F1]"/> Collaboration Track
                </h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Outbound research proposals</p>
            </div>

            {myRequests.length === 0 ? (
                <div className="bg-white p-16 rounded-2xl text-center border border-dashed border-slate-200">
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">No collaboration history found in the repository.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {myRequests.map((req) => (
                        <div key={req._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:border-indigo-200 group">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            req.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {req.status}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Calendar size={12}/>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider">{new Date(req.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 leading-snug mb-4 group-hover:text-[#6366F1] transition-colors">{req.projectTitle}</h3>
                                    
                                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl w-fit border border-slate-100">
                                        <div className="bg-white p-1.5 rounded-lg text-[#0B0F19] shadow-sm"><User size={14}/></div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Faculty Lead</p>
                                            <p className="text-xs font-semibold text-slate-700">{req.receiverEmail}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Refined Status Badge Area */}
                                <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl min-w-[160px] border border-slate-100">
                                    {req.status === 'Approved' ? (
                                        <>
                                            <CheckCircle className="text-emerald-500 mb-1" size={32}/>
                                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Inquiry Accepted</p>
                                        </>
                                    ) : req.status === 'Rejected' ? (
                                        <>
                                            <XCircle className="text-red-500 mb-1" size={32}/>
                                            <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Inquiry Declined</p>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="text-amber-500 mb-1" size={32} />
                                            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Review Pending</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {req.status === 'Approved' && (
                                <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                    <Mail className="text-[#6366F1]" size={18}/>
                                    <p className="text-[#6366F1] font-semibold text-xs uppercase tracking-wide">
                                        Instructions dispatched to your institutional email.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentStatusTracker;