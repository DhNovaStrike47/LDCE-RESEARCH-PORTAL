import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API_URL from '../api'; 
import { Save, Github, Link as LinkIcon, Users, Calendar, ArrowLeft } from 'lucide-react';

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // 🟢 Preserved State from AddProject
    const [projectData, setProjectData] = useState({
        title: '', description: '', domain: '', projectType: 'UDP',
        githubLink: '', projectYear: '', researchPaper: '',
        program: '', semester: '', department: '', mentor: '',
        teamMembers: [], isFunded: false, fundingAgency: '',
        demandedFund: '', grantedFund: ''
    });

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        setUser(storedUser);

        axios.get(`${API_URL}/api/projects/${id}`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        })
        .then(res => {
            setProjectData(res.data);
            setLoading(false);
        })
        .catch(() => navigate(-1));
    }, [id, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/api/projects/update/${id}`, projectData, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            alert("✅ Entry Updated in Repository");
            navigate(-1);
        } catch (err) { alert("Correction Failed"); }
    };

    if (loading) return <div className="text-center mt-20 text-slate-400 font-medium">Syncing Archive...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-10 font-sans">
            <Navbar />
            <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-8 border-b border-slate-100 pb-5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-[#0B0F19]">Technical Correction: {projectData.title}</h2>
                        <p className="text-xs text-slate-500 font-medium uppercase mt-1">Institutional Repository Update</p>
                    </div>
                    <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-[#0B0F19] flex items-center gap-1 text-xs font-bold uppercase"><ArrowLeft size={14}/> Back</button>
                </div>
                
                <form onSubmit={handleUpdate} className="space-y-6">
                    {/* Core Technical Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Project Nomenclature</label>
                            <input value={projectData.title} onChange={(e)=>setProjectData({...projectData, title: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-[#6366F1] outline-none" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Technical Abstract</label>
                            <textarea value={projectData.description} onChange={(e)=>setProjectData({...projectData, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium h-28 focus:border-[#6366F1] outline-none" required />
                        </div>
                    </div>

                    {/* Meta Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Domain</label>
                            <select className="w-full p-2 border rounded bg-white text-xs font-semibold" value={projectData.domain} onChange={(e)=>setProjectData({...projectData, domain: e.target.value})}>
                                <option>Web Development</option><option>AI / ML</option><option>IoT</option><option>Blockchain</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Type</label>
                            <select className="w-full p-2 border rounded bg-white text-xs font-semibold" value={projectData.projectType} onChange={(e)=>setProjectData({...projectData, projectType: e.target.value})}>
                                <option value="UDP">UDP</option><option value="IDP">IDP</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Year</label>
                            <input type="number" className="w-full p-2 border rounded bg-white text-xs font-semibold" value={projectData.projectYear} onChange={(e)=>setProjectData({...projectData, projectYear: e.target.value})} />
                        </div>
                    </div>

                    {/* Team Section (If present) */}
                    {projectData.teamMembers?.length > 0 && (
                        <div className="p-6 bg-indigo-50/30 rounded-xl border border-indigo-100">
                            <label className="text-[10px] font-semibold text-[#4338CA] mb-4 uppercase flex items-center gap-2"><Users size={14}/> Research Team Registry</label>
                            {projectData.teamMembers.map((m, i) => (
                                <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 bg-white p-2 rounded-lg border border-indigo-100">
                                    <input value={m.name} onChange={(e) => {
                                        const t = [...projectData.teamMembers]; t[i].name = e.target.value; setProjectData({...projectData, teamMembers: t});
                                    }} className="p-2 bg-slate-50 border rounded text-[11px] font-medium" placeholder="Name"/>
                                    <input value={m.email} className="p-2 bg-slate-50 border rounded text-[11px] font-medium opacity-50" readOnly placeholder="Email"/>
                                    <input value={m.enrollment} className="p-2 bg-slate-50 border rounded text-[11px] font-medium" placeholder="ID"/>
                                    <input value={m.dept} className="p-2 bg-slate-50 border rounded text-[11px] font-medium" placeholder="Dept"/>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* External Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Github size={14}/> Repository Link</label>
                            <input value={projectData.githubLink} onChange={(e)=>setProjectData({...projectData, githubLink: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-[#6366F1] outline-none" />
                        </div>
                        {user?.role === 'faculty' && (
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><LinkIcon size={14}/> Research Paper URL</label>
                                <input value={projectData.researchPaper} onChange={(e)=>setProjectData({...projectData, researchPaper: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-[#6366F1] outline-none" />
                            </div>
                        )}
                    </div>

                    {/* Funding Log Correction */}
                    <div className={`p-5 rounded-xl border ${projectData.isFunded ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <input type="checkbox" checked={projectData.isFunded} onChange={(e)=>setProjectData({...projectData, isFunded: e.target.checked})} className="w-4 h-4 accent-emerald-600" />
                            <label className="text-slate-700 text-sm font-semibold">Grant Funded Project</label>
                        </div>
                        {projectData.isFunded && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input className="p-2 bg-white border border-emerald-100 rounded-lg text-xs font-medium" placeholder="Agency" value={projectData.fundingAgency} onChange={(e)=>setProjectData({...projectData, fundingAgency: e.target.value})} />
                                <input type="number" className="p-2 bg-white border border-emerald-100 rounded-lg text-xs font-medium" placeholder="Demanded" value={projectData.demandedFund} onChange={(e)=>setProjectData({...projectData, demandedFund: e.target.value})} />
                                <input type="number" className="p-2 bg-white border border-emerald-100 rounded-lg text-xs font-medium" placeholder="Granted" value={projectData.grantedFund} onChange={(e)=>setProjectData({...projectData, grantedFund: e.target.value})} />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-[#0B0F19] text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition shadow-sm text-sm">
                        <Save size={16} className="inline mr-2"/> Commit All Corrections
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProject;