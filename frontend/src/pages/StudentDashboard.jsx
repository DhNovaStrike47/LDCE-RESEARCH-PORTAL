import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { PlusCircle, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_URL from '../api';

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [myProjects, setMyProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        // Fetch User Profile + My Projects
        axios.get(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setUser(res.data.user);
            setMyProjects(res.data.myProjects || []);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center mt-20 font-bold text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-6 py-10">
                
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-900">Welcome, {user?.name}!</h1>
                        <p className="text-gray-500 mt-1">Enrollment: <span className="font-mono font-semibold text-gray-700">{user?.enrollmentNo}</span></p>
                    </div>
                    <Link to="/add-project" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <PlusCircle size={20} /> Submit New Project
                    </Link>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="text-yellow-500" />
                            <h3 className="font-bold text-gray-700">Pending</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{myProjects.filter(p => p.status === 'Pending').length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="text-green-500" />
                            <h3 className="font-bold text-gray-700">Approved</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{myProjects.filter(p => p.status === 'Approved').length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                        <div className="flex items-center gap-3 mb-2">
                            <XCircle className="text-red-500" />
                            <h3 className="font-bold text-gray-700">Rejected</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{myProjects.filter(p => p.status === 'Rejected').length}</p>
                    </div>
                </div>

                {/* My Projects List */}
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText /> My Projects
                </h2>
                
                {myProjects.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-400 mb-4">You haven't submitted any projects yet.</p>
                        <Link to="/add-project" className="text-blue-600 font-bold hover:underline">Start your first project</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {myProjects.map(project => (

                           <div key={project._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{project.title}</h3>
                                    <p className="text-sm text-gray-500">{project.domain} • {project.year}</p>
                                </div>
                                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                    project.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                    project.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {project.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;