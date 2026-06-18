import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ExternalLink, UserCheck, UserPlus, Star, BarChart3, ChevronRight, ShieldCheck, FileText, Info, Trash2, FileX, RefreshCcw, ArrowRight, LogOut, CheckSquare, Square, X, User, Phone, CheckCircle2, KeyRound, Eye, EyeOff, Bell, History, Building2, Menu, Edit3, Save as SaveIcon, Lock, Unlock, Megaphone, Clock, Trophy, Settings } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import PrintTemplate from '../components/PrintTemplate';
import RankingTable from '../components/RankingTable';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState([]);
  const [submissionsRound2, setSubmissionsRound2] = useState([]);
  const [roundView, setRoundView] = useState('round1');
  const [dynamicUsers, setDynamicUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list', 'details', 'compare', 'results'
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPass: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [activities, setActivities] = useState([]);
  const [showActivities, setShowActivities] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingName, setEditingName] = useState({ username: '', name: '' });
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [systemSettingsForm, setSystemSettingsForm] = useState({ closeAt: '' });
  const [systemSettingsSaving, setSystemSettingsSaving] = useState(false);

  const normalizePassword = (p) => {
    const raw = String(p || '');
    return raw.length >= 6 ? raw : raw.padEnd(6, '0');
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime activity logs
    const channel = supabase
      .channel('admin-activity-logs')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT and DELETE
          schema: 'public',
          table: 'activity_logs',
        },
        (payload) => {
          console.log('Realtime activity update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setActivities(prev => [payload.new, ...prev].slice(0, 20));
            // If it's a submission, refresh the data to show the new status in the table
            if (payload.new.event_type === 'submit') {
              fetchData();
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove the deleted log from the activities list
            setActivities(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

      // Set session variable for RLS
      await supabase.rpc('set_config', {
        setting: 'app.current_user',
        value: localUser.username,
        is_local: false
      });

      let usersData = [];
      let subsData = [];

      const usersResult = await supabase
        .from('users')
        .select('id, username, name, role, created_at, is_locked')
        .eq('role', 'company')
        .order('created_at', { ascending: false });
      
      if (usersResult.error) {
        alert(`خطأ في جلب بيانات الشركات: ${usersResult.error.message}`);
      } else {
        usersData = usersResult.data || [];
      }

      const subsResult = await supabase
        .from('submissions')
        .select('*')
        .order('last_updated', { ascending: false });
      
      if (subsResult.error) {
        alert(`خطأ في جلب بيانات التقديم: ${subsResult.error.message}`);
      } else {
        subsData = subsResult.data || [];
      }

      const subsR2Result = await supabase
        .from('submissions_round2')
        .select('*')
        .order('last_updated', { ascending: false });
      
      let subsR2Data = [];
      if (subsR2Result.error) {
        console.error('Error fetching round 2', subsR2Result.error);
      } else {
        subsR2Data = subsR2Result.data || [];
      }

      const logsResult = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      const logsData = logsResult.data || [];

      setDynamicUsers(usersData);
      setSubmissions(subsData);
      setSubmissionsRound2(subsR2Data);
      setActivities(logsData);

      // Fetch current announcement
      const { data: annData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      if (annData && annData[0]) {
        setAnnouncementForm({ title: annData[0].title || '', content: annData[0].content || '' });
      }

      // Fetch system settings
      const { data: sysData } = await supabase
        .from('system_settings')
        .select('*')
        .eq('id', 'global')
        .maybeSingle();
      if (sysData && sysData.close_at) {
        // Convert to datetime-local format (YYYY-MM-DDTHH:mm)
        const date = new Date(sysData.close_at);
        const localDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setSystemSettingsForm({ closeAt: localDateTime });
      } else {
        setSystemSettingsForm({ closeAt: '' });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      alert(`خطأ غير متوقع: ${err.message}`);
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

  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', username: '', userId: '', title: '' });
  const executeDelete = async () => {
    const { type, username, userId } = confirmModal;
    console.log('Executing action:', { type, username, userId });
    if (!userId && type !== 'delete') {
      alert(`خطأ تقني: معرف المستخدم (userId) مفقود لنوع العملية ${type}`);
      setConfirmModal({ show: false, type: '', username: '', userId: '', title: '' });
      return;
    }

    try {
      if (type === 'reset' || type === 'confirm_receipt' || type === 'finalize') {
        const { data, error: fnError } = await supabase.functions.invoke('create-company-user', {
          body: { action: type, username }
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        
        if (type === 'reset') alert('تم تصفير العرض بنجاح.');
        else if (type === 'confirm_receipt') alert('تم تأييد الاستلام وقفل التعديل للشركة.');
        else if (type === 'finalize') alert('تم تثبيت العرض كطلب نهائي وتأييد الاستلام وقفل التعديل بنجاح.');
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
      console.error('Operation failed:', err);
      alert(`فشل تنفيذ العملية: ${err.message || 'خطأ غير معروف'}`);
    }
    setConfirmModal({ show: false, type: '', username: '', userId: '', title: '' });
  };

  const handleUpdateScore = async (username, newScore) => {
    if (newScore === undefined || newScore === null || newScore === '') {
      alert('يرجى إدخال درجة التقييم أولاً.');
      return;
    }

    try {
      const scoreValue = parseFloat(newScore);
      if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
        alert('يرجى إدخال درجة صحيحة بين 0 و 100.');
        return;
      }

      console.log(`Updating score for user ${username} to ${scoreValue}`);
      const { data, error: fnError } = await supabase.functions.invoke('create-company-user', {
        body: { action: 'update_score', username, score: scoreValue }
      });

      if (fnError) {
        console.error('Function Error:', fnError);
        alert(`فشل التحديث: ${fnError.message}`);
        return;
      }
      if (data?.error) {
        console.error('Data Error:', data.error);
        alert(`فشل التحديث: ${data.error}`);
        return;
      }
      
      alert(`تم رصد درجة التقييم (${scoreValue}) للشركة بنجاح.`);
      await fetchData();
      if (selectedSubmission && selectedSubmission.username === username) {
        setSelectedSubmission(prev => ({ ...prev, evaluation_score: scoreValue }));
      }
    } catch (err) {
      console.error('Error updating score:', err);
      alert('فشل تحديث التقييم. تأكد من وجود عمود evaluation_score في قاعدة البيانات.');
    }
  };

  const handleUpdateName = async () => {
    if (!editingName.username || !editingName.name.trim()) return;
    
    setIsUpdatingName(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-company-user', {
        body: { 
          action: 'update_name', 
          username: editingName.username, 
          newName: editingName.name.trim() 
        }
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      await fetchData();
      setEditingName({ username: '', name: '' });
      alert('تم تحديث اسم الشركة بنجاح.');
    } catch (err) {
      console.error('Error updating name:', err);
      alert(`فشل تحديث الاسم: ${err.message}`);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleToggleLock = async (username, currentLocked) => {
    const newLocked = !currentLocked;
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-company-user', {
        body: { action: 'toggle_lock', username, locked: newLocked }
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      alert(newLocked ? 'تم تعليق حساب الشركة بنجاح.' : 'تم إعادة تفعيل حساب الشركة.');
      await fetchData();
    } catch (err) {
      alert(`فشل العملية: ${err.message}`);
    }
  };

  const handleSaveAnnouncement = async () => {
    setAnnouncementSaving(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-company-user', {
        body: { action: 'update_announcement', title: announcementForm.title, content: announcementForm.content, is_active: true }
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      alert('تم حفظ الإعلان بنجاح. سيظهر للشركات عند الدخول.');
      setShowAnnouncement(false);
    } catch (err) {
      alert(`فشل حفظ الإعلان: ${err.message}`);
    } finally {
      setAnnouncementSaving(false);
    }
  };
  const handleSaveSystemSettings = async () => {
    setSystemSettingsSaving(true);
    try {
      const closeAt = systemSettingsForm.closeAt ? new Date(systemSettingsForm.closeAt).toISOString() : null;
      const { data, error: fnError } = await supabase.functions.invoke('create-company-user', {
        body: { action: 'update_system_settings', closeAt }
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      alert('تم تحديث موعد غلق النظام بنجاح.');
      setShowSystemSettings(false);
      await fetchData();
    } catch (err) {
      alert(`فشل التحديث: ${err.message}`);
    } finally {
      setSystemSettingsSaving(false);
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('currentUser');
    navigate('/login');
    window.location.reload();
  };

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess('');

    if (!pwForm.current || !pwForm.newPass || !pwForm.confirm) {
      setPwError('يرجى ملء جميع الحقول.');
      return;
    }
    if (pwForm.newPass.length < 4) {
      setPwError('كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل.');
      return;
    }
    if (pwForm.newPass !== pwForm.confirm) {
      setPwError('كلمة المرور الجديدة وتأكيدها غير متطابقتين.');
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('create-company-user', {
        body: {
          action: 'change_admin_password',
          currentPassword: pwForm.current,
          newPassword: pwForm.newPass
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPwSuccess('تم تغيير كلمة المرور بنجاح!');
      setPwForm({ current: '', newPass: '', confirm: '' });
      setTimeout(() => {
        setShowChangePassword(false);
        setPwSuccess('');
      }, 1500);
    } catch (err) {
      setPwError(err?.message || 'فشل تغيير كلمة المرور.');
    }
  };

  const allCompanies = dynamicUsers.map(u => {
    const activeSubmissions = roundView === 'round1' ? submissions : submissionsRound2;
    const submission = activeSubmissions.find(s => s.username === u.username) || {};
    const finalUserId = u.id || submission.user_id || submission.userId;
    console.log(`Mapping company ${u.username}:`, { u_id: u.id, sub_user_id: submission.user_id, finalUserId });
    
    return {
      ...submission,
      ...(submission.data || {}),
      userId: finalUserId, // Standardize as userId everywhere
      evaluation_score: submission.evaluation_score,
      status: submission.status,
      lastUpdated: submission.last_updated || submission.lastupdated,
      documentUrl: submission.document_path || submission.document_url,
      username: u.username,
      companyName: (submission.data && submission.data.companyName) || submission.companyName || submission.companyname || u.name || u.username,
      representative: (submission.data && submission.data.representativeName) || submission.representativeName || submission.representativename || '---',
      phone: (submission.data && submission.data.phone) || submission.phone || '---',
      isSubmitted: submission.status === 'final',
      isReceived: !!submission.is_received,
      isLocked: !!u.is_locked
    };
  });

  const filteredCompanies = allCompanies.filter(c => 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!loading && allCompanies.length > 0) {
      const target = searchParams.get('company');
      if (target) {
        // Just filter the list to show that company - don't open details
        setSearchTerm(target);
        setView('list');
        setSearchParams({}, { replace: true });
      }
    }
  }, [loading, searchParams, allCompanies]);

  const toggleCompare = (username) => {
    if (selectedForCompare.includes(username)) {
      setSelectedForCompare(prev => prev.filter(u => u !== username));
    } else {
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row" dir="rtl">
      <div className="hidden print:block w-full bg-white">
        <PrintTemplate data={selectedSubmission} />
      </div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white p-1 rounded-xl shadow-sm border border-gray-50">
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-sm font-black text-indigo-950">لوحة الإدارة</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={logout}
            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-gray-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-indigo-950/20 backdrop-blur-sm z-[45] animate-fade-in" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        print:hidden 
        fixed lg:sticky top-0 right-0 h-screen w-80 bg-white border-l border-gray-100 flex flex-col z-50 
        transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        <div className="p-8">
          <div className="hidden lg:flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-white p-1 rounded-2xl flex items-center justify-center shadow-lg border border-gray-50 shrink-0">
              <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-black text-indigo-950 leading-tight">نظام إدارة المعايير</h1>
              <p className="text-[9px] font-bold text-gray-400 mt-1">جامعة بابل - 2026</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => { setView('list'); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${view === 'list' || view === 'compare' ? 'bg-indigo-900 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'text-gray-400 hover:bg-gray-50 hover:text-indigo-600'}`}
            >
              <Building2 className="w-5 h-5" />
              قائمة الشركات
            </button>



            <button 
              onClick={() => { navigate('/admin/question-comparison'); setIsMobileMenuOpen(false); }} 
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              مقارنة سؤال بسؤال
            </button>


            <button 
              onClick={() => setShowAddUser(!showAddUser)} 
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${showAddUser ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
            >
              <UserPlus className="w-5 h-5" />
              إضافة شركة
            </button>

            <div className="pt-8 pb-4">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest pr-4 mb-4">النظام والنشاطات</p>
              
              <button 
                onClick={fetchData} 
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                <RefreshCcw className="w-5 h-5" />
                تحديث البيانات
              </button>

              <button 
                onClick={() => setShowActivities(!showActivities)} 
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all relative ${showActivities ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
              >
                <Bell className="w-5 h-5" />
                <span>النشاطات الأخيرة</span>
                {activities.length > 0 && <span className="mr-auto w-5 h-5 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white animate-pulse">{activities.length}</span>}
              </button>
              <button 
                onClick={() => setShowAnnouncement(!showAnnouncement)} 
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${showAnnouncement ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-purple-50 hover:text-purple-600'}`}
              >
                <Megaphone className="w-5 h-5" />
                لوحة الإعلانات
              </button>
              <button 
                onClick={() => setShowSystemSettings(!showSystemSettings)} 
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${showSystemSettings ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:bg-rose-50 hover:text-rose-600'}`}
              >
                <Clock className="w-5 h-5" />
                موعد غلق النظام
              </button>
            </div>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-50 space-y-3 pb-24 lg:pb-8">
          {JSON.parse(localStorage.getItem('currentUser') || '{}').username === 'admin' && (
            <button 
              onClick={() => { setShowChangePassword(true); setPwError(''); setPwSuccess(''); setPwForm({ current: '', newPass: '', confirm: '' }); }} 
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white transition-all"
            >
              <KeyRound className="w-5 h-5" />
              كلمة المرور
            </button>
          )}
          
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      <main className="flex-grow p-4 lg:p-12 overflow-y-auto print:hidden">
          {showAddUser && (
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-indigo-100 mb-10 animate-slide-down">
              <h3 className="text-lg font-black text-indigo-900 mb-6">إنشاء حساب شركة جديدة</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleAddUser({ username: fd.get('username'), password: fd.get('password'), displayName: fd.get('displayName') });
                e.target.reset();
              }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <input name="displayName" placeholder="اسم الشركة" className="p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-600 outline-none font-bold transition-all" required />
                <input name="username" placeholder="يوزر الدخول" className="p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-600 outline-none font-bold transition-all" required />
                <input name="password" type="password" placeholder="كلمة المرور" className="p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-600 outline-none font-bold transition-all" required />
                <button type="submit" className="bg-indigo-950 text-white p-4 rounded-2xl font-black hover:bg-indigo-900 transition-all shadow-lg shadow-indigo-200">تفعيل الحساب</button>
              </form>
            </div>
          )}

          {selectedForCompare.length > 0 && view === 'list' && (
            <div className="mb-8 flex items-center justify-between bg-indigo-950 p-6 rounded-[2rem] text-white animate-fade-in shadow-2xl shadow-indigo-200">
              <div className="flex items-center gap-4">
                <BarChart3 className="w-8 h-8 text-indigo-400" />
                <div>
                  <h4 className="font-black">مقارنة العروض المحددة</h4>
                  <p className="text-xs text-indigo-300">تم اختيار {selectedForCompare.length} شركات للمقارنة</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setView('compare')} className="bg-indigo-600 px-8 py-3 rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all">بدء المقارنة</button>
                <button onClick={() => setSelectedForCompare([])} className="bg-white/10 px-4 py-3 rounded-2xl hover:bg-white/20 transition-all"><X className="w-5 h-5" /></button>
              </div>
            </div>
          )}

          {view === 'list' && (
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
              <div className="p-8 bg-gray-50/50">
                <div className="flex gap-4 mb-4">
                  <button onClick={() => setRoundView('round1')} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${roundView === 'round1' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>بيانات الجولة الأولى</button>
                  <button onClick={() => setRoundView('round2')} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${roundView === 'round2' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>بيانات الجولة الثانية</button>
                </div>
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
                  <thead className="bg-gray-50 text-gray-600 text-sm font-black uppercase">
                    <tr>
                      <th className="px-8 py-5 w-16">#</th>
                      <th className="px-8 py-5">الشركة والممثل</th>
                      <th className="px-8 py-5">الحالة</th>
                      <th className="px-8 py-5 text-center">المرفقات</th>
                      <th className="px-8 py-5 text-center">التقييم</th>
                      <th className="px-8 py-5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredCompanies.map((c) => (
                      <tr key={c.username} className={`hover:bg-indigo-50/20 transition-all ${selectedForCompare.includes(c.username) ? 'bg-indigo-50/50 border-r-4 border-indigo-600' : ''}`}>
                        <td className="px-8 py-6">
                           <button onClick={() => toggleCompare(c.username)} className={`p-2 rounded-lg transition-all ${selectedForCompare.includes(c.username) ? 'text-indigo-600 bg-indigo-100' : 'text-gray-200 hover:text-indigo-300'}`}>
                             {selectedForCompare.includes(c.username) ? <CheckSquare /> : <Square />}
                           </button>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 group">
                            {editingName.username === c.username ? (
                              <div className="flex items-center gap-2 w-full">
                                <input 
                                  autoFocus
                                  className="p-2 border-2 border-indigo-600 rounded-lg text-sm font-black w-full outline-none"
                                  value={editingName.name}
                                  onChange={(e) => setEditingName({ ...editingName, name: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateName();
                                    if (e.key === 'Escape') setEditingName({ username: '', name: '' });
                                  }}
                                />
                                <button 
                                  onClick={handleUpdateName}
                                  disabled={isUpdatingName}
                                  className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shrink-0"
                                >
                                  <SaveIcon className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setEditingName({ username: '', name: '' })}
                                  className="p-2 bg-gray-100 text-gray-400 rounded-lg hover:bg-gray-200 transition-all shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="font-black text-indigo-950">{c.companyName}</div>
                                <button 
                                  onClick={() => setEditingName({ username: c.username, name: c.companyName })}
                                  className="p-1 text-indigo-400 hover:text-indigo-600 transition-all"
                                  title="تعديل الاسم"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                          <div className="text-sm font-bold text-gray-500 mt-1">{c.representative} | {c.phone}</div>
                        </td>
                         <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                            {c.isLocked && (
                              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit"><Lock className="w-3 h-3" /> حساب معلّق</span>
                            )}
                            {c.isReceived ? (
                              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> تم تأييد الاستلام</span>
                            ) : c.isSubmitted ? (
                              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit"><ShieldCheck className="w-3 h-3" /> تم الإرسال</span>
                            ) : (
                              <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black w-fit">مسودة</span>
                            )}
                            </div>
                         </td>
                        <td className="px-8 py-6 text-center">
                          {c.documentUrl ? <a href={supabase.storage.from('documents').getPublicUrl(c.documentUrl).data.publicUrl} target="_blank" rel="noreferrer" className="text-indigo-600"><FileText className="mx-auto" /></a> : '---'}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <input 
                            type="number" 
                            min="0" 
                            max="100" 
                            step="0.5"
                            disabled={!c.isSubmitted} 
                            defaultValue={c.evaluation_score !== undefined && c.evaluation_score !== null ? c.evaluation_score : ''} 
                            onBlur={(e) => {
                              const val = e.target.value;
                              if (val !== '' && parseFloat(val) !== c.evaluation_score) {
                                handleUpdateScore(c.username, val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.target.blur();
                            }}
                            className="w-14 p-2 text-center font-black border-2 border-gray-100 rounded-xl focus:border-indigo-600 outline-none transition-all" 
                          />
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => openDetails(c)} className="bg-indigo-950 text-white px-4 py-2 rounded-xl text-[9px] font-black hover:bg-indigo-900 transition-all">مراجعة</button>
                            {c.isSubmitted && !c.isReceived && (
                              <button onClick={() => setConfirmModal({ show: true, type: 'confirm_receipt', username: c.username, userId: c.userId, title: 'تأييد استلام العرض؟ سيؤدي هذا لقفل إمكانية التعديل للشركة.' })} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[9px] font-black hover:bg-emerald-700 transition-all">تأييد الاستلام</button>
                            )}
                            <button onClick={() => setConfirmModal({ show: true, type: 'reset', username: c.username, userId: c.userId, title: 'تصفير العرض؟ سيتم مسح الإجابات والمرفقات لهذه الشركة.' })} className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[9px] font-black hover:bg-amber-100 transition-all">تصفير</button>
                            <button 
                              onClick={() => handleToggleLock(c.username, c.isLocked)} 
                              className={`p-2 rounded-xl transition-all ${c.isLocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white'}`}
                              title={c.isLocked ? 'إعادة تفعيل الحساب' : 'تعليق الحساب'}
                            >
                              {c.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setConfirmModal({ show: true, type: 'delete', username: c.username, userId: c.userId, title: 'حذف الحساب نهائياً؟' })} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
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
            <div className="space-y-8 animate-fade-in pb-20">
              <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-xl border border-white">
                 <button onClick={() => setView('list')} className="flex items-center gap-2 text-indigo-600 font-black hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"><ArrowRight /> العودة للقائمة</button>
                 <h2 className="text-2xl font-black text-indigo-950">مقارنة العروض الفنية والمالية</h2>
                 <div className="w-32"></div>
              </div>

              <div className="overflow-x-auto pb-10">
                <div className="inline-flex gap-8 min-w-full">
                  
                  {roundView === 'round1' ? (
                    <CompareColumn title="المعايير والأسئلة" isHeader fields={[
                    { label: 'رأس المال المودع' },
                    { label: 'سنوات الخبرة' },
                    { label: 'المؤسسات الحكومية' },
                    { label: 'آلية التسوية المالية' },
                    { label: 'العمولات المقترحة' },
                    { label: 'النظام الإلكتروني' },
                    { label: 'شهادات الأمن' },
                    { label: 'خطاب الضمان' },
                    { label: 'تطبيق الهاتف' },
                    { label: 'التقييم' }
                  ]} />
                  ) : (
                    <CompareColumn title="المعايير والأسئلة" isHeader fields={[
                      { label: 'فترة الإيداع' },
                      { label: 'الضمانات' },
                      { label: 'العمولات' },
                      { label: 'أجهزة الصراف' },
                      { label: 'البطاقات المجانية' },
                      { label: 'مراكز الشحن' },
                      { label: 'صيانة النقاط' },
                      { label: 'نظام متكامل' },
                      { label: 'سرية البيانات' },
                      { label: 'التقييم' }
                    ]} />
                  )}


                  {selectedForCompare.map(username => {
                    const comp = allCompanies.find(c => c.username === username);
                    return (
                      
                      roundView === 'round1' ? (
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
                      ) : (
                        <CompareColumn key={username} comp={comp} fields={[
                          { key: 'q2_1_deposit_within_short_period' },
                          { key: 'q2_3_guarantee_movements_in_rashid' },
                          { key: 'q2_4_commissions_and_discounts' },
                          { key: 'q2_5_provide_atms_in_university' },
                          { key: 'q2_6_student_cards_free_or_cheap' },
                          { key: 'q2_7_charging_centers_in_university' },
                          { key: 'q2_8_pos_maintenance_and_free_supplies' },
                          { key: 'q3_1_integrated_system' },
                          { key: 'q4_1_confidentiality' },
                          { key: 'evaluation_score', isScore: true }
                        ]} />
                      )

                    );
                  })}
                </div>
              </div>
            </div>
          )}



          {view === 'details' && selectedSubmission && (
            <div className="space-y-8 animate-fade-in pb-20">
              <div className="flex justify-between items-center">
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-indigo-600 font-black hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"><ArrowRight /> العودة للشركات</button>
                <button onClick={handlePdfExport} className="bg-indigo-950 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-100"><Download className="w-5 h-5" /> تصدير PDF</button>
              </div>
              
              <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-white">
                <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-16 text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none grayscale">
                    <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-5xl font-black leading-tight tracking-tight">{selectedSubmission.companyName}</h2>
                    <div className="flex flex-wrap gap-8 mt-6">
                      <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                        <User className="w-5 h-5 text-indigo-300" />
                        <span className="font-bold">{selectedSubmission.representative}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                        <Phone className="w-5 h-5 text-indigo-300" />
                        <span className="font-bold">{selectedSubmission.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-lg">التقييم الحالي: {selectedSubmission.evaluation_score || 0}/10</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evaluation Section */}
                <div className="bg-amber-50 p-10 border-y border-amber-100 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-amber-400 rounded-3xl flex items-center justify-center text-white shadow-xl">
                      <Star className="w-8 h-8 fill-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-amber-900">تقييم العرض الفني والمالي</h4>
                      <p className="text-xs font-bold text-amber-700/60 mt-1">تأثير الدرجة يظهر مباشرة في جدول التصنيف العام</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] shadow-lg border border-amber-200/50">
                    <span className="text-xs font-black text-gray-400 mr-4">الدرجة (0-10):</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="10" 
                      step="0.5"
                      placeholder="0.0"
                      defaultValue={selectedSubmission.evaluation_score ?? ''}
                      onChange={(e) => window.pendingScore = e.target.value}
                      className="w-24 p-3 bg-gray-50 rounded-xl border-none text-center font-black text-2xl text-indigo-900 focus:ring-2 ring-amber-400 outline-none"
                    />
                    <button 
                      onClick={() => {
                        const val = window.pendingScore !== undefined && window.pendingScore !== '' ? window.pendingScore : (selectedSubmission.evaluation_score ?? 0);
                        handleUpdateScore(selectedSubmission.username, val);
                        window.pendingScore = undefined; // Reset pending score after save
                      }}
                      className="px-8 py-4 bg-indigo-950 text-white rounded-xl font-black hover:bg-indigo-900 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center gap-2"
                    >
                      تثبيت الدرجة الآن
                    </button>
                  </div>
                </div>

                <div className="p-16 space-y-20">
                  <DetailSection title="أولاً: المعلومات العامة والخبرات" data={selectedSubmission} fields={[
                    { key: 'companyName', label: 'اسم الشركة', aliases: ['companyname'] },
                    { key: 'submissionDate', label: 'تاريخ تقديم العرض', aliases: ['submissiondate'] },
                    { key: 'representativeName', label: 'اسم ممثل الشركة', aliases: ['representativename'] },
                    { key: 'phone', label: 'رقم الهاتف المعتمد' },
                    { key: 'email', label: 'البريد الإلكتروني المعتمد' },
                    { key: 'centralBankLicense', label: 'رقم إجازة البنك المركزي العراقي', aliases: ['centralbanklicense'] },
                    { key: 'marketExperience', label: 'سنوات الخبرة في السوق المحلي', aliases: ['marketexperience'] },
                    { key: 'govInstitutionsCount', label: 'عدد المؤسسات الحكومية المخدَّمة حالياً', aliases: ['govinstitutionscount'] },
                    { key: 'paidCapital', label: 'رأس المال المدفوع / الملاءة المالية', aliases: ['paidcapital'] },
                    { key: 'officialAddress', label: 'العنوان الرسمي / المقر الرئيسي', aliases: ['officialaddress'] },
                  ]} />

                  
                  {roundView === 'round1' ? (
                    <>
                      <DetailSection title="ثانياً: الالتزامات التشغيلية والمالية (8 أسئلة)" data={selectedSubmission} fields={[
                    { key: 'q2_1_settlement', label: '1. ما هي الآلية المعتمدة لإجراء التسوية المالية (المقاصة) مع مصرف الرشيد؟ وهل تلتزمون بالإيداع خلال 12 ساعة عمل؟' },
                    { key: 'q2_2_commissions', label: '2. ما هي نسب العمولات والخصومات المقترحة؟ وهل توافقون على مراجعتها دورياً وإشعار الجامعة قبل 30 يوماً من أي تعديل؟' },
                    { key: 'q2_3_intermediary', label: '3. هل يوجد وسيط (مصرف آخر) لنقل المبالغ أم مباشرة؟ يرجى ذكر تفاصيل سير الحركات المالية.' },
                    { key: 'q2_4_delayPenalty', label: '4. ما قيمة غرامة التأخير المقترحة عن كل ساعة تجاوز مدة التسوية المتفق عليها؟' },
                    { key: 'q2_5_atmCommitment', label: '5. هل تلتزمون بتوفير جهاز صراف آلي (ATM) يملأ دائماً داخل الجامعة؟' },
                    { key: 'q2_6_studentCards', label: '6. ما هي تفاصيل إصدار بطاقات الطلبة؟ (رسوم الإصدار، التجديد، بدل الضائع، مدة الإصدار)' },
                    { key: 'q2_7_chargingCenters', label: '7. هل توفرون مراكز تعبئة كافية داخل الكليات؟ وما هي ساعات العمل المقترحة لها؟' },
                    { key: 'q2_8_posCommitment', label: '8. هل تلتزمون بتجهيز نقاط البيع (PoS) والورق الحراري مجاناً؟ وما هو زمن الاستجابة للصيانة (SLA)؟' },
                  ]} />

                  <DetailSection title="ثالثاً: أ- النظام الإلكتروني والتكامل (6 أسئلة)" data={selectedSubmission} fields={[
                    { key: 'q3a_1_integratedSystem', label: '1. هل يتوفر لديكم نظام إلكتروني متكامل يُبيّن جميع الحركات المالية؟' },
                    { key: 'q3a_2_techSpecs', label: '2. هل يمكن إصدار بطاقات خاصة بكل كلية أو وحدة إدارية بدون عمولات تحويل داخلية؟', aliases: ['q3a_2_techspecs'] },
                    { key: 'q3a_3_appSupport', label: '3. هل يمكن للجامعة الحصول على كشف حساب لحظي (Real-time) في أي وقت؟', aliases: ['q3a_3_appsupport'] },
                    { key: 'q3a_4_webIntegration', label: '4. هل يمكن تحقيق تكامل إلكتروني مع موقع الجامعة يتيح التسديد عبر رابط آمن أو QR كود؟', aliases: ['q3a_4_webintegration'] },
                    { key: 'q3a_5_reporting', label: '5. هل توفرون خدمة التحويلات خارج العراق؟ يرجى بيان العمولات والحدود اليومية.' },
                    { key: 'q3a_6_training', label: '6. هل يتوفر رقم IBAN لكل بطاقة؟ وهل هو متوافق مع معايير الدفع الدولية؟' },
                  ]} />

                  <DetailSection title="ثالثاً: ب- الأمن السيبراني والاستمرارية (8 أسئلة)" data={selectedSubmission} fields={[
                    { key: 'q3b_1_certificates', label: '1. ما هي شهادات الأمن المعتمدة لديكم؟ (PCI-DSS / ISO 27001 / غيرها)' },
                    { key: 'q3b_2_encryption', label: '2. ما هو بروتوكول التشفير المستخدم في المعاملات؟', aliases: ['q3b_2_encryption'] },
                    { key: 'q3b_3_rto_bcp', label: '3. ما هو الحد الأقصى لوقت استعادة الخدمة عند الانقطاع (RTO)؟' },
                    { key: 'q3b_4_backups', label: '4. هل توفرون نسخاً احتياطية يومية للبيانات؟ أين تُخزَّن؟' },
                    { key: 'q3b_5_supportSla', label: '5. ما هو نظام الدعم الفني؟ هل يتوفر على مدار الساعة (24/7)؟', aliases: ['q3b_5_supportsla'] },
                    { key: 'q3b_6_penTest', label: '6. هل تُجرون اختبارات اختراق أمني (Penetration Testing) دورية؟', aliases: ['q3b_6_pentest'] },
                    { key: 'q3b_7_monitoring', label: '7. ما هي سياسة شركتكم في الاحتفاظ بالبيانات؟ (المدة الزمنية، مكان التخزين)', aliases: ['q3b_7_monitoring'] },
                    { key: 'q3b_8_incident', label: '8. ما هي طرائق الاتصالات المستخدمة وهل تحتاج انترنت؟', aliases: ['q3b_8_incident'] },
                  ]} />

                  <DetailSection title="رابعاً: أ- الضمانات وملكية البيانات (3 أسئلة)" data={selectedSubmission} fields={[
                    { key: 'q4_1_bankGuarantee', label: '1. خطاب الضمان المصرفي: هل تقدمون خطاب ضمان مصرفي غير مشروط لصالح الجامعة؟', aliases: ['q4_1_bankguarantee'] },
                    { key: 'q4_2_penaltyClause', label: '2. سرية البيانات: هل تلتزمون بسرية البيانات وتوقيع اتفاقية (NDA) رسمية؟', aliases: ['q4_2_penaltyclause'] },
                    { key: 'q4_3_dataOwnership', label: '3. ملكية البيانات واستردادها: هل توافقون على أن ملكية البيانات تعود للجامعة حصراً؟', aliases: ['q4_3_dataownership'] },
                  ]} />

                  <DetailSection title="رابعاً: ب- الالتزامات القانونية والتعاقدية (7 أسئلة)" data={selectedSubmission} fields={[
                    { key: 'q4_4_exitClause', label: '4. هل تقدمون برامج تدريبية مجانية لموظفي الجامعة؟', aliases: ['q4_4_exitclause'] },
                    { key: 'q4_5_liability', label: '5. هل توافقون على حق الجامعة بفسخ العقد فورياً عند الإخلال الجوهري؟', aliases: ['q4_5_liability'] },
                    { key: 'q4_6_jurisdiction', label: '6. هل توافقون على تطبيق القانون العراقي النافذ، واختصاص محاكم محافظة بابل؟' },
                    { key: 'q4_7_auditRight', label: '7. هل توافقون على اللجوء إلى التحكيم التجاري وفق الأنظمة العراقية؟', aliases: ['q4_7_auditright'] },
                    { key: 'q4_8_contractDuration', label: '8. ما هي مدة العقد المقترحة؟ وما شروط التجديد والتعديل؟', aliases: ['q4_8_contractduration'] },
                    { key: 'q4_9_renewal', label: '9. ما هي آلية استقبال ومعالجة شكاوى الطلبة؟ وما الحد الأقصى للمدة؟', aliases: ['q4_9_renewal'] },
                    { key: 'q4_10_blacklist', label: '10. هل الشركة مسجلة ضمن القائمة السوداء حسب اعمامات البنك المركزي العراقي أو محظور التعامل معها داخل او خارج العراق؟' },
                  ]} />

                  <DetailSection title="خامساً: الخدمات الإضافية والميزات التنافسية (8 أسئلة)" data={selectedSubmission} fields={[
                    { key: 'q5_1_extraFeatures', label: '1. هل تقدمون تطبيق هاتفي (iOS/Android)؟ ما الخدمات المتاحة فيه؟', aliases: ['q5_1_extrafeatures'] },
                    { key: 'q5_2_innovation', label: '2. هل تقدمون خدمات مصرفية إضافية مثل: محفظة رقمية، صرف راتب إلكتروني؟', aliases: ['q5_2_innovation'] },
                    { key: 'q5_3_scholarships', label: '3. ما الحد الأقصى لعدد المعاملات اليومية التي يستطيع نظامكم معالجتها؟', aliases: ['q5_3_scholarships'] },
                    { key: 'q5_4_staffTraining', label: '4. هل تقدمون الدعم (Sponsor) لتغطية تكاليف الفعاليات والمؤتمرات العلمية؟', aliases: ['q5_4_stafftraining'] },
                    { key: 'q5_5_posUpdates', label: '5. هل هنالك تحديث دوري لأجهزة PoS والأنظمة الإلكترونية؟', aliases: ['q5_5_mobileApp', 'mobileApp', 'posUpdates'] },
                    { key: 'q5_6_foreignPayments', label: '6. هل هنالك إمكانية تسديد أجور بعملة الدولار إلى مصارف خارج البلد؟', aliases: ['q5_6_foreignStudents', 'foreignStudents', 'foreignPayments'] },
                    { key: 'q5_7_complaints', label: '7. هل تقدمون أي ميزات إضافية أو عروض تنافسية لصالح جامعة بابل تحديداً؟', aliases: ['q5_7_complaints'] },
                    { key: 'q5_8_socialResp', label: '8. ذكر المؤسسات الحكومية المخدَّمة حالياً، وما هي التي تتعامل مع مصرف الرشيد؟', aliases: ['socialResp', 'q5_8_socialresp'] },
                  ]} />
                    </>
                  ) : (
                    <>
                      <DetailSection title="ثانياً: الالتزامات التشغيلية والمالية" data={selectedSubmission} fields={[
                        { key: 'q2_1_deposit_within_short_period', label: '1. هل تلتزمون بإيداع المبالغ في حسابات الجامعة خلال فترة قصيرة؟' },
                        { key: 'q2_2_process_end_of_month_payments', label: '2. هل لديكم قدرة على معالجة مدفوعات نهاية الشهر دون تأخير؟' },
                        { key: 'q2_3_guarantee_movements_in_rashid', label: '3. ما هي الضمانات لتأمين حركات المبالغ في مصرف الرشيد؟' },
                        { key: 'q2_4_commissions_and_discounts', label: '4. تفاصيل العمولات والخصومات؟' },
                        { key: 'q2_5_provide_atms_in_university', label: '5. توفير أجهزة صراف آلي داخل الحرم الجامعي؟' },
                        { key: 'q2_6_student_cards_free_or_cheap', label: '6. إصدار بطاقات جامعية للطلاب بأسعار مخفضة أو مجانية؟' },
                        { key: 'q2_7_charging_centers_in_university', label: '7. إنشاء مراكز شحن داخل الجامعة؟' },
                        { key: 'q2_8_pos_maintenance_and_free_supplies', label: '8. صيانة أجهزة نقاط البيع وتوفير المواد مجانا؟' },
                        { key: 'q2_9_laptop_and_printer', label: '9. توفير جهاز حاسوب وطابعة؟' },
                        { key: 'q2_10_partnership_with_rashid', label: '10. الشراكة مع مصرف الرشيد؟' },
                      ]} />
                      <DetailSection title="ثالثاً: النظام الإلكتروني والتكامل" data={selectedSubmission} fields={[
                        { key: 'q3_1_integrated_system', label: '1. توفير نظام إلكتروني متكامل؟' },
                        { key: 'q3_2_safe_link_payment', label: '2. دفع آمن عبر الرابط؟' },
                        { key: 'q3_3_iban_available', label: '3. توفير رقم آيبان لكل بطاقة؟' },
                      ]} />
                      <DetailSection title="رابعاً: الأمن السيبراني والاستمرارية" data={selectedSubmission} fields={[
                        { key: 'q4_1_confidentiality', label: '1. سرية البيانات والمعلومات؟' },
                        { key: 'q4_2_backups', label: '2. النسخ الاحتياطية؟' },
                        { key: 'q4_3_technical_support', label: '3. الدعم الفني؟' },
                      ]} />
                      <DetailSection title="خامساً: الالتزامات القانونية" data={selectedSubmission} fields={[
                        { key: 'q5_1_data_ownership', label: '1. ملكية البيانات؟' },
                        { key: 'q5_2_free_training', label: '2. التدريب المجاني؟' },
                        { key: 'q5_3_contract_duration', label: '3. مدة العقد المقترحة؟' },
                        { key: 'q5_4_partial_updates', label: '4. التحديثات الجزئية؟' },
                        { key: 'q5_5_contract_termination_and_fines', label: '5. إنهاء العقد والغرامات؟' },
                      ]} />
                      <DetailSection title="سادساً: الخدمات الإضافية" data={selectedSubmission} fields={[
                        { key: 'q6_1_sponsor_support', label: '1. دعم الرعاة (Sponsor)؟' },
                      ]} />
                    </>
                  )}


                  <DetailSection title="سادساً: المرفقات والملاحظات" data={selectedSubmission} fields={[
                    { key: 'additionalNotes', label: 'ملاحظات إضافية ترغب الشركة بإضافتها', aliases: ['additionalnotes'] },
                    { key: 'documentUrl', label: 'رابط العرض الفني والمالي (PDF)', aliases: ['document_url', 'document_path'] },
                  ]} />

                  <DetailSection title="سابعاً: التوقيع والمصادقة النهائية" data={selectedSubmission} fields={[
                    { key: 'signedBy', label: 'اسم المفوض بالتوقيع', aliases: ['signedby'] },
                    { key: 'position', label: 'الصفة الوظيفية للمفوض' },
                    { key: 'lastUpdated', label: 'تاريخ الإرسال النهائي', aliases: ['last_updated', 'lastupdated'] },
                  ]} />
                </div>

                <div className="bg-white p-10 flex gap-4 border-t border-gray-100">
                   <button 
                     onClick={() => setConfirmModal({ show: true, type: 'confirm_receipt', username: selectedSubmission.username, userId: selectedSubmission.userId, title: 'هل تريد تأييد استلام هذا العرض وقفل التعديل؟' })}
                     className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
                   >
                     <CheckCircle2 className="w-6 h-6" />
                     تأييد استلام العرض (قفل النهائي)
                   </button>

                </div>
              </div>
            </div>
          )}
        </main>

      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-scale-in">
            <h3 className="text-xl font-black text-center mb-6 text-indigo-950 leading-relaxed">{confirmModal.title}</h3>
            <div className="flex gap-4">
              <button onClick={executeDelete} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">تأكيد</button>
              <button onClick={() => setConfirmModal({ show: false })} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black hover:bg-gray-200 transition-all">تراجع</button>
            </div>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                <KeyRound className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-indigo-950">تغيير كلمة المرور</h3>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pr-2">كلمة المرور الحالية</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={pwForm.current}
                    onChange={(e) => setPwForm(prev => ({ ...prev, current: e.target.value }))}
                    className="w-full p-4 pr-12 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-bold text-gray-900 transition-all"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-all">
                    {showCurrentPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pr-2">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={pwForm.newPass}
                    onChange={(e) => setPwForm(prev => ({ ...prev, newPass: e.target.value }))}
                    className="w-full p-4 pr-12 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-bold text-gray-900 transition-all"
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-all">
                    {showNewPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pr-2">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 font-bold text-gray-900 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {pwError && (
              <div className="mt-5 bg-red-50 border border-red-100 p-4 rounded-2xl">
                <p className="text-red-600 text-xs text-center font-black">{pwError}</p>
              </div>
            )}

            {pwSuccess && (
              <div className="mt-5 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <p className="text-emerald-600 text-xs text-center font-black">{pwSuccess}</p>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button onClick={handleChangePassword} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">حفظ كلمة المرور</button>
              <button onClick={() => setShowChangePassword(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black hover:bg-gray-200 transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showActivities && (
        <div className="fixed inset-y-0 left-0 z-[60] w-96 bg-white shadow-2xl border-r border-indigo-50 animate-slide-left flex flex-col">
          <div className="p-8 border-b border-indigo-50 flex items-center justify-between bg-indigo-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-indigo-950">النشاطات الأخيرة</h3>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={async () => {
                  if (confirm('هل تريد مسح جميع النشاطات؟')) {
                    await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                    setActivities([]);
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="مسح الكل"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={() => setShowActivities(false)} className="p-2 hover:bg-white rounded-lg text-gray-400 transition-all"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                 <Bell className="w-20 h-20 mx-auto mb-4" />
                 <p className="font-bold">لا توجد نشاطات حالياً</p>
              </div>
            ) : (
              activities.map((log) => (
                <div key={log.id} className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${log.event_type === 'submit' ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full ${log.event_type === 'submit' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                      {log.event_type === 'submit' ? 'إرسال نهائي' : 'دخول للموقع'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-gray-400">{new Date(log.created_at).toLocaleTimeString('ar-EG')}</span>
                      <button 
                        onClick={() => {
                          supabase.from('activity_logs').delete().eq('id', log.id).then();
                          setActivities(prev => prev.filter(a => a.id !== log.id));
                        }}
                        className="p-1 text-gray-300 hover:text-red-500 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-black text-indigo-950">
                    {allCompanies.find(c => c.username === log.username)?.companyName || log.username}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 mt-1">{log.details}</p>
                </div>
              ))
            )}
          </div>
          <div className="p-6 border-t border-indigo-50">
             <button onClick={fetchData} className="w-full py-4 bg-gray-50 text-indigo-600 rounded-2xl font-black text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
               <RefreshCcw className="w-4 h-4" /> تحديث النشاطات
             </button>
          </div>
        </div>
      )}

      {showAnnouncement && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-indigo-950/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-scale-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Megaphone className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-indigo-950">لوحة الإعلانات</h3>
                <p className="text-[10px] font-bold text-gray-400 mt-1">سيظهر هذا الإعلان للشركات عند دخول النظام</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pr-2">عنوان الإعلان</label>
                <input
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-purple-500/30 focus:ring-4 focus:ring-purple-500/5 font-bold text-gray-900 transition-all"
                  placeholder="مثال: مرحباً بكم في نظام جامعة بابل"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pr-2">محتوى الإعلان</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm(p => ({ ...p, content: e.target.value }))}
                  rows={6}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-purple-500/30 focus:ring-4 focus:ring-purple-500/5 font-bold text-gray-900 transition-all resize-none"
                  placeholder="اكتب نص الإعلان هنا... سيظهر للشركات كنافذة ترحيبية عند أول دخول"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={handleSaveAnnouncement} 
                disabled={announcementSaving}
                className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-50"
              >
                {announcementSaving ? 'جاري الحفظ...' : 'نشر الإعلان'}
              </button>
              <button onClick={() => setShowAnnouncement(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black hover:bg-gray-200 transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showSystemSettings && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-indigo-950/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-scale-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-indigo-950">إعدادات غلق النظام</h3>
                <p className="text-[10px] font-bold text-gray-400 mt-1">تحديد موعد توقف النظام عن استقبال الطلبات</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pr-2">تاريخ ووقت الإغلاق</label>
                <input
                  type="datetime-local"
                  value={systemSettingsForm.closeAt}
                  onChange={(e) => setSystemSettingsForm(p => ({ ...p, closeAt: e.target.value }))}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-rose-500/30 focus:ring-4 focus:ring-rose-500/5 font-bold text-gray-900 transition-all"
                />
                <p className="text-[9px] text-gray-400 mt-2 pr-2 leading-relaxed">
                  * سيتم منع الشركات من الدخول أو تعديل العروض تلقائياً بعد هذا الموعد.
                  <br />
                  * اترك الحقل فارغاً لإبقاء النظام مفتوحاً دائماً.
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button 
                onClick={handleSaveSystemSettings} 
                disabled={systemSettingsSaving}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50"
              >
                {systemSettingsSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
              <button 
                onClick={() => {
                  setSystemSettingsForm({ closeAt: '' });
                  handleSaveSystemSettings();
                }} 
                className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all"
                title="إلغاء الموعد"
              >
                فتح النظام
              </button>
              <button onClick={() => setShowSystemSettings(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black hover:bg-gray-200 transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CompareColumn = ({ title, comp, fields, isHeader }) => {
  const getVal = (c, key) => {
    if (!c) return '---';
    if (c[key]) return c[key];
    const lowerKey = key.toLowerCase();
    if (c[lowerKey]) return c[lowerKey];
    const noPrefix = key.replace(/^q\d[a-z]?_\d_/, '');
    if (c[noPrefix]) return c[noPrefix];
    return '---';
  };

  return (
    <div className={`flex-1 min-w-[320px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white transition-all hover:shadow-indigo-100/50 ${isHeader ? 'bg-indigo-50/50 border-indigo-100' : ''}`}>
      <div className={`p-10 text-center border-b ${isHeader ? 'bg-indigo-100/50' : 'bg-gradient-to-br from-indigo-950 to-slate-900 text-white'}`}>
        <h5 className="font-black text-xl leading-tight">{isHeader ? title : comp.companyName}</h5>
        {!isHeader && <p className="text-[10px] text-indigo-300 font-bold mt-2">يوزر: {comp.username}</p>}
      </div>
      <div className="p-10 space-y-10">
        {fields.map((f, i) => (
          <div key={i} className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
             <label className="text-sm font-black text-indigo-400 block mb-2 uppercase tracking-tighter leading-relaxed">{isHeader ? '' : f.label}</label>
             <div className={`font-bold text-lg leading-relaxed ${isHeader ? 'text-indigo-950 text-xl' : 'text-gray-800'} ${f.isScore ? 'text-4xl text-indigo-600 font-black' : ''}`}>
               {isHeader ? f.label : getVal(comp, f.key)}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetailSection = ({ title, data, fields }) => {
  const getVal = (f) => {
    if (data[f.key]) return data[f.key];
    if (f.aliases) {
      for (const alias of f.aliases) {
        if (data[alias]) return data[alias];
      }
    }
    const lowerKey = f.key.toLowerCase();
    if (data[lowerKey]) return data[lowerKey];
    const noPrefix = f.key.replace(/^q\d[a-z]?_\d_/, '');
    if (data[noPrefix]) return data[noPrefix];
    const noPrefixLower = noPrefix.toLowerCase();
    if (data[noPrefixLower]) return data[noPrefixLower];
    return '---';
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <h3 className="text-3xl font-black text-indigo-950 border-r-8 border-indigo-600 pr-6 py-1 leading-none">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fields.map(f => (
          <div key={f.key} className="bg-white border-2 border-gray-50 p-8 rounded-[2.5rem] hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all group">
            <label className="text-base font-black text-indigo-400 uppercase tracking-widest block mb-4 group-hover:text-indigo-600 transition-all leading-relaxed">{f.label}</label>
            <p className="text-xl font-bold text-gray-800 whitespace-pre-wrap leading-relaxed">{getVal(f)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
