import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import IncomingProposals from '../components/IncomingProposals'; 
import ApprovedTeams from '../components/ApprovedTeams';
import API_URL from '../api';
import { Search, User, Inbox, Users, XCircle, Mail, Send } from 'lucide-react';

const Collaborations = () => {
    const [allProjects, setAllProjects] = useState([]);
    const [myUserProjects, setMyUserProjects] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const [showCollabModal, setShowCollabModal] = useState(false);
    const [targetFacultyProj, setTargetFacultyProj] = useState(null);
    const [selectedMyProj, setSelectedMyProj] = useState(null);
    const [suggestion, setSuggestion] = useState('');

    const [showDirectiveModal, setShowDirectiveModal] = useState(false);
    const [selectedStudentForDirective, setSelectedStudentForDirective] = useState(null);
    const [directiveText, setDirectiveText] = useState('');

    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('token');

    const fetchData = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = Array.isArray(res.data) ? res.data : [];
            setAllProjects(data);

            const own = data.filter(p => {
                const studentId = p.student?._id || p.student;
                return String(studentId) === String(user._id);
            });
            setMyUserProjects(own);
        } catch (err) {
            console.error("Fetch error", err);
            setAllProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const visibleProjects = allProjects.filter(p => {
        if (user.role === 'student') {
            const role = p.student?.role;
            return role === 'faculty' || role === 'principal';
        }
        return false;
    });

    const handleFinalSend = async () => {
        if (!selectedMyProj) return alert("Please select one of your projects to link.");

        const storedUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
        setLoading(true); 
        try {
            const payload = {
                senderId: user._id,
                facultyName: targetFacultyProj.student?.name || "Faculty Member",
                facultyEmail: targetFacultyProj.student?.email,
                facultyProjectTitle: targetFacultyProj.title,
                studentName:storedUser.name,
                studentEmail: storedUser.email,
                studentRole: storedUser.role,
                studentDepartment: storedUser.department,
                studentEnrollment: storedUser.enrollmentNo,
                studentAchievements: storedUser.achievements,
                studentLinkedIn: storedUser.linkedIn,
                studentProjectTitle: selectedMyProj.title,
                domain: selectedMyProj.domain,
                projectType: selectedMyProj.projectType,
                projectYear: selectedMyProj.projectYear,
                githubLink: selectedMyProj.githubLink,
                researchPaper: selectedMyProj.researchPaper,
                description: selectedMyProj.description,
                message: suggestion 
            };
            await axios.post(`${API_URL}/api/collaboration/send-professional-mail`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`✅ Professional Proposal Dispatched!`);
            setShowCollabModal(false);
            setSuggestion("");
        } catch (err) {
            alert("❌ Network Error: Could not dispatch professional inquiry.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendOfficialDirective = async () => {
        if (!directiveText.trim()) return alert("Please enter a directive message.");
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/collaboration/send-directive`, {
                studentEmail: selectedStudentForDirective.senderEmail,
                studentName: selectedStudentForDirective.senderName,
                projectTitle: selectedStudentForDirective.projectTitle,
                directive: directiveText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`✅ Directive sent to ${selectedStudentForDirective.senderName}`);
            setShowDirectiveModal(false);
            setDirectiveText('');
        } catch (err) {
            alert("❌ Failed to dispatch official directive.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && allProjects.length === 0) return <div className="text-center p-20 text-slate-500 font-medium">Loading Collaboration Hub...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
            <Navbar />
            <div className="container mx-auto px-6 py-10">
                <div className="mb-10 border-b border-slate-200 pb-5">
                    <h1 className="text-2xl font-semibold text-[#0B0F19] tracking-tight">
                        Research Collaboration Hub
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Connect with faculty and lead institutional research.</p>
                </div>

                {user.role === 'student' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleProjects.length > 0 ? (
                            visibleProjects.map(p => (
                                <div key={p._id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#6366F1] transition-all shadow-sm">
                                    <div className="bg-indigo-50 w-fit px-2 py-1 rounded text-[#6366F1] font-semibold text-[10px] mb-3 uppercase tracking-wider">
                                        {p.domain}
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-base mb-1">{p.title}</h3>
                                    <div className="flex items-center gap-2 mb-5 text-slate-500">
                                        <User size={14}/>
                                        <span className="text-xs">{p.student?.name}</span>
                                    </div>
                                    <button 
                                        onClick={() => { setTargetFacultyProj(p); setShowCollabModal(true); }}
                                        className="w-full bg-[#6366F1] text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                                    >
                                         Collaborate
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                <Search className="mx-auto text-slate-300 mb-4" size={40}/>
                                <p className="text-slate-500 text-sm font-medium">No projects available for collaboration.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-10">
                        <section>
                            <div className="flex items-center gap-2 mb-6 text-[#0B0F19]">
                                <Inbox size={18} className="text-[#6366F1]"/> 
                                <span className="font-semibold text-sm uppercase tracking-wide">Incoming Proposals</span>
                            </div>
                            <IncomingProposals /> 
                        </section>

                        <section className="pt-8 border-t border-slate-200">
                            <div className="flex items-center gap-2 mb-6 text-[#0B0F19]">
                                <Users size={18} className="text-[#10B981]"/> 
                                <span className="font-semibold text-sm uppercase tracking-wide">Approved Research Team</span>
                            </div>
                            <ApprovedTeams onDirectiveClick={(student) => {
                                setSelectedStudentForDirective(student);
                                setShowDirectiveModal(true);
                            }} />
                        </section>
                    </div>
                )}
            </div>

            {/* Collaboration Modal */}
            {showCollabModal && targetFacultyProj && (
                <div className="fixed inset-0 z-[100] bg-[#0B0F19]/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-semibold text-[#0B0F19]">Propose Collaboration</h3>
                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Project: {targetFacultyProj.title}</p>
                            </div>
                            <button onClick={() => setShowCollabModal(false)} className="text-slate-400 hover:text-red-500 transition">
                                <XCircle size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Your Project</label>
                                <select 
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#6366F1]"
                                    onChange={(e) => setSelectedMyProj(myUserProjects.find(p => p._id === e.target.value))}
                                >
                                    <option value="">-- Choose Your Project --</option>
                                    {myUserProjects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Message & Achievements</label>
                                <textarea 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#6366F1] h-28"
                                    placeholder="Briefly explain your suitability..."
                                    value={suggestion}
                                    onChange={(e) => setSuggestion(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={handleFinalSend} className="flex-1 py-2.5 bg-[#6366F1] text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Send Proposal</button>
                            <button onClick={() => setShowCollabModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Directive Modal */}
            {showDirectiveModal && selectedStudentForDirective && (
                <div className="fixed inset-0 z-[110] bg-[#0B0F19]/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-7 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                                <Send className="text-[#6366F1]" size={20}/> Issue Directive
                            </h2>
                            <button onClick={() => setShowDirectiveModal(false)} className="text-slate-400 hover:text-red-500 transition">
                                <XCircle size={24}/>
                            </button>
                        </div>

                        <div className="mb-5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Scholar</p>
                            <p className="font-semibold text-sm text-slate-700">{selectedStudentForDirective.senderName}</p>
                        </div>

                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Instructions</label>
                        <textarea 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#6366F1] h-32"
                            placeholder="Enter task details..."
                            value={directiveText}
                            onChange={(e) => setDirectiveText(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button 
                                onClick={handleSendOfficialDirective}
                                disabled={loading}
                                className="bg-[#0B0F19] text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Directive'}
                            </button>
                            <button 
                                onClick={() => setShowDirectiveModal(false)}
                                className="bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
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

export default Collaborations;