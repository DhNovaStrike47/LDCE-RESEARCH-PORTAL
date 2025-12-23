import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import ProjectMilestones from './ProjectMilestones'; 
import { Briefcase, CheckCircle, Search, Mail } from 'lucide-react';

const StudentApprovedCollaborations = ({ studentName }) => {
    const [approvedList, setApprovedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const fetchApproved = async () => {
            if (!token || !user.email) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${API_URL}/api/collaboration/my-requests/${user.email}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const approved = Array.isArray(res.data) 
                    ? res.data.filter(req => req.senderEmail === user.email && req.status === 'Approved')
                    : [];
                setApprovedList(approved);
            } catch (err) {
                console.error("Error loading approved collaborations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApproved();
    }, [user.email, token]);

    if (loading) return <div className="p-10 text-center text-slate-400 font-medium uppercase tracking-widest text-xs animate-pulse">Syncing Faculty Assignments...</div>;

    return (
        <div className="space-y-8 font-sans">
            <div className="border-b border-slate-200 pb-5">
                <h2 className="text-xl font-semibold text-[#0B0F19] tracking-tight flex items-center gap-2">
                    <CheckCircle size={24} className="text-[#10B981]"/> Verified Research Mentors
                </h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Active institutional collaborations</p>
            </div>

            {approvedList.length === 0 ? (
                <div className="bg-white p-16 rounded-2xl text-center border border-dashed border-slate-200">
                    <Search className="mx-auto text-slate-300 mb-4" size={40}/>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">No active faculty mentors found in the registry.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {approvedList.map(item => (
                        <div key={item._id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-indigo-200 group">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-[#6366F1] font-bold text-xl border border-indigo-100 shadow-sm">
                                    {item.receiverEmail?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-0.5">Faculty Lead</p>
                                    <h3 className="text-lg font-semibold text-slate-800 break-all flex items-center gap-2">
                                        <Mail size={14} className="text-slate-300"/> {item.receiverEmail}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 rounded-xl mb-8 border border-slate-200 group-hover:bg-indigo-50/30 group-hover:border-indigo-100 transition-colors">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Briefcase size={12}/> Collaboration Assignment
                                </p>
                                <p className="text-base font-semibold text-slate-800 leading-snug">
                                    {item.projectTitle}
                                </p>
                            </div>

                            {/* Preserved Component Integration */}
                            <div className="border-t border-slate-100 pt-6">
                                <ProjectMilestones 
                                    collaborationId={item._id} 
                                    isFaculty={false} 
                                    projectTitle={item.projectTitle} 
                                    studentName={studentName || user.name} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentApprovedCollaborations;