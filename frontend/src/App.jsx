import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddProject from './pages/AddProject';
import Analytics from './pages/Analytics';
import LabBooking from './pages/LabBooking';
import FacultyDashboard from './pages/FacultyDashboard';
import DeanDashboard from './pages/DeanDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* --- SHARED ROUTES --- */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={['student', 'faculty', 'principal']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute allowedRoles={['student', 'faculty', 'principal']}>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        {/* ❌ Removed: <Route path="/profile" ... /> (It is now a popup) */}

        {/* --- STUDENT & FACULTY ROUTES --- */}
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

        {/* --- FACULTY & PRINCIPAL ROUTES --- */}
        <Route 
          path="/faculty" 
          element={
            <ProtectedRoute allowedRoles={['faculty', 'principal']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } 
        />

        {/* --- PRINCIPAL ONLY ROUTE --- */}
        <Route 
          path="/principal" 
          element={
            <ProtectedRoute allowedRoles={['principal']}>
              <DeanDashboard />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </Router>
  );
}

export default App;