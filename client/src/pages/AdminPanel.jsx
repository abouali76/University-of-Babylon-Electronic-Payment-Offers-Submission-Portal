import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ExternalLink, UserCheck, UserPlus, Star, BarChart3, ChevronRight, ShieldCheck, FileText, Info, Trash2, FileX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrintTemplate from '../components/PrintTemplate';
import { exportToPdf } from '../utils/exportPdf';
import RankingTable from '../components/RankingTable';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [dynamicUsers, setDynamicUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list', 'details', 'compare'
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);

  useEffect(() => {
    const savedSubmissions = JSON.parse(localStorage.getItem('uob_all_submissions') || '[]');
    const savedUsers = JSON.parse(localStorage.getItem('uob_dynamic_users') || '[]');
    setSubmissions(savedSubmissions);
    setDynamicUsers(savedUsers);
    setLoading(false);
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    const newUsername = e.target.username?.value;
    const newPassword = e.target.password?.value;
    const newDisplayName = e.target.displayName?.value;

    if (!newUsername || !newPassword) return;
    const updatedUsers = [...dynamicUsers, { username: newUsername, password: newPassword, name: newDisplayName || newUsername }];
    localStorage.setItem('uob_dynamic_users', JSON.stringify(updatedUsers));
    setDynamicUsers(updatedUsers);
    e.target.reset();
    setShowAddUser(false);
  };

  const handleDeleteSubmission = (username) => {
    if (!window.confirm('هل أنت متأكد من حذف "العرض المقدم" فقط لهذه الشركة؟ سيبقى حساب الشركة فعالاً ويمكنهم إعادة التقديم.')) return;
    
    const updatedSubmissions = submissions.filter(s => s.username !== username);
    localStorage.setItem('uob_all_submissions', JSON.stringify(updatedSubmissions));
    setSubmissions(updatedSubmissions);
  };

  const handleDeleteCompany = (username) => {
    if (!window.confirm('تحذير: أنت على وشك حذف "حساب الشركة" بالكامل مع كافة عروضها. هل تريد الاستمرار؟')) return;
    
    const updatedUsers = dynamicUsers.filter(u => u.username !== username);
    const updatedSubmissions = submissions.filter(s => s.username !== username);
    
    localStorage.setItem('uob_dynamic_users', JSON.stringify(updatedUsers));
    localStorage.setItem('uob_all_submissions', JSON.stringify(updatedSubmissions));
    
    setDynamicUsers(updatedUsers);
    setSubmissions(updatedSubmissions);
  };

  const handleUpdateScore = (username, score) => {
    const updatedSubmissions = submissions.map(s => {
      if (s.username === username) return { ...s, evaluation_score: score };
      return s;
    });
    setSubmissions(updatedSubmissions);
    localStorage.setItem('uob_all_submissions', JSON.stringify(updatedSubmissions));
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
    window.location.reload();
  };

  const allCompanies = dynamicUsers.map(user => {
    const submission = submissions.find(s => s.username === user.username) || {};
    return {
      ...submission,
      username: user.username,
      companyName: submission.companyName || user.name || user.username,
      isSubmitted: !!submission.lastUpdated
    };
  });

  const filteredCompanies = allCompanies.filter(c => 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `uob_full_report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const openDetails = (comp) => {
    setSelectedSubmission(comp);
    setView('details');
  };

  const handlePdfExport = async () => {
    if (!selectedSubmission) return;
    setIsExporting(true);
    await exportToPdf('print-area', `UOB_Official_${selectedSubmission.companyName}.pdf`);
    setIsExporting(false);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Hidden Print Area */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <PrintTemplate data={selectedSubmission} />
      </div>

      <header className="bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white p-1 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/10 border border-gray-50">
              <img src="./logo.jpg" alt="University Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black text-indigo-950 tracking-tight">لوحة تحكم ادارة لجنة الدفع الالكتروني</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">University of Babylon Central Admin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center bg-gray-100 p-1 rounded-2xl">
              <button 
                onClick={() => { setView('list'); setSelectedSubmission(null); }}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${view === 'list' || view === 'details' ? 'bg-white text-indigo-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                قائمة الشركات
              </button>
              <button 
                onClick={() => setView('compare')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${view === 'compare' ? 'bg-white text-indigo-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                تقارير المقارنة
              </button>
            </nav>

            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

            <button 
              onClick={() => setShowAddUser(!showAddUser)}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              إضافة حساب شركة
            </button>

            <button onClick={logout} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm group" title="تسجيل الخروج">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="إجمالي الشركات" value={dynamicUsers.length} icon={<UserCheck className="w-6 h-6" />} color="indigo" />
          <StatCard title="عروض مكتملة" value={submissions.length} icon={<FileText className="w-6 h-6" />} color="emerald" />
          <StatCard title="بانتظار التقديم" value={dynamicUsers.length - submissions.length} icon={<Info className="w-6 h-6" />} color="amber" />
          <StatCard title="متوسط التقييم" value={submissions.length ? (submissions.reduce((acc, s) => acc + (s.evaluation_score || 0), 0) / submissions.length).toFixed(1) : 0} icon={<Star className="w-6 h-6" />} color="blue" />
        </div>

        {showAddUser && (
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-indigo-100 mb-10 animate-fade-in relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
             <h3 className="text-lg font-black text-indigo-900 mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                إنشاء حساب وصول لشركة جديدة
             </h3>
             <form onSubmit={(e) => {
               e.preventDefault();
               const fd = new FormData(e.target);
               handleAddUser({
                 preventDefault: () => {},
                 target: {
                   username: { value: fd.get('username') },
                   password: { value: fd.get('password') },
                   displayName: { value: fd.get('displayName') },
                   reset: () => e.target.reset()
                 }
               });
             }} className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mr-1">اسم الشركة (الرسمي)</label>
                  <input name="displayName" placeholder="مثال: شركة بوابة الرافدين" className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent outline-none focus:bg-white focus:border-indigo-600/10 focus:ring-4 focus:ring-indigo-600/5 transition-all font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mr-1">يوزر الدخول (بالإنجليزي)</label>
                  <input name="username" placeholder="Username" className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent outline-none focus:bg-white focus:border-indigo-600/10 focus:ring-4 focus:ring-indigo-600/5 transition-all font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mr-1">كلمة المرور</label>
                  <input name="password" type="password" placeholder="Password" className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent outline-none focus:bg-white focus:border-indigo-600/10 focus:ring-4 focus:ring-indigo-600/5 transition-all font-bold" required />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-indigo-950 text-white p-4 rounded-2xl font-black hover:bg-indigo-900 shadow-xl shadow-indigo-900/20 transition-all active:scale-95">تفعيل الحساب</button>
                </div>
             </form>
          </div>
        )}

        {view === 'list' && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/5 border border-white overflow-hidden">
            <div className="p-8 bg-gray-50/50 flex gap-4 border-b border-gray-100">
              <div className="relative flex-grow">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="البحث باسم الشركة أو اليوزر..." 
                  className="w-full p-4 pr-12 bg-white border-2 border-transparent rounded-2xl outline-none shadow-sm focus:border-indigo-100 transition-all font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                  <tr>
                    <th className="px-8 py-5">هوية الشركة</th>
                    <th className="px-8 py-5">الحالة</th>
                    <th className="px-8 py-5">تاريخ التحديث</th>
                    <th className="px-8 py-5 text-center">تقييم اللجنة</th>
                    <th className="px-8 py-5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCompanies.map((c, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black group-hover:scale-110 transition-all ${c.isSubmitted ? 'bg-indigo-900 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                            {c.companyName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="font-black text-indigo-950">{c.companyName}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">@{c.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {c.isSubmitted ? (
                          <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 w-fit">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            تم تقديم العرض
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 w-fit">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            بانتظار التقديم
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs font-bold text-gray-500">{c.submissionDate || '---'}</div>
                        <div className="text-[10px] text-gray-300">آخر تعديل: {c.lastUpdated ? new Date(c.lastUpdated).toLocaleDateString() : 'لم يبدأ بعد'}</div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center justify-center gap-3">
                            <input 
                              type="number" min="0" max="10" 
                              disabled={!c.isSubmitted}
                              className={`w-14 p-2 rounded-xl text-center font-black outline-none shadow-sm border-2 transition-all ${c.isSubmitted ? 'bg-white border-gray-100 focus:border-indigo-200 text-indigo-900' : 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'}`}
                              value={c.evaluation_score || 0}
                              onChange={(e) => handleUpdateScore(c.username, parseInt(e.target.value))}
                            />
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${(c.evaluation_score / 2) > i ? 'text-amber-400 fill-amber-400' : 'text-gray-100'}`} />
                              ))}
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openDetails(c)}
                            className="bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-indigo-950 hover:text-white transition-all duration-300 flex items-center gap-2"
                          >
                            <Info className="w-4 h-4" />
                            مراجعة البيانات
                          </button>
                          
                          {c.isSubmitted && (
                            <button 
                              onClick={() => handleDeleteSubmission(c.username)}
                              className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                              title="حذف العرض فقط"
                            >
                              <FileX className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleDeleteCompany(c.username)}
                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="حذف الحساب بالكامل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'details' && selectedSubmission && (
          <div className="animate-fade-in pb-20">
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setView('list')} className="flex items-center gap-2 text-indigo-600 font-black hover:-translate-x-2 transition-transform group">
                <ChevronRight className="w-5 h-5 rotate-180 group-hover:scale-110" />
                العودة لقائمة الشركات والمتابعة
              </button>
              
              <button 
                onClick={handlePdfExport}
                disabled={isExporting}
                className="bg-indigo-900 text-white px-8 py-3 rounded-2xl text-xs font-black hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-900/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isExporting ? <span className="animate-spin">⌛</span> : <Download className="w-4 h-4" />}
                تصدير كـ PDF رسمي
              </button>
            </div>
            
            <div className="bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden">
              <div className="bg-indigo-950 p-12 text-white relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedSubmission.isSubmitted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                         {selectedSubmission.isSubmitted ? 'عرض رسمي مكتمل' : 'قيد الإعداد / لم يتم الإرسال'}
                       </span>
                    </div>
                    <h2 className="text-5xl font-black mb-2 tracking-tight">{selectedSubmission.companyName}</h2>
                    <p className="opacity-60 font-bold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      مراجعة الأسئلة والالتزامات الـ 39 لعام 2026
                    </p>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 min-w-[240px] shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">نقاط تقييم اللجنة العليا</p>
                    <div className="flex items-center justify-center gap-4">
                       <div className="text-6xl font-black text-amber-400">{selectedSubmission.evaluation_score || 0}<span className="text-xl opacity-30">/10</span></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-12 space-y-16">
                <DetailSection title="أولاً: المعلومات العامة والخبرات" data={selectedSubmission} fields={[
                  { key: 'submissionDate', label: 'تاريخ التقديم المذكور' },
                  { key: 'representativeName', label: 'الممثل الرسمي' },
                  { key: 'phone', label: 'رقم التواصل المباشر' },
                  { key: 'email', label: 'البريد الإلكتروني المعتمد' },
                  { key: 'centralBankLicense', label: 'رقم إجازة البنك المركزي العراقي' },
                  { key: 'marketExperience', label: 'سنوات الخبرة في السوق المحلي' },
                  { key: 'govInstitutionsCount', label: 'عدد المؤسسات الحكومية المخدَّمة' },
                  { key: 'paidCapital', label: 'رأس المال المدفوع / الملاءة المالية' },
                  { key: 'officialAddress', label: 'المقر الرئيسي والعنوان' },
                ]} />

                <DetailSection title="ثانياً: الالتزامات التشغيلية والمالية (8 أسئلة)" data={selectedSubmission} fields={[
                  { key: 'q2_1_settlement', label: '1. آلية التسوية (12 ساعة)' },
                  { key: 'q2_2_commissions', label: '2. العمولات والخصومات المقترحة' },
                  { key: 'q2_3_intermediary', label: '3. الوسيط المالي / البنك الوسيط' },
                  { key: 'q2_4_delayPenalty', label: '4. قيمة غرامات التأخير' },
                  { key: 'q2_5_atmCommitment', label: '5. الالتزام بأجهزة ATM داخل الجامعة' },
                  { key: 'q2_6_studentCards', label: '6. تفاصيل إصدار بطاقات الطلبة' },
                  { key: 'q2_7_chargingCenters', label: '7. مراكز التعبئة وساعات العمل' },
                  { key: 'q2_8_posCommitment', label: '8. مستلزمات PoS المجانية والصيانة' },
                ]} />

                <DetailSection title="ثالثاً: الالتزامات التقنية والأمن السيبراني" data={selectedSubmission} fields={[
                  { key: 'q3a_1_integratedSystem', label: '1. النظام الإلكتروني والتقارير' },
                  { key: 'q3a_4_webIntegration', label: '2. التكامل مع موقع الجامعة' },
                  { key: 'q3b_1_certificates', label: '3. شهادات الأمن (ISO, PCI-DSS)' },
                  { key: 'q3b_3_rto_bcp', label: '4. خطة الاستمرارية (RTO / BCP)' },
                  { key: 'q3b_4_backups', label: '5. سياسة النسخ الاحتياطي' },
                  { key: 'q3b_5_supportSla', label: '6. الدعم الفني (24/7 SLA)' },
                ]} />

                <DetailSection title="رابعاً: الالتزامات القانونية والتعاقدية" data={selectedSubmission} fields={[
                  { key: 'q4_1_bankGuarantee', label: '1. خطاب الضمان المصرفي' },
                  { key: 'q4_3_dataOwnership', label: '2. ملكية البيانات واستردادها' },
                  { key: 'q4_6_jurisdiction', label: '3. القانون والاختصاص القضائي' },
                  { key: 'q4_8_contractDuration', label: '4. مدة العقد وشروط التجديد' },
                ]} />
              </div>
            </div>
          </div>
        )}

        {view === 'compare' && (
          <div className="space-y-8 animate-fade-in">
             <RankingTable />
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-900/5 border border-white flex items-center gap-6 group hover:border-indigo-100 transition-all duration-500">
    <div className={`w-16 h-16 bg-${color}-50 text-${color}-600 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-4xl font-black text-indigo-950 tracking-tight">{value}</p>
    </div>
  </div>
);

const DetailSection = ({ title, data, fields }) => (
  <div className="space-y-8">
    <h3 className="text-2xl font-black text-indigo-950 flex items-center gap-4">
      <span className="w-2 h-8 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/30"></span>
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {fields.map(f => (
        <div key={f.key} className="bg-gray-50/50 p-8 rounded-[2rem] border-2 border-transparent group hover:bg-white hover:border-indigo-600/10 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all duration-500">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block group-hover:text-indigo-600 transition-colors">{f.label}</label>
          <p className="text-sm font-bold text-gray-700 leading-relaxed whitespace-pre-wrap">{data[f.key] || '--- لم يتم ملء هذه الفقرة بعد ---'}</p>
        </div>
      ))}
    </div>
  </div>
);

const Badge = ({ color, text }) => (
  <span className={`bg-${color}-50 text-${color}-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border border-${color}-100`}>
    {text}
  </span>
);

export default AdminPanel;
