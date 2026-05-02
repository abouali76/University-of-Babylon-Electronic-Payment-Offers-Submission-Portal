import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Save, Send, LogOut, 
  CheckCircle2, AlertCircle, Building2, User, 
  Phone, Mail, FileCheck, ShieldCheck, HelpCircle 
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PrintTemplate from '../components/PrintTemplate';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
    { id: 1, title: 'المعلومات العامة', theme: 'theme-blue' },
    { id: 2, title: 'الالتزامات التشغيلية', theme: 'theme-emerald' },
    { id: 3, title: 'النظام الإلكتروني', theme: 'theme-indigo' },
    { id: 4, title: 'الأمن السيبراني', theme: 'theme-purple' },
    { id: 5, title: 'الضمانات والبيانات', theme: 'theme-amber' },
    { id: 6, title: 'الالتزامات القانونية', theme: 'theme-rose' },
    { id: 7, title: 'الخدمات الإضافية', theme: 'theme-cyan' },
    { id: 8, title: 'المرفقات والملاحظات', theme: 'theme-teal' },
    { id: 9, title: 'التوقيع والمصادقة', theme: 'theme-slate' }
  ];

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

      const username = session.user.user_metadata?.username || (session.user.email || '').split('@')[0];
      const name = session.user.user_metadata?.display_name || session.user.user_metadata?.name || username;
      const currentUser = { username, name, role, userId: session.user.id };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      setUser(currentUser);
      await fetchSubmission(session.user.id);
    };

    boot().catch((e) => {
      console.error('Boot error:', e);
      navigate('/login');
    });
  }, [navigate]);

  const fetchSubmission = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('status, data, document_path')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data?.data) {
        setFormData(prev => ({
          ...prev,
          ...(data.data || {}),
          documentUrl: data.document_path || ''
        }));
        if (data.status === 'final') {
          setIsSubmitted(true);
          setShowSuccess(true);
        }
      }
    } catch (err) {
      console.error('Error fetching submission:', err);
    }
  };

  const handleInputChange = (e) => {
    if (isSubmitted) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
    if (errors.includes(name)) {
      setErrors(prev => prev.filter(f => f !== name));
    }
  };

  const handleFileUpload = async (e) => {
    if (isSubmitted) return;
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
      alert('حدث خطأ أثناء رفع المستند. يرجى التأكد من أن الملف بصيغة PDF وأقل من 10 ميغابايت.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    try {
      const payload = {
        user_id: user.userId,
        username: user.username,
        status: 'draft',
        data: { ...formData },
        document_path: formData.documentUrl || null
      };

      const { error } = await supabase
        .from('submissions')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('فشل حفظ المسودة.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitted) return;

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: user.userId,
        username: user.username,
        status: 'final',
        data: { ...formData },
        document_path: formData.documentUrl || null
      };

      const { error } = await supabase
        .from('submissions')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      setIsSubmitted(true);
      setShowSuccess(true);
      alert('تم إرسال العرض بنجاح. شكراً لكم!');
    } catch (err) {
      console.error('Submit error:', err);
      alert('حدث خطأ أثناء الإرسال.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('currentUser');
    navigate('/login');
    window.location.reload();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold border-r-4 pr-4 mb-6 section-card p-4 rounded-xl shadow-sm" style={{ color: 'var(--theme-color)' }}>أولاً: المعلومات العامة والخبرات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="اسم الشركة" name="companyName" value={formData.companyName} onChange={handleInputChange} />
              <InputField label="تاريخ تقديم العرض" type="date" name="submissionDate" value={formData.submissionDate} onChange={handleInputChange} />
              <InputField label="اسم ممثل الشركة" name="representativeName" value={formData.representativeName} onChange={handleInputChange} />
              <InputField label="رقم الهاتف" name="phone" value={formData.phone} onChange={handleInputChange} />
              <InputField label="البريد الإلكتروني" type="email" name="email" value={formData.email} onChange={handleInputChange} />
              <InputField label="رقم إجازة البنك المركزي" name="centralBankLicense" value={formData.centralBankLicense} onChange={handleInputChange} />
              <InputField label="سنوات الخبرة في السوق العراقي" name="marketExperience" value={formData.marketExperience} onChange={handleInputChange} />
              <InputField label="عدد المؤسسات الحكومية المخدَّمة حالياً" type="number" name="govInstitutionsCount" value={formData.govInstitutionsCount} onChange={handleInputChange} />
              <InputField label="رأس المال المدفوع / الملاءة المالية" name="paidCapital" value={formData.paidCapital} onChange={handleInputChange} />
              <InputField label="العنوان الرسمي / المقر الرئيسي" name="officialAddress" value={formData.officialAddress} onChange={handleInputChange} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold border-r-4 pr-4 mb-6 section-card p-4 rounded-xl shadow-sm" style={{ color: 'var(--theme-color)' }}>ثانياً: الالتزامات التشغيلية والمالية (8 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionBox id="q2_1_settlement" label="1. ما هي الآلية المعتمدة لإجراء التسوية المالية (المقاصة) مع مصرف الرشيد؟ وهل تلتزمون بالإيداع خلال 12 ساعة عمل؟" value={formData.q2_1_settlement} onChange={handleInputChange} />
              <QuestionBox id="q2_2_commissions" label="2. ما هي نسب العمولات والخصومات المقترحة؟ وهل توافقون على مراجعتها دورياً وإشعار الجامعة قبل 30 يوماً من أي تعديل؟" value={formData.q2_2_commissions} onChange={handleInputChange} />
              <QuestionBox id="q2_3_intermediary" label="3. هل يوجد وسيط (مصرف آخر) لنقل المبالغ أم مباشرة؟ يرجى ذكر تفاصيل سير الحركات المالية." value={formData.q2_3_intermediary} onChange={handleInputChange} />
              <QuestionBox id="q2_4_delayPenalty" label="4. ما قيمة غرامة التأخير المقترحة عن كل ساعة تجاوز مدة التسوية المتفق عليها؟" value={formData.q2_4_delayPenalty} onChange={handleInputChange} />
              <QuestionBox id="q2_5_atmCommitment" label="5. هل تلتزمون بتوفير جهاز صراف آلي (ATM) يملأ دائماً داخل الجامعة؟" value={formData.q2_5_atmCommitment} onChange={handleInputChange} />
              <QuestionBox id="q2_6_studentCards" label="6. ما هي تفاصيل إصدار بطاقات الطلبة؟ (رسوم الإصدار، التجديد، بدل الضائع، مدة الإصدار)" value={formData.q2_6_studentCards} onChange={handleInputChange} />
              <QuestionBox id="q2_7_chargingCenters" label="7. هل توفرون مراكز تعبئة كافية داخل الكليات؟ وما هي ساعات العمل المقترحة لها؟" value={formData.q2_7_chargingCenters} onChange={handleInputChange} />
              <QuestionBox id="q2_8_posCommitment" label="8. هل تلتزمون بتجهيز نقاط البيع (PoS) والورق الحراري مجاناً؟ وما هو زمن الاستجابة للصيانة (SLA)؟" value={formData.q2_8_posCommitment} onChange={handleInputChange} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold border-r-4 pr-4 mb-6 section-card p-4 rounded-xl shadow-sm" style={{ color: 'var(--theme-color)' }}>ثالثاً: أ- النظام الإلكتروني والتكامل (6 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionBox id="q3a_1_integratedSystem" label="1. هل يتوفر لديكم نظام إلكتروني متكامل يُبيّن جميع الحركات المالية؟" value={formData.q3a_1_integratedSystem} onChange={handleInputChange} />
              <QuestionBox id="q3a_2_techSpecs" label="2. هل يمكن إصدار بطاقات خاصة بكل كلية أو وحدة إدارية بدون عمولات تحويل داخلية؟" value={formData.q3a_2_techSpecs} onChange={handleInputChange} />
              <QuestionBox id="q3a_3_appSupport" label="3. هل يمكن للجامعة الحصول على كشف حساب لحظي (Real-time) في أي وقت؟" value={formData.q3a_3_appSupport} onChange={handleInputChange} />
              <QuestionBox id="q3a_4_webIntegration" label="4. هل يمكن تحقيق تكامل إلكتروني مع موقع الجامعة يتيح التسديد عبر رابط آمن أو QR كود؟" value={formData.q3a_4_webIntegration} onChange={handleInputChange} />
              <QuestionBox id="q3a_5_reporting" label="5. هل توفرون خدمة التحويلات خارج العراق؟ يرجى بيان العمولات والحدود اليومية." value={formData.q3a_5_reporting} onChange={handleInputChange} />
              <QuestionBox id="q3a_6_training" label="6. هل يتوفر رقم IBAN لكل بطاقة؟ وهل هو متوافق مع معايير الدفع الدولية؟" value={formData.q3a_6_training} onChange={handleInputChange} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold border-r-4 pr-4 mb-6 section-card p-4 rounded-xl shadow-sm" style={{ color: 'var(--theme-color)' }}>ثالثاً: ب- الأمن السيبراني والاستمرارية (8 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionBox id="q3b_1_certificates" label="1. ما هي شهادات الأمن المعتمدة لديكم؟ (PCI-DSS / ISO 27001 / غيرها)" value={formData.q3b_1_certificates} onChange={handleInputChange} />
              <QuestionBox id="q3b_2_encryption" label="2. ما هو بروتوكول التشفير المستخدم في المعاملات؟" value={formData.q3b_2_encryption} onChange={handleInputChange} />
              <QuestionBox id="q3b_3_rto_bcp" label="3. ما هو الحد الأقصى لوقت استعادة الخدمة عند الانقطاع (RTO)؟" value={formData.q3b_3_rto_bcp} onChange={handleInputChange} />
              <QuestionBox id="q3b_4_backups" label="4. هل توفرون نسخاً احتياطية يومية للبيانات؟ أين تُخزَّن؟" value={formData.q3b_4_backups} onChange={handleInputChange} />
              <QuestionBox id="q3b_5_supportSla" label="5. ما هو نظام الدعم الفني؟ هل يتوفر على مدار الساعة (24/7)؟" value={formData.q3b_5_supportSla} onChange={handleInputChange} />
              <QuestionBox id="q3b_6_penTest" label="6. هل تُجرون اختبارات اختراق أمني (Penetration Testing) دورية؟" value={formData.q3b_6_penTest} onChange={handleInputChange} />
              <QuestionBox id="q3b_7_monitoring" label="7. ما هي سياسة شركتكم في الاحتفاظ بالبيانات؟ (المدة الزمنية، مكان التخزين)" value={formData.q3b_7_monitoring} onChange={handleInputChange} />
              <QuestionBox id="q3b_8_incident" label="8. ما هي طرائق الاتصالات المستخدمة وهل تحتاج انترنت؟" value={formData.q3b_8_incident} onChange={handleInputChange} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold border-r-4 pr-4 mb-6 section-card p-4 rounded-xl shadow-sm" style={{ color: 'var(--theme-color)' }}>رابعاً: أ- الضمانات وملكية البيانات (3 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionBox id="q4_1_bankGuarantee" label="1. خطاب الضمان المصرفي: هل تقدمون خطاب ضمان مصرفي غير مشروط لصالح الجامعة؟" value={formData.q4_1_bankGuarantee} onChange={handleInputChange} />
              <QuestionBox id="q4_2_penaltyClause" label="2. سرية البيانات: هل تلتزمون بسرية البيانات وتوقيع اتفاقية (NDA) رسمية؟" value={formData.q4_2_penaltyClause} onChange={handleInputChange} />
              <QuestionBox id="q4_3_dataOwnership" label="3. ملكية البيانات واستردادها: هل توافقون على أن ملكية البيانات تعود للجامعة حصراً؟" value={formData.q4_3_dataOwnership} onChange={handleInputChange} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold border-r-4 pr-4 mb-6 section-card p-4 rounded-xl shadow-sm" style={{ color: 'var(--theme-color)' }}>رابعاً: ب- الالتزامات القانونية والتعاقدية (6 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionBox id="q4_4_exitClause" label="4. هل تقدمون برامج تدريبية مجانية لموظفي الجامعة؟" value={formData.q4_4_exitClause} onChange={handleInputChange} />
              <QuestionBox id="q4_5_liability" label="5. هل توافقون على حق الجامعة بفسخ العقد فورياً عند الإخلال الجوهري؟" value={formData.q4_5_liability} onChange={handleInputChange} />
              <QuestionBox id="q4_6_jurisdiction" label="6. هل توافقون على تطبيق القانون العراقي النافذ، واختصاص محاكم محافظة بابل؟" value={formData.q4_6_jurisdiction} onChange={handleInputChange} />
              <QuestionBox id="q4_7_auditRight" label="7. هل توافقون على اللجوء إلى التحكيم التجاري وفق الأنظمة العراقية؟" value={formData.q4_7_auditRight} onChange={handleInputChange} />
              <QuestionBox id="q4_8_contractDuration" label="8. ما هي مدة العقد المقترحة؟ وما شروط التجديد والتعديل؟" value={formData.q4_8_contractDuration} onChange={handleInputChange} />
              <QuestionBox id="q4_9_renewal" label="9. ما هي آلية استقبال ومعالجة شكاوى الطلبة؟ وما الحد الأقصى للمدة؟" value={formData.q4_9_renewal} onChange={handleInputChange} />
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold border-r-4 pr-4 mb-6 section-card p-4 rounded-xl shadow-sm" style={{ color: 'var(--theme-color)' }}>خامساً: الخدمات الإضافية والميزات التنافسية (8 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionBox id="q5_1_extraFeatures" label="1. هل تقدمون تطبيق هاتفي (iOS/Android)؟ ما الخدمات المتاحة فيه؟" value={formData.q5_1_extraFeatures} onChange={handleInputChange} />
              <QuestionBox id="q5_2_innovation" label="2. هل تقدمون خدمات مصرفية إضافية مثل: محفظة رقمية، صرف راتب إلكتروني؟" value={formData.q5_2_innovation} onChange={handleInputChange} />
              <QuestionBox id="q5_3_scholarships" label="3. ما الحد الأقصى لعدد المعاملات اليومية التي يستطيع نظامكم معالجتها؟" value={formData.q5_3_scholarships} onChange={handleInputChange} />
              <QuestionBox id="q5_4_staffTraining" label="4. هل تقدمون الدعم (Sponsor) لتغطية تكاليف الفعاليات والمؤتمرات العلمية؟" value={formData.q5_4_staffTraining} onChange={handleInputChange} />
              <QuestionBox id="q5_5_posUpdates" label="5. هل هنالك تحديث دوري لأجهزة PoS والأنظمة الإلكترونية؟" value={formData.q5_5_posUpdates} onChange={handleInputChange} />
              <QuestionBox id="q5_6_foreignPayments" label="6. هل هنالك إمكانية تسديد أجور بعملة الدولار إلى مصارف خارج البلد؟" value={formData.q5_6_foreignPayments} onChange={handleInputChange} />
              <QuestionBox id="q5_7_complaints" label="7. هل تقدمون أي ميزات إضافية أو عروض تنافسية لصالح جامعة بابل تحديداً؟" value={formData.q5_7_complaints} onChange={handleInputChange} />
              <QuestionBox id="q5_8_socialResp" label="8. ذكر المؤسسات الحكومية المخدَّمة حالياً، وما هي التي تتعامل مع مصرف الرشيد؟" value={formData.q5_8_socialResp} onChange={handleInputChange} />
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold border-r-4 pr-4 mb-6 section-card p-4 rounded-xl shadow-sm" style={{ color: 'var(--theme-color)' }}>سادساً: المرفقات والملاحظات (اختياري)</h3>
            <div className="bg-white p-10 rounded-[2.5rem] border-4 border-dashed border-teal-100 flex flex-col items-center">
              <FileCheck className="w-16 h-16 text-teal-600 mb-4" />
              <h4 className="text-xl font-black mb-2">إرفاق المستندات (PDF)</h4>
              {formData.documentUrl ? (
                <div className="flex gap-4 items-center">
                  <span className="text-emerald-600 font-bold">تم الرفع ✓</span>
                  <button onClick={() => setFormData(p => ({...p, documentUrl: ''}))} className="text-red-500 text-xs underline">حذف</button>
                </div>
              ) : (
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="text-sm" />
              )}
            </div>
            <textarea 
              name="additionalNotes"
              placeholder="ملاحظات إضافية..."
              className="w-full h-40 p-6 rounded-3xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-teal-200 outline-none font-bold"
              value={formData.additionalNotes}
              onChange={handleInputChange}
            />
          </div>
        );
      case 9:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold border-r-4 pr-4 mb-6 section-card p-4 rounded-xl shadow-sm" style={{ color: 'var(--theme-color)' }}>تاسعاً: التوقيع والمصادقة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="اسم المفوض بالتوقيع" name="signedBy" value={formData.signedBy} onChange={handleInputChange} />
              <InputField label="الصفة الوظيفية" name="position" value={formData.position} onChange={handleInputChange} />
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col ${steps[currentStep-1].theme}`}>
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white p-1 rounded-xl shadow-sm border">
              <img src="./logo.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-black text-blue-950 hidden md:block">استمارة التقديم الإلكتروني - جامعة بابل</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-600">{user.name}</span>
            <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <div className="flex-grow flex max-w-7xl mx-auto w-full p-6 gap-6">
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-4">
          <nav className="bg-white rounded-3xl border shadow-sm p-3 space-y-1">
            {steps.map(s => (
              <button 
                key={s.id} 
                onClick={() => setCurrentStep(s.id)}
                className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs transition-all ${currentStep === s.id ? 'sidebar-item-active' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {s.title}
              </button>
            ))}
          </nav>
          <div className="bg-blue-900 rounded-3xl p-6 text-white shadow-lg">
            <p className="text-[10px] font-black uppercase opacity-60 mb-1">نسبة الإكمال</p>
            <p className="text-3xl font-black">{Math.round((currentStep/9)*100)}%</p>
            <div className="h-1.5 w-full bg-white/20 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-white" style={{width: `${(currentStep/9)*100}%`}}></div>
            </div>
          </div>
        </aside>

        <main className="flex-grow">
          {showSuccess ? (
            <div className="bg-white rounded-[3rem] p-12 text-center border shadow-xl">
              <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
              <h2 className="text-2xl font-black mb-4">تم الإرسال بنجاح</h2>
              <button onClick={() => setShowSuccess(false)} className="px-8 py-3 bg-blue-900 text-white rounded-xl font-bold">عرض البيانات</button>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border shadow-xl flex flex-col min-h-[600px]">
              <form onSubmit={handleSubmit} className="p-8 flex flex-col flex-grow">
                <div className="flex-grow">{renderStepContent()}</div>
                <div className="mt-8 pt-8 border-t flex justify-between items-center">
                  <button type="button" onClick={() => setCurrentStep(p => Math.max(1, p-1))} className="px-6 py-3 bg-gray-100 rounded-xl font-bold">السابق</button>
                  <div className="flex gap-3">
                    <button type="button" onClick={saveDraft} className="px-6 py-3 border rounded-xl font-bold">{isSaved ? 'تم الحفظ ✓' : 'حفظ كمسودة'}</button>
                    {currentStep < 9 ? (
                      <button type="button" onClick={() => setCurrentStep(p => Math.min(9, p+1))} className="px-8 py-3 bg-blue-950 text-white rounded-xl font-bold flex items-center gap-2">التالي <ChevronLeft className="w-4 h-4" /></button>
                    ) : (
                      <button type="submit" disabled={isSubmitting} className="px-10 py-3 bg-blue-900 text-white rounded-xl font-black">{isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب النهائي'}</button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = 'text' }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-200 outline-none font-bold" />
  </div>
);

const QuestionBox = ({ id, label, value, onChange }) => (
  <div className="p-6 rounded-2xl bg-gray-50/50 border-2 border-transparent hover:border-indigo-100 hover:bg-white transition-all">
    <label className="block text-sm font-bold mb-3 text-blue-950">{label}</label>
    <textarea name={id} value={value} onChange={onChange} className="w-full h-32 p-4 rounded-xl border focus:ring-2 ring-indigo-50 outline-none font-bold" />
  </div>
);

export default Dashboard;
