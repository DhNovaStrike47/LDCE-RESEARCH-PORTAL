import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            if (res.data.token) {
                sessionStorage.setItem('token', res.data.token);
                sessionStorage.setItem('user', JSON.stringify(res.data.user));
                const role = res.data.user.role;
                if (role === 'student') navigate('/StudentDashboard');
                else if (role === 'faculty') navigate('/FacultyDashboard');
                else navigate('/'); 
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid Email or Password");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            <Navbar />
            <div className="flex-grow flex justify-center items-center p-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm">
                    <h2 className="text-xl font-semibold mb-2 text-[#0B0F19]">Institutional Login</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-8">Research & Academic Portal</p>
                    
                    {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg mb-4 text-[11px] font-semibold border border-red-100">{error}</div>}
                    
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Institutional Email</label>
                            <input type="email" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-[#6366F1] outline-none" onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                            <input type="password" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-[#6366F1] outline-none" onChange={(e) => setPassword(e.target.value)} required />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-3 rounded-xl text-sm font-medium text-white transition shadow-sm ${loading ? 'bg-slate-400' : 'bg-[#0B0F19] hover:bg-slate-800'}`}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'} 
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center text-xs font-medium">
                        <p className="text-slate-400">New researcher? <Link to="/register" className="text-[#6366F1] font-semibold hover:underline">Create Account</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;