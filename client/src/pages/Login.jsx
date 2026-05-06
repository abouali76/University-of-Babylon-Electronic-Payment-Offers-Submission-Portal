import React, { useState, useEffect } from 'react';
import { LogIn, User, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
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
      const savedAdminPass = localStorage.getItem('adminPassword') || 'admin123';
      if (String(username).trim() === 'admin' && password === savedAdminPass) {
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

      await supabase.rpc('set_config', {
        setting: 'app.current_user',
        value: String(username).trim(),
        is_local: false
      });

      const role = data?.user?.app_metadata?.role || data?.user?.user_metadata?.role || 'company';
      const displayName = data?.user?.user_metadata?.display_name || data?.user?.user_metadata?.name || username;

      const userData = {
        username: String(username || '').trim(),
        role,
        name: displayName,
        userId: data.user.id // Add this critical ID for locking mechanism
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
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center p-6 font-sans" dir="rtl">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-50 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-50 rounded-full blur-[120px] opacity-50"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(30,41,59,0.1)] border border-white p-10 md:p-14 overflow-hidden relative">
          {/* Top Branding */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="w-24 h-24 bg-white p-1 rounded-3xl flex items-center justify-center shadow-xl border border-gray-50 mx-auto mb-6"
            >
              <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Logo" className="w-full h-full object-contain" />
            </motion.div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">جامعة بابل</h1>
            <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mt-2">نظام إدارة معايير التعاقد مع شركات الدفع الالكتروني</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  className="w-full p-5 pr-14 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-900 shadow-sm text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-5 pr-14 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-900 shadow-sm text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-100 p-4 rounded-2xl overflow-hidden"
                >
                  <p className="text-red-600 text-xs text-center font-bold">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white flex items-center justify-center gap-3 text-base font-black py-5 rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 group"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              )}
              <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول للنظام'}</span>
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase tracking-tighter">
              جميع الحقوق محفوظة &copy; 2026 جامعة بابل <br /> قسم الشؤون المالية - اللجنة الفنية
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
