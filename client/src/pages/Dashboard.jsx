import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Save, Send, LogOut, 
  CheckCircle2, AlertCircle, Building2, User, 
  Phone, Mail, FileCheck, ShieldCheck, HelpCircle, ArrowRight, X,
  Download
} from 'lucide-react';
import { supabase, safeUrl, safeAnon } from '../utils/supabaseClient';
import PrintTemplate from '../components/PrintTemplate';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReceived, setIsReceived] = useState(false);
  const activityLogId = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    submissionDate: new Date().toISOString().split('T')[0],
    representativeName: '',
    phone: '',
    email: '',
    centralBankLicense: '',
    marketExperience: '',
    govInstitutionsCount: '',
    paidCapital: '',
    officialAddress: '',
    q2_1_settlement: '',
    q2_2_commissions: '',
    q2_3_intermediary: '',
    q2_4_delayPenalty: '',
    q2_5_atmCommitment: '',
    q2_6_studentCards: '',
    q2_7_chargingCenters: '',
    q2_8_posCommitment: '',
    q3a_1_integratedSystem: '',
    q3a_2_techSpecs: '',
    q3a_3_appSupport: '',
    q3a_4_webIntegration: '',
    q3a_5_reporting: '',
    q3a_6_training: '',
    q3b_1_certificates: '',
    q3b_2_encryption: '',
    q3b_3_rto_bcp: '',
    q3b_4_backups: '',
    q3b_5_supportSla: '',
    q3b_6_penTest: '',
    q3b_7_monitoring: '',
    q3b_8_incident: '',
    q4_1_bankGuarantee: '',
    q4_2_penaltyClause: '',
    q4_3_dataOwnership: '',
    q4_4_exitClause: '',
    q4_5_liability: '',
    q4_6_jurisdiction: '',
    q4_7_auditRight: '',
    q4_8_contractDuration: '',
    q4_9_renewal: '',
    q4_10_blacklist: '',
    q5_1_extraFeatures: '',
    q5_2_innovation: '',
    q5_3_scholarships: '',
    q5_4_staffTraining: '',
    q5_5_posUpdates: '',
    q5_6_foreignPayments: '',
    q5_7_complaints: '',
    q5_8_socialResp: '',
    additionalNotes: '',
    signedBy: '',
    position: '',
    documentUrl: ''
  });

  const steps = [
    { id: 1, title: 'المعلومات العامة' },
    { id: 2, title: 'الالتزامات التشغيلية والمالية' },
    { id: 3, title: 'النظام الإلكتروني والتكامل' },
    { id: 4, title: 'الأمن السيبراني والاستمرارية' },
    { id: 5, title: 'الضمانات وملكية البيانات' },
    { id: 6, title: 'الالتزامات القانونية' },
    { id: 7, title: 'الخدمات الإضافية والميزات' },
    { id: 8, title: 'المرفقات والملاحظات' },
    { id: 9, title: 'المصادقة والتوقيع النهائي' }
  ];

  const STEP_FIELDS = {
    1: ['companyName', 'submissionDate', 'representativeName', 'phone', 'email', 'centralBankLicense', 'marketExperience', 'govInstitutionsCount', 'paidCapital', 'officialAddress'],
    2: ['q2_1_settlement', 'q2_2_commissions', 'q2_3_intermediary', 'q2_4_delayPenalty', 'q2_5_atmCommitment', 'q2_6_studentCards', 'q2_7_chargingCenters', 'q2_8_posCommitment'],
    3: ['q3a_1_integratedSystem', 'q3a_2_techSpecs', 'q3a_3_appSupport', 'q3a_4_webIntegration', 'q3a_5_reporting', 'q3a_6_training'],
    4: ['q3b_1_certificates', 'q3b_2_encryption', 'q3b_3_rto_bcp', 'q3b_4_backups', 'q3b_5_supportSla', 'q3b_6_penTest', 'q3b_7_monitoring', 'q3b_8_incident'],
    5: ['q4_1_bankGuarantee', 'q4_2_penaltyClause', 'q4_3_dataOwnership'],
    6: ['q4_4_exitClause', 'q4_5_liability', 'q4_6_jurisdiction', 'q4_7_auditRight', 'q4_8_contractDuration', 'q4_9_renewal', 'q4_10_blacklist'],
    7: ['q5_1_extraFeatures', 'q5_2_innovation', 'q5_3_scholarships', 'q5_4_staffTraining', 'q5_5_posUpdates', 'q5_6_foreignPayments', 'q5_7_complaints', 'q5_8_socialResp'],
    8: ['documentUrl'],
    9: ['signedBy', 'position']
  };

  const FIELD_LABELS = {
    companyName: 'اسم الشركة',
    submissionDate: 'تاريخ تقديم العرض',
    representativeName: 'اسم ممثل الشركة',
    phone: 'رقم الهاتف المعتمد',
    email: 'البريد الإلكتروني المعتمد',
    centralBankLicense: 'رقم إجازة البنك المركزي العراقي',
    marketExperience: 'سنوات الخبرة في السوق المحلي',
    govInstitutionsCount: 'عدد المؤسسات الحكومية المخدَّمة',
    paidCapital: 'رأس المال / الملاءة المالية',
    officialAddress: 'العنوان الرسمي / المقر الرئيسي',
    q2_1_settlement: '1. آلية التسوية المالية (المقاصة)',
    q2_2_commissions: '2. نسب العمولات والخصومات المقترحة',
    q2_3_intermediary: '3. تفاصيل البنك الوسيط (إن وجد)',
    q2_4_delayPenalty: '4. قيمة غرامة التأخير المقترحة',
    q2_5_atmCommitment: '5. الالتزام بتوفير أجهزة ATM',
    q2_6_studentCards: '6. تفاصيل إصدار بطاقات الطلبة',
    q2_7_chargingCenters: '7. مراكز التعبئة وساعات العمل',
    q2_8_posCommitment: '8. تجهيز PoS والورق الحراري والصيانة',
    q3a_1_integratedSystem: '1. توفر نظام إلكتروني متكامل للتقارير',
    q3a_2_techSpecs: '2. إصدار بطاقات خاصة بالوحدات الإدارية',
    q3a_3_appSupport: '3. كشف حساب لحظي (Real-time)',
    q3a_4_webIntegration: '4. التكامل مع موقع الجامعة (QR/رابط)',
    q3a_5_reporting: '5. خدمة التحويلات خارج العراق',
    q3a_6_training: '6. توفر رقم IBAN لكل بطاقة',
    q3b_1_certificates: '1. شهادات الأمن (PCI-DSS / ISO)',
    q3b_2_encryption: '2. بروتوكول التشفير المستخدم',
    q3b_3_rto_bcp: '3. وقت استعادة الخدمة (RTO)',
    q3b_4_backups: '4. سياسة النسخ الاحتياطي ومكان التخزين',
    q3b_5_supportSla: '5. نظام الدعم الفني (24/7)',
    q3b_6_penTest: '6. اختبارات الاختراق الأمني الدورية',
    q3b_7_monitoring: '7. سياسة الاحتفاظ بالبيانات',
    q3b_8_incident: '8. طرائق الاتصال والحاجة للإنترنت',
    q4_1_bankGuarantee: '1. خطاب الضمان المصرفي غير المشروط',
    q4_2_penaltyClause: '2. الالتزام بسرية البيانات (NDA)',
    q4_3_dataOwnership: '3. ملكية البيانات للجامعة حصراً',
    q4_4_exitClause: '4. برامج تدريبية مجانية للموظفين',
    q4_5_liability: '5. حق الجامعة بفسخ العقد فورياً',
    q4_6_jurisdiction: '6. القانون العراقي واختصاص محاكم بابل',
    q4_7_auditRight: '7. اللجوء للتحكيم التجاري العراقي',
    q4_8_contractDuration: '8. مدة العقد وشروط التجديد',
    q4_9_renewal: '9. آلية معالجة شكاوى الطلبة',
    q4_10_blacklist: '10. القائمة السوداء (البنك المركزي)',
    q5_1_extraFeatures: '1. تطبيق هاتفي (iOS/Android)',
    q5_2_innovation: '2. خدمات مصرفية إضافية ومحافظ رقمية',
    q5_3_scholarships: '3. الطاقة الاستيعابية لمعالجة الحركات',
    q5_4_staffTraining: '4. دعم الفعاليات والمؤتمرات العلمية',
    q5_5_posUpdates: '5. التحديث الدوري للأجهزة والأنظمة',
    q5_6_foreignPayments: '6. تسديد أجور بالدولار للخارج',
    q5_7_complaints: '7. ميزات إضافية لصالح جامعة بابل',
    q5_8_socialResp: '8. المؤسسات الحكومية المخدَّمة حالياً',
    documentUrl: 'الملف المرفق (PDF)',
    signedBy: 'اسم المفوض بالتوقيع',
    position: 'الصفة الوظيفية للموقع'
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
        .from('submissions')
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
    const data = {};
    
    // Comprehensive Map of DB lowercase columns to React camelCase keys
    const mapping = {
      companyname: 'companyName',
      submissiondate: 'submissionDate',
      representativename: 'representativeName',
      centralbanklicense: 'centralBankLicense',
      marketexperience: 'marketExperience',
      govinstitutionscount: 'govInstitutionsCount',
      paidcapital: 'paidCapital',
      officialaddress: 'officialAddress',
      // Step 2-7 questions
      q2_2_commissions: 'q2_2_commissions',
      q2_4_delaypenalty: 'q2_4_delayPenalty',
      q2_5_atmcommitment: 'q2_5_atmCommitment',
      q2_6_studentcards: 'q2_6_studentCards',
      q2_7_chargingcenters: 'q2_7_chargingCenters',
      q2_8_poscommitment: 'q2_8_posCommitment',
      q3a_1_integratedsystem: 'q3a_1_integratedSystem',
      q3a_2_techspecs: 'q3a_2_techSpecs',
      q3a_3_appsupport: 'q3a_3_appSupport',
      q3a_4_webintegration: 'q3a_4_webIntegration',
      q3b_1_certificates: 'q3b_1_certificates',
      q3b_5_supportsla: 'q3b_5_supportSla',
      q3b_6_pentest: 'q3b_6_penTest',
      q4_1_bankguarantee: 'q4_1_bankGuarantee',
      q4_2_penaltyclause: 'q4_2_penaltyClause',
      q4_3_dataownership: 'q4_3_dataOwnership',
      q4_4_exitclause: 'q4_4_exitClause',
      q4_7_auditright: 'q4_7_auditRight',
      q4_8_contractduration: 'q4_8_contractDuration',
      q5_1_extrafeatures: 'q5_1_extraFeatures',
      q5_4_stafftraining: 'q5_4_staffTraining',
      q5_5_posupdates: 'q5_5_posUpdates',
      q5_6_foreignpayments: 'q5_6_foreignPayments',
      q5_8_socialresp: 'q5_8_socialResp',
      // Other fields
      document_url: 'documentUrl',
      document_path: 'documentUrl',
      additionalnotes: 'additionalNotes',
      signedby: 'signedBy',
      is_received: 'isReceived'
    };

    Object.keys(dbData).forEach(dbKey => {
      const reactKey = mapping[dbKey] || dbKey;
      data[reactKey] = dbData[dbKey];
    });
    return data;
  };

  const toDbPayload = (data) => {
    const payload = {};
    // Fields to exclude from the company's update payload
    const exclude = ['isreceived', 'is_received', 'isReceived', 'evaluation_score', 'evaluation_score', 'lastupdated', 'last_updated', 'created_at', 'id'];
    
    Object.keys(data).forEach(key => {
      // Convert to lowercase by default to match most DB setups
      let dbKey = key.toLowerCase();
      
      if (exclude.includes(dbKey)) return;

      // Specifically handle underscore cases
      if (dbKey === 'documenturl') dbKey = 'document_url';
      
      payload[dbKey] = data[key];
    });
    return payload;
  };

  const checkLockStatus = async () => {
    try {
      const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = localUser.userId;
      if (!userId) return;

      const { data, error } = await supabase
        .from('submissions')
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
    if (isReceived) return;
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
    if (isReceived) return;
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

      const path = `${uid}/${Date.now()}-${file.name}`.replace(/\s+/g, '_');
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

  const saveDraft = async () => {
    try {
      const dbFields = toDbPayload(formData);
      
      const payload = {
        ...dbFields,
        user_id: user.userId || user.id,
        username: user.username,
        status: 'draft',
        last_updated: new Date().toISOString()
      };

      // Ensure we update the existing record and check if it's locked
      const { data: existing } = await supabase
        .from('submissions')
        .select('id, is_received')
        .eq('username', (user.username || '').toLowerCase().trim())
        .maybeSingle();
      
      if (existing?.is_received) {
        alert('لا يمكن حفظ المسودة: لقد تم تأييد استلام العرض من قبل اللجنة وقفل التعديل.');
        setIsReceived(true);
        return;
      }

      if (existing?.id) {
        payload.id = existing.id;
      }

      const { error } = await supabase
        .from('submissions')
        .upsert(payload);

      if (error) throw error;
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving draft:', err);
      alert(`فشل حفظ المسودة: ${err.message || 'خطأ غير معروف'}`);
    }
  };

  const handleDownloadBlankForm = () => {
    window.print();
  };

  const processFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);
    try {
      const dbFields = toDbPayload(formData);

      const payload = {
        ...dbFields,
        user_id: user.userId || user.id,
        username: user.username,
        status: 'final',
        last_updated: new Date().toISOString()
      };

      // Ensure we update the existing record and check if it's locked
      const { data: existing } = await supabase
        .from('submissions')
        .select('id, is_received')
        .eq('username', (user.username || '').toLowerCase().trim())
        .maybeSingle();
      
      if (existing?.is_received) {
        alert('لا يمكن التحديث: لقد تم تأييد استلام العرض من قبل اللجنة وقفل التعديل.');
        setIsReceived(true);
        setIsSubmitted(true);
        return;
      }

      if (existing?.id) {
        payload.id = existing.id;
      }

      const { error } = await supabase
        .from('submissions')
        .upsert(payload);

      if (error) throw error;
      
      // Log Submission Activity
      try {
        await supabase.from('activity_logs').insert({
          username: user.username,
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
    if (isSubmitted && isReceived) return;

    if (!formData.signedBy || !formData.position) {
      alert('يرجى كتابة اسم الموقع وصفته الوظيفية قبل الإرسال النهائي.');
      setCurrentStep(9);
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
                <div key={f} className="flex justify-between items-start gap-4 p-3 bg-white border rounded-xl text-xs">
                  <span className="font-bold text-gray-400 shrink-0 w-1/3">
                    {/* Logic to find label for field f */}
                    {findLabelForField(f)}
                  </span>
                  <span className="font-black text-gray-800 text-left w-2/3">{formData[f] || '---'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
        <p className="text-xs text-amber-800 font-bold leading-relaxed">
          يرجى مراجعة كافة البيانات أعلاه بدقة. بمجرد الضغط على "تأكيد ومتابعة"، سيتم نقلك لصفحة التوقيع النهائي.
        </p>
      </div>
      <button 
        onClick={() => { setShowReview(false); setCurrentStep(9); }}
        className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black shadow-xl"
      >
        تأكيد وصحة البيانات - المتابعة للتوقيع
      </button>
    </div>
  );

  const findLabelForField = (fieldName) => {
    return FIELD_LABELS[fieldName] || fieldName;
  };

  const renderStepContent = () => {
    const isLocked = isReceived;
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
              <InputField label="سنوات الخبرة في السوق المحلي" value={formData.marketExperience} {...inputProps('marketExperience')} />
              <InputField label="عدد المؤسسات الحكومية المخدَّمة حالياً" type="number" value={formData.govInstitutionsCount} {...inputProps('govInstitutionsCount')} />
              <InputField label="رأس المال المدفوع / الملاءة المالية" value={formData.paidCapital} {...inputProps('paidCapital')} />
              <InputField label="العنوان الرسمي / المقر الرئيسي" value={formData.officialAddress} {...inputProps('officialAddress')} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="ثانياً: الالتزامات التشغيلية والمالية (8 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q2_1_settlement" label="1. ما هي الآلية المعتمدة لإجراء التسوية المالية (المقاصة) مع مصرف الرشيد؟ وهل تلتزمون بالإيداع خلال 12 ساعة عمل؟" value={formData.q2_1_settlement} {...inputProps('q2_1_settlement')} />
              <QuestionBox id="q2_2_commissions" label="2. ما هي نسب العمولات والخصومات المقترحة؟ وهل توافقون على مراجعتها دورياً وإشعار الجامعة قبل 30 يوماً من أي تعديل؟" value={formData.q2_2_commissions} {...inputProps('q2_2_commissions')} />
              <QuestionBox id="q2_3_intermediary" label="3. هل يوجد وسيط (مصرف آخر) لنقل المبالغ أم مباشرة؟ يرجى ذكر تفاصيل سير الحركات المالية." value={formData.q2_3_intermediary} {...inputProps('q2_3_intermediary')} />
              <QuestionBox id="q2_4_delayPenalty" label="4. ما قيمة غرامة التأخير المقترحة عن كل ساعة تجاوز مدة التسوية المتفق عليها؟" value={formData.q2_4_delayPenalty} {...inputProps('q2_4_delayPenalty')} />
              <QuestionBox id="q2_5_atmCommitment" label="5. هل تلتزمون بتوفير جهاز صراف آلي (ATM) يملأ دائماً داخل الجامعة؟" value={formData.q2_5_atmCommitment} {...inputProps('q2_5_atmCommitment')} />
              <QuestionBox id="q2_6_studentCards" label="6. ما هي تفاصيل إصدار بطاقات الطلبة؟ (رسوم الإصدار، التجديد، بدل الضائع، مدة الإصدار)" value={formData.q2_6_studentCards} {...inputProps('q2_6_studentCards')} />
              <QuestionBox id="q2_7_chargingCenters" label="7. هل توفرون مراكز تعبئة كافية داخل الكليات؟ وما هي ساعات العمل المقترحة لها؟" value={formData.q2_7_chargingCenters} {...inputProps('q2_7_chargingCenters')} />
              <QuestionBox id="q2_8_posCommitment" label="8. هل تلتزمون بتجهيز نقاط البيع (PoS) والورق الحراري مجاناً؟ وما هو زمن الاستجابة للصيانة (SLA)؟" value={formData.q2_8_posCommitment} {...inputProps('q2_8_posCommitment')} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="ثالثاً: أ- النظام الإلكتروني والتكامل (6 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q3a_1_integratedSystem" label="1. هل يتوفر لديكم نظام إلكتروني متكامل يُبيّن جميع الحركات المالية؟" value={formData.q3a_1_integratedSystem} {...inputProps('q3a_1_integratedSystem')} />
              <QuestionBox id="q3a_2_techSpecs" label="2. هل يمكن إصدار بطاقات خاصة بكل كلية أو وحدة إدارية بدون عمولات تحويل داخلية؟" value={formData.q3a_2_techSpecs} {...inputProps('q3a_2_techSpecs')} />
              <QuestionBox id="q3a_3_appSupport" label="3. هل يمكن للجامعة الحصول على كشف حساب لحظي (Real-time) في أي وقت؟" value={formData.q3a_3_appSupport} {...inputProps('q3a_3_appSupport')} />
              <QuestionBox id="q3a_4_webIntegration" label="4. هل يمكن تحقيق تكامل إلكتروني مع موقع الجامعة يتيح التسديد عبر رابط آمن أو QR كود؟" value={formData.q3a_4_webIntegration} {...inputProps('q3a_4_webIntegration')} />
              <QuestionBox id="q3a_5_reporting" label="5. هل توفرون خدمة التحويلات خارج العراق؟ يرجى بيان العمولات والحدود اليومية." value={formData.q3a_5_reporting} {...inputProps('q3a_5_reporting')} />
              <QuestionBox id="q3a_6_training" label="6. هل يتوفر رقم IBAN لكل بطاقة؟ وهل هو متوافق مع معايير الدفع الدولية؟" value={formData.q3a_6_training} {...inputProps('q3a_6_training')} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="ثالثاً: ب- الأمن السيبراني والاستمرارية (8 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q3b_1_certificates" label="1. ما هي شهادات الأمن المعتمدة لديكم؟ (PCI-DSS / ISO 27001 / غيرها)" value={formData.q3b_1_certificates} {...inputProps('q3b_1_certificates')} />
              <QuestionBox id="q3b_2_encryption" label="2. ما هو بروتوكول التشفير المستخدم في المعاملات؟" value={formData.q3b_2_encryption} {...inputProps('q3b_2_encryption')} />
              <QuestionBox id="q3b_3_rto_bcp" label="3. ما هو الحد الأقصى لوقت استعادة الخدمة عند الانقطاع (RTO)؟" value={formData.q3b_3_rto_bcp} {...inputProps('q3b_3_rto_bcp')} />
              <QuestionBox id="q3b_4_backups" label="4. هل توفرون نسخاً احتياطية يومية للبيانات؟ أين تُخزَّن؟" value={formData.q3b_4_backups} {...inputProps('q3b_4_backups')} />
              <QuestionBox id="q3b_5_supportSla" label="5. ما هو نظام الدعم الفني؟ هل يتوفر على مدار الساعة (24/7)؟" value={formData.q3b_5_supportSla} {...inputProps('q3b_5_supportSla')} />
              <QuestionBox id="q3b_6_penTest" label="6. هل تُجرون اختبارات اختراق أمني (Penetration Testing) دورية؟" value={formData.q3b_6_penTest} {...inputProps('q3b_6_penTest')} />
              <QuestionBox id="q3b_7_monitoring" label="7. ما هي سياسة شركتكم في الاحتفاظ بالبيانات؟ (المدة الزمنية، مكان التخزين)" value={formData.q3b_7_monitoring} {...inputProps('q3b_7_monitoring')} />
              <QuestionBox id="q3b_8_incident" label="8. ما هي طرائق الاتصالات المستخدمة وهل تحتاج انترنت؟" value={formData.q3b_8_incident} {...inputProps('q3b_8_incident')} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="رابعاً: أ- الضمانات وملكية البيانات (3 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q4_1_bankGuarantee" label="1. خطاب الضمان المصرفي: هل تقدمون خطاب ضمان مصرفي غير مشروط لصالح الجامعة؟" value={formData.q4_1_bankGuarantee} {...inputProps('q4_1_bankGuarantee')} />
              <QuestionBox id="q4_2_penaltyClause" label="2. سرية البيانات: هل تلتزمون بسرية البيانات وتوقيع اتفاقية (NDA) رسمية؟" value={formData.q4_2_penaltyClause} {...inputProps('q4_2_penaltyClause')} />
              <QuestionBox id="q4_3_dataOwnership" label="3. ملكية البيانات واستردادها: هل توافقون على أن ملكية البيانات تعود للجامعة حصراً؟" value={formData.q4_3_dataOwnership} {...inputProps('q4_3_dataOwnership')} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="رابعاً: ب- الالتزامات القانونية والتعاقدية (7 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q4_4_exitClause" label="4. هل تقدمون برامج تدريبية مجانية لموظفي الجامعة؟" value={formData.q4_4_exitClause} {...inputProps('q4_4_exitClause')} />
              <QuestionBox id="q4_5_liability" label="5. هل توافقون على حق الجامعة بفسخ العقد فورياً عند الإخلال الجوهري؟" value={formData.q4_5_liability} {...inputProps('q4_5_liability')} />
              <QuestionBox id="q4_6_jurisdiction" label="6. هل توافقون على تطبيق القانون العراقي النافذ، واختصاص محاكم محافظة بابل؟" value={formData.q4_6_jurisdiction} {...inputProps('q4_6_jurisdiction')} />
              <QuestionBox id="q4_7_auditRight" label="7. هل توافقون على اللجوء إلى التحكيم التجاري وفق الأنظمة العراقية؟" value={formData.q4_7_auditRight} {...inputProps('q4_7_auditRight')} />
              <QuestionBox id="q4_8_contractDuration" label="8. ما هي مدة العقد المقترحة؟ وما شروط التجديد والتعديل؟" value={formData.q4_8_contractDuration} {...inputProps('q4_8_contractDuration')} />
              <QuestionBox id="q4_9_renewal" label="9. ما هي آلية استقبال ومعالجة شكاوى الطلبة؟ وما الحد الأقصى للمدة؟" value={formData.q4_9_renewal} {...inputProps('q4_9_renewal')} />
              <QuestionBox id="q4_10_blacklist" label="10. هل الشركة مسجلة ضمن القائمة السوداء حسب اعمامات البنك المركزي العراقي أو محظور التعامل معها داخل او خارج العراق؟" value={formData.q4_10_blacklist} {...inputProps('q4_10_blacklist')} />
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="خامساً: الخدمات الإضافية والميزات التنافسية (8 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q5_1_extraFeatures" label="1. هل تقدمون تطبيق هاتفي (iOS/Android)؟ ما الخدمات المتاحة فيه؟" value={formData.q5_1_extraFeatures} {...inputProps('q5_1_extraFeatures')} />
              <QuestionBox id="q5_2_innovation" label="2. هل تقدمون خدمات مصرفية إضافية مثل: محفظة رقمية، صرف راتب إلكتروني؟" value={formData.q5_2_innovation} {...inputProps('q5_2_innovation')} />
              <QuestionBox id="q5_3_scholarships" label="3. ما الحد الأقصى لعدد المعاملات اليومية التي يستطيع نظامكم معالجتها؟" value={formData.q5_3_scholarships} {...inputProps('q5_3_scholarships')} />
              <QuestionBox id="q5_4_staffTraining" label="4. هل تقدمون الدعم (Sponsor) لتغطية تكاليف الفعاليات والمؤتمرات العلمية؟" value={formData.q5_4_staffTraining} {...inputProps('q5_4_staffTraining')} />
              <QuestionBox id="q5_5_posUpdates" label="5. هل هنالك تحديث دوري لأجهزة PoS والأنظمة الإلكترونية؟" value={formData.q5_5_posUpdates} {...inputProps('q5_5_posUpdates')} />
              <QuestionBox id="q5_6_foreignPayments" label="6. هل هنالك إمكانية تسديد أجور بعملة الدولار إلى مصارف خارج البلد؟" value={formData.q5_6_foreignPayments} {...inputProps('q5_6_foreignPayments')} />
              <QuestionBox id="q5_7_complaints" label="7. هل تقدمون أي ميزات إضافية أو عروض تنافسية لصالح جامعة بابل تحديداً؟" value={formData.q5_7_complaints} {...inputProps('q5_7_complaints')} />
              <QuestionBox id="q5_8_socialResp" label="8. ذكر المؤسسات الحكومية المخدَّمة حالياً، وما هي التي تتعامل مع مصرف الرشيد؟" value={formData.q5_8_socialResp} {...inputProps('q5_8_socialResp')} />
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="سادساً: المرفقات والملاحظات" />
            <div className={`bg-white p-12 rounded-[2rem] border-4 border-dashed transition-all flex flex-col items-center text-center ${errors.includes('documentUrl') ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}>
              <FileCheck className={`w-20 h-20 mb-6 opacity-20 ${errors.includes('documentUrl') ? 'text-red-500' : 'text-blue-900'}`} />
              <h4 className={`text-xl font-black mb-2 ${errors.includes('documentUrl') ? 'text-red-900' : 'text-blue-950'}`}>تحميل عرض الشركة الفني والمالي (PDF)</h4>
              <p className="text-xs text-gray-400 mb-8 font-bold">يرجى رفع ملف واحد يحتوي على كافة المخططات والإجازات</p>
              
              {formData.documentUrl ? (
                <div className="bg-emerald-50 px-8 py-4 rounded-2xl flex items-center gap-4">
                  <span className="text-emerald-700 font-black text-sm">تم رفع المستند بنجاح ✓</span>
                  <button onClick={() => setFormData(p => ({...p, documentUrl: ''}))} className="text-red-500 text-xs font-bold underline">حذف</button>
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
      case 9:
        return (
          <div className="space-y-10 animate-fade-in py-10">
            <div className="max-w-2xl mx-auto text-center">
               <ShieldCheck className="w-24 h-24 text-blue-900 mx-auto mb-8" />
               <h3 className="text-3xl font-black text-blue-950 mb-4">المصادقة والتوقيع النهائي</h3>
               <p className="text-gray-500 font-bold mb-12">يرجى كتابة الاسم الكامل والصفة الوظيفية للمسؤول المخول بالتوقيع قبل إرسال العرض نهائياً.</p>
               
               <div className="space-y-6 text-right">
                  <InputField label="اسم المفوض بالتوقيع" value={formData.signedBy} {...inputProps('signedBy')} />
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
                         : "بمجرد الضغط على \"إرسال العرض نهائياً\"، تقر الشركة بصحة كافة البيانات المذكورة أعلاه. يمكنك تعديل العرض لاحقاً طالما لم يقم المسؤول بتأييد استلام الطلب."
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
      default: return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-arabic" dir="rtl">
      {/* Hidden Print Template */}
      <div className="hidden print:block w-full bg-white">
        <PrintTemplate isBlank={true} />
      </div>

      <header className="bg-white border-b sticky top-0 z-50 print:hidden">
        {isReceived && (
          <div className="bg-red-600 text-white text-center py-2 text-[10px] font-black uppercase tracking-widest">
            تم تأييد الاستلام - هذا العرض مقفل للمراجعة النهائية ولا يمكن تعديله
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
                 <span className="text-lg font-black text-blue-900">{Math.round((currentStep/9)*100)}%</span>
               </div>
               <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-900 transition-all duration-500" style={{width: `${(currentStep/9)*100}%`}}></div>
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
              <button onClick={() => setShowSuccess(false)} className="bg-blue-900 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-blue-100">عرض البيانات المرسلة</button>
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
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setCurrentStep(p => Math.max(1, p-1))} className="px-10 py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-all">السابق</button>
                    {!isReceived && (
                      <div className="flex gap-2">
                        <button type="button" onClick={saveDraft} className="px-10 py-4 bg-white border border-blue-900 text-blue-900 rounded-2xl font-black hover:bg-blue-50 transition-all">{isSaved ? 'تم الحفظ ✓' : 'حفظ كمسودة'}</button>
                        <button 
                          type="button" 
                          onClick={handleDownloadBlankForm} 
                          title="تحميل الاستمارة فارغة للمطالعة"
                          className="px-6 py-4 bg-blue-50 text-blue-900 rounded-2xl hover:bg-blue-900 hover:text-white transition-all border border-blue-100 shadow-sm flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          <span className="text-xs font-black">تحميل الاستمارة فارغة (للاطلاع)</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4 w-full md:w-auto">
                    {currentStep < 8 ? (
                      <button type="button" onClick={() => goToStep(currentStep + 1)} className="w-full md:w-auto px-12 py-4 bg-blue-950 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-900 transition-all">الخطوة التالية <ChevronLeft className="w-5 h-5" /></button>
                    ) : currentStep === 8 ? (
                      <button type="button" onClick={() => { if(validateStep(8)) setShowReview(true); }} className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 transition-all">مراجعة كافة البيانات <FileCheck className="w-5 h-5" /></button>
                    ) : (
                      !isReceived && (
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
      <label className={`text-[11px] font-black uppercase tracking-widest block ${error ? 'text-red-500' : 'text-gray-400'}`}>{label}</label>
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

const QuestionBox = ({ id, label, value, onChange, disabled, error }) => (
  <div className={`p-8 rounded-[2.5rem] border-2 transition-all group shadow-sm ${error ? 'bg-red-50/50 border-red-200' : 'bg-gray-50/30 border-transparent hover:border-blue-50 hover:bg-white'}`}>
    <div className="flex justify-between items-start mb-4">
      <label className={`block text-sm font-black leading-relaxed ${error ? 'text-red-900' : 'text-blue-950 group-hover:text-blue-900'}`}>{label}</label>
      {error && <span className="text-[10px] bg-red-500 text-white px-3 py-1 rounded-full font-black shrink-0 animate-bounce">إجابة مطلوبة</span>}
    </div>
    <textarea 
      name={id} 
      value={value} 
      onChange={onChange} 
      disabled={disabled}
      className={`w-full h-40 p-6 rounded-2xl border-2 focus:ring-4 outline-none font-bold transition-all text-sm bg-white ${error ? 'border-red-200 focus:border-red-500 ring-red-50' : 'border-gray-100 focus:border-blue-900 ring-blue-50'}`} 
    />
  </div>
);

export default Dashboard;
