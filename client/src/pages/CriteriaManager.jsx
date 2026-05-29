import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { api } from '../utils/api';
import { Save, Trash2, Plus, ArrowRight, Settings, Info, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CriteriaManager = () => {
  const navigate = useNavigate();
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCriterion, setNewCriterion] = useState({
    question_text: '',
    category: 'Technical',
    weight: 1,
    is_mandatory: false,
    options_scores: { accept: 100, provide: 50, reject: 0 }
  });

  useEffect(() => {
    fetchCriteria();
  }, []);

  const fetchCriteria = async () => {
    setLoading(true);
    try {
      // Try local API first if in local testing mode, or if Supabase fails
      try {
        const data = await api.get('/evaluation/criteria');
        if (data && Array.isArray(data)) {
          setCriteria(data);
          return;
        }
      } catch (e) {
        console.warn('Local API fetch failed, trying Supabase...', e);
      }

      const { data, error } = await supabase
        .from('evaluation_criteria')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setCriteria(data || []);
    } catch (err) {
      console.error('Error fetching criteria:', err);
      alert(`خطأ في جلب المعايير: ${err.message || 'فشل الاتصال بالسيرفر'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCriterion.question_text) return;
    setSaving(true);
    try {
      // Try local API
      try {
        await api.post('/evaluation/criteria', { ...newCriterion, display_order: criteria.length });
        await fetchCriteria();
        setIsAdding(false);
        setNewCriterion({
            question_text: '',
            category: 'Technical',
            weight: 1,
            is_mandatory: false,
            options_scores: { accept: 100, provide: 50, reject: 0 }
        });
        return;
      } catch (e) {
        console.warn('Local API add failed, trying Supabase...', e);
      }

      const { error } = await supabase
        .from('evaluation_criteria')
        .insert([{ ...newCriterion, display_order: criteria.length }]);
      if (error) throw error;
      await fetchCriteria();
      setIsAdding(false);
      setNewCriterion({
        question_text: '',
        category: 'Technical',
        weight: 1,
        is_mandatory: false,
        options_scores: { accept: 100, provide: 50, reject: 0 }
      });
    } catch (err) {
      alert('فشل إضافة المعيار: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المعيار؟ سيؤدي ذلك لحذف إجابات الشركات المرتبطة به.')) return;
    try {
      const { error } = await supabase.from('evaluation_criteria').delete().eq('id', id);
      if (error) throw error;
      setCriteria(criteria.filter(c => c.id !== id));
    } catch (err) {
      alert('فشل الحذف');
    }
  };

  if (loading) return <div className="p-20 text-center font-black">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 lg:p-12" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12 bg-white p-8 rounded-[2rem] shadow-xl border border-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-900 text-white rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-indigo-950">إدارة معايير التقييم التلقائي</h1>
              <p className="text-xs font-bold text-gray-400 mt-1">تحديد الأسئلة والأوزان التي سيتم بناءً عليها ترتيب الشركات</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/admin')} 
            className="flex items-center gap-2 text-indigo-600 font-black hover:bg-indigo-50 px-6 py-3 rounded-2xl transition-all"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للوحة الإدارة
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-indigo-50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-indigo-900">المعايير الحالية ({criteria.length})</h3>
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                <Plus className="w-5 h-5" />
                إضافة معيار جديد
              </button>
            </div>

            {isAdding && (
              <div className="mb-10 p-8 bg-gray-50 rounded-3xl border-2 border-emerald-100 animate-slide-down">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-gray-400 mb-2 mr-2">نص السؤال / المعيار</label>
                    <input 
                      className="w-full p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold transition-all"
                      placeholder="مثال: هل توفر الشركة شهادة ISO 27001؟"
                      value={newCriterion.question_text}
                      onChange={e => setNewCriterion({...newCriterion, question_text: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 mr-2">الفئة</label>
                    <select 
                      className="w-full p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold transition-all"
                      value={newCriterion.category}
                      onChange={e => setNewCriterion({...newCriterion, category: e.target.value})}
                    >
                      <option value="Technical">فني</option>
                      <option value="Financial">مالي</option>
                      <option value="Legal">قانوني</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 mr-2">الوزن (الأهمية)</label>
                    <input 
                      type="number" step="0.5" min="0.5" max="10"
                      className="w-full p-4 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold transition-all"
                      value={newCriterion.weight}
                      onChange={e => setNewCriterion({...newCriterion, weight: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm">
                    <input 
                      type="checkbox" id="mandatory" className="w-5 h-5 accent-red-500"
                      checked={newCriterion.is_mandatory}
                      onChange={e => setNewCriterion({...newCriterion, is_mandatory: e.target.checked})}
                    />
                    <label htmlFor="mandatory" className="font-black text-sm text-gray-600 flex items-center gap-2">
                      معيار إلزامي (الرفض يعني استبعاد الشركة)
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </label>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleAdd}
                      disabled={saving}
                      className="flex-grow bg-indigo-950 text-white p-4 rounded-2xl font-black hover:bg-indigo-900 transition-all"
                    >
                      {saving ? 'جاري الحفظ...' : 'حفظ المعيار'}
                    </button>
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="bg-gray-200 text-gray-500 p-4 rounded-2xl font-black hover:bg-gray-300 transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {criteria.map((c, idx) => (
                <div key={c.id} className="group flex items-center gap-6 p-6 bg-white border-2 border-gray-50 rounded-[2rem] hover:border-indigo-100 hover:shadow-xl transition-all">
                  <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center font-black text-sm">{idx + 1}</div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-black text-indigo-950">{c.question_text}</h4>
                      {c.is_mandatory && <span className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> إلزامي</span>}
                      <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-1 rounded-lg">{c.category === 'Technical' ? 'فني' : c.category === 'Financial' ? 'مالي' : 'قانوني'}</span>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400">الوزن: {c.weight} | النقاط: قبول (100)، توفير (50)، رفض (0)</div>
                  </div>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {criteria.length === 0 && <div className="text-center py-20 text-gray-300 font-bold">لا توجد معايير مضافة حالياً</div>}
            </div>
          </div>
          
          <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 flex gap-6">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-amber-900 mb-2">كيف يعمل التقييم التلقائي؟</h4>
              <p className="text-xs font-bold text-amber-800 leading-relaxed">
                يقوم النظام بحساب درجة مئوية لكل شركة بناءً على إجاباتها. يتم ضرب درجة الخيار (قبول=100، توفير=50، رفض=0) في وزن المعيار.
                إذا كان المعيار "إلزامي" وتمت الإجابة بـ "رفض"، سيتم استبعاد الشركة تلقائياً بغض النظر عن باقي الدرجات.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriteriaManager;
