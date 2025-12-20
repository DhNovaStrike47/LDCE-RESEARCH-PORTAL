import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';

const Navbar = () => {  
  const navigate = useNavigate();
  
  // Try to get user from sessionStorage OR localStorage
  const user = JSON.parse(sessionStorage.getItem('user')) || JSON.parse(localStorage.getItem('user'));
  
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-blue-900 p-4 text-white shadow-md relative z-40">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-wide hover:text-blue-200 transition">
            LDCE Research Portal
          </Link>
          
          {user ? (
            <div className="flex items-center gap-6">
              {/* 1. SHARED LINKS (Visible to Everyone) */}
              <Link to="/" className="hover:text-yellow-300 transition text-sm font-medium">Dashboard</Link>
              
              {/* 🟢 NEW: ANALYTICS LINK ADDED HERE */}
              <Link to="/analytics" className="hover:text-yellow-300 transition text-sm font-medium">Analytics</Link>
              
              {/* 2. STUDENT & FACULTY LINKS (Principal cannot Add Projects/Book Labs) */}
              {user.role !== 'principal' && (
                <>
                  <Link to="/add-project" className="hover:text-yellow-300 transition text-sm font-medium">Add Project</Link>
                  <Link to="/labs" className="hover:text-yellow-300 transition text-sm font-medium">Labs</Link>
                </>
              )}

              {/* 3. FACULTY PANEL BUTTON */}
              {(user.role === 'faculty' || user.role === 'principal') && (
                <Link to="/faculty" className="hover:text-yellow-300 transition text-sm font-medium">
                   {user.role === 'principal' ? 'View Requests' : 'Faculty Panel'}
                </Link>
              )}

              {/* 4. PRINCIPAL PANEL BUTTON */}
              {user.role === 'principal' && (
                <Link to="/principal" className="bg-yellow-400 text-blue-900 px-3 py-1 rounded font-bold hover:bg-yellow-300 transition shadow text-sm">
                    Principal's Desk
                </Link>
              )}

              {/* PROFILE ICON */}
              <button 
                  onClick={() => setShowProfile(true)} 
                  className="flex items-center gap-2 hover:bg-blue-800 px-2 py-1 rounded-full transition group"
              >
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-sm shadow border border-transparent group-hover:border-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
              </button>

              {/* LOGOUT */}
              <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-bold transition shadow text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
               <Link to="/login" className="hover:text-yellow-300 font-medium">Login</Link>
               <Link to="/register" className="bg-yellow-400 text-blue-900 px-4 py-2 rounded font-bold hover:bg-yellow-300 transition shadow">Register</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Render Profile Modal */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Navbar;