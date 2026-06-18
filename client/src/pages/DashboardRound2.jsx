import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Save, Send, LogOut, 
  CheckCircle2, AlertCircle, Building2, User, 
  Phone, Mail, FileCheck, ShieldCheck, HelpCircle, ArrowRight, X,
  Download, Megaphone
} from 'lucide-react';
import { supabase, safeUrl, safeAnon } from '../utils/supabaseClient';
import PrintTemplate from '../components/PrintTemplate';

const DashboardRound2 = () => {
  const isReadOnly = false;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReceived, setIsReceived] = useState(false);
  const activityLogId = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [isSystemClosed, setIsSystemClosed] = useState(false);
  const [systemCloseTime, setSystemCloseTime] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [evaluationAnswers, setEvaluationAnswers] = useState({});
  const [printMode, setPrintMode] = useState('blank');
  const [formData, setFormData] = useState({
    companyName: '',
    submissionDate: new Date().toISOString().split('T')[0],
    representativeName: '',
    phone: '',
    email: '',
    centralBankLicense: '',
    officialAddress: '',
    q2_1_deposit_within_short_period: '',
    q2_2_process_end_of_month_payments: '',
    q2_3_guarantee_movements_in_rashid: '',
    q2_4_commissions_and_discounts: '',
    q2_5_provide_atms_in_university: '',
    q2_6_student_cards_free_or_cheap: '',
    q2_7_charging_centers_in_university: '',
    q2_8_pos_maintenance_and_free_supplies: '',
    q2_9_laptop_and_printer: '',
    q2_10_partnership_with_rashid: '',
    q3_1_integrated_system: '',
    q3_2_safe_link_payment: '',
    q3_3_iban_available: '',
    q4_1_confidentiality: '',
    q4_2_backups: '',
    q4_3_technical_support: '',
    q5_1_data_ownership: '',
    q5_2_free_training: '',
    q5_3_contract_duration: '',
    q5_4_partial_updates: '',
    q5_5_contract_termination_and_fines: '',
    q6_1_sponsor_support: '',
    additionalNotes: '',
    signedBy: '',
    position: '',
    documentUrl: ''
  });

  const steps = [
    { id: 1, title: 'معلومات الشركة' },
    { id: 2, title: 'الالتزامات التشغيلية والمالية' },
    { id: 3, title: 'النظام الإلكتروني والأمن' },
    { id: 4, title: 'الالتزامات القانونية' },
    { id: 5, title: 'الخدمات الإضافية والمرفقات' },
    { id: 6, title: 'المصادقة والتوقيع النهائي' }
  ];

  const STEP_FIELDS = {
    1: ['companyName', 'submissionDate', 'representativeName', 'phone', 'email', 'centralBankLicense', 'officialAddress'],
    2: ['q2_1_deposit_within_short_period', 'q2_2_process_end_of_month_payments', 'q2_3_guarantee_movements_in_rashid', 'q2_4_commissions_and_discounts', 'q2_5_provide_atms_in_university', 'q2_6_student_cards_free_or_cheap', 'q2_7_charging_centers_in_university', 'q2_8_pos_maintenance_and_free_supplies', 'q2_9_laptop_and_printer', 'q2_10_partnership_with_rashid'],
    3: ['q3_1_integrated_system', 'q3_2_safe_link_payment', 'q3_3_iban_available', 'q4_1_confidentiality', 'q4_2_backups', 'q4_3_technical_support'],
    4: ['q5_1_data_ownership', 'q5_2_free_training', 'q5_3_contract_duration', 'q5_4_partial_updates', 'q5_5_contract_termination_and_fines'],
    5: ['q6_1_sponsor_support', 'additionalNotes', 'documentUrl'],
    6: ['signedBy', 'position']
  };

  const FIELD_LABELS = {
    companyName: 'اسم الشركة',
    submissionDate: 'تاريخ تقديم العرض',
    representativeName: 'اسم ممثل الشركة',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    centralBankLicense: 'رقم إجازة البنك المركزي',
    officialAddress: 'العنوان (المقر الرئيسي وفي الحلة)',
    q2_1_deposit_within_short_period: 'الإيداع في مصرف الرشيد خلال مدة قصيرة',
    q2_2_process_end_of_month_payments: 'معالجة مشكلة التسديدات في اليوم الأخير',
    q2_3_guarantee_movements_in_rashid: 'ضمان ظهور جميع الحركات في الحسابات',
    q2_4_commissions_and_discounts: 'العمولات والخصومات والنسبة المسترجعة',
    q2_5_provide_atms_in_university: 'توفير أجهزة صراف آلي داخل الجامعة',
    q2_6_student_cards_free_or_cheap: 'إصدار بطاقات الطلبة مجانا أو بأجور بسيطة',
    q2_7_charging_centers_in_university: 'توفير مراكز تعبئة داخل الجامعة',
    q2_8_pos_maintenance_and_free_supplies: 'توفير مستلزمات التشغيل والصيانة',
    q2_9_laptop_and_printer: 'توفير حاسبة وطابعة لشعبة الحسابات',
    q2_10_partnership_with_rashid: 'التعاون مع مصرف الرشيد لحل المشاكل',
    q3_1_integrated_system: 'النظام الإلكتروني والتقارير',
    q3_2_safe_link_payment: 'آلية التسديد عبر رابط آمن',
    q3_3_iban_available: 'توفر رقم IBAN',
    q4_1_confidentiality: 'سرية الأنظمة والبيانات',
    q4_2_backups: 'توفير نسخ احتياطية',
    q4_3_technical_support: 'الدعم الفني المتاح 24/7',
    q5_1_data_ownership: 'ملكية البيانات للجامعة',
    q5_2_free_training: 'برامج تدريبية لموظفي الجامعة',
    q5_3_contract_duration: 'مدة العقد سنتان قابلة للتجديد',
    q5_4_partial_updates: 'تحديث جزئي لتسهيل الدفع',
    q5_5_contract_termination_and_fines: 'فسخ العقد والغرامات',
    q6_1_sponsor_support: 'دعم فعاليات الجامعة',
    documentUrl: 'الملف المرفق (PDF)',
    signedBy: 'الاسم',
    position: 'المنصب'
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrors([]);
  }, [currentStep]);

  useEffect(() => {
    const boot = async () => {
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
      const currentUser = { ...session.user, ...localUser };
      setUser(currentUser);

      const username = (currentUser.user_metadata?.username || localUser.username || '').toLowerCase().trim();
      
      const { data: sub, error: subError } = await supabase
        .from('submissions_round2')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (subError) throw subError;

      if (sub) {
        const mappedData = fromDbPayload(sub);
        setFormData(p => ({ 
          ...p, 
          ...mappedData,
          documentUrl: sub.document_path || sub.document_url || sub.documentUrl || p.documentUrl 
        }));
        if (sub.status === 'final') setIsSubmitted(true);
        setIsReceived(!!sub.is_received);
      }

      // Log Login Activity
      try {
        const { data: logData } = await supabase.from('activity_logs').insert({
          username: username,
          event_type: 'login',
          details: `دخلت الشركة للعمل على الاستمارة`
        }).select();
        
        if (logData && logData[0]) {
          activityLogId.current = logData[0].id;
        }
      } catch (logErr) {
        console.warn('Logging failed (table might not exist yet):', logErr);
      }

      // Fetch active announcement
      try {
        const { data: annData } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (annData && annData[0]) {
          const ann = annData[0];
          setAnnouncement(ann);
          // Always show on entry as per user request
          setShowAnnouncementModal(true);
          setAnnouncementDismissed(false);
        }
      } catch (annErr) {
        console.warn('Announcement fetch failed:', annErr);
      }

      // Fetch system settings
      try {
        const { data: sysData } = await supabase
          .from('system_settings')
          .select('*')
          .eq('id', 'global')
          .maybeSingle();
        
        if (sysData && sysData.close_at) {
          const closeDate = new Date(sysData.close_at);
          setSystemCloseTime(closeDate);
          if (new Date() > closeDate) {
            setIsSystemClosed(true);
          }
        }
      } catch (sysErr) {
        console.warn('System settings fetch failed:', sysErr);
      }

      // Fetch evaluation criteria
      try {
        const { data: critData } = await supabase
          .from('evaluation_criteria')
          .select('*')
          .order('display_order', { ascending: true });
        setCriteria(critData || []);

        if (sub?.id) {
          const { data: ansData } = await supabase
            .from('company_answers')
            .select('*')
            .eq('submission_id', sub.id);
          
          if (ansData) {
            const ansMap = {};
            ansData.forEach(a => { ansMap[a.criterion_id] = a.answer_value; });
            setEvaluationAnswers(ansMap);
          }
        }
      } catch (critErr) {
        console.warn('Criteria fetch failed:', critErr);
      }
    };
    boot();

    // Cleanup: Delete login notification when leaving
    const cleanup = () => {
      if (activityLogId.current) {
        // Use native fetch with keepalive to ensure it finishes even on tab close
        const url = `${safeUrl}/rest/v1/activity_logs?id=eq.${activityLogId.current}`;
        fetch(url, {
          method: 'DELETE',
          headers: {
            'apikey': safeAnon,
            'Authorization': `Bearer ${safeAnon}`,
            'Content-Type': 'application/json'
          },
          keepalive: true
        });
      }
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [navigate]);

  const fromDbPayload = (dbData) => {
    if (!dbData) return {};
    const data = { ...dbData };
    data.documentUrl = dbData.document_url || dbData.documentUrl;
    return data;
  };

  const toDbPayload = (data) => {
    const payload = {};
    const exclude = ['isreceived', 'is_received', 'isReceived', 'evaluation_score', 'lastupdated', 'last_updated', 'created_at', 'id'];
    
    Object.keys(data).forEach(key => {
      if (exclude.includes(key.toLowerCase())) return;
      if (key === 'documentUrl') {
        payload['document_url'] = data[key];
      } else {
        payload[key] = data[key];
      }
    });
    return payload;
  };

  const checkLockStatus = async () => {
    try {
      const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = localUser.userId;
      if (!userId) return;

      const { data, error } = await supabase
        .from('submissions_round2')
        .select('is_received, status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setIsReceived(!!data.is_received);
        if (data.status === 'final') setIsSubmitted(true);
      }
    } catch (err) {
      console.error('Lock check failed:', err);
    }
  };

  useEffect(() => {
    checkLockStatus();
    // Check every 30 seconds as well
    const interval = setInterval(checkLockStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    if (isReadOnly || isReceived || isSystemClosed) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.includes(name)) {
      setErrors(prev => prev.filter(f => f !== name));
    }
  };

  const validateStep = (stepId) => {
    const fields = STEP_FIELDS[stepId];
    if (!fields) return true;
    
    const missing = fields.filter(f => !formData[f]);
    if (missing.length > 0) {
      setErrors(missing);
      return false;
    }
    return true;
  };

  const goToStep = (stepId) => {
    // If moving forward, validate current step
    if (stepId > currentStep) {
      if (!validateStep(currentStep)) {
        alert('يرجى الإجابة على جميع الأسئلة المطلوبة في هذا القسم قبل الانتقال.');
        return;
      }
    }
    setCurrentStep(stepId);
  };

  const handleFileUpload = async (e) => {
    if (isReadOnly || isReceived || isSystemClosed) return;
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الملف كبير جداً. الحد الأقصى هو 10 ميغابايت.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;
      if (!uid) throw new Error('No session');

      const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const path = `${uid}/${Date.now()}-${safeFileName}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file, { upsert: false, contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      setFormData(prev => ({ ...prev, documentUrl: path }));
      alert('تم رفع المستند بنجاح!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('حدث خطأ أثناء رفع المستند.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handlePrintBlank = () => {
    setPrintMode('blank');
    setTimeout(() => window.print(), 100);
  };

  const handlePrintFilled = () => {
    setPrintMode('filled');
    setTimeout(() => window.print(), 100);
  };

  const processFinalSubmit = async () => {
    // Check if all criteria are answered if any exist
    if (criteria.length > 0) {
      const unanswered = criteria.filter(c => !evaluationAnswers[c.id]);
      if (unanswered.length > 0) {
        alert('يرجى الإجابة على جميع أسئلة استمارة التقييم التلقائي في الخطوة الأخيرة.');
        setCurrentStep(10);
        return;
      }
    }

    setIsSubmitting(true);
    setShowConfirmModal(false);
    try {
      const dbFields = toDbPayload(formData);
      const normalizedUsername = (user.user_metadata?.username || user.username || '').toLowerCase().trim();

      const payload = {
        ...dbFields,
        user_id: user.userId || user.id,
        username: normalizedUsername,
        status: 'final',
        last_updated: new Date().toISOString()
      };

      // Ensure we update the existing record and check if it's locked
      const { data: existing } = await supabase
        .from('submissions_round2')
        .select('id, is_received')
        .eq('username', (user.username || '').toLowerCase().trim())
        .maybeSingle();
      
      if (existing?.is_received) {
        alert('لا يمكن التحديث: لقد تم تأييد استلام العرض من قبل اللجنة وقفل التعديل.');
        setIsReceived(true);
        setIsSubmitted(true);
        return;
      }

      let submissionId = existing?.id;
      if (submissionId) {
        payload.id = submissionId;
      }

      const { data: upsertData, error } = await supabase
        .from('submissions_round2')
        .upsert(payload)
        .select();

      if (error) throw error;
      submissionId = upsertData[0].id;

      // Save evaluation answers
      if (criteria.length > 0) {
        const answerPayloads = Object.entries(evaluationAnswers).map(([critId, val]) => ({
          submission_id: submissionId,
          criterion_id: critId,
          answer_value: val
        }));

        const { error: ansError } = await supabase
          .from('company_answers')
          .upsert(answerPayloads, { onConflict: 'submission_id,criterion_id' });
        
        if (ansError) console.error('Failed to save answers:', ansError);

        // Trigger auto-evaluation edge function
        try {
          await supabase.functions.invoke('auto-evaluate', {
            body: { submissionId }
          });
        } catch (evalErr) {
          console.error('Auto-evaluation trigger failed:', evalErr);
          // Don't block submission if evaluation fails, just log it
          await supabase.from('activity_logs').insert({
            username: normalizedUsername,
            event_type: 'error',
            details: `فشل التقييم التلقائي: ${evalErr.message}`
          });
        }
      }
      
      // Log Submission Activity
      try {
        await supabase.from('activity_logs').insert({
          username: normalizedUsername,
          event_type: 'submit',
          details: `قامت الشركة بإرسال العرض النهائي بنجاح`
        });
      } catch (logErr) {
        console.warn('Logging failed:', logErr);
      }

      setIsSubmitted(true);
      setShowSuccess(true);
    } catch (err) {
      console.error('Submit error:', err);
      alert(`حدث خطأ أثناء الإرسال: ${err.message || 'خطأ غير معروف'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isReadOnly || (isSubmitted && isReceived) || isSystemClosed) return;

    if (!formData.signedBy || !formData.position) {
      alert('يرجى كتابة اسم الموقع وصفته الوظيفية قبل الإرسال النهائي.');
      setCurrentStep(6);
      return;
    }

    setShowConfirmModal(true);
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('currentUser');
    navigate('/login');
    window.location.reload();
  };

  const SummaryTable = () => (
    <div className="space-y-10 animate-fade-in py-6 text-right">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-xl font-black text-blue-950">مراجعة البيانات قبل الإرسال</h3>
        <button onClick={() => setShowReview(false)} className="text-sm text-blue-600 font-bold">عودة للتعديل</button>
      </div>
      <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
        {steps.map(s => (
          <div key={s.id} className="space-y-4">
            <h4 className="text-sm font-black text-blue-900 bg-blue-50 p-2 rounded-lg">{s.title}</h4>
            <div className="grid grid-cols-1 gap-3">
              {STEP_FIELDS[s.id]?.map(f => (
                <div key={f} className="flex justify-between items-start gap-4 p-4 bg-white border rounded-xl text-base">
                  <span className="font-bold text-gray-700 shrink-0 w-1/3">
                    {/* Logic to find label for field f */}
                    {findLabelForField(f)}
                  </span>
                  <span className="font-black text-gray-900 text-left w-2/3 leading-relaxed">{formData[f] || '---'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
        <p className="text-xs text-amber-800 font-bold leading-relaxed">
          {isReadOnly ? "الاستمارة الحالية للقراءة فقط، ولا يمكن التعديل عليها." : "يرجى مراجعة كافة البيانات أعلاه بدقة. بمجرد الضغط على \"تأكيد ومتابعة\"، سيتم نقلك لصفحة التوقيع النهائي."}
        </p>
      </div>
      {!isReadOnly && (
        <button 
          onClick={() => { setShowReview(false); setCurrentStep(6); }}
          className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black shadow-xl"
        >
          تأكيد وصحة البيانات - المتابعة للتوقيع
        </button>
      )}
    </div>
  );

  const findLabelForField = (fieldName) => {
    return FIELD_LABELS[fieldName] || fieldName;
  };

  const renderStepContent = () => {
    const isLocked = isReadOnly || isReceived || isSystemClosed;
    const inputProps = (name) => ({ 
      name,
      onChange: handleInputChange, 
      disabled: isLocked,
      error: errors.includes(name)
    });

    if (showReview) return <SummaryTable />;

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="أولاً: المعلومات العامة والخبرات" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputField label="اسم الشركة" value={formData.companyName} {...inputProps('companyName')} />
              <InputField label="تاريخ تقديم العرض" type="date" value={formData.submissionDate} {...inputProps('submissionDate')} />
              <InputField label="اسم ممثل الشركة" value={formData.representativeName} {...inputProps('representativeName')} />
              <InputField label="رقم الهاتف المعتمد" value={formData.phone} {...inputProps('phone')} />
              <InputField label="البريد الإلكتروني المعتمد" type="email" value={formData.email} {...inputProps('email')} />
              <InputField label="رقم إجازة البنك المركزي العراقي" value={formData.centralBankLicense} {...inputProps('centralBankLicense')} />
              <InputField label="العنوان (المقر الرئيسي ومقر الحلة)" value={formData.officialAddress} {...inputProps('officialAddress')} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="ثانياً: الالتزامات التشغيلية والمالية" />
            <div className="space-y-6">
              <ChoiceBox id="q2_1_deposit_within_short_period" label="1. هل تلتزمون بإيداع المبالغ في مصرف الرشيد خلال مدة قصيرة؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}, {label: 'غير معلوم', value: 'غير معلوم'}
              ]} value={formData.q2_1_deposit_within_short_period} {...inputProps('q2_1_deposit_within_short_period')} />

              <ChoiceBox id="q2_2_process_end_of_month_payments" label="2. هل بالإمكان معالجة مشكلة التسديدات التي تتم في اليوم الأخير من الشهر، بحيث لا تظهر ضمن حسابات الشهر اللاحق في المصرف؟" options={[
                {label: 'نعم بالامكان', value: 'نعم بالامكان'}, {label: 'كلا لا يمكن، لان هذا يعتمد على البنك المركزي او المصرف', value: 'كلا لا يمكن، لان هذا يعتمد على البنك المركزي او المصرف'}
              ]} value={formData.q2_2_process_end_of_month_payments} {...inputProps('q2_2_process_end_of_month_payments')} />

              <ChoiceBox id="q2_3_guarantee_movements_in_rashid" label="3. ضمان ظهور جميع الحركات في حسابات مصرف الرشيد." options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q2_3_guarantee_movements_in_rashid} {...inputProps('q2_3_guarantee_movements_in_rashid')} />

              <PercentageBox id="q2_4_commissions_and_discounts" label="4. ما هي نسب العمولات والخصومات المقترحة والتي يتم ارجاعها الى جامعة مع مراجعتها بشكل دوري وإشعار الجامعة؟ (النسبة المسترجعة من نسبة ارباحكم الخاصة)" value={formData.q2_4_commissions_and_discounts} {...inputProps('q2_4_commissions_and_discounts')} />

              <ChoiceBox id="q2_5_provide_atms_in_university" label="5. هل بالامكان توفير عدد من اجهزة الصراف آلي (ATM) داخل الجامعة؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}, {label: 'غير معلوم', value: 'غير معلوم'}
              ]} value={formData.q2_5_provide_atms_in_university} {...inputProps('q2_5_provide_atms_in_university')} />

              <ChoiceBox id="q2_6_student_cards_free_or_cheap" label="6. هل يتم إصدار بطاقات للطلبة مجانا او باجور بسيطة تختلف عن غير طلبة وتدريسي جامعة بابل حصرا؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}, {label: 'غير معلوم', value: 'غير معلوم'}
              ]} value={formData.q2_6_student_cards_free_or_cheap} {...inputProps('q2_6_student_cards_free_or_cheap')} />

              <ChoiceBox id="q2_7_charging_centers_in_university" label="7. هل يمكن توفير مراكز تعبئة داخل الجامعة؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}, {label: 'غير معلوم', value: 'غير معلوم'}
              ]} value={formData.q2_7_charging_centers_in_university} {...inputProps('q2_7_charging_centers_in_university')} />

              <ChoiceBox id="q2_8_pos_maintenance_and_free_supplies" label="8. هل تلتزمون بتوفير مستلزمات التشغيل والصيانة والاستبدال (اجهزة PoS حديثة، ورق، بطاريات، الخ) مجاناً؟ (تعاد لاحقا الى الشركة عند انتهاء العقد)" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q2_8_pos_maintenance_and_free_supplies} {...inputProps('q2_8_pos_maintenance_and_free_supplies')} />

              <ChoiceBox id="q2_9_laptop_and_printer" label="9. هل تلتزمون بتوفير حاسبة لاب توب وطابعة ليزرية جديدتان الى شعبة الحسابات للكليات ورئاسة الجامعة مجاناً؟ (تبقى ملك للجامعة)" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}, {label: 'غير معلوم', value: 'غير معلوم'}
              ]} value={formData.q2_9_laptop_and_printer} {...inputProps('q2_9_laptop_and_printer')} />

              <ChoiceBox id="q2_10_partnership_with_rashid" label="10. هل لديكم تعاون متميز وشراكة دائمة مع مصرف الرشيد فرع الحله الرئيسي لحل جميع المشاكل؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q2_10_partnership_with_rashid} {...inputProps('q2_10_partnership_with_rashid')} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="ثالثاً: الالتزامات التقنية والأمنية" />
            <h3 className="text-xl font-black text-blue-900 mb-6 bg-blue-50 p-4 rounded-xl inline-block border border-blue-100">أ. النظام الإلكتروني والتكامل</h3>
            <div className="space-y-6">
              <ChoiceBox id="q3_1_integrated_system" label="1. هل يتوفر لديكم نظام إلكتروني متكامل يُبيّن جميع الحركات المالية ويقدم التقارير المطلوبة متوفر دائما ولفترات طويلة وقابل للتحديث حسب حاجة الجامعة؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q3_1_integrated_system} {...inputProps('q3_1_integrated_system')} />

              <ChoiceBox id="q3_2_safe_link_payment" label="2. هل يمكن توفير الية التسديد عبر رابط آمن دون الحاجة للحضور الشخصي او استخدام اجهزة PoS؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q3_2_safe_link_payment} {...inputProps('q3_2_safe_link_payment')} />

              <ChoiceBox id="q3_3_iban_available" label="3. هل يتوفر رقم IBAN لكل بطاقة؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}, {label: 'ممكن لاحقا', value: 'ممكن لاحقا'}
              ]} value={formData.q3_3_iban_available} {...inputProps('q3_3_iban_available')} />
            </div>

            <h3 className="text-xl font-black text-blue-900 mt-12 mb-6 bg-blue-50 p-4 rounded-xl inline-block border border-blue-100">ب. الأمن السيبراني والاستمرارية</h3>
            <div className="space-y-6">
              <ChoiceBox id="q4_1_confidentiality" label="1. هل جيع الانظمة والعمليات والبيانات المالية بسرية تامة؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q4_1_confidentiality} {...inputProps('q4_1_confidentiality')} />

              <ChoiceBox id="q4_2_backups" label="2. هل توفرون نسخاً احتياطية للبيانات ولسنوات طويلة؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q4_2_backups} {...inputProps('q4_2_backups')} />

              <ChoiceBox id="q4_3_technical_support" label="3. هل هنالك دعم فني متوفر على مدار الساعة (24/7) ؟ (1- كروب واتساب 2- رقم استجابة سريعة 3- المتابعة شخصية مع مسؤول الحسابات لحل المشاكل او تزويده بالبيانات المطلوبة بسرعة لا تتجاوز اليومان)" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q4_3_technical_support} {...inputProps('q4_3_technical_support')} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="رابعاً: الالتزامات القانونية والتعاقدية" />
            <div className="space-y-6">
              <ChoiceBox id="q5_1_data_ownership" label="1. أن ملكية البيانات تعود للجامعة حصراً، وأنه يحق لها استردادها كاملةً باي وقت تحتاجه؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q5_1_data_ownership} {...inputProps('q5_1_data_ownership')} />

              <ChoiceBox id="q5_2_free_training" label="2. هل تقدمون برامج تدريبية مجانية لموظفي الجامعة عند الحاجة؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q5_2_free_training} {...inputProps('q5_2_free_training')} />

              <ChoiceBox id="q5_3_contract_duration" label="3. مدة العقد المقترحة سنتان (2 سنة) ؟ وقابلة للتجديد لفترة لا تقل عن سنة بعد إعادة التفاوض على الشروط عند كل تجديد ان وجد اي تحديث؟" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا', hasExtra: true}
              ]} value={formData.q5_3_contract_duration} {...inputProps('q5_3_contract_duration')} extraInputPlaceholder="اذا كلا، ماهي الفترة؟" />

              <ChoiceBox id="q5_4_partial_updates" label="4. بالامكان اضافة اي تحديث جزئي ضمن الاتفاق الموجود لتسهيل الدفع الالكتروني لجامعة بابل. (يكون رسميا الى الشركة من قبل مدير المالية او الرقابة في الجامعة)" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q5_4_partial_updates} {...inputProps('q5_4_partial_updates')} />

              <ChoiceBox id="q5_5_contract_termination_and_fines" label="5. فسخ العقد و تسديد الغرامات المالية ان وجدت وتحمل كافة التبعات القانونية في حالة عدم الالتزام بالشروط المتفق عليها، هذا بعد تنبيه الشركة خلال اسبوعان وبعد تشكيل لجنة تدقيقة من الطرفين تبين وتاكد وجود عدم الالتزام." options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q5_5_contract_termination_and_fines} {...inputProps('q5_5_contract_termination_and_fines')} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="خامساً: الخدمات الإضافية والمرفقات" />
            <div className="space-y-6 mb-12">
              <ChoiceBox id="q6_1_sponsor_support" label="1. هل تستاهمون بالدعم (Sponsor) (تغطية بعض التكاليف) لعدد من فعاليات والمؤتمرات العلمية لكليات الجامعة؟ (بعد الاتفاق معكم وموافقة رئيس الجامعة)" options={[
                {label: 'نعم', value: 'نعم'}, {label: 'كلا', value: 'كلا'}
              ]} value={formData.q6_1_sponsor_support} {...inputProps('q6_1_sponsor_support')} />
            </div>

            <SectionHeader title="سادساً: المرفقات والملاحظات" />
            <div className={`bg-white p-12 rounded-[2rem] border-4 border-dashed transition-all flex flex-col items-center text-center ${errors.includes('documentUrl') ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}>
              <FileCheck className={`w-20 h-20 mb-6 opacity-20 ${errors.includes('documentUrl') ? 'text-red-500' : 'text-blue-900'}`} />
              <h4 className={`text-xl font-black mb-2 ${errors.includes('documentUrl') ? 'text-red-900' : 'text-blue-950'}`}>تحميل عرض الشركة الفني والمالي (PDF)</h4>
              <p className="text-xs text-gray-400 mb-8 font-bold">يرجى رفع ملف واحد يحتوي على كافة المخططات والإجازات</p>
              
              {formData.documentUrl ? (
                <div className="bg-emerald-50 px-8 py-4 rounded-2xl flex items-center gap-4">
                  <span className="text-emerald-700 font-black text-sm">تم رفع المستند بنجاح ✓</span>
                  <button type="button" onClick={() => setFormData(p => ({...p, documentUrl: ''}))} className="text-red-500 text-xs font-bold underline">حذف</button>
                </div>
              ) : (
                <div className="relative">
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="bg-blue-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-100">اختيار ملف PDF</div>
                </div>
              )}
              {errors.includes('documentUrl') && <p className="mt-4 text-red-600 font-black text-xs animate-bounce">يرجى رفع الملف الإلزامي للمتابعة</p>}
            </div>
            
            <div className="mt-10">
              <label className="block text-sm font-black text-blue-950 mb-4">ملاحظات إضافية ترغب الشركة بإضافتها (اختياري):</label>
              <textarea 
                name="additionalNotes"
                placeholder="اكتب ملاحظاتك هنا..."
                className="w-full h-48 p-8 rounded-[2rem] bg-white border-2 border-gray-100 focus:border-blue-900 outline-none font-bold transition-all shadow-sm"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                disabled={isSubmitted}
              />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-10 animate-fade-in py-10">
            <div className="max-w-2xl mx-auto text-center">
               <ShieldCheck className="w-24 h-24 text-blue-900 mx-auto mb-8" />
               <h3 className="text-3xl font-black text-blue-950 mb-4">سابعاً: المصادقة والتوقيع النهائي</h3>
               <p className="text-gray-500 font-bold mb-12">يرجى كتابة الاسم الكامل والصفة الوظيفية للمسؤول المخول بالتوقيع قبل إرسال العرض نهائياً.</p>
               
               <div className="space-y-6 text-right">
                  <InputField label="اسم المفوض بالتوقيع (الختم الرسمي)" value={formData.signedBy} {...inputProps('signedBy')} />
                  <InputField label="الصفة الوظيفية للموقع" value={formData.position} {...inputProps('position')} />
               </div>

               <div className="mt-12 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-200 text-right shadow-inner">
                 <div className="flex items-start gap-4">
                   <ShieldCheck className="w-8 h-8 text-slate-400 shrink-0 mt-1" />
                   <div className="space-y-4 flex-grow">
                     <h4 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2">إقرار وتعهد قانوني</h4>
                     <p className="text-xs text-slate-600 font-bold leading-relaxed">
                       {isSubmitted && !isReceived 
                         ? "لقد قمت بإرسال العرض مسبقاً، ولكن يمكنك تحديث البيانات طالما لم يتم تأييد الاستلام من قبل الجامعة. سيؤدي الضغط على تحديث العرض إلى تحديث البيانات المرسلة حالياً."
                         : 'بمجرد الضغط على "إرسال العرض نهائياً"، تقر الشركة بصحة كافة البيانات المذكورة أعلاه. يمكنك تعديل العرض لاحقاً طالما لم يقم المسؤول بتأييد استلام الطلب.'
                       }
                     </p>
                     <div className="p-4 bg-white rounded-xl border-r-4 border-red-500 shadow-sm">
                       <p className="text-xs text-red-700 font-black leading-relaxed">
                         "في حالة عدم صحة المعلومات المقدمة من قبل الشركة يحق للجامعة فسخ العقد دون اللجوء إلى المحاكم المختصة وتحتفظ بحقها في المطالبة بكافة التعويضات القانونية"
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-arabic" dir="rtl">
      {/* Hidden Print Template */}
      <div className="hidden print:block w-full bg-white">
        {printMode === 'blank' ? (
          <PrintTemplate isBlank={true} />
        ) : (
          <PrintTemplate data={{ ...formData, username: user?.username }} isBlank={false} />
        )}
      </div>

      <header className="bg-white border-b sticky top-0 z-50 print:hidden">
        {isReceived && (
          <div className="bg-red-600 text-white text-center py-2 text-[10px] font-black uppercase tracking-widest">
            تم تأييد الاستلام - هذا العرض مقفل للمراجعة النهائية ولا يمكن تعديله
          </div>
        )}
        {isSystemClosed && (
          <div className="bg-rose-600 text-white text-center py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            انتهت الفترة المحددة للتقديم - النظام مغلق حالياً ولا يمكن تعديل أو إرسال العروض
          </div>
        )}
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Logo" className="w-12 h-12 object-contain" />
            <div>
                <h1 className="text-xl font-black text-indigo-950 leading-tight">نظام إدارة معايير التعاقد مع شركات الدفع الالكتروني</h1>
              <p className="text-[10px] font-bold text-gray-400">جامعة بابل - لجنة معايير التعاقد</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase">مرحباً بك</p>
              <p className="text-xs font-black text-blue-900">{user.name || user.username}</p>
            </div>
            <button onClick={logout} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <div className="flex-grow flex max-w-7xl mx-auto w-full p-6 md:p-10 gap-10 print:hidden">
        <aside className="hidden lg:flex flex-col w-72 shrink-0">
          <div className="bg-white rounded-[2.5rem] border shadow-sm p-4 sticky top-28">
            <p className="px-4 py-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">أقسام الاستمارة</p>
            <nav className="space-y-1">
              {steps.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => goToStep(s.id)}
                  className={`w-full text-right px-6 py-4 rounded-2xl font-black text-[11px] transition-all flex items-center justify-between group ${currentStep === s.id ? 'bg-blue-900 text-white shadow-xl shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <span>{s.title}</span>
                  {currentStep === s.id && <ChevronLeft className="w-4 h-4" />}
                </button>
              ))}
            </nav>
            <div className="mt-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-[10px] font-black text-gray-400 uppercase">الإكمال</span>
                 <span className="text-lg font-black text-blue-900">{Math.round((currentStep/6)*100)}%</span>
               </div>
               <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-900 transition-all duration-500" style={{width: `${(currentStep/6)*100}%`}}></div>
               </div>
            </div>
          </div>
        </aside>

        <main className="flex-grow min-w-0">
          {showSuccess ? (
            <div className="bg-white rounded-[3rem] p-20 text-center border shadow-xl animate-fade-in">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-black text-blue-950 mb-4">تم استلام عرضكم بنجاح</h2>
              <p className="text-gray-500 font-bold mb-10 max-w-md mx-auto text-sm leading-relaxed">
                {isReceived 
                  ? 'تم تأييد استلام عرضكم من قبل اللجنة بنجاح. العرض الآن في مرحلة المراجعة النهائية ولا يمكن تعديله.'
                  : 'شكراً لكم، تم استلام بيانات العرض بنجاح. يمكنك دائماً تحديث البيانات طالما لم يتم تأييد الاستلام من قبل اللجنة.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button onClick={() => setShowSuccess(false)} className="bg-blue-900 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-blue-100">عرض البيانات المرسلة</button>
                <button onClick={handlePrintFilled} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 flex items-center justify-center gap-2">
                   <Download className="w-5 h-5" /> تحميل العرض المكتمل (PDF)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border shadow-sm flex flex-col min-h-[700px] overflow-hidden">
              <form 
                onSubmit={handleSubmit} 
                onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }}
                className="flex flex-col flex-grow"
              >
                <div className="p-10 md:p-16 flex-grow">{renderStepContent()}</div>
                
                <div className="p-8 md:p-12 bg-gray-50/50 border-t flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button type="button" onClick={() => setCurrentStep(p => Math.max(1, p-1))} className="px-10 py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-all">السابق</button>
                    <div className="flex flex-wrap gap-2">
                      {!isReceived && (
                        <button 
                          type="button" 
                          onClick={handlePrintBlank} 
                          title="تحميل الاستمارة فارغة للمطالعة"
                          className="px-6 py-4 bg-blue-50 text-blue-900 rounded-2xl hover:bg-blue-900 hover:text-white transition-all border border-blue-100 shadow-sm flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          <span className="text-xs font-black hidden lg:inline">تحميل فارغة (للاطلاع)</span>
                        </button>
                      )}
                      {isSubmitted && (
                        <button 
                          type="button" 
                          onClick={handlePrintFilled} 
                          title="تحميل العرض المكتمل للشركة"
                          className="px-6 py-4 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          <span className="text-xs font-black">تحميل العرض المكتمل</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 w-full md:w-auto">
                    {currentStep < 5 ? (
                      <button type="button" onClick={() => goToStep(currentStep + 1)} className="w-full md:w-auto px-12 py-4 bg-blue-950 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-900 transition-all">الخطوة التالية <ChevronLeft className="w-5 h-5" /></button>
                    ) : currentStep === 5 ? (
                      <button type="button" onClick={() => { if(validateStep(5)) setShowReview(true); }} className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 transition-all">مراجعة كافة البيانات <FileCheck className="w-5 h-5" /></button>
                    ) : (
                      (!isReadOnly && !isReceived && !isSystemClosed) && (
                        <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-16 py-5 bg-blue-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-blue-100 hover:bg-blue-800 transition-all">
                          {isSubmitting ? 'جاري الإرسال...' : isSubmitted ? 'تحديث العرض المرسل' : 'إرسال العرض نهائياً'}
                          <Send className="w-5 h-5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-scale-in text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-blue-950 mb-4">{isSubmitted ? 'تأكيد تحديث العرض' : 'تأكيد الإرسال النهائي'}</h3>
            <p className="text-gray-500 font-bold mb-10 leading-relaxed text-sm">
              {isSubmitted 
                ? 'هل أنت متأكد من رغبتك في تحديث بيانات العرض المرسل؟' 
                : 'هل أنت متأكد من إرسال العرض نهائياً؟ يمكنك التعديل لاحقاً طالما لم يتم تأييد الاستلام.'
              }
            </p>
            <div className="flex gap-4">
              <button onClick={processFinalSubmit} className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-black hover:bg-blue-800 transition-all shadow-lg shadow-blue-100">{isSubmitted ? 'تحديث الآن' : 'نعم، إرسال'}</button>
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black hover:bg-gray-200 transition-all">تراجع</button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && announcement && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-blue-950/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[3rem] p-0 max-w-lg w-full shadow-2xl animate-scale-in overflow-hidden">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-10 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full"></div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                  <Megaphone className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black leading-tight">{announcement.title || 'إعلان هام'}</h2>
              </div>
            </div>
            <div className="p-10">
              <div className="text-gray-700 font-bold text-sm leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-y-auto">
                {announcement.content}
              </div>
              <button 
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setAnnouncementDismissed(true);
                  localStorage.setItem('dismissed_announcement_id', announcement.id);
                }}
                className="w-full mt-8 py-4 bg-indigo-950 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-900 transition-all"
              >
                تم الاطلاع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Sidebar Reminder */}
      {announcementDismissed && announcement && !showAnnouncementModal && (
        <button
          onClick={() => setShowAnnouncementModal(true)}
          className="fixed bottom-6 left-6 z-[90] bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-purple-200 hover:shadow-purple-300 hover:scale-105 transition-all flex items-center gap-3 group print:hidden"
        >
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Megaphone className="w-4 h-4" />
          </div>
          <span className="text-xs font-black">إعلان هام</span>
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
        </button>
      )}
    </div>
  );
};

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
    <div className="w-2 h-10 bg-blue-900 rounded-full"></div>
    <h3 className="text-2xl font-black text-blue-950">{title}</h3>
  </div>
);

const InputField = ({ label, name, value, onChange, type = 'text', disabled, error }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center pr-2">
      <label className={`text-sm font-black uppercase tracking-widest block ${error ? 'text-red-500' : 'text-gray-600'}`}>{label}</label>
      {error && <span className="text-[9px] text-red-500 font-black animate-pulse">يجب الإجابة</span>}
    </div>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      disabled={disabled}
      onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }}
      className={`w-full p-5 rounded-2xl border-2 outline-none font-bold transition-all text-sm ${error ? 'bg-red-50 border-red-200 focus:border-red-500' : 'bg-gray-50/50 border-transparent focus:bg-white focus:border-blue-900'}`} 
    />
  </div>
);


const ChoiceBox = ({ id, label, options, value, onChange, disabled, error, extraInputPlaceholder }) => {
  const currentBaseValue = value?.includes(':') ? value.split(':')[0] : value;
  const extraValue = value?.includes(':') ? value.split(':')[1] : '';

  return (
    <div className={`p-8 rounded-[2.5rem] border-2 transition-all group shadow-sm ${error ? 'bg-red-50/50 border-red-200' : 'bg-gray-50/30 border-transparent hover:border-blue-50 hover:bg-white'}`}>
      <div className="flex justify-between items-start mb-4">
        <label className={`block text-lg font-black leading-relaxed ${error ? 'text-red-900' : 'text-blue-950 group-hover:text-blue-900'}`}>{label}</label>
        {error && <span className="text-xs bg-red-500 text-white px-3 py-1 rounded-full font-black shrink-0 animate-bounce">إجابة مطلوبة</span>}
      </div>
      <div className="space-y-4 mt-6">
        {options.map((opt, idx) => (
          <label key={idx} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${currentBaseValue === opt.value ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:bg-gray-50'}`}>
            <input
              type="radio"
              name={id}
              value={opt.value}
              checked={currentBaseValue === opt.value}
              onChange={(e) => {
                if (opt.hasExtra) {
                  onChange({ target: { name: id, value: `${e.target.value}:` } });
                } else {
                  onChange({ target: { name: id, value: e.target.value } });
                }
              }}
              disabled={disabled}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-bold text-gray-800">{opt.label}</span>
          </label>
        ))}
        
        {options.find(o => o.hasExtra && currentBaseValue === o.value) && (
          <input
            type="text"
            placeholder={extraInputPlaceholder || "يرجى التحديد..."}
            value={extraValue}
            onChange={(e) => {
              const baseValue = options.find(o => o.hasExtra).value;
              onChange({ target: { name: id, value: `${baseValue}:${e.target.value}` } });
            }}
            disabled={disabled}
            className="w-full mt-4 p-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 outline-none font-bold transition-all bg-white"
          />
        )}
      </div>
    </div>
  );
};

const PercentageBox = ({ id, label, value, onChange, disabled, error }) => (
  <div className={`p-8 rounded-[2.5rem] border-2 transition-all group shadow-sm ${error ? 'bg-red-50/50 border-red-200' : 'bg-gray-50/30 border-transparent hover:border-blue-50 hover:bg-white'}`}>
    <div className="flex justify-between items-start mb-4">
      <label className={`block text-lg font-black leading-relaxed ${error ? 'text-red-900' : 'text-blue-950 group-hover:text-blue-900'}`}>{label}</label>
      {error && <span className="text-xs bg-red-500 text-white px-3 py-1 rounded-full font-black shrink-0 animate-bounce">إجابة مطلوبة</span>}
    </div>
    <div className="relative mt-6 max-w-sm">
      <input
        type="number"
        name={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="مثال: 10"
        className={`w-full pl-12 pr-6 py-4 rounded-xl border-2 focus:ring-4 outline-none font-black text-xl transition-all bg-white text-left dir-ltr ${error ? 'border-red-200 focus:border-red-500 ring-red-50' : 'border-gray-200 focus:border-blue-600 ring-blue-50'}`}
        dir="ltr"
      />
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">%</span>
    </div>
  </div>
);

const QuestionBox = ({ id, label, value, onChange, disabled, error }) => (
  <div className={`p-8 rounded-[2.5rem] border-2 transition-all group shadow-sm ${error ? 'bg-red-50/50 border-red-200' : 'bg-gray-50/30 border-transparent hover:border-blue-50 hover:bg-white'}`}>
    <div className="flex justify-between items-start mb-4">
      <label className={`block text-lg font-black leading-relaxed ${error ? 'text-red-900' : 'text-blue-950 group-hover:text-blue-900'}`}>{label}</label>
      {error && <span className="text-xs bg-red-500 text-white px-3 py-1 rounded-full font-black shrink-0 animate-bounce">إجابة مطلوبة</span>}
    </div>
    <textarea 
      name={id} 
      value={value} 
      onChange={onChange} 
      disabled={disabled}
      className={`w-full h-40 p-6 rounded-2xl border-2 focus:ring-4 outline-none font-bold transition-all text-base leading-relaxed bg-white ${error ? 'border-red-200 focus:border-red-500 ring-red-50' : 'border-gray-100 focus:border-blue-900 ring-blue-50'}`} 
    />
  </div>
);

export default DashboardRound2;
