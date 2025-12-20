import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../api'; // 🟢 Import API_URL

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 🟢 Use API_URL
        axios.get(`${API_URL}/api/projects`)
            .then(res => {
                setProjects(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8">
                
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Research Dashboard</h2>
                        <p className="text-gray-600">Overview of all ongoing academic projects</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded shadow text-sm font-semibold text-gray-700">
                        Total Projects: {projects.length}
                    </div>
                </div>

                {loading && <p className="text-center text-gray-500 text-lg">Loading projects...</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((proj) => (
                        <div key={proj._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 flex flex-col">
                            
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide bg-blue-100 px-2 py-1 rounded">
                                    {proj.department}
                                </span>
                                <span className="text-xs font-semibold text-gray-500">
                                    {proj.year}
                                </span>
                            </div>

                            <div className="p-6 flex-grow">
                                <div className="mb-4">
                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full mb-2 inline-block">
                                        {proj.domain}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-800 leading-tight">
                                        {proj.title}
                                    </h3>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {proj.description}
                                </p>

                                <div className="flex items-center text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                                    <span className="mr-2">🎓 Mentor:</span>
                                    <span className="font-semibold text-gray-700">
                                        {proj.mentor || "Self-Guided"}
                                    </span>
                                </div>
                            </div>

                            <div className={`px-6 py-3 text-sm font-bold flex justify-between items-center ${proj.isFunded ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                <span>
                                    {proj.isFunded ? `💰 Funded by ${proj.fundingAgency}` : "⚪ Self Financed"}
                                </span>
                                {proj.isFunded && (
                                    <span>₹{proj.amountGranted.toLocaleString()}</span>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
                
                {!loading && projects.length === 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-xl text-gray-500">No projects found.</h3>
                        <p className="text-gray-400">Click "Add Project" to start.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Dashboard;