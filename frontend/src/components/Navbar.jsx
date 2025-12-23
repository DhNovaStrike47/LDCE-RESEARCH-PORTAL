import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProfileModal from './ProfileModal';
import API_URL from '../api';
import { LayoutDashboard, BarChart2, PlusSquare, Beaker, Users, Shield, LogOut } from 'lucide-react';

const Navbar = () => {  
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🟢 Session Observer: Reactively handles UI state on login/logout
  const userString = sessionStorage.getItem('user') || localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  const [showProfile, setShowProfile] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'faculty') {
      const token = sessionStorage.getItem('token');
      axios.get(`${API_URL}/api/collaboration/my-requests/${user.email}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const count = res.data.filter(req => req.status === 'Pending' && req.receiverEmail === user.email).length;
        setPendingCount(count);
      })
      .catch(err => console.error("Notification fetch error:", err));
    }
  }, [user?.email, user?.role]);

  // 🟢 Logout Protocol: Clears all technical session data and reverts Navbar
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setPendingCount(0); // Reset internal badges
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-[#0B0F19] text-white border-b border-slate-800 sticky top-0 z-[100] backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* 🟢 Persistent Brand: Remains constant regardless of auth status */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-[#6366F1] p-2 rounded-xl group-hover:rotate-6 transition-transform">
              <Shield size={24} className="text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white group-hover:text-[#6366F1] transition-colors">
              LDCE <span className="text-slate-400 font-light italic">Research Portal</span>
            </span>
          </Link>
          
          {/* 🟢 Conditional Logic: Displays utilities only when 'user' is valid */}
          {user ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-500">
              
              {/* Navigation Grid - Medium Sizing */}
              <div className="hidden lg:flex items-center gap-1 bg-slate-900/50 p-1 rounded-2xl border border-slate-800 mr-4">
                <Link to="/" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isActive('/') ? 'bg-[#6366F1] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                   <LayoutDashboard size={18}/> Dashboard
                </Link>
                
                <Link to="/analytics" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isActive('/analytics') ? 'bg-[#6366F1] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                   <BarChart2 size={18}/> Analytics
                </Link>
                
                {user.role !== 'principal' && (
                  <>
                    <Link to="/add-project" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isActive('/add-project') ? 'bg-[#6366F1] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                       <PlusSquare size={18}/> New Research
                    </Link>
                    <Link to="/labs" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isActive('/labs') ? 'bg-[#6366F1] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                       <Beaker size={18}/> Labs
                    </Link>
                    <Link to="/collaborations" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isActive('/collaborations') ? 'bg-[#6366F1] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                       <Users size={18}/> Network
                    </Link>
                  </>
                )}
              </div>

              {/* Identity & Actions */}
              <div className="flex items-center gap-4">
                {user.role === 'faculty' && (
                  <Link to="/FacultyDashboard" className={`relative group px-5 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm font-semibold tracking-wide ${isActive('/FacultyDashboard') ? 'bg-[#6366F1] border-[#6366F1] text-white' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                     Faculty Panel
                     {pendingCount > 0 && (
                       <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-lg border-2 border-[#0B0F19]">
                          {pendingCount}
                       </span>
                     )}
                  </Link>
                )}

                <button 
                    onClick={() => setShowProfile(true)} 
                    className="flex items-center gap-3 p-1 pr-3 bg-slate-900 border border-slate-800 rounded-full hover:border-[#6366F1] transition group"
                >
                    {user.profilePicture ? (
                      <img src={`${API_URL}${user.profilePicture}`} alt="Profile" className="w-9 h-9 rounded-full border border-slate-700 object-cover" />
                    ) : (
                      <div className="w-9 h-9 bg-[#6366F1] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{user.name?.split(' ')[0]}</span>
                </button>

                <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 p-2 transition-colors">
                  <LogOut size={22} />
                </button>
              </div>
            </div>
          ) : (
            /* 🟢 Reverted Pre-Login State: Visible only when 'user' is null */
            <div className="flex items-center gap-4 animate-in fade-in duration-500">
               <Link to="/login" className="text-slate-400 hover:text-white font-medium px-4 py-2 transition text-sm">Sign In</Link>
               <Link to="/register" className="bg-[#6366F1] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg text-sm tracking-wide">
                 Join Portal
               </Link>
            </div>
          )}
        </div>
      </nav>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Navbar;