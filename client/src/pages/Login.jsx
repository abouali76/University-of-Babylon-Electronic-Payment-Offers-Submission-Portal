import React, { useState, useEffect } from 'react';
import { LogIn, User, Lock, Loader2, ShieldCheck, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If already logged in, redirect
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [navigate]);

  const usernameToEmail = (u) => `${String(u || '').trim().toLowerCase()}@uob.local`;
  const normalizePassword = (p) => {
    const raw = String(p || '');
    return raw.length >= 6 ? raw : raw.padEnd(6, '0');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Requested emergency admin fallback login.
      if (String(username).trim() === 'admin' && password === 'admin123') {
        const userData = {
          username: 'admin',
          role: 'admin',
          name: 'Admin',
          localOnly: true
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        navigate('/admin');
        window.location.reload();
        return;
      }

      const email = usernameToEmail(username);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: normalizePassword(password)
      });

      if (authError) throw authError;

      // Set session variable for RLS
      await supabase.rpc('set_config', {
        setting: 'app.current_user',
        value: String(username).trim(),
        is_local: false
      });

      const role = data?.user?.app_metadata?.role || data?.user?.user_metadata?.role || 'company';
      const displayName =
        data?.user?.user_metadata?.display_name ||
        data?.user?.user_metadata?.name ||
        username;

      const userData = {
        username: String(username || '').trim(),
        role,
        name: displayName
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      navigate(role === 'admin' ? '/admin' : '/dashboard');
      window.location.reload();
    } catch (err) {
      console.error('Login error:', err);
      setError('خطأ في اسم المستخدم أو كلمة المرور، أو لم يتم تفعيل الحساب بعد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-x-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-30 animate-pulse delay-700"></div>

      <div className="relative z-10 flex flex-col items-center pt-20 pb-40">
        {/* Login Card */}
        <div className="w-full max-w-[450px] p-2 mb-20">
          <div className="bg-white/90 backdrop-blur-3xl p-10 md:p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-900/10 border border-white">
            <div className="text-center mb-10">
              <div className="w-28 h-28 bg-white p-2 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-900/10 mx-auto mb-6 border border-gray-50">
                <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="University Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-black text-indigo-950 tracking-tight mb-1">جامعة بابل</h1>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] leading-relaxed mb-1">
                معايير التعاقد مع شركات الدفع الالكتروني
              </p>
              <div className="h-1 w-12 bg-indigo-900 mx-auto rounded-full mt-4"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-1">اسم المستخدم</label>
                <div className="relative group">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-4 pr-12 bg-gray-50/50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600/10 focus:ring-4 focus:ring-indigo-600/5 transition-all font-bold text-indigo-950 shadow-inner"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-1">كلمة المرور</label>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-4 pr-12 bg-gray-50/50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600/10 focus:ring-4 focus:ring-indigo-600/5 transition-all font-bold text-indigo-950 shadow-inner"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-shake">
                  <p className="text-red-600 text-[10px] text-center font-black leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-900 text-white flex items-center justify-center gap-3 text-lg font-black py-5 rounded-[2rem] shadow-2xl shadow-indigo-900/30 hover:bg-indigo-800 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                <span className="text-sm">{loading ? 'جاري المصادقة...' : 'تسجيل الدخول'}</span>
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-50 text-center">
              <p className="text-[10px] font-bold text-gray-300 leading-relaxed uppercase tracking-tighter">
                &copy; 2026 University of Babylon <br /> Financial Affairs Department
              </p>
            </div>
          </div>
        </div>

        {/* Public Ranking Section */}
      </div>
    </div>
  );
};

export default Login;
