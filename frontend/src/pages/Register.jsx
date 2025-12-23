import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import API_URL from '../api';
import { X, User, Mail, Lock, Building, GraduationCap, Briefcase, Award, Linkedin } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: 'student',
        department: '',
        enrollmentNo: '', 
        linkedIn: '',
        achievements: '',
        studyProgram: 'BE',
        semester: '',
        qualification: 'MTech',
        designation: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const departments = ["Information Technology", "Computer Engineering", "Mechanical", "Civil", "Electrical", "Chemical", "IC"];
    const [semesters, setSemesters] = useState([]);

    useEffect(() => {
        if (formData.studyProgram === 'BE') {
            setSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
        } else {
            setSemesters([1, 2, 3, 4]); 
        }
    }, [formData.studyProgram]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        setLoading(true);
        try {
            const payload = { ...formData };
            if (payload.role === 'student') {
                delete payload.qualification;
                delete payload.designation;
            } else if (payload.role === 'faculty') {
                delete payload.studyProgram;
                delete payload.semester;
            }
            const res = await axios.post(`${API_URL}/api/auth/register`, payload);
            if (res.data.token) {
                sessionStorage.setItem('token', res.data.token);
                sessionStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#F8FAFC] font-sans">
            <Navbar />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F19]/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
                    
                    {/* Header */}
                    <div className="bg-[#0B0F19] px-8 py-5 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-white tracking-tight">Researcher Registration</h2>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">L.D. College of Engineering Portal</p>
                        </div>
                        <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                            <X size={20}/>
                        </Link>
                    </div>

                    <form onSubmit={handleRegister} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-semibold border border-red-100 animate-in fade-in duration-300">
                                {error}
                            </div>
                        )}

                        {/* Core Identity Section */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                        <User size={12}/> Full Legal Name
                                    </label>
                                    <input type="text" name="name" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-[#6366F1] outline-none transition-all" onChange={handleChange} required />
                                </div>

                                <div>
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">Institutional Email</label>
                                <input 
                                    type="email" name="email" 
                                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                    title="Valid formats: abc@gmail.com, abc@ldce.ac.in"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-[#6366F1] outline-none" 
                                    onChange={handleChange} required 
                                />
                            </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                        <Building size={12}/> Department
                                    </label>
                                    <select name="department" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-[#6366F1]" onChange={handleChange} required>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                        <Lock size={12}/> Password
                                    </label>
                                    <input type={showPassword ? "text" : "password"} name="password" 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium pr-10 focus:border-[#6366F1] outline-none" 
                                        onChange={handleChange} required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-slate-400 hover:text-[#6366F1]">
                                        {showPassword ? <X size={16}/> : <User size={16}/> /* Using generic icons for brevity */}
                                    </button>
                                </div>

                                <div className="relative">
                                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                        <Lock size={12}/> Confirm Password
                                    </label>
                                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium pr-10 focus:border-[#6366F1] outline-none" 
                                        onChange={handleChange} required />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-8 text-slate-400 hover:text-[#6366F1]">
                                        {showConfirmPassword ? <X size={16}/> : <User size={16}/>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Role Selector */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-3">Institutional Role</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="role" value="student" checked={formData.role === 'student'} onChange={handleChange} className="accent-[#6366F1] w-4 h-4" />
                                    <span className={`text-sm font-semibold ${formData.role === 'student' ? 'text-[#6366F1]' : 'text-slate-500'}`}>Academic Student</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="role" value="faculty" checked={formData.role === 'faculty'} onChange={handleChange} className="accent-[#6366F1] w-4 h-4" />
                                    <span className={`text-sm font-semibold ${formData.role === 'faculty' ? 'text-[#6366F1]' : 'text-slate-500'}`}>Faculty Member</span>
                                </label>
                            </div>
                        </div>

                        {/* Dynamic Section Based on Role */}
                        <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                            {formData.role === 'student' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-2"><GraduationCap size={12}/> Study Program</label>
                                        <select name="studyProgram" value={formData.studyProgram} onChange={handleChange} required className="w-full p-2.5 bg-white border border-indigo-100 rounded-lg text-xs font-semibold outline-none">
                                            <option value="BE">BE (Bachelor's)</option>
                                            <option value="ME">ME (Master's)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">Current Semester</label>
                                        <select name="semester" onChange={handleChange} required className="w-full p-2.5 bg-white border border-indigo-100 rounded-lg text-xs font-semibold outline-none">
                                            <option value="">Select</option>
                                            {semesters.map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">Enrollment Registration</label>
                                        <input type="text" name="enrollmentNo" onChange={handleChange} required 
                                            className="w-full p-2.5 bg-white border border-indigo-100 rounded-lg text-sm font-medium focus:border-[#6366F1] outline-none placeholder:text-slate-300" placeholder="e.g. 210280131..." />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-2"><Award size={12}/> Highest Qualification</label>
                                        <select name="qualification" onChange={handleChange} required className="w-full p-2.5 bg-white border border-indigo-100 rounded-lg text-xs font-semibold outline-none">
                                            <option value="MTech">M.Tech</option>
                                            <option value="PhD">Ph.D</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">Faculty ID Code</label>
                                        <input type="text" name="enrollmentNo" onChange={handleChange} required 
                                            className="w-full p-2.5 bg-white border border-indigo-100 rounded-lg text-sm font-medium outline-none" placeholder="FAC-XXX" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2">Academic Designation</label>
                                        <div className="flex flex-wrap gap-4">
                                            {['Assistant Professor', 'Associate Professor', 'HoD'].map(d => (
                                                <label key={d} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="designation" value={d} onChange={handleChange} required className="accent-[#6366F1]" />
                                                    <span className="text-xs font-medium text-slate-600">{d}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Professional Section */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                    <Linkedin size={12} className="text-[#0077b5]"/> Professional LinkedIn URL
                                </label>
                                <input type="url" name="linkedIn" onChange={handleChange} required
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:border-[#6366F1] outline-none" placeholder="https://linkedin.com/in/your-profile" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                    <Award size={12}/> Academic Achievements & Research Focus
                                </label>
                                <textarea name="achievements" onChange={handleChange} required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:border-[#6366F1] outline-none h-24 placeholder:italic" placeholder="Summary of papers published, technical awards, or specific research interests..."></textarea>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4 sticky bottom-0 bg-white">
                            <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                                Sign In Instead
                            </Link>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`px-10 py-3 bg-[#0B0F19] text-white text-xs font-semibold uppercase tracking-widest rounded-xl shadow-lg transition-all hover:bg-slate-800 active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Processing...' : 'Complete Registration'} 
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;