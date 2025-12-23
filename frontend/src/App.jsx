import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; // Public Research Dashboard
import AddProject from './pages/AddProject';
import Analytics from './pages/Analytics';
import LabBooking from './pages/LabBooking';
import Collaborations from './pages/Collaborations';
import EditProject from './pages/EditProject';

// Import Role-Based Dashboardsz
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import DeanDashboard from './pages/DeanDashboard'; // 🟢 ENSURE THIS FILE EXISTS

import ProtectedRoute from './components/ProtectedRoute';
import IncomingProposals from './components/IncomingProposals';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* --- COMMON DASHBOARD (Home) --- */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={['student', 'faculty', 'principal', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* --- 🟢 STUDENT DASHBOARD --- */}
        <Route 
          path="/StudentDashboard" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

        {/* --- 🟢 FACULTY DASHBOARD --- */}
        <Route 
          path="/FacultyDashboard" 
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } 
        />

        {/* --- 🟢 PRINCIPAL/ADMIN DASHBOARD (Fixes the error) --- */}
        <Route 
          path="/DeanDashboard" 
          element={
            <ProtectedRoute allowedRoles={['principal', 'admin']}>
              <DeanDashboard />
            </ProtectedRoute>
          } 
        />

        {/* --- SHARED FEATURES --- */}
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute allowedRoles={['student', 'faculty', 'principal']}>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-project" 
          element={
            <ProtectedRoute allowedRoles={['student', 'faculty']}>
              <AddProject />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/labs" 
          element={
            <ProtectedRoute allowedRoles={['student', 'faculty']}>
              <LabBooking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/collaborations" 
          element={
            <ProtectedRoute allowedRoles={['student', 'faculty']}>
              <Collaborations />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/edit-project/:id" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <EditProject />
            </ProtectedRoute>
          } 
        />

        <Route path="/incoming-proposals" 
        element={<IncomingProposals />} />
      </Routes>
    </Router>
  );
}

export default App;