import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API_URL from '../api'; 
import { Users, Plus, Trash2, Github, Link as LinkIcon, Calendar } from 'lucide-react';

const AddProject = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Core Fields (Shared)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('Web Development');
  const [projectType, setProjectType] = useState('UDP');
  const [githubLink, setGithubLink] = useState('');
  const [projectYear, setProjectYear] = useState(new Date().getFullYear().toString());
  const [researchPaper, setResearchPaper] = useState('');
  const [projectPhotos, setProjectPhotos] = useState(null);

  // Academic Fields (Student Only)
  const [program, setProgram] = useState('BE'); 
  const [semester, setSemester] = useState('Sem 1');
  const [department, setDepartment] = useState('Information Technology');
  const [mentor, setMentor] = useState('');
  const [file, setFile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([{ name: '', email: '', enrollment: '', dept: '' }]);

  // Funding (Shared)
  const [isFunded, setIsFunded] = useState(false);
  const [fundingAgency, setFundingAgency] = useState('');
  const [demandedFund, setDemandedFund] = useState('');
  const [grantedFund, setGrantedFund] = useState('');

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.role === 'faculty') setProgram('Ph.D.');
    }
  }, []);

  const currentRealYear = new Date().getFullYear();
  
  const availableYears = useMemo(() => {
    if (!user || user.role === 'faculty') {
        return Array.from({ length: currentRealYear - 1950 + 1 }, (_, i) => (currentRealYear - i).toString());
    }

    const semNum = parseInt(semester.replace('Sem ', ''));
    let yearsBack = 0;

    if (program === 'BE') {
        if (semNum === 1) yearsBack = 0;
        else if (semNum <= 3) yearsBack = 1;
        else if (semNum <= 5) yearsBack = 2;
        else if (semNum <= 7) yearsBack = 3;
        else if (semNum === 8) yearsBack = 4;
    } else if (program === 'ME') {
        if (semNum === 1) yearsBack = 0;
        else if (semNum <= 3) yearsBack = 1;
        else if (semNum === 4) yearsBack = 2;
    }

    return Array.from({ length: yearsBack + 1 }, (_, i) => (currentRealYear - i).toString());
  }, [semester, program, user, currentRealYear]);

  const handleTeamChange = (index, field, value) => {
      const newTeam = [...teamMembers];
      newTeam[index][field] = value;
      setTeamMembers(newTeam);
  };
  const addTeamMember = () => setTeamMembers([...teamMembers, { name: '', email: '', enrollment: '', dept: '' }]);
  const removeTeamMember = (index) => setTeamMembers(teamMembers.filter((_, i) => i !== index));

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (isFunded && (!fundingAgency || !demandedFund || !grantedFund)) {
        alert("All funding details are compulsory when checked.");
        return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token'); 
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('domain', domain);
      formData.append('projectType', projectType);
      formData.append('githubLink', githubLink);
      formData.append('projectYear', projectYear);

      if (user.role === 'student') {
          formData.append('program', program);
          formData.append('semester', semester);
          formData.append('department', department);
          formData.append('mentor', mentor);
          formData.append('teamMembers', JSON.stringify(teamMembers.filter(t => t.name && t.email)));
          if (file) formData.append('synopsis', file);
      } else {
          formData.append('researchPaper', researchPaper);
          formData.append('status', 'Approved');
      }

      formData.append('isFunded', isFunded);
      if(isFunded) {
          formData.append('fundingAgency', fundingAgency);
          formData.append('demandedFund', demandedFund);
          formData.append('grantedFund', grantedFund);
      }

      await axios.post(`${API_URL}/api/projects/add`, formData, { 
          headers: { 'Authorization': `Bearer ${token}` } 
      });
      alert('✅ Research Submitted Successfully!');
      navigate('/');
    } catch (err) { alert('Error: ' + err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-8 border-b border-slate-100 pb-5">
            <h3 className="text-xl font-semibold text-[#0B0F19] flex items-center gap-2">
                <Plus size={20} className="text-[#6366F1]"/> {user?.role === 'student' ? 'Academic Project Submission' : 'Faculty Research Publication'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Fill in the technical dossier for the repository.</p>
          </div>

          <form onSubmit={handleAddProject} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Project Nomenclature *</label>
                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-[#6366F1] outline-none transition-all" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Technical Abstract *</label>
                    <textarea className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium h-28 focus:border-[#6366F1] outline-none" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Domain *</label>
                  <select className="w-full p-2.5 border rounded-lg bg-slate-50 text-sm font-medium outline-none focus:border-[#6366F1]" value={domain} onChange={(e) => setDomain(e.target.value)} required>
                    <option>Web Development</option><option>AI / ML</option><option>IoT</option><option>Blockchain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Project Type *</label>
                  <select className="w-full p-2.5 border rounded-lg bg-slate-50 text-sm font-medium outline-none focus:border-[#6366F1]" value={projectType} onChange={(e) => setProjectType(e.target.value)} required>
                    <option value="UDP">User-Defined-Project</option><option value="IDP">Industry-Defined-Project</option>
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Program</label>
                    <select className="w-full p-2 border rounded bg-white text-xs font-semibold" value={program} onChange={e => setProgram(e.target.value)}>
                        {user?.role === 'student' ? (
                            <><option>BE</option><option>ME</option></>
                        ) : (
                            <><option>Mtech</option><option>Ph.D.</option></>
                        )}
                    </select>
                </div>

                {user?.role === 'student' && (
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Semester</label>
                        <select className="w-full p-2 border rounded bg-white text-xs font-semibold" value={semester} onChange={e => setSemester(e.target.value)}>
                            {Array.from({ length: program === 'BE' ? 8 : 4 }, (_, i) => `Sem ${i + 1}`).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase flex items-center gap-1"><Calendar size={12}/> Academic Year</label>
                    <select className="w-full p-2 border rounded bg-white text-xs font-semibold" value={projectYear} onChange={e => setProjectYear(e.target.value)}>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
             </div>

             {user?.role === 'student' && (
                 <>
                    <div className="p-5 bg-indigo-50/30 rounded-xl border border-indigo-100">
                        <h4 className="text-[10px] font-semibold text-[#4338CA] mb-4 uppercase tracking-[0.2em] flex items-center gap-2"><Users size={14}/> Research Team Dossier</h4>
                        {teamMembers.map((m, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm relative">
                                <input placeholder="Name" className="p-2 bg-slate-50 border rounded text-[11px] font-medium" value={m.name} onChange={(e) => handleTeamChange(i, 'name', e.target.value)} required/>
                                <input placeholder="Email" className="p-2 bg-slate-50 border rounded text-[11px] font-medium" value={m.email} onChange={(e) => handleTeamChange(i, 'email', e.target.value)} required/>
                                <input placeholder="Enrollment" className="p-2 bg-slate-50 border rounded text-[11px] font-medium" value={m.enrollment} onChange={(e) => handleTeamChange(i, 'enrollment', e.target.value)} required/>
                                <input placeholder="Dept" className="p-2 bg-slate-50 border rounded text-[11px] font-medium" value={m.dept} onChange={(e) => handleTeamChange(i, 'dept', e.target.value)} required/>
                                {i > 0 && <button type="button" onClick={() => removeTeamMember(i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1"><Trash2 size={10}/></button>}
                            </div>
                        ))}
                        <button type="button" onClick={addTeamMember} className="text-[10px] font-semibold text-[#6366F1] mt-1 uppercase tracking-widest">+ Add Member</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Mentor Name</label>
                            <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#6366F1]" value={mentor} onChange={(e) => setMentor(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Synopsis PDF *</label>
                            <input type="file" accept="application/pdf" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium" onChange={(e) => setFile(e.target.files[0])} required />
                        </div>
                    </div>
                 </>
             )}

             {user?.role === 'faculty' && (
                 <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><LinkIcon size={14}/> Research Paper / DOI Link</label>
                    <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#6366F1]" value={researchPaper} onChange={(e) => setResearchPaper(e.target.value)} />
                 </div>
             )}

             <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Github size={14}/> GitHub Link</label>
                <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#6366F1]" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
             </div>

             

             <div className={`p-5 rounded-xl border transition-all ${isFunded ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <input type="checkbox" id="fundedCheck" className="w-4 h-4 accent-emerald-600 cursor-pointer" checked={isFunded} onChange={(e) => setIsFunded(e.target.checked)}/>
                  <label htmlFor="fundedCheck" className="text-slate-700 text-sm font-semibold cursor-pointer">Grant Funded Project</label>
                </div>
                {isFunded && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input className="p-2 bg-white border border-emerald-100 rounded-lg text-xs font-medium" placeholder="Funding Agency" value={fundingAgency} onChange={(e) => setFundingAgency(e.target.value)} required={isFunded} />
                    <input type="number" className="p-2 bg-white border border-emerald-100 rounded-lg text-xs font-medium" placeholder="Demanded (₹)" value={demandedFund} onChange={(e) => setDemandedFund(e.target.value)} required={isFunded} />
                    <input type="number" className="p-2 bg-white border border-emerald-100 rounded-lg text-xs font-medium" placeholder="Granted (₹)" value={grantedFund} onChange={(e) => setGrantedFund(e.target.value)} required={isFunded} />
                  </div>
                )}
             </div>

             <button type="submit" disabled={loading} className="w-full bg-[#0B0F19] text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition shadow-sm text-sm">
                {loading ? 'Dispatched...' : 'Publish to Repository'}
             </button>
          </form>
      </div>
    </div>
  );
};

export default AddProject;