import React, { useState, useEffect } from 'react';
import { Trophy, Star, Download, BarChart3, Building2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { exportToPdf } from '../utils/exportPdf';

const RankingTable = ({ submissions: initialSubmissions }) => {
  const [submissions, setSubmissions] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (initialSubmissions) {
      const sorted = [...initialSubmissions].sort((a, b) => (b.evaluation_score || 0) - (a.evaluation_score || 0));
      setSubmissions(sorted);
    } else {
      fetchPublicSubmissions();
    }
  }, [initialSubmissions]);

  const fetchPublicSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'final');
        
      if (data) {
        const sorted = data.sort((a, b) => (b.evaluation_score || 0) - (a.evaluation_score || 0));
        setSubmissions(sorted);
      }
    } catch (err) {
      console.error('Error fetching rankings:', err);
    }
  };

  const handlePrint = async () => {
    setIsExporting(true);
    await exportToPdf('public-ranking-area', 'UOB_Competitive_Report_2026.pdf');
    setIsExporting(false);
  };

  if (submissions.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-20 px-4 text-center py-20 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-dashed border-gray-300">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-black text-gray-500">لا يوجد بيانات حالياً</h3>
        <p className="text-gray-400 font-bold mt-2">سيظهر الترتيب هنا بمجرد تقديم الشركات لعروضها وتقييمها</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-20 px-4 animate-fade-in">
      <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl p-10 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-400 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-amber-400/20">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-indigo-950">تقرير تصنيف الشركات المتقدمة</h2>
              <p className="text-xs font-bold text-gray-400">ترتيب العروض بناءً على التقييم الفني والمالي للجنة العليا</p>
            </div>
          </div>
          <button 
            onClick={handlePrint}
            disabled={isExporting}
            className="px-8 py-4 bg-indigo-900 text-white rounded-2xl font-black flex items-center gap-3 hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-900/20 active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <span className="animate-spin">⌛</span> : <Download className="w-5 h-5" />}
            تحميل التقرير كـ PDF
          </button>
        </div>

        {/* Ranking List */}
        <div id="public-ranking-area" className="space-y-6 bg-white rounded-[2rem] p-4" style={{ backgroundColor: '#ffffff', direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
          {submissions.map((s, idx) => (
            <div key={idx} className="relative flex flex-col md:flex-row items-center justify-between p-8 rounded-[2rem] transition-all border-2" style={{ 
              backgroundColor: idx === 0 ? '#1e1b4b' : '#f9fafb', 
              color: idx === 0 ? '#ffffff' : '#020617',
              borderColor: idx === 0 ? '#fbbf24' : 'transparent',
              marginBottom: '24px'
            }}>
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black" style={{ 
                  backgroundColor: idx === 0 ? '#fbbf24' : '#eef2ff', 
                  color: idx === 0 ? '#1e1b4b' : '#312e81' 
                }}>
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-xl font-black mb-1" style={{ color: idx === 0 ? '#ffffff' : '#020617' }}>{s.companyName}</h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-black px-3 py-1 rounded-full" style={{ backgroundColor: idx === 0 ? 'rgba(255,255,255,0.1)' : '#e0e7ff', color: idx === 0 ? '#fcd34d' : '#4f46e5' }}>خبرة: {s.marketExperience}</span>
                    <span className="text-[10px] font-black px-3 py-1 rounded-full" style={{ backgroundColor: idx === 0 ? 'rgba(255,255,255,0.1)' : '#d1fae5', color: idx === 0 ? '#6ee7b7' : '#059669' }}>مكتمل</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-6 md:mt-0">
                <div className="text-center">
                   <p className="text-[10px] font-black uppercase mb-1" style={{ color: idx === 0 ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>التقييم الفني</p>
                   <div className="flex gap-0.5">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className="w-3 h-3" style={{ color: (s.evaluation_score / 2) > i ? '#fbbf24' : (idx === 0 ? 'rgba(255,255,255,0.1)' : '#e5e7eb'), fill: (s.evaluation_score / 2) > i ? '#fbbf24' : 'none' }} />
                     ))}
                   </div>
                </div>
                <div className="w-[1px] h-10" style={{ backgroundColor: idx === 0 ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}></div>
                <div className="text-center min-w-[80px]">
                   <p className="text-[10px] font-black uppercase mb-1" style={{ color: idx === 0 ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>الدرجة</p>
                   <p className="text-4xl font-black" style={{ color: idx === 0 ? '#fbbf24' : '#020617' }}>{s.evaluation_score || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Branding Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none grayscale">
          <img src="./logo.jpg" alt="" className="w-[400px] h-[400px]" />
        </div>
      </div>
    </div>
  );
};

export default RankingTable;
