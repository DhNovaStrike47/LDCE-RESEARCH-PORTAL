import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import API_URL from '../api'; // 🟢 Import API_URL

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // 🟢 Use API_URL
        axios.get(`${API_URL}/api/projects/stats`)
            .then(res => {
                setStats(res.data);
                
                if(res.data.domainStats) {
                    const data = Object.keys(res.data.domainStats).map(key => ({
                        name: key,
                        projects: res.data.domainStats[key]
                    }));
                    setChartData(data);
                }
            })
            .catch(err => console.error("Error fetching stats:", err));
    }, []);

    if (!stats) return <div className="text-center mt-20 text-xl font-bold">Loading Analytics...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto p-8">
                <h2 className="text-3xl font-bold mb-8 text-gray-800">Research Impact Analytics</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Total Projects</h3>
                        <p className="text-4xl font-bold text-gray-800">{stats.totalProjects || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Total Grant Money</h3>
                        <p className="text-4xl font-bold text-green-600">₹{(stats.totalGrant || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Funded Projects</h3>
                        <p className="text-4xl font-bold text-purple-600">{stats.fundedProjects || 0}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h3 className="text-xl font-bold mb-6 text-gray-700">Projects by Domain</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="projects" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
                        <h3 className="text-xl font-bold mb-2 text-gray-700">Domain Distribution</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="projects"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;