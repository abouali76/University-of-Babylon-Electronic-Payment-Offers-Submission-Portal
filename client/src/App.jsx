import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    setUser(savedUser);
    setLoading(false);
  }, []);

  if (loading) return null;

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
              path="/dashboard" 
              element={user?.role === 'company' ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/login" />} 
            />
            <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
