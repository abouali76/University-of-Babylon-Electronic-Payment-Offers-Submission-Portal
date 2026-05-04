import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Save, Send, LogOut, 
  CheckCircle2, AlertCircle, Building2, User, 
  Phone, Mail, FileCheck, ShieldCheck, HelpCircle, ArrowRight, X
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PrintTemplate from '../components/PrintTemplate';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReceived, setIsReceived] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

      const username = currentUser.user_metadata?.username || localUser.username;
      
      const { data: sub, error: subError } = await supabase
        .from('submissions')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (subError) throw subError;

      if (sub) {
        setFormData(p => ({ ...p, ...sub.data, documentUrl: sub.document_path || p.documentUrl }));
        if (sub.status === 'final') setIsSubmitted(true);
        setIsReceived(!!sub.is_received);
      }
    };
    boot();
  }, [navigate]);

  const handleInputChange = (e) => {
    if (isReceived) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const payload = {
        user_id: user.userId || user.id,
        username: user.username,
        status: 'draft',
        data: { ...formData },
        document_path: formData.documentUrl || null,
        last_updated: new Date().toISOString()
      };

      // Ensure we update the existing record and check if it's locked
      const { data: existing } = await supabase
        .from('submissions')
        .select('id, is_received')
        .eq('username', user.username)
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

  const processFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);
    try {
      const payload = {
        user_id: user.userId || user.id,
        username: user.username,
        status: 'final',
        data: { ...formData },
        document_path: formData.documentUrl || null,
        last_updated: new Date().toISOString()
      };

      // Ensure we update the existing record and check if it's locked
      const { data: existing } = await supabase
        .from('submissions')
        .select('id, is_received')
        .eq('username', user.username)
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

  const renderStepContent = () => {
    const isLocked = isReceived; // Strictly lock based on admin confirmation
    const inputProps = { onChange: handleInputChange, disabled: isLocked };
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="أولاً: المعلومات العامة والخبرات" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputField label="اسم الشركة" name="companyName" value={formData.companyName} {...inputProps} />
              <InputField label="تاريخ تقديم العرض" type="date" name="submissionDate" value={formData.submissionDate} {...inputProps} />
              <InputField label="اسم ممثل الشركة" name="representativeName" value={formData.representativeName} {...inputProps} />
              <InputField label="رقم الهاتف المعتمد" name="phone" value={formData.phone} {...inputProps} />
              <InputField label="البريد الإلكتروني المعتمد" type="email" name="email" value={formData.email} {...inputProps} />
              <InputField label="رقم إجازة البنك المركزي العراقي" name="centralBankLicense" value={formData.centralBankLicense} {...inputProps} />
              <InputField label="سنوات الخبرة في السوق المحلي" name="marketExperience" value={formData.marketExperience} {...inputProps} />
              <InputField label="عدد المؤسسات الحكومية المخدَّمة حالياً" type="number" name="govInstitutionsCount" value={formData.govInstitutionsCount} {...inputProps} />
              <InputField label="رأس المال المدفوع / الملاءة المالية" name="paidCapital" value={formData.paidCapital} {...inputProps} />
              <InputField label="العنوان الرسمي / المقر الرئيسي" name="officialAddress" value={formData.officialAddress} {...inputProps} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="ثانياً: الالتزامات التشغيلية والمالية (8 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q2_1_settlement" label="1. ما هي الآلية المعتمدة لإجراء التسوية المالية (المقاصة) مع مصرف الرشيد؟ وهل تلتزمون بالإيداع خلال 12 ساعة عمل؟" value={formData.q2_1_settlement} {...inputProps} />
              <QuestionBox id="q2_2_commissions" label="2. ما هي نسب العمولات والخصومات المقترحة؟ وهل توافقون على مراجعتها دورياً وإشعار الجامعة قبل 30 يوماً من أي تعديل؟" value={formData.q2_2_commissions} {...inputProps} />
              <QuestionBox id="q2_3_intermediary" label="3. هل يوجد وسيط (مصرف آخر) لنقل المبالغ أم مباشرة؟ يرجى ذكر تفاصيل سير الحركات المالية." value={formData.q2_3_intermediary} {...inputProps} />
              <QuestionBox id="q2_4_delayPenalty" label="4. ما قيمة غرامة التأخير المقترحة عن كل ساعة تجاوز مدة التسوية المتفق عليها؟" value={formData.q2_4_delayPenalty} {...inputProps} />
              <QuestionBox id="q2_5_atmCommitment" label="5. هل تلتزمون بتوفير جهاز صراف آلي (ATM) يملأ دائماً داخل الجامعة؟" value={formData.q2_5_atmCommitment} {...inputProps} />
              <QuestionBox id="q2_6_studentCards" label="6. ما هي تفاصيل إصدار بطاقات الطلبة؟ (رسوم الإصدار، التجديد، بدل الضائع، مدة الإصدار)" value={formData.q2_6_studentCards} {...inputProps} />
              <QuestionBox id="q2_7_chargingCenters" label="7. هل توفرون مراكز تعبئة كافية داخل الكليات؟ وما هي ساعات العمل المقترحة لها؟" value={formData.q2_7_chargingCenters} {...inputProps} />
              <QuestionBox id="q2_8_posCommitment" label="8. هل تلتزمون بتجهيز نقاط البيع (PoS) والورق الحراري مجاناً؟ وما هو زمن الاستجابة للصيانة (SLA)؟" value={formData.q2_8_posCommitment} {...inputProps} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="ثالثاً: أ- النظام الإلكتروني والتكامل (6 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q3a_1_integratedSystem" label="1. هل يتوفر لديكم نظام إلكتروني متكامل يُبيّن جميع الحركات المالية؟" value={formData.q3a_1_integratedSystem} {...inputProps} />
              <QuestionBox id="q3a_2_techSpecs" label="2. هل يمكن إصدار بطاقات خاصة بكل كلية أو وحدة إدارية بدون عمولات تحويل داخلية؟" value={formData.q3a_2_techSpecs} {...inputProps} />
              <QuestionBox id="q3a_3_appSupport" label="3. هل يمكن للجامعة الحصول على كشف حساب لحظي (Real-time) في أي وقت؟" value={formData.q3a_3_appSupport} {...inputProps} />
              <QuestionBox id="q3a_4_webIntegration" label="4. هل يمكن تحقيق تكامل إلكتروني مع موقع الجامعة يتيح التسديد عبر رابط آمن أو QR كود؟" value={formData.q3a_4_webIntegration} {...inputProps} />
              <QuestionBox id="q3a_5_reporting" label="5. هل توفرون خدمة التحويلات خارج العراق؟ يرجى بيان العمولات والحدود اليومية." value={formData.q3a_5_reporting} {...inputProps} />
              <QuestionBox id="q3a_6_training" label="6. هل يتوفر رقم IBAN لكل بطاقة؟ وهل هو متوافق مع معايير الدفع الدولية؟" value={formData.q3a_6_training} {...inputProps} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="ثالثاً: ب- الأمن السيبراني والاستمرارية (8 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q3b_1_certificates" label="1. ما هي شهادات الأمن المعتمدة لديكم؟ (PCI-DSS / ISO 27001 / غيرها)" value={formData.q3b_1_certificates} {...inputProps} />
              <QuestionBox id="q3b_2_encryption" label="2. ما هو بروتوكول التشفير المستخدم في المعاملات؟" value={formData.q3b_2_encryption} {...inputProps} />
              <QuestionBox id="q3b_3_rto_bcp" label="3. ما هو الحد الأقصى لوقت استعادة الخدمة عند الانقطاع (RTO)؟" value={formData.q3b_3_rto_bcp} {...inputProps} />
              <QuestionBox id="q3b_4_backups" label="4. هل توفرون نسخاً احتياطية يومية للبيانات؟ أين تُخزَّن؟" value={formData.q3b_4_backups} {...inputProps} />
              <QuestionBox id="q3b_5_supportSla" label="5. ما هو نظام الدعم الفني؟ هل يتوفر على مدار الساعة (24/7)؟" value={formData.q3b_5_supportSla} {...inputProps} />
              <QuestionBox id="q3b_6_penTest" label="6. هل تُجرون اختبارات اختراق أمني (Penetration Testing) دورية؟" value={formData.q3b_6_penTest} {...inputProps} />
              <QuestionBox id="q3b_7_monitoring" label="7. ما هي سياسة شركتكم في الاحتفاظ بالبيانات؟ (المدة الزمنية، مكان التخزين)" value={formData.q3b_7_monitoring} {...inputProps} />
              <QuestionBox id="q3b_8_incident" label="8. ما هي طرائق الاتصالات المستخدمة وهل تحتاج انترنت؟" value={formData.q3b_8_incident} {...inputProps} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="رابعاً: أ- الضمانات وملكية البيانات (3 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q4_1_bankGuarantee" label="1. خطاب الضمان المصرفي: هل تقدمون خطاب ضمان مصرفي غير مشروط لصالح الجامعة؟" value={formData.q4_1_bankGuarantee} {...inputProps} />
              <QuestionBox id="q4_2_penaltyClause" label="2. سرية البيانات: هل تلتزمون بسرية البيانات وتوقيع اتفاقية (NDA) رسمية؟" value={formData.q4_2_penaltyClause} {...inputProps} />
              <QuestionBox id="q4_3_dataOwnership" label="3. ملكية البيانات واستردادها: هل توافقون على أن ملكية البيانات تعود للجامعة حصراً؟" value={formData.q4_3_dataOwnership} {...inputProps} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="رابعاً: ب- الالتزامات القانونية والتعاقدية (6 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q4_4_exitClause" label="4. هل تقدمون برامج تدريبية مجانية لموظفي الجامعة؟" value={formData.q4_4_exitClause} {...inputProps} />
              <QuestionBox id="q4_5_liability" label="5. هل توافقون على حق الجامعة بفسخ العقد فورياً عند الإخلال الجوهري؟" value={formData.q4_5_liability} {...inputProps} />
              <QuestionBox id="q4_6_jurisdiction" label="6. هل توافقون على تطبيق القانون العراقي النافذ، واختصاص محاكم محافظة بابل؟" value={formData.q4_6_jurisdiction} {...inputProps} />
              <QuestionBox id="q4_7_auditRight" label="7. هل توافقون على اللجوء إلى التحكيم التجاري وفق الأنظمة العراقية؟" value={formData.q4_7_auditRight} {...inputProps} />
              <QuestionBox id="q4_8_contractDuration" label="8. ما هي مدة العقد المقترحة؟ وما شروط التجديد والتعديل؟" value={formData.q4_8_contractDuration} {...inputProps} />
              <QuestionBox id="q4_9_renewal" label="9. ما هي آلية استقبال ومعالجة شكاوى الطلبة؟ وما الحد الأقصى للمدة؟" value={formData.q4_9_renewal} {...inputProps} />
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="خامساً: الخدمات الإضافية والميزات التنافسية (8 أسئلة)" />
            <div className="space-y-6">
              <QuestionBox id="q5_1_extraFeatures" label="1. هل تقدمون تطبيق هاتفي (iOS/Android)؟ ما الخدمات المتاحة فيه؟" value={formData.q5_1_extraFeatures} {...inputProps} />
              <QuestionBox id="q5_2_innovation" label="2. هل تقدمون خدمات مصرفية إضافية مثل: محفظة رقمية، صرف راتب إلكتروني؟" value={formData.q5_2_innovation} {...inputProps} />
              <QuestionBox id="q5_3_scholarships" label="3. ما الحد الأقصى لعدد المعاملات اليومية التي يستطيع نظامكم معالجتها؟" value={formData.q5_3_scholarships} {...inputProps} />
              <QuestionBox id="q5_4_staffTraining" label="4. هل تقدمون الدعم (Sponsor) لتغطية تكاليف الفعاليات والمؤتمرات العلمية؟" value={formData.q5_4_staffTraining} {...inputProps} />
              <QuestionBox id="q5_5_posUpdates" label="5. هل هنالك تحديث دوري لأجهزة PoS والأنظمة الإلكترونية؟" value={formData.q5_5_posUpdates} {...inputProps} />
              <QuestionBox id="q5_6_foreignPayments" label="6. هل هنالك إمكانية تسديد أجور بعملة الدولار إلى مصارف خارج البلد؟" value={formData.q5_6_foreignPayments} {...inputProps} />
              <QuestionBox id="q5_7_complaints" label="7. هل تقدمون أي ميزات إضافية أو عروض تنافسية لصالح جامعة بابل تحديداً؟" value={formData.q5_7_complaints} {...inputProps} />
              <QuestionBox id="q5_8_socialResp" label="8. ذكر المؤسسات الحكومية المخدَّمة حالياً، وما هي التي تتعامل مع مصرف الرشيد؟" value={formData.q5_8_socialResp} {...inputProps} />
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="سادساً: المرفقات والملاحظات" />
            <div className="bg-white p-12 rounded-[2rem] border-4 border-dashed border-gray-100 flex flex-col items-center text-center">
              <FileCheck className="w-20 h-20 text-blue-900 mb-6 opacity-20" />
              <h4 className="text-xl font-black text-blue-950 mb-2">تحميل عرض الشركة الفني والمالي (PDF)</h4>
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
            </div>
            
            <div className="mt-10">
              <label className="block text-sm font-black text-blue-950 mb-4">ملاحظات إضافية ترغب الشركة بإضافتها:</label>
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
                  <InputField label="اسم المفوض بالتوقيع" name="signedBy" value={formData.signedBy} {...inputProps} />
                  <InputField label="الصفة الوظيفية للموقع" name="position" value={formData.position} {...inputProps} />
               </div>

               <div className="mt-12 p-8 bg-amber-50 rounded-[2rem] border border-amber-100 text-right">
                 <div className="flex items-start gap-4">
                   <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                   <p className="text-xs text-amber-800 font-bold leading-relaxed">{isSubmitted && !isReceived 
                        ? "لقد قمت بإرسال العرض مسبقاً، ولكن يمكنك تحديث البيانات طالما لم يتم تأييد الاستلام من قبل الجامعة. سيؤدي الضغط على تحديث العرض إلى تحديث البيانات المرسلة حالياً."
                        : "بمجرد الضغط على \"إرسال العرض نهائياً\"، تقر الشركة بصحة كافة البيانات المذكورة أعلاه. يمكنك تعديل العرض لاحقاً طالما لم يقم المسؤول بتأييد استلام الطلب."
                      }</p>
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
      <header className="bg-white border-b sticky top-0 z-50">
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

      <div className="flex-grow flex max-w-7xl mx-auto w-full p-6 md:p-10 gap-10">
        <aside className="hidden lg:flex flex-col w-72 shrink-0">
          <div className="bg-white rounded-[2.5rem] border shadow-sm p-4 sticky top-28">
            <p className="px-4 py-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">أقسام الاستمارة</p>
            <nav className="space-y-1">
              {steps.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setCurrentStep(s.id)}
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
              <h2 className="text-3xl font-black text-blue-950 mb-4">{isSubmitted && !isReceived ? 'تم تحديث العرض بنجاح' : 'تم إرسال العرض بنجاح'}</h2>
              <p className="text-gray-500 font-bold mb-10 max-w-md mx-auto text-sm leading-relaxed">
                {isReceived 
                  ? 'تم تأييد استلام عرضكم من قبل اللجنة بنجاح. العرض الآن في مرحلة المراجعة النهائية ولا يمكن تعديله.'
                  : 'شكراً لكم، تم استلام عرضكم بنجاح. يمكنك تعديل البيانات في أي وقت طالما لم يتم تأييد الاستلام من قبل اللجنة.'
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
                      <button type="button" onClick={saveDraft} className="px-10 py-4 bg-white border border-blue-900 text-blue-900 rounded-2xl font-black hover:bg-blue-50 transition-all">{isSaved ? 'تم الحفظ ✓' : 'حفظ كمسودة'}</button>
                    )}
                  </div>
                  
                  <div className="flex gap-4 w-full md:w-auto">
                    {currentStep < 9 ? (
                      <button type="button" onClick={() => setCurrentStep(p => Math.min(9, p+1))} className="w-full md:w-auto px-12 py-4 bg-blue-950 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-900 transition-all">الخطوة التالية <ChevronLeft className="w-5 h-5" /></button>
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

const InputField = ({ label, name, value, onChange, type = 'text', disabled }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block pr-2">{label}</label>
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      disabled={disabled}
      onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }}
      className="w-full p-5 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:bg-white focus:border-blue-900 outline-none font-bold transition-all text-sm" 
    />
  </div>
);

const QuestionBox = ({ id, label, value, onChange, disabled }) => (
  <div className="p-8 rounded-[2.5rem] bg-gray-50/30 border-2 border-transparent hover:border-blue-50 hover:bg-white transition-all group shadow-sm">
    <label className="block text-sm font-black mb-4 text-blue-950 leading-relaxed group-hover:text-blue-900">{label}</label>
    <textarea 
      name={id} 
      value={value} 
      onChange={onChange} 
      disabled={disabled}
      className="w-full h-40 p-6 rounded-2xl border-2 border-gray-100 focus:border-blue-900 focus:ring-4 ring-blue-50 outline-none font-bold transition-all text-sm bg-white" 
    />
  </div>
);

export default Dashboard;
