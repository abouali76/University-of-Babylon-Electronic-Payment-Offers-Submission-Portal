import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, User, LogOut, CheckCircle2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const CompanyHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session?.user) {
        navigate('/login');
        return;
      }
      const role = session.user.app_metadata?.role || session.user.user_metadata?.role || 'company';
      if (role !== 'company') {
        navigate('/login');
        return;
      }
      const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setUser({ ...session.user, ...localUser });
    };
    checkAuth();
  }, [navigate]);

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('currentUser');
    navigate('/login');
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-white relative">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <h1 className="text-3xl font-black mb-2 leading-tight">مرحباً بك في البوابة الإلكترونية</h1>
              <p className="text-blue-200 text-sm font-bold flex items-center gap-2">
                <User className="w-4 h-4" />
                {user?.user_metadata?.name || user?.name || user?.username}
              </p>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-bold backdrop-blur-md"
            >
              تسجيل الخروج
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-800 mb-4">يرجى اختيار الجولة</h2>
            <p className="text-gray-500 text-sm font-bold max-w-lg mx-auto">
              يمكنك الآن تقديم العرض الفني والمالي الخاص بالجولة الثانية. أما معلومات الجولة الأولى فهي متاحة للاطلاع والقراءة فقط.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Round 1 Card */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="group cursor-pointer bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 rounded-2xl p-6 transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-gray-100 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 rounded-2xl flex items-center justify-center transition-all">
                  <FileText className="w-7 h-7" />
                </div>
                <span className="text-xs font-black px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                  للقراءة فقط
                </span>
              </div>
              
              <h3 className="text-xl font-black text-gray-800 mb-2">استمارة الجولة الأولى</h3>
              <p className="text-gray-500 text-sm mb-6 font-bold leading-relaxed">
                عرض البيانات والمرفقات السابقة التي تم تقديمها خلال الجولة الأولى.
              </p>
              
              <div className="flex items-center text-gray-400 group-hover:text-blue-600 font-bold text-sm gap-2 transition-all">
                <span>استعراض الاستمارة</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </div>
            </div>

            {/* Round 2 Card */}
            <div 
              onClick={() => navigate('/dashboard-round2')}
              className="group cursor-pointer bg-white border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-900/10 rounded-2xl p-6 transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center transition-all">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <span className="text-xs font-black px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full animate-pulse">
                  متاح الآن
                </span>
              </div>
              
              <h3 className="text-xl font-black text-gray-800 mb-2">استمارة الجولة الثانية</h3>
              <p className="text-gray-500 text-sm mb-6 font-bold leading-relaxed">
                تقديم العرض الفني والمالي المحدث بناءً على المتطلبات الجديدة للجامعة.
              </p>
              
              <div className="flex items-center text-emerald-600 font-bold text-sm gap-2 transition-all">
                <span>المباشرة بالملء</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-[-4px] transition-transform" />
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CompanyHome;
