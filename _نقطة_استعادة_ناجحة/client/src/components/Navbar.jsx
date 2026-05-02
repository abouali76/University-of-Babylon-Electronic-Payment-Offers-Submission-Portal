import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md text-babylon-blue border-b border-babylon-blue/10 shadow-sm fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-full border border-babylon-gold group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-tight">جامعة بابل</span>
          </Link>
          
          <div className="h-6 w-px bg-babylon-blue/10 mx-2"></div>
          
          <div className="flex gap-4 text-sm font-medium">
            <Link to="/dashboard" className="hover:text-babylon-gold transition-colors">لوحة العرض</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="hover:text-babylon-gold transition-colors flex items-center gap-1">
                <Shield className="w-4 h-4" />
                الإدارة
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-300">مرحباً بك،</p>
              <p className="text-sm font-bold">{user.username}</p>
            </div>
            <div className="bg-babylon-dark p-2 rounded-full">
              <UserIcon className="w-5 h-5 text-babylon-gold" />
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
