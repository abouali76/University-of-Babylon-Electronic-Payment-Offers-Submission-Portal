import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import RankingTable from './components/RankingTable';
import QuestionComparison from './pages/QuestionComparison';
import CompanyHome from './pages/CompanyHome';
import DashboardRound2 from './pages/DashboardRound2';

function App() {
  // Read synchronously to prevent flicker - localStorage is synchronous
  const [user] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser'));
    } catch {
      return null;
    }
  });

  return (
    <Router>
      <div className="min-h-screen font-['IBM_Plex_Sans_Arabic'] bg-[#F8FAFC] relative overflow-hidden" dir="rtl">
        {/* Global Background Watermark */}
        <div className="fixed inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none grayscale z-0">
          <img src="./logo.jpg" alt="" className="w-[800px] h-[800px] object-contain" />
        </div>

        <div className="relative z-10">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/home" 
              element={user?.role === 'company' ? <CompanyHome /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/dashboard" 
              element={user?.role === 'company' ? <Dashboard isReadOnly={true} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/dashboard-round2" 
              element={user?.role === 'company' ? <DashboardRound2 /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/question-comparison" 
              element={user?.role === 'admin' ? <QuestionComparison /> : <Navigate to="/login" />} 
            />

            <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/home') : '/login'} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
