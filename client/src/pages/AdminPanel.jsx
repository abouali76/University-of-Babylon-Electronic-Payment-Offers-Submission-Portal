import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ExternalLink, UserCheck, UserPlus, Star, BarChart3, ChevronRight, ShieldCheck, FileText, Info, Trash2, FileX } from 'lucide-react';
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
        .from('profiles')
        .select('user_id, username, display_name, role, created_at')
        .eq('role', 'company')
        .order('created_at', { ascending: false });
      
      if (!usersResult.error) {
        usersData = usersResult.data || [];
      }

      const subsResult = await supabase
        .from('submissions')
        .select('user_id, username, status, evaluation_score, last_updated, document_path, data')
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

  const handleAddUser = async (data) => {
    const { username, password, displayName } = data;
    if (!username || !password) return;
    
    try {
      const payload = {
        username: username.trim(),
        password: normalizePassword(password.trim()),
        displayName: (displayName || username).trim()
      };

      const { data: fnData, error: fnError } = await supabase.functions.invoke('create-company-user', {
        body: payload
      });

      if (fnError) throw fnError;
      if (fnData?.error) throw new Error(fnData.error);

      await fetchData();
      setShowAddUser(false);
      alert('تم إنشاء الحساب بنجاح.');
    } catch (err) {
      const msg = String(err?.message || err?.error_description || '');
      alert(`فشل إنشاء الحساب: ${msg}`);
    }
  };

  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', username: '', title: '' });

  const handleDeleteSubmission = (username) => {
    setConfirmModal({
      show: true,
      type: 'reset',
      username,
      title: 'هل تريد تصفير العرض لهذه الشركة؟ سيتم حذف المسودة والتقديم الحالي.'
    });
  };

  const handleDeleteCompany = (username) => {
    setConfirmModal({
      show: true,
      type: 'delete',
      username,
      title: 'حذف حساب الشركة نهائياً؟ سيتم مسح كافة البيانات المرتبطة بها.'
    });
  };

  const executeDelete = async () => {
    const { type, username } = confirmModal;
    try {
      if (type === 'reset') {
        const { error } = await supabase
          .from('submissions')
          .delete()
          .eq('username', username);
        if (error) throw error;
        alert('تم تصفير العرض بنجاح.');
      } else if (type === 'delete') {
        const { data, error: fnError } = await supabase.functions.invoke('create-company-user', {
          body: { action: 'delete', username }
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        alert('تم حذف الشركة بنجاح.');
      }
      await fetchData();
    } catch (err) {
      alert('فشل تنفيذ العملية.');
    }
    setConfirmModal({ show: false, type: '', username: '', title: '' });
  };

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
      ...(submission.data || {}),
      evaluation_score: submission.evaluation_score,
      status: submission.status,
      lastUpdated: submission.last_updated,
      documentUrl: submission.document_path,
      username: user.username,
      companyName: (submission.data && submission.data.companyName) || user.display_name || user.username,
      isSubmitted: submission.status === 'final' || !!submission.last_updated
    };
  });

  const filteredCompanies = allCompanies.filter(c => 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-xl font-black text-indigo-950">لوحة تحكم إدارة العروض</h1>
                <p className="text-[10px] font-bold text-gray-400">جامعة بابل - 2026/2027</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setView('list')} className={`px-6 py-2 rounded-xl text-xs font-black ${view === 'list' ? 'bg-indigo-900 text-white' : 'text-gray-400'}`}>الشركات</button>
              <button onClick={() => setShowAddUser(!showAddUser)} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black border border-indigo-100">إضافة شركة</button>
              <button onClick={logout} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 mt-12">
          {showAddUser && (
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-indigo-100 mb-10">
              <h3 className="text-lg font-black text-indigo-900 mb-6">إنشاء حساب شركة جديدة</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleAddUser({ username: fd.get('username'), password: fd.get('password'), displayName: fd.get('displayName') });
                e.target.reset();
              }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <input name="displayName" placeholder="اسم الشركة" className="p-4 rounded-2xl bg-gray-50 border-2 outline-none font-bold" required />
                <input name="username" placeholder="يوزر الدخول" className="p-4 rounded-2xl bg-gray-50 border-2 outline-none font-bold" required />
                <input name="password" type="password" placeholder="كلمة المرور" className="p-4 rounded-2xl bg-gray-50 border-2 outline-none font-bold" required />
                <button type="submit" className="bg-indigo-950 text-white p-4 rounded-2xl font-black">تفعيل الحساب</button>
              </form>
            </div>
          )}

          {view === 'list' && (
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
              <div className="p-8 bg-gray-50/50">
                <input 
                  type="text" 
                  placeholder="البحث باسم الشركة أو اليوزر..." 
                  className="w-full p-4 bg-white border-2 rounded-2xl outline-none font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase">
                    <tr>
                      <th className="px-8 py-5">الشركة</th>
                      <th className="px-8 py-5">الحالة</th>
                      <th className="px-8 py-5 text-center">المرفقات</th>
                      <th className="px-8 py-5 text-center">التقييم</th>
                      <th className="px-8 py-5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCompanies.map((c) => (
                      <tr key={c.username} className="hover:bg-indigo-50/20 group">
                        <td className="px-8 py-6">
                          <div className="font-black text-indigo-950">{c.companyName}</div>
                          <div className="text-[10px] font-bold text-gray-400">@{c.username}</div>
                        </td>
                        <td className="px-8 py-6">
                          {c.isSubmitted ? <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black">تم التقديم</span> : <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black">بانتظار التقديم</span>}
                        </td>
                        <td className="px-8 py-6 text-center">
                          {c.documentUrl ? <a href={supabase.storage.from('documents').getPublicUrl(c.documentUrl).data.publicUrl} target="_blank" className="inline-block p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText className="w-5 h-5" /></a> : <span className="text-gray-200">---</span>}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <input type="number" min="0" max="10" disabled={!c.isSubmitted} value={c.evaluation_score || 0} onChange={(e) => handleUpdateScore(c.username, parseInt(e.target.value))} className="w-14 p-2 text-center font-black border rounded-xl" />
                        </td>
                        <td className="px-8 py-6 text-center flex justify-center gap-2">
                          <button onClick={() => openDetails(c)} className="bg-indigo-900 text-white px-4 py-2 rounded-xl text-[10px] font-black">مراجعة</button>
                          <button onClick={() => handleDeleteSubmission(c.username)} className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black"><FileX className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteCompany(c.username)} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'details' && selectedSubmission && (
            <div className="space-y-8 animate-fade-in pb-20">
              <div className="flex justify-between items-center">
                <button onClick={() => setView('list')} className="text-indigo-600 font-black">← العودة</button>
                <button onClick={handlePdfExport} className="bg-indigo-900 text-white px-8 py-3 rounded-2xl font-black">تصدير PDF</button>
              </div>
              
              <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border">
                <div className="bg-indigo-950 p-12 text-white">
                  <h2 className="text-4xl font-black">{selectedSubmission.companyName}</h2>
                  <p className="text-indigo-300 font-bold mt-2">الممثل: {selectedSubmission.representativeName}</p>
                </div>
                
                <div className="p-12 space-y-12">
                  <DetailSection title="أولاً: المعلومات العامة والخبرات" data={selectedSubmission} fields={[
                    { key: 'submissionDate', label: 'تاريخ التقديم' },
                    { key: 'representativeName', label: 'الممثل الرسمي' },
                    { key: 'phone', label: 'رقم الهاتف' },
                    { key: 'email', label: 'البريد الإلكتروني' },
                    { key: 'paidCapital', label: 'رأس المال' },
                    { key: 'officialAddress', label: 'العنوان' },
                  ]} />

                  <DetailSection title="ثانياً: الالتزامات التشغيلية والمالية (8 أسئلة)" data={selectedSubmission} fields={[
                    { key: 'q2_1_settlement', label: '1. آلية التسوية' },
                    { key: 'q2_2_commissions', label: '2. العمولات' },
                    { key: 'q2_3_intermediary', label: '3. الوسيط المالي' },
                    { key: 'q2_4_delayPenalty', label: '4. غرامات التأخير' },
                    { key: 'q2_5_atmCommitment', label: '5. أجهزة ATM' },
                    { key: 'q2_6_studentCards', label: '6. بطاقات الطلبة' },
                    { key: 'q2_7_chargingCenters', label: '7. مراكز التعبئة' },
                    { key: 'q2_8_posCommitment', label: '8. نقاط البيع PoS' },
                  ]} />

                  <DetailSection title="ثالثاً: أ- النظام الإلكتروني والتكامل (6 أسئلة)" data={selectedSubmission} fields={[
                    { key: 'q3a_1_integratedSystem', label: '1. النظام الإلكتروني' },
                    { key: 'q3a_2_techSpecs', label: '2. بطاقات الوحدات الإدارية' },
                    { key: 'q3a_3_appSupport', label: '3. كشف حساب لحظي' },
                    { key: 'q3a_4_webIntegration', label: '4. التكامل مع الموقع' },
                    { key: 'q3a_5_reporting', label: '5. التحويلات الخارجية' },
                    { key: 'q3a_6_training', label: '6. رقم IBAN دولي' },
                  ]} />

                  <DetailSection title="ثالثاً: ب- الأمن السيبراني والاستمرارية (8 أسئلة)" data={selectedSubmission} fields={[
                    { key: 'q3b_1_certificates', label: '1. شهادات الأمن' },
                    { key: 'q3b_2_encryption', label: '2. التشفير' },
                    { key: 'q3b_3_rto_bcp', label: '3. خطة الاستمرارية' },
                    { key: 'q3b_4_backups', label: '4. النسخ الاحتياطي' },
                    { key: 'q3b_5_supportSla', label: '5. الدعم الفني' },
                    { key: 'q3b_6_penTest', label: '6. اختبارات الاختراق' },
                    { key: 'q3b_7_monitoring', label: '7. الاحتفاظ بالبيانات' },
                    { key: 'q3b_8_incident', label: '8. طرائق الاتصال' },
                  ]} />

                  <DetailSection title="رابعاً: أ- الضمانات وملكية البيانات" data={selectedSubmission} fields={[
                    { key: 'q4_1_bankGuarantee', label: '1. خطاب الضمان' },
                    { key: 'q4_2_penaltyClause', label: '2. سرية البيانات' },
                    { key: 'q4_3_dataOwnership', label: '3. ملكية البيانات' },
                  ]} />

                  <DetailSection title="رابعاً: ب- الالتزامات القانونية والتعاقدية (6 أسئلة)" data={selectedSubmission} fields={[
                    { key: 'q4_4_exitClause', label: '4. التدريب المجاني' },
                    { key: 'q4_5_liability', label: '5. فسخ العقد' },
                    { key: 'q4_6_jurisdiction', label: '6. القانون والاختصاص' },
                    { key: 'q4_7_auditRight', label: '7. التحكيم التجاري' },
                    { key: 'q4_8_contractDuration', label: '8. مدة العقد' },
                    { key: 'q4_9_renewal', label: '9. شكاوى الطلبة' },
                  ]} />

                  <DetailSection title="خامساً: الخدمات الإضافية والميزات التنافسية (8 أسئلة)" data={selectedSubmission} fields={[
                    { key: 'q5_1_extraFeatures', label: '1. تطبيق الهاتف' },
                    { key: 'q5_2_innovation', label: '2. خدمات مصرفية إضافية' },
                    { key: 'q5_3_scholarships', label: '3. الطاقة الاستيعابية' },
                    { key: 'q5_4_staffTraining', label: '4. دعم الفعاليات' },
                    { key: 'q5_5_posUpdates', label: '5. تحديث الأنظمة', aliases: ['q5_5_mobileApp', 'mobileApp', 'posUpdates'] },
                    { key: 'q5_6_foreignPayments', label: '6. تسديد الأجور بالدولار', aliases: ['q5_6_foreignStudents', 'foreignStudents', 'foreignPayments'] },
                    { key: 'q5_7_complaints', label: '7. ميزات إضافية' },
                    { key: 'q5_8_socialResp', label: '8. المؤسسات المخدَّمة', aliases: ['socialResp'] },
                  ]} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-center mb-6">{confirmModal.title}</h3>
            <div className="flex gap-4">
              <button onClick={executeDelete} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black">تأكيد</button>
              <button onClick={() => setConfirmModal({ show: false })} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black">تراجع</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailSection = ({ title, data, fields }) => {
  const getVal = (f) => {
    // 1. Try exact key
    if (data[f.key]) return data[f.key];
    
    // 2. Try aliases
    if (f.aliases) {
      for (const alias of f.aliases) {
        if (data[alias]) return data[alias];
      }
    }
    
    // 3. Try lowercase variant
    const lowerKey = f.key.toLowerCase();
    if (data[lowerKey]) return data[lowerKey];
    
    // 4. Try without qX_ prefix
    const noPrefix = f.key.replace(/^q\d[a-z]?_\d_/, '');
    if (data[noPrefix]) return data[noPrefix];
    const noPrefixLower = noPrefix.toLowerCase();
    if (data[noPrefixLower]) return data[noPrefixLower];

    return '---';
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black text-indigo-950 border-r-4 border-indigo-600 pr-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(f => (
          <div key={f.key} className="bg-gray-50 p-6 rounded-2xl">
            <label className="text-[10px] font-black text-gray-400 uppercase">{f.label}</label>
            <p className="text-sm font-bold text-gray-700 mt-1 whitespace-pre-wrap">{getVal(f)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
