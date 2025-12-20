import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Check, X, FileText, Eye, Search, Filter } from 'lucide-react'; 
import API_URL from '../api'; // 🟢 Import API_URL

const FacultyDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); 
    const [selectedPdf, setSelectedPdf] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDept, setFilterDept] = useState('All');

    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            // 🟢 Use API_URL
            const res = await axios.get(`${API_URL}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch = 
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || project.status === filterStatus;
        const matchesDept = filterDept === 'All' || project.department === filterDept;
        return matchesSearch && matchesStatus && matchesDept;
    });

    const handleViewPdf = async (fileUrl) => {
        if (!fileUrl) return;
        const filename = fileUrl.replace(/^.*[\\\/]/, '');
        try {
            // 🟢 Use API_URL
            const response = await axios.get(`${API_URL}/api/projects/file/${filename}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' 
            });
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setSelectedPdf(pdfUrl);
        } catch (err) {
            alert("❌ Access Denied: Secure Document Load Failed");
        }
    };

    const handleAction = async (id, status) => {
        if(!window.confirm(`Are you sure you want to ${status} this project?`)) return;
        setActionLoading(id);
        try {
            // 🟢 Use API_URL
            await axios.put(`${API_URL}/api/projects/approve/${id}`, 
                { status }, { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`Project ${status} Successfully!`);
            fetchProjects(); 
        } catch (err) { alert("Error updating status"); } 
        finally { setActionLoading(null); }
    };

    if (loading) return <div className="text-center mt-20 text-xl font-bold">Loading Projects...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Navbar />
            <div className="container mx-auto px-6 mt-10">
                <h1 className="text-3xl font-bold text-blue-900 mb-6 border-b pb-4 flex items-center gap-3">
                    <FileText /> Faculty Dashboard
                </h1>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by Student Name or Project Title..." 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative">
                            <Filter className="absolute left-3 top-3 text-gray-400" size={16} />
                            <select 
                                className="pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <select 
                            className="px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                        >
                            <option value="All">All Departments</option>
                            <option value="Information Technology">IT</option>
                            <option value="Computer Engineering">Computer</option>
                            <option value="Civil Engineering">Civil</option>
                            <option value="Mechanical Engineering">Mechanical</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.length === 0 ? (
                        <div className="col-span-3 text-center py-20 text-gray-400 italic">
                            No projects match your search filters.
                        </div>
                    ) : (
                        filteredProjects.map((project) => (
                            <div key={project._id} className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition">
                                <div className={`h-2 ${project.status === 'Approved' ? 'bg-green-500' : project.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex justify-between mb-2">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${project.status==='Approved'?'bg-green-100 text-green-700':project.status==='Rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{project.status}</span>
                                        <span className="text-xs text-gray-400">{new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">{project.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{project.student?.name} • {project.department}</p>
                                    
                                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500 flex-grow">
                                        <div><span className="font-bold">Program:</span> {project.program}</div>
                                        <div><span className="font-bold">Year:</span> {project.projectYear}</div>
                                        {project.mentor && <div className="col-span-2"><span className="font-bold">Mentor:</span> {project.mentor}</div>}
                                    </div>

                                    {project.fileUrl ? (
                                        <button 
                                            onClick={() => handleViewPdf(project.fileUrl)}
                                            className="flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-bold text-sm mb-4 hover:bg-blue-100 transition border border-blue-200"
                                        >
                                            <Eye size={16} /> Preview Synopsis
                                        </button>
                                    ) : (
                                        <div className="text-center text-gray-400 text-sm italic mb-4 py-2 bg-gray-50 rounded-lg border">No Synopsis</div>
                                    )}

                                    {project.status === 'Pending' && (
                                        <div className="grid grid-cols-2 gap-3 mt-auto">
                                            <button onClick={() => handleAction(project._id, 'Approved')} disabled={actionLoading} className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 transition"><Check size={16} /> Approve</button>
                                            <button onClick={() => handleAction(project._id, 'Rejected')} disabled={actionLoading} className="flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded font-bold hover:bg-red-600 transition"><X size={16} /> Reject</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedPdf && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2"><FileText size={20} className="text-green-600"/> Secure Viewer</h3>
                            <button onClick={() => setSelectedPdf(null)} className="p-2 text-gray-500 hover:text-red-600 rounded-full"><X size={24}/></button>
                        </div>
                        <div className="flex-grow bg-gray-50">
                            <iframe src={selectedPdf} className="w-full h-full" title="PDF Viewer" style={{ border: 'none' }}></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDashboard;