import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../api'; // 🟢 Import API_URL

const DeanDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentLabs, setRecentLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        
        if (!token) {
            setError("No authentication token found. Please login.");
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                // 🟢 Use API_URL
                const res = await axios.get(`${API_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data.stats);
                setRecentProjects(res.data.recentProjects);
                setRecentLabs(res.data.recentLabs);
                setLoading(false);
            } catch (err) {
                console.error("Access Error:", err);
                setError("Access Denied or Error Loading Data");
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="text-center mt-20 text-xl font-bold">Loading Principal's Desk...</div>;
    if (error) return <div className="text-center mt-20 text-red-500 text-xl font-bold">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Navbar />
            
            <div className="container mx-auto px-6 mt-10">
                <h1 className="text-3xl font-bold text-blue-900 mb-8 border-b pb-4">🎓 Principal's Dashboard</h1>
                
                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                        <p className="text-gray-500 text-sm font-bold uppercase">Total Projects</p>
                        <p className="text-3xl font-bold text-gray-800">{stats?.totalProjects}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                        <p className="text-gray-500 text-sm font-bold uppercase">Total Grant Received</p>
                        <p className="text-3xl font-bold text-gray-800">₹{stats?.totalGrant}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                        <p className="text-gray-500 text-sm font-bold uppercase">Total Students</p>
                        <p className="text-3xl font-bold text-gray-800">{stats?.totalStudents}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
                        <p className="text-gray-500 text-sm font-bold uppercase">Faculty Members</p>
                        <p className="text-3xl font-bold text-gray-800">{stats?.totalFaculty}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* RECENT PROJECTS */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">📄 Recent Project Submissions</h3>
                        <div className="space-y-4">
                            {recentProjects.length === 0 ? <p>No projects yet.</p> : recentProjects.map(p => (
                                <div key={p._id} className="border-b pb-2">
                                    <p className="font-bold text-blue-900">{p.title}</p>
                                    <p className="text-xs text-gray-500">by {p.student?.name} • {p.domain}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RECENT LAB BOOKINGS */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">🧪 Recent Lab Requests</h3>
                        <div className="space-y-4">
                            {recentLabs.length === 0 ? <p>No bookings yet.</p> : recentLabs.map(l => (
                                <div key={l._id} className="flex justify-between items-center border-b pb-2">
                                    <div>
                                        <p className="font-bold text-gray-800">{l.labName}</p>
                                        <p className="text-xs text-gray-500">{l.date} • {l.student?.name}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${l.status==='Approved'?'bg-green-100 text-green-700':l.status==='Rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>
                                        {l.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeanDashboard;