import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API_URL from '../api'; // 🟢 Import API_URL

const AddProject = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('Web Development');
  const [department, setDepartment] = useState('Information Technology');
  
  const [program, setProgram] = useState('BE'); 
  
  const [projectYear, setProjectYear] = useState('2024'); 
  const [currentYear, setCurrentYear] = useState('2nd Year'); 
  const [semester, setSemester] = useState('Sem 3'); 
  
  const [mentor, setMentor] = useState(''); 
  const [researchPaper, setResearchPaper] = useState(''); 

  const [file, setFile] = useState(null);

  const [isFunded, setIsFunded] = useState(false);
  const [fundingAgency, setFundingAgency] = useState('');
  const [demandedFund, setDemandedFund] = useState('');
  const [grantedFund, setGrantedFund] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        if (parsedUser.role === 'faculty') {
            setProgram('Ph.D.');
        }
    }
  }, []);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!user || !user._id) {
        alert("Error: User ID missing. Please Logout and Login again.");
        return;
    }
    setLoading(true);

    try {
      const storedToken = sessionStorage.getItem('token') || localStorage.getItem('token'); 
      
      const formData = new FormData();
      
      formData.append('title', title);
      formData.append('description', description);
      formData.append('domain', domain);
      formData.append('department', department);
      formData.append('projectYear', projectYear);
      formData.append('program', program);
      formData.append('currentYear', program === 'PhD' || user.role === 'faculty' ? '' : currentYear);
      formData.append('semester', program === 'PhD' || user.role === 'faculty' ? '' : semester);
      
      formData.append('mentor', user.role === 'student' ? mentor : '');
      formData.append('researchPaper', user.role === 'faculty' || program === 'PhD' ? researchPaper : '');

      formData.append('isFunded', isFunded);
      if(isFunded) {
          formData.append('fundingAgency', fundingAgency);
          formData.append('demandedFund', demandedFund);
          formData.append('grantedFund', grantedFund);
      }

      if (file) {
          formData.append('synopsis', file);
      }

      // 🟢 Use API_URL
      await axios.post(`${API_URL}/api/projects/add`, formData, { 
          headers: { 'Authorization': `Bearer ${storedToken}` } 
      });
      
      alert('✅ Project & Synopsis Submitted Successfully!');
      navigate('/');
      
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err.response?.data?.error || err.message)); 
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">➕ Submit New Project</h3>
          <form onSubmit={handleAddProject} className="space-y-6">
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title <span className="text-red-500">*</span></label>
                    <input className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea className="w-full p-3 border border-gray-300 rounded-lg min-h-[80px] focus:ring-2 focus:ring-green-500 outline-none" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                  <select className="w-full p-3 border rounded-lg bg-white" value={domain} onChange={(e) => setDomain(e.target.value)}>
                    <option>Web Development</option><option>AI / ML</option><option>IoT</option><option>Blockchain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Year</label>
                  <input type="number" className="w-full p-3 border rounded-lg" value={projectYear} onChange={(e) => setProjectYear(e.target.value)} required />
                </div>
             </div>

             <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-200">
                <h4 className="text-sm font-bold text-yellow-700 uppercase mb-3">📄 Project Synopsis</h4>
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-700">Upload PDF (Max 5MB)</label>
                    <input 
                        type="file" 
                        accept="application/pdf" 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>
             </div>

             <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {user?.role === 'faculty' ? 'Qualification' : 'Study Program'}
                    </label>
                    
                    <select 
                        className="w-full p-3 border rounded-lg bg-white font-semibold text-blue-800" 
                        value={program} 
                        onChange={(e) => setProgram(e.target.value)}
                    >
                      {user?.role === 'faculty' ? (
                        <>
                            <option value="Ph.D.">Ph.D.</option>
                            <option value="M.E. / M.Tech">M.E. / M.Tech</option>
                            <option value="M.Sc">M.Sc</option>
                        </>
                      ) : (
                        <>
                            <option value="BE">BE (Bachelor)</option>
                            <option value="ME">ME (Master)</option>
                            <option value="PhD">PhD (Doctorate)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select className="w-full p-3 border rounded-lg bg-white" value={department} onChange={(e) => setDepartment(e.target.value)}>
                      <option>Information Technology</option><option>Computer Engineering</option><option>Civil Engineering</option><option>Mechanical Engineering</option>
                    </select>
                  </div>
                  
                  {user?.role === 'student' && program !== 'PhD' && (
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Name</label>
                        <input className="w-full p-3 border rounded-lg" placeholder="Prof. Name" value={mentor} onChange={(e) => setMentor(e.target.value)} />
                      </div>
                  )}

                  {(user?.role === 'faculty' || program === 'PhD') && (
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Research Paper Link / DOI</label>
                        <input className="w-full p-3 border border-blue-300 rounded-lg bg-blue-50" placeholder="https://..." value={researchPaper} onChange={(e) => setResearchPaper(e.target.value)} />
                    </div>
                  )}
                </div>
             </div>

             <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <input type="checkbox" id="fundedCheck" className="w-5 h-5 accent-blue-600" checked={isFunded} onChange={(e) => setIsFunded(e.target.checked)}/>
                  <label htmlFor="fundedCheck" className="text-gray-800 font-semibold cursor-pointer">Is this project funded?</label>
                </div>
                {isFunded && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 animate-fade-in">
                    <input className="p-2 border rounded-md" placeholder="Agency" value={fundingAgency} onChange={(e) => setFundingAgency(e.target.value)} required={isFunded} />
                    <input type="number" className="p-2 border rounded-md" placeholder="Demanded (₹)" value={demandedFund} onChange={(e) => setDemandedFund(e.target.value)} required={isFunded} />
                    <input type="number" className="p-2 border rounded-md" placeholder="Granted (₹)" value={grantedFund} onChange={(e) => setGrantedFund(e.target.value)} required={isFunded} />
                  </div>
                )}
             </div>

             <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3 rounded-lg shadow-md transition-all ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                {loading ? 'Submitting...' : 'Submit Project'}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProject;