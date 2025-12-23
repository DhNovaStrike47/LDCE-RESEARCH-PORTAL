import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { X, User, Briefcase, Pencil, Save, ExternalLink, Linkedin, Award, BookOpen, Camera, Mail, Building, Hash, GraduationCap, School } from 'lucide-react';
import API_URL from '../api';

const ProfileModal = ({ onClose }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [profileImage, setProfileImage] = useState(null); 
    const [previewImage, setPreviewImage] = useState(null); 
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        axios.get(`${API_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                const u = res.data.user;
                setUser(u);
                setProjects(res.data.myProjects || []);
                setFormData({
                    name: u.name || '',
                    email: u.email || '',
                    department: u.department || '',
                    enrollmentNo: u.enrollmentNo || '',
                    linkedIn: u.linkedIn || '',
                    achievements: u.achievements || '',
                    studyProgram: u.studyProgram || 'BE',
                    semester: u.semester || '',
                    qualification: u.qualification || 'MTech',
                    designation: u.designation || ''
                });
            })
            .catch(err => console.error("Error loading profile:", err));
    }, []);

    const handleEditProject = (id) => {
        onClose(); // 🟢 Ensure modal closes before navigation
        navigate(`/edit-project/${id}`); // 🟢 Redirects to full-field editor
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (profileImage) data.append('profilePicture', profileImage);

            const res = await axios.put(`${API_URL}/api/users/update-details`, data, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setUser(res.data);
            sessionStorage.setItem('user', JSON.stringify(res.data));
            setIsEditing(false);
            alert("✅ Dossier Updated!");
        } catch (err) { alert("❌ Update failed."); } finally { setLoading(false); }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0B0F19]/80 backdrop-blur-md p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl h-[720px] flex flex-col relative border border-slate-200">
                <div className="bg-[#0B0F19] h-32 shrink-0 rounded-t-[31px] relative overflow-hidden">
                    <button onClick={onClose} className="absolute top-5 right-5 z-20 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"><X size={20}/></button>
                </div>

                <div className="absolute top-16 left-10 z-30">
                    <div className="w-32 h-32 bg-white p-1 rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex items-center justify-center">
                        {previewImage || user.profilePicture ? (
                            <img src={previewImage || `${API_URL}${user.profilePicture}`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-[#0B0F19] uppercase">{user.name?.charAt(0)}</span>
                        )}
                    </div>
                </div>

                <div className="mt-14 px-10 pt-4 flex justify-between items-start shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{user.name}</h2>
                        <span className="inline-block mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-[0.15em] border border-indigo-100">{user.role} Researcher</span>
                    </div>
                </div>

                <div className="flex border-b border-slate-100 mt-6 mx-10 shrink-0">
                    <button onClick={() => setActiveTab('info')} className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-all ${activeTab==='info'?'text-indigo-600 border-b-2 border-indigo-600':'text-slate-400 hover:text-slate-600'}`}>Identity Dossier</button>
                    <button onClick={() => setActiveTab('projects')} className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-all ${activeTab==='projects'?'text-indigo-600 border-b-2 border-indigo-600':'text-slate-400 hover:text-slate-600'}`}>Research Log</button>
                </div>

                <div className="px-10 py-8 overflow-y-auto flex-grow custom-scrollbar">
                    {activeTab === 'info' && (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            {/* ...Identity Dossier Fields (Omitted for brevity, preserved from previous turn)... */}
                        </form>
                    )}
                    
                    {activeTab === 'projects' && (
                        <div className="space-y-3">
                            {projects.map(p => (
                                <div key={p._id} className="group border border-slate-100 p-5 rounded-2xl flex justify-between items-center bg-white hover:border-indigo-200 transition-all shadow-sm">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{p.title}</p>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{p.domain}</span>
                                    </div>
                                    <button onClick={() => handleEditProject(p._id)} className="text-slate-300 hover:text-indigo-600 p-2 border border-transparent hover:border-indigo-50 rounded-lg">
                                        <Pencil size={18}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;