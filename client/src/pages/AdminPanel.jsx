import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ExternalLink, UserCheck, UserPlus, Star, BarChart3, ChevronRight, ShieldCheck, FileText, Info, Trash2, FileX, RefreshCcw, ArrowRight, LogOut, CheckSquare, Square, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import PrintTemplate from '../components/PrintTemplate';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [dynamicUsers, setDynamicUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list', 'details', 'compare'
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  const normalizePassword = (p) => {
    const raw = String(p || '');
    return raw.length >= 6 ? raw : raw.padEnd(6, '0');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (!localUser || localUser.role !== 'admin') {
        navigate('/login');
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const role = sessionData?.session?.user?.app_metadata?.role || sessionData?.session?.user?.user_metadata?.role;
      if (!localUser.localOnly && role !== 'admin') {
        navigate('/login');
        return;
      }

      let usersData = [];
      let subsData = [];

      const usersResult = await supabase
        .from('users')
        .select('id, username, name, role, created_at')
        .eq('role', 'company')
        .order('created_at', { ascending: false });
      
      if (!usersResult.error) {
        usersData = usersResult.data || [];
      }

      const subsResult = await supabase
        .from('submissions')
        .select('*')
        .order('last_updated', { ascending: false });
      
      if (!subsResult.error) {
        subsData = subsResult.data || [];
      }

      setDynamicUsers(usersData);
      setSubmissions(subsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (data) => { ... }; // Unchanged logic

  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', username: '', title: '' });

  const executeDelete = async () => { ... }; // Unchanged logic

  const handleUpdateScore = async (username, score) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ evaluation_score: score })
        .eq('username', username);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error updating score:', err);
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('currentUser');
    navigate('/login');
    window.location.reload();
  };

  const allCompanies = dynamicUsers.map(user => {
    const submission = submissions.find(s => s.username === user.username) || {};
    return {
      ...(submission || {}),
      ...(submission.data || {}),
      evaluation_score: submission.evaluation_score,
      status: submission.status,
      lastUpdated: submission.last_updated || submission.lastupdated,
      documentUrl: submission.document_path || submission.document_url,
      username: user.username,
      companyName: (submission.data && submission.data.companyName) || submission.companyName || user.name || user.username,
      representative: (submission.data && submission.data.representativeName) || submission.representativeName || submission.representativename || '---',
      phone: (submission.data && submission.data.phone) || submission.phone || '---',
      isSubmitted: submission.status === 'final' || !!(submission.last_updated || submission.lastupdated)
    };
  });

  const filteredCompanies = allCompanies.filter(c => 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCompare = (username) => {
    if (selectedForCompare.includes(username)) {
      setSelectedForCompare(prev => prev.filter(u => u !== username));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('يمكنك مقارنة 4 شركات كحد أقصى');
        return;
      }
      setSelectedForCompare(prev => [...prev, username]);
    }
  };

  const openDetails = (comp) => {
    setSelectedSubmission(comp);
    setView('details');
  };

  const handlePdfExport = () => {
    window.print();
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="hidden print:block w-full bg-white">
        <PrintTemplate data={selectedSubmission} />
      </div>

      <div className="print:hidden">
        <header className="bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white p-1 rounded-2xl flex items-center justify-center shadow-lg border border-gray-50">
                <img src="./logo.jpg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-black text-indigo-950 leading-tight">لوحة تحكم وادارة معايير التعاقد مع شركات الدفع الالكتروني</h1>
                <p className="text-[10px] font-bold text-gray-400">جامعة بابل - 2026/2027</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={fetchData} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <RefreshCcw className="w-5 h-5" />
              </button>
              <button onClick={() => setView('list')} className={`px-6 py-2 rounded-xl text-xs font-black ${view === 'list' || view === 'compare' ? 'bg-indigo-900 text-white' : 'text-gray-400'}`}>الشركات</button>
              <button onClick={() => setShowAddUser(!showAddUser)} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black border border-indigo-100">إضافة شركة</button>
              <button onClick={logout} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 mt-12">
          {selectedForCompare.length > 0 && view === 'list' && (
            <div className="mb-8 flex items-center justify-between bg-indigo-950 p-6 rounded-[2rem] text-white animate-fade-in">
              <div className="flex items-center gap-4">
                <BarChart3 className="w-8 h-8 text-indigo-400" />
                <div>
                  <h4 className="font-black">مقارنة العروض المحددة</h4>
                  <p className="text-xs text-indigo-300">تم اختيار {selectedForCompare.length} شركات للمقارنة</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setView('compare')} className="bg-indigo-600 px-8 py-3 rounded-2xl font-black text-sm">بدء المقارنة</button>
                <button onClick={() => setSelectedForCompare([])} className="bg-white/10 px-4 py-3 rounded-2xl"><X className="w-5 h-5" /></button>
              </div>
            </div>
          )}

          {view === 'list' && (
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
              <div className="p-8 bg-gray-50/50">
                <input 
                  type="text" 
                  placeholder="البحث باسم الشركة..." 
                  className="w-full p-4 pr-12 bg-white border-2 border-gray-100 rounded-2xl outline-none font-bold focus:border-indigo-600 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase">
                    <tr>
                      <th className="px-8 py-5 w-16">#</th>
                      <th className="px-8 py-5">الشركة والممثل</th>
                      <th className="px-8 py-5">الحالة</th>
                      <th className="px-8 py-5 text-center">التقييم</th>
                      <th className="px-8 py-5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredCompanies.map((c) => (
                      <tr key={c.username} className={`hover:bg-indigo-50/20 transition-all ${selectedForCompare.includes(c.username) ? 'bg-indigo-50/50 border-r-4 border-indigo-600' : ''}`}>
                        <td className="px-8 py-6">
                           <button onClick={() => toggleCompare(c.username)} className={`p-2 rounded-lg ${selectedForCompare.includes(c.username) ? 'text-indigo-600 bg-indigo-100' : 'text-gray-200'}`}>
                             {selectedForCompare.includes(c.username) ? <CheckSquare /> : <Square />}
                           </button>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-black text-indigo-950">{c.companyName}</div>
                          <div className="text-[10px] font-bold text-gray-400">{c.representative} | {c.phone}</div>
                        </td>
                        <td className="px-8 py-6">
                           {c.isSubmitted ? <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black">تم التقديم</span> : <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black">بانتظار التقديم</span>}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <input type="number" min="0" max="10" disabled={!c.isSubmitted} value={c.evaluation_score || 0} onChange={(e) => handleUpdateScore(c.username, parseInt(e.target.value))} className="w-14 p-2 text-center font-black border rounded-xl" />
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => openDetails(c)} className="bg-indigo-950 text-white px-5 py-2.5 rounded-xl text-[10px] font-black">مراجعة</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'compare' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-xl">
                 <button onClick={() => setView('list')} className="flex items-center gap-2 text-indigo-600 font-black"><ArrowRight /> العودة للقائمة</button>
                 <h2 className="text-2xl font-black text-indigo-950">مقارنة العروض الفنية والمالية</h2>
                 <div className="w-32"></div>
              </div>

              <div className="overflow-x-auto pb-10">
                <div className="inline-flex gap-6 min-w-full">
                  <CompareColumn title="المعايير والأسئلة" isHeader fields={[
                    { label: 'رأس المال المودع' },
                    { label: 'سنوات الخبرة' },
                    { label: 'المؤسسات المخدَّمة' },
                    { label: 'آلية التسوية المالية' },
                    { label: 'العمولات المقترحة' },
                    { label: 'شمولية النظام الإلكتروني' },
                    { label: 'شهادات الأمن السيبراني' },
                    { label: 'خطاب الضمان المصرفي' },
                    { label: 'تطبيق الهاتف الذكي' },
                    { label: 'التقييم النهائي' }
                  ]} />

                  {selectedForCompare.map(username => {
                    const comp = allCompanies.find(c => c.username === username);
                    return (
                      <CompareColumn key={username} comp={comp} fields={[
                        { key: 'paidCapital' },
                        { key: 'marketExperience' },
                        { key: 'govInstitutionsCount' },
                        { key: 'q2_1_settlement' },
                        { key: 'q2_2_commissions' },
                        { key: 'q3a_1_integratedSystem' },
                        { key: 'q3b_1_certificates' },
                        { key: 'q4_1_bankGuarantee' },
                        { key: 'q5_1_extraFeatures' },
                        { key: 'evaluation_score', isScore: true }
                      ]} />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {view === 'details' && selectedSubmission && (
            <div className="space-y-8 animate-fade-in pb-20">
              <div className="flex justify-between items-center">
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-indigo-600 font-black"><ArrowRight /> العودة</button>
                <button onClick={handlePdfExport} className="bg-indigo-950 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2"><Download className="w-5 h-5" /> تصدير PDF</button>
              </div>
              {/* Detailed view content same as before but wrapped in premium cards */}
              <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border">
                <div className="bg-indigo-950 p-12 text-white">
                  <h2 className="text-4xl font-black">{selectedSubmission.companyName}</h2>
                  <p className="text-indigo-300 font-bold mt-2">الممثل: {selectedSubmission.representative} | الهاتف: {selectedSubmission.phone}</p>
                </div>
                <div className="p-12 space-y-16">
                   {/* Sections 1 to 7 here (omitted for brevity in this scratch tool but present in final file) */}
                   <DetailSection title="أولاً: المعلومات العامة والخبرات" data={selectedSubmission} fields={[{ key: 'submissionDate', label: 'تاريخ التقديم' }, { key: 'paidCapital', label: 'رأس المال' }, { key: 'marketExperience', label: 'سنوات الخبرة' }]} />
                   <DetailSection title="ثانياً: الالتزامات التشغيلية والمالية" data={selectedSubmission} fields={[{ key: 'q2_1_settlement', label: '1. آلية التسوية' }, { key: 'q2_2_commissions', label: '2. العمولات' }]} />
                   {/* ... and so on for all 39 questions ... */}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const CompareColumn = ({ title, comp, fields, isHeader }) => {
  const getVal = (c, key) => {
    if (!c) return '---';
    if (c[key]) return c[key];
    const lowerKey = key.toLowerCase();
    if (c[lowerKey]) return c[lowerKey];
    return '---';
  };

  return (
    <div className={`flex-1 min-w-[300px] bg-white rounded-[2.5rem] shadow-xl overflow-hidden ${isHeader ? 'bg-indigo-50 border-2 border-indigo-100' : ''}`}>
      <div className={`p-8 text-center border-b ${isHeader ? 'bg-indigo-100' : 'bg-indigo-950 text-white'}`}>
        <h5 className="font-black text-lg">{isHeader ? title : comp.companyName}</h5>
        {!isHeader && <p className="text-[10px] text-indigo-300 font-bold">يوزر: {comp.username}</p>}
      </div>
      <div className="p-8 space-y-6">
        {fields.map((f, i) => (
          <div key={i} className="pb-4 border-b border-gray-50 last:border-0">
             <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase">{isHeader ? '' : f.label}</label>
             <div className={`font-bold text-sm ${isHeader ? 'text-indigo-950' : 'text-gray-700'} ${f.isScore ? 'text-2xl text-indigo-600 font-black' : ''}`}>
               {isHeader ? f.label : getVal(comp, f.key)}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetailSection = ({ title, data, fields }) => { ... }; // Same robust getVal logic

export default AdminPanel;
