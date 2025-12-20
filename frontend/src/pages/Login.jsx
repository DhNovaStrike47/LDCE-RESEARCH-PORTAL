import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../api'; // 🟢 Import API_URL

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
            // 🟢 Use API_URL
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            if (res.data.token) {
                sessionStorage.setItem('token', res.data.token);
                sessionStorage.setItem('user', JSON.stringify(res.data.user));
                
                if(res.data.user.role === 'principal') navigate('/principal');
                else navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Server Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />
            <div className="flex-grow flex justify-center items-center">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96 border border-gray-200">
                    <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Login</h2>
                    {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input type="email" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input type="password" className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full text-white font-bold py-2 rounded transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Signing In...' : 'Login'} 
                    </button>
                    
                    <div className="mt-4 text-center text-sm">
                        <p className="text-gray-600">Don't have an account? <Link to="/register" className="text-blue-500 font-bold hover:underline">Register</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;