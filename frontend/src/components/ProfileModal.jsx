import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Mail, User, Lock, Pencil, Check, FileText, BadgeCheck } from 'lucide-react';

const ProfileModal = ({ onClose }) => {
    // Data States
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [approvedProjects, setApprovedProjects] = useState([]); 
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info'); 
    
    // Name Editing States
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    
    // Password States
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' });
    const [passMsg, setPassMsg] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        // Use sessionStorage as requested
        const token = sessionStorage.getItem('token');
        
        axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setUser(res.data.user);
            setNewName(res.data.user.name);
            setProjects(res.data.myProjects || []); 
            setApprovedProjects(res.data.approvedProjects || []); 
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    // 1. Update Name Function
    const handleUpdateName = async () => {
        if (!newName.trim()) return;
        const token = sessionStorage.getItem('token');
        try {
            await axios.put('http://localhost:5000/api/users/update-details', { name: newName }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local storage so Navbar updates instantly
            const stored = JSON.parse(sessionStorage.getItem('user'));
            sessionStorage.setItem('user', JSON.stringify({ ...stored, name: newName }));
            
            setUser({ ...user, name: newName });
            setIsEditing(false);
        } catch (err) {
            alert("Update failed");
        }
    };

    // 2. Handle Enter Key for Name
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleUpdateName();
        }
    };

    // 3. Change Password Function
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassLoading(true);
        setPassMsg('');
        const token = sessionStorage.getItem('token');
        try {
            await axios.put('http://localhost:5000/api/users/change-password', passData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPassMsg('✅ Password Changed!');
            setPassData({ oldPassword: '', newPassword: '' });
        } catch (err) {
            setPassMsg('❌ ' + (err.response?.data?.message || 'Error'));
        } finally {
            setPassLoading(false);
        }
    };

    if (!user && !loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-[420px] relative overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* CLOSE BUTTON */}
                <button onClick={onClose} className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full z-10 transition">
                    <X size={24} />
                </button>

                {/* HEADER GRAPHIC */}
                <div className="h-28 bg-gradient-to-r from-blue-700 to-indigo-800 shrink-0"></div>

                {/* AVATAR */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg">
                        <div className="w-full h-full bg-yellow-400 rounded-full flex items-center justify-center text-3xl font-bold text-blue-900 select-none">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="pt-14 px-6 pb-6 flex-grow overflow-y-auto">
                    
                    {/* Name & Role Section */}
                    <div className="text-center mb-6">
                        {isEditing ? (
                            <div className="flex justify-center items-center gap-2 mb-1">
                                <input 
                                    className="border-2 border-blue-300 rounded px-2 py-1 text-sm w-40 focus:border-blue-600 outline-none transition" 
                                    value={newName} 
                                    onChange={e => setNewName(e.target.value)}
                                    onKeyDown={handleKeyDown} 
                                    autoFocus
                                />
                                <button onClick={handleUpdateName} className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition">
                                    <Check size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-600 transition">
                                    <Pencil size={14} />
                                </button>
                            </div>
                        )}
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">{user?.role}</span>
                    </div>

                    {/* TABS HEADER */}
                    <div className="flex border-b border-gray-200 mb-4">
                        <button 
                            className={`flex-1 pb-2 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            onClick={() => setActiveTab('info')}
                        >
                            <User size={16}/> Info
                        </button>
                        <button 
                            className={`flex-1 pb-2 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Lock size={16}/> Security
                        </button>
                    </div>

                    {/* TAB 1: INFO (PROJECTS & DETAILS) */}
                    {activeTab === 'info' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">ID Number</p>
                                    <p className="font-semibold text-gray-800 text-sm">{user?.enrollmentNo || "N/A"}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Department</p>
                                    <p className="font-semibold text-gray-800 text-sm">{user?.department || "N/A"}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 text-gray-600 text-sm px-2 justify-center">
                                <Mail size={16} className="text-blue-500" /> {user?.email}
                            </div>

                            {/* 1. MY PROJECTS LIST */}
                            <div className="mt-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                                    <FileText size={12}/> My Projects ({projects.length})
                                </h3>
                                <div className="max-h-24 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {projects.length === 0 ? (
                                        <div className="text-center py-2 bg-gray-50 rounded text-gray-400 text-xs italic">
                                            No projects submitted.
                                        </div>
                                    ) : (
                                        projects.map(p => (
                                            <div key={p._id} className="border border-gray-100 rounded p-2 flex justify-between items-center bg-gray-50">
                                                <span className="text-xs font-semibold text-gray-700 truncate w-32">{p.title}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                                    p.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                                    p.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* 2. APPROVED PROJECTS LIST (FACULTY ONLY) */}
                            {user?.role === 'faculty' && (
                                <div className="mt-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                                        <BadgeCheck size={12}/> Approved by Me ({approvedProjects.length})
                                    </h3>
                                    <div className="max-h-24 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {approvedProjects.length === 0 ? (
                                            <div className="text-center py-2 bg-gray-50 rounded text-gray-400 text-xs italic">
                                                No projects approved yet.
                                            </div>
                                        ) : (
                                            approvedProjects.map(p => (
                                                <div key={p._id} className="border border-green-200 bg-green-50 p-2 rounded">
                                                    <p className="text-xs font-bold text-green-800 truncate">{p.title}</p>
                                                    <p className="text-[10px] text-green-600">Student: {p.student?.name}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: SECURITY (CHANGE PASSWORD FORM) */}
                    {activeTab === 'security' && (
                        <div className="animate-fade-in pt-2">
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-600 block mb-1">Current Password <span className="text-red-500">*</span></label>
                                    <input 
                                        type="password" 
                                        required 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="Enter current password"
                                        value={passData.oldPassword}
                                        onChange={e => setPassData({...passData, oldPassword: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600 block mb-1">New Password <span className="text-red-500">*</span></label>
                                    <input 
                                        type="password" 
                                        required 
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="Enter new password"
                                        value={passData.newPassword}
                                        onChange={e => setPassData({...passData, newPassword: e.target.value})}
                                    />
                                </div>
                                
                                {passMsg && (
                                    <p className={`text-xs font-bold text-center p-2 rounded ${passMsg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        {passMsg}
                                    </p>
                                )}

                                <button 
                                    disabled={passLoading}
                                    className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-black transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {passLoading ? "Updating Password..." : "Update Password"}
                                </button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProfileModal;