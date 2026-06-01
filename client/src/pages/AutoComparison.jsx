import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { api } from '../utils/api';
import { BarChart3, ArrowRight, Download, Filter, Star, AlertTriangle, CheckCircle2, XCircle, Search, Trophy, TrendingUp, Building2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AutoComparison = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Try local API first
      try {
        const data = await api.get('/admin/submissions'); // The local server might have its own logic for ranking
        if (data && Array.isArray(data)) {
            // Sort by evaluation_score
            const sorted = data.sort((a, b) => (b.evaluation_score || 0) - (a.evaluation_score || 0));
            setSubmissions(sorted);
            return;
        }
      } catch (e) {
        console.warn('Local API fetch failed, trying Supabase...', e);
      }

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'final')
        .order('evaluation_score', { ascending: false });
      
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching results:', err);
      alert('خطأ في جلب النتائج');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    const name = (s.data && s.data.companyName) || s.companyName || s.companyname || s.username || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="p-20 text-center font-black">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 lg:p-12" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 bg-white p-8 rounded-[2rem] shadow-xl border border-white gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-amber-100">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-indigo-950">التصنيف التلقائي للشركات</h1>
              <p className="text-sm font-bold text-gray-400 mt-1">ترتيب الشركات بناءً على المعايير الفنية والمالية المحددة مسبقاً</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/admin')} 
                className="flex items-center gap-2 text-indigo-600 font-black hover:bg-indigo-50 px-6 py-4 rounded-2xl transition-all"
            >
                <ArrowRight className="w-5 h-5" />
                لوحة الإدارة
            </button>
            <button className="flex items-center gap-2 bg-indigo-950 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-100">
              <Download className="w-5 h-5" />
              تصدير التقرير
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-white flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-indigo-950 mb-1">{submissions.length}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي الشركات</div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-white flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-emerald-600 mb-1">{submissions.filter(s => !s.auto_rejection_reason).length}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">شركات مستوفية</div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-white flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                    <XCircle className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-red-600 mb-1">{submissions.filter(s => s.auto_rejection_reason).length}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">شركات مستبعدة</div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-white flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-amber-600 mb-1">%{submissions.length > 0 ? (submissions.reduce((acc, curr) => acc + (curr.evaluation_score || 0), 0) / submissions.length).toFixed(1) : 0}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">متوسط النقاط</div>
            </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
            <div className="p-8 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-grow max-w-xl">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="البحث باسم الشركة..." 
                        className="w-full p-4 pr-12 bg-white border-2 border-gray-100 rounded-2xl outline-none font-bold focus:border-indigo-600 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <select className="bg-white border-2 border-gray-100 p-4 rounded-2xl font-bold outline-none focus:border-indigo-600 shadow-sm">
                        <option>كل الحالات</option>
                        <option>مستوفي الشروط</option>
                        <option>مستبعد</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase">
                        <tr>
                            <th className="px-10 py-6 text-center w-24">الترتيب</th>
                            <th className="px-10 py-6">الشركة</th>
                            <th className="px-10 py-6">حالة التأهيل</th>
                            <th className="px-10 py-6 text-center">التقييم البشري (من 100)</th>
                            <th className="px-10 py-6 text-center">التفاصيل</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredSubmissions.map((s, idx) => (
                            <tr key={s.id} className="hover:bg-indigo-50/20 transition-all">
                                <td className="px-10 py-8 text-center">
                                    <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center font-black ${idx === 0 ? 'bg-amber-100 text-amber-600 border-2 border-amber-200' : idx === 1 ? 'bg-slate-100 text-slate-600' : idx === 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                                        {idx + 1}
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="font-black text-indigo-950 text-lg mb-1">{(s.data && s.data.companyName) || s.companyName || s.companyname || s.username}</div>
                                    <div className="text-[10px] font-bold text-gray-400 flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3" />
                                        آخر تحديث: {new Date(s.last_updated || s.lastUpdated).toLocaleDateString('ar-EG')}
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    {s.auto_rejection_reason ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 w-fit">
                                                <XCircle className="w-4 h-4" /> مستبعد
                                            </span>
                                            <span className="text-[9px] text-red-400 font-bold max-w-[200px]">{s.auto_rejection_reason}</span>
                                        </div>
                                    ) : (
                                        <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 w-fit">
                                            <CheckCircle2 className="w-4 h-4" /> مستوفي للشروط
                                        </span>
                                    )}
                                </td>

                                <td className="px-10 py-8 text-center">
                                    <div className="flex items-center justify-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-lg w-fit mx-auto font-black text-sm">
                                        <Star className="w-3 h-3 fill-current" />
                                        {s.evaluation_score || '0'}
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <button className="p-3 text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all">
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredSubmissions.length === 0 && (
                    <div className="text-center py-32">
                        <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Filter className="w-10 h-10" />
                        </div>
                        <h4 className="text-xl font-black text-gray-300">لم يتم العثور على أي نتائج تصنيف</h4>
                        <p className="text-sm font-bold text-gray-300 mt-2">تأكد من قيام الشركات بإرسال عروضها النهائية</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AutoComparison;
