import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, Send, LogOut, CheckCircle2, AlertCircle, Building2, User, Phone, Mail, FileCheck, ShieldCheck, HelpCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PrintTemplate from '../components/PrintTemplate';
import { exportToPdf } from '../utils/exportPdf';

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
// ... existing fields ...
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
    q5_5_mobileApp: '',
    q5_6_foreignStudents: '',
    q5_7_complaints: '',
    q5_8_socialResp: '',
    additionalNotes: '',
    signedBy: '',
    position: '',
    documentUrl: ''
  });

  const mapToDb = (data) => {
    const specialMappings = {
      documentUrl: 'document_url',
    };
    
    const result = {};
    for (const key in data) {
      const dbKey = specialMappings[key] || key.toLowerCase();
      result[dbKey] = data[key];
    }
    return result;
  };

  const mapFromDb = (data) => {
    if (!data) return {};
    
    const toCamelMap = {
      companyname: 'companyName',
      submissiondate: 'submissionDate',
      representativename: 'representativeName',
      centralbanklicense: 'centralBankLicense',
      marketexperience: 'marketExperience',
      govinstitutionscount: 'govInstitutionsCount',
      paidcapital: 'paidCapital',
      officialaddress: 'officialAddress',
      additionalnotes: 'additionalNotes',
      signedby: 'signedBy',
      lastupdated: 'lastUpdated',
      document_url: 'documentUrl',
      q2_4_delaypenalty: 'q2_4_delayPenalty',
      q2_5_atmcommitment: 'q2_5_atmCommitment',
      q2_6_studentcards: 'q2_6_studentCards',
      q2_7_chargingcenters: 'q2_7_chargingCenters',
      q2_8_poscommitment: 'q2_8_posCommitment',
      q3a_1_integratedsystem: 'q3a_1_integratedSystem',
      q3a_2_techspecs: 'q3a_2_techSpecs',
      q3a_3_appsupport: 'q3a_3_appSupport',
      q3a_4_webintegration: 'q3a_4_webIntegration',
      q3a_5_reporting: 'q3a_5_reporting',
      q3a_6_training: 'q3a_6_training',
      q3b_1_certificates: 'q3b_1_certificates',
      q3b_2_encryption: 'q3b_2_encryption',
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
      q5_5_mobileapp: 'q5_5_mobileApp',
      q5_6_foreignstudents: 'q5_6_foreignStudents'
    };

    const result = {};
    for (const key in data) {
      // Map lowercase or underscore keys to their CamelCase UI equivalent
      const uiKey = toCamelMap[key.toLowerCase()] || key;
      result[uiKey] = data[key];
    }
    return result;
  };

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'company') {
      navigate('/login');
    } else {
      setUser(currentUser);
      fetchSubmission(currentUser.username);
    }
  }, [navigate]);

  const fetchSubmission = async (username) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('username', username)
        .single();
        
      if (data) {
        const mappedData = mapFromDb(data);
        setFormData(mappedData);
        if (mappedData.status === 'final') {
          setIsSubmitted(true);
          setShowSuccess(true);
        }
      }
    } catch (err) {
      console.error('Error fetching submission:', err);
    }
  };

   const requiredFieldsByStep = {
    1: ['companyName', 'submissionDate', 'representativeName', 'phone', 'email', 'centralBankLicense', 'marketExperience', 'govInstitutionsCount', 'paidCapital', 'officialAddress'],
    2: ['q2_1_settlement', 'q2_2_commissions', 'q2_3_intermediary', 'q2_4_delayPenalty', 'q2_5_atmCommitment', 'q2_6_studentCards', 'q2_7_chargingCenters', 'q2_8_posCommitment'],
    3: ['q3a_1_integratedSystem', 'q3a_2_techSpecs', 'q3a_3_appSupport', 'q3a_4_webIntegration', 'q3a_5_reporting', 'q3a_6_training'],
    4: ['q3b_1_certificates', 'q3b_2_encryption', 'q3b_3_rto_bcp', 'q3b_4_backups', 'q3b_5_supportSla', 'q3b_6_penTest', 'q3b_7_monitoring', 'q3b_8_incident'],
    5: ['q4_1_bankGuarantee', 'q4_2_penaltyClause', 'q4_3_dataOwnership'],
    6: ['q4_4_exitClause', 'q4_5_liability', 'q4_6_jurisdiction', 'q4_7_auditRight', 'q4_8_contractDuration', 'q4_9_renewal'],
    7: ['q5_1_extraFeatures', 'q5_2_innovation', 'q5_3_scholarships', 'q5_4_staffTraining', 'q5_5_mobileApp', 'q5_6_foreignStudents', 'q5_7_complaints', 'q5_8_socialResp'],
    8: ['documentUrl'],
    9: ['signedBy', 'position']
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.username}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, documentUrl: publicUrl }));
      alert('تم رفع المستند بنجاح!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('حدث خطأ أثناء رفع المستند. تأكد من إعداد مساحة التخزين (Storage) في Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePdfExport = async () => {
    window.print();
  };

  const saveDraft = async () => {
    try {
      const { error } = await supabase
        .from('submissions')
        .upsert([mapToDb({ 
          ...formData, 
          username: user.username, 
          status: 'draft',
          lastUpdated: new Date().toISOString()
        })]);
        
      if (!error) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
    window.location.reload();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitted) return;

    const stepFields = requiredFieldsByStep[currentStep];
    const missingFields = stepFields.filter(f => !formData[f] || formData[f].trim() === '');
    
    if (missingFields.length > 0) {
      setErrors(missingFields);
      alert('يرجى ملء كافة الحقول المطلوبة في هذه المرحلة قبل الانتقال للمرحلة التالية.');
      return;
    }

    setErrors([]);

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      setIsSubmitting(true);
      
      const submitData = async () => {
        try {
          const payload = mapToDb({
            ...formData,
            username: user.username,
            status: 'final',
            lastUpdated: new Date().toISOString(),
            evaluation_score: formData.evaluation_score || 0
          });

          // Check if a submission already exists for this user
          const { data: existing } = await supabase
            .from('submissions')
            .select('id')
            .eq('username', user.username)
            .single();

          let error;
          if (existing?.id) {
            // Update existing record
            const { error: updateError } = await supabase
              .from('submissions')
              .update(payload)
              .eq('id', existing.id);
            error = updateError;
          } else {
            // Insert new record
            const { error: insertError } = await supabase
              .from('submissions')
              .insert([payload]);
            error = insertError;
          }
            
          if (!error) {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setShowSuccess(true);
            window.scrollTo(0, 0);
          } else {
            console.error('Submit error:', error);
            alert('خطأ في الإرسال: ' + error.message);
            setIsSubmitting(false);
          }
        } catch (err) {
          console.error('Error submitting:', err);
          alert('خطأ غير متوقع: ' + err.message);
          setIsSubmitting(false);
        }
      };
      
      submitData();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4 mb-6">أولاً: معلومات الشركة العامة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="اسم الشركة" name="companyName" value={formData.companyName} onChange={handleInputChange} isError={errors.includes('companyName')} />
              <InputField label="تاريخ تقديم العرض" type="date" name="submissionDate" value={formData.submissionDate} onChange={handleInputChange} isError={errors.includes('submissionDate')} />
              <InputField label="اسم ممثل الشركة" name="representativeName" value={formData.representativeName} onChange={handleInputChange} isError={errors.includes('representativeName')} />
              <InputField label="رقم الهاتف" name="phone" value={formData.phone} onChange={handleInputChange} isError={errors.includes('phone')} />
              <InputField label="البريد الإلكتروني" type="email" name="email" value={formData.email} onChange={handleInputChange} isError={errors.includes('email')} />
              <InputField label="رقم إجازة البنك المركزي" name="centralBankLicense" value={formData.centralBankLicense} onChange={handleInputChange} isError={errors.includes('centralBankLicense')} />
              <InputField label="سنوات الخبرة في السوق العراقي" name="marketExperience" value={formData.marketExperience} onChange={handleInputChange} isError={errors.includes('marketExperience')} />
              <InputField label="عدد المؤسسات الحكومية المخدَّمة حالياً" type="number" name="govInstitutionsCount" value={formData.govInstitutionsCount} onChange={handleInputChange} isError={errors.includes('govInstitutionsCount')} />
              <InputField label="رأس المال المدفوع / الملاءة المالية" name="paidCapital" value={formData.paidCapital} onChange={handleInputChange} isError={errors.includes('paidCapital')} />
              <InputField label="العنوان الرسمي / المقر الرئيسي" name="officialAddress" value={formData.officialAddress} onChange={handleInputChange} isError={errors.includes('officialAddress')} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4 mb-6">ثانياً: الالتزامات التشغيلية والمالية (8 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionField id="q2_1_settlement" label="1. ما هي الآلية المعتمدة لإجراء التسوية المالية (المقاصة) مع مصرف الرشيد؟ وهل تلتزمون بالإيداع خلال 12 ساعة عمل؟" value={formData.q2_1_settlement} onChange={handleInputChange} isError={errors.includes('q2_1_settlement')} />
              <QuestionField id="q2_2_commissions" label="2. ما هي نسب العمولات والخصومات المقترحة؟ وهل توافقون على مراجعتها دورياً وإشعار الجامعة قبل 30 يوماً من أي تعديل؟" value={formData.q2_2_commissions} onChange={handleInputChange} isError={errors.includes('q2_2_commissions')} />
              <QuestionField id="q2_3_intermediary" label="3. هل يوجد وسيط (مصرف آخر) لنقل المبالغ أم مباشرة؟ يرجى ذكر تفاصيل سير الحركات المالية." value={formData.q2_3_intermediary} onChange={handleInputChange} isError={errors.includes('q2_3_intermediary')} />
              <QuestionField id="q2_4_delayPenalty" label="4. ما قيمة غرامة التأخير المقترحة عن كل ساعة تجاوز مدة التسوية المتفق عليها؟" value={formData.q2_4_delayPenalty} onChange={handleInputChange} isError={errors.includes('q2_4_delayPenalty')} />
              <QuestionField id="q2_5_atmCommitment" label="5. هل تلتزمون بتوفير جهاز صراف آلي (ATM) يملأ دائماً داخل الجامعة؟ (العدد، المواقع، تكلفة الصيانة)" value={formData.q2_5_atmCommitment} onChange={handleInputChange} isError={errors.includes('q2_5_atmCommitment')} />
              <QuestionField id="q2_6_studentCards" label="6. ما هي تفاصيل إصدار بطاقات الطلبة؟ (رسوم الإصدار، التجديد، بدل الضائع، مدة الإصدار)" value={formData.q2_6_studentCards} onChange={handleInputChange} isError={errors.includes('q2_6_studentCards')} />
              <QuestionField id="q2_7_chargingCenters" label="7. هل توفرون مراكز تعبئة كافية داخل الكليات؟ وما هي ساعات العمل المقترحة لها؟" value={formData.q2_7_chargingCenters} onChange={handleInputChange} isError={errors.includes('q2_7_chargingCenters')} />
              <QuestionField id="q2_8_posCommitment" label="8. هل تلتزمون بتجهيز نقاط البيع (PoS) والورق الحراري مجاناً؟ وما هو زمن الاستجابة للصيانة (SLA)؟" value={formData.q2_8_posCommitment} onChange={handleInputChange} isError={errors.includes('q2_8_posCommitment')} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4 mb-6">ثالثاً: أ- النظام الإلكتروني والتكامل (6 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionField id="q3a_1_integratedSystem" label="1. هل يتوفر لديكم نظام إلكتروني متكامل يُبيّن جميع الحركات المالية؟ يرجى شرح آلية وصول الجامعة (صلاحيات الإدارة، التقارير، تصدير البيانات بصيغ PDF/Excel)" value={formData.q3a_1_integratedSystem} onChange={handleInputChange} isError={errors.includes('q3a_1_integratedSystem')} />
              <QuestionField id="q3a_2_techSpecs" label="2. هل يمكن إصدار بطاقات خاصة بكل كلية أو وحدة إدارية بدون عمولات تحويل داخلية؟ مثلاً خاصة بلجان المشتريات." value={formData.q3a_2_techSpecs} onChange={handleInputChange} isError={errors.includes('q3a_2_techSpecs')} />
              <QuestionField id="q3a_3_appSupport" label="3. هل يمكن للجامعة الحصول على كشف حساب لحظي (Real-time) في أي وقت؟ وهل يمكن جدولة تقارير دورية تلقائية؟" value={formData.q3a_3_appSupport} onChange={handleInputChange} isError={errors.includes('q3a_3_appSupport')} />
              <QuestionField id="q3a_4_webIntegration" label="4. هل يمكن تحقيق تكامل إلكتروني مع موقع الجامعة يتيح التسديد عبر رابط آمن أو QR كود دون الحاجة للحضور الشخصي؟ من يتحمل تكلفة التطوير والصيانة؟" value={formData.q3a_4_webIntegration} onChange={handleInputChange} isError={errors.includes('q3a_4_webIntegration')} />
              <QuestionField id="q3a_5_reporting" label="5. هل توفرون خدمة التحويلات خارج العراق؟ يرجى بيان العمولات والحدود اليومية والعملات المدعومة." value={formData.q3a_5_reporting} onChange={handleInputChange} isError={errors.includes('q3a_5_reporting')} />
              <QuestionField id="q3a_6_training" label="6. هل يتوفر رقم IBAN لكل بطاقة؟ وهل هو متوافق مع معايير الدفع الدولية؟" value={formData.q3a_6_training} onChange={handleInputChange} isError={errors.includes('q3a_6_training')} />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4 mb-6">ثالثاً: ب- الأمن السيبراني والاستمرارية (8 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionField id="q3b_1_certificates" label="1. ما هي شهادات الأمن المعتمدة لديكم؟ (PCI-DSS / ISO 27001 / غيرها) يرجى إرفاق نسخ من الشهادات." value={formData.q3b_1_certificates} onChange={handleInputChange} isError={errors.includes('q3b_1_certificates')} />
              <QuestionField id="q3b_2_encryption" label="2. ما هو بروتوكول التشفير المستخدم في المعاملات؟ (TLS 1.2+، AES-256، إلخ)" value={formData.q3b_2_encryption} onChange={handleInputChange} isError={errors.includes('q3b_2_encryption')} />
              <QuestionField id="q3b_3_rto_bcp" label="3. ما هو الحد الأقصى لوقت استعادة الخدمة عند الانقطاع (RTO)؟ وما هي خطة الاستمرارية عند الكوارث (BCP)؟ (مهم في أيام الامتحانات ومواسم القبول)" value={formData.q3b_3_rto_bcp} onChange={handleInputChange} isError={errors.includes('q3b_3_rto_bcp')} />
              <QuestionField id="q3b_4_backups" label="4. هل توفرون نسخاً احتياطية يومية للبيانات؟ أين تُخزَّن؟ وما مدة الاحتفاظ بها؟" value={formData.q3b_4_backups} onChange={handleInputChange} isError={errors.includes('q3b_4_backups')} />
              <QuestionField id="q3b_5_supportSla" label="5. ما هو نظام الدعم الفني؟ هل يتوفر على مدار الساعة (24/7)؟ وما مدة الاستجابة المضمونة عند الأعطال؟ (SLA)" value={formData.q3b_5_supportSla} onChange={handleInputChange} isError={errors.includes('q3b_5_supportSla')} />
              <QuestionField id="q3b_6_penTest" label="6. هل تُجرون اختبارات اختراق أمني (Penetration Testing) دورية؟ وهل ستزودون الجامعة بتقاريرها السنوية؟" value={formData.q3b_6_penTest} onChange={handleInputChange} isError={errors.includes('q3b_6_penTest')} />
              <QuestionField id="q3b_7_monitoring" label="7. ما هي سياسة شركتكم في الاحتفاظ بالبيانات؟ (المدة الزمنية، مكان التخزين، هل هو داخل العراق أم خارجه؟)" value={formData.q3b_7_monitoring} onChange={handleInputChange} isError={errors.includes('q3b_7_monitoring')} />
              <QuestionField id="q3b_8_incident" label="8. ما هي طرائق الاتصالات المستخدمة وهل تحتاج انترنت؟ وهل هي متعددة في حالة الانقطاع؟" value={formData.q3b_8_incident} onChange={handleInputChange} isError={errors.includes('q3b_8_incident')} />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4 mb-6">رابعاً: أ- الضمانات وملكية البيانات (مهم جداً)</h3>
            <div className="space-y-6">
              <QuestionField id="q4_1_bankGuarantee" label="1. خطاب الضمان المصرفي: هل تقدمون خطاب ضمان مصرفي غير مشروط لصالح الجامعة؟ ما قيمته المقترحة ومدته؟ (الضمانات غير المصرفية غير مقبولة)" value={formData.q4_1_bankGuarantee} onChange={handleInputChange} isError={errors.includes('q4_1_bankGuarantee')} />
              <QuestionField id="q4_2_penaltyClause" label="2. سرية البيانات: هل تلتزمون بسرية البيانات وعدم مشاركتها مع أي جهة ثالثة؟ وهل توافقون على توقيع اتفاقية عدم إفصاح (NDA) رسمية؟" value={formData.q4_2_penaltyClause} onChange={handleInputChange} isError={errors.includes('q4_2_penaltyClause')} />
              <QuestionField id="q4_3_dataOwnership" label="3. ملكية البيانات واستردادها: هل توافقون على أن ملكية البيانات تعود للجامعة حصراً، وأنه يحق لها استردادها كاملةً عند انتهاء العقد وفي أي وقت تحتاجه؟" value={formData.q4_3_dataOwnership} onChange={handleInputChange} isError={errors.includes('q4_3_dataOwnership')} />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4 mb-6">رابعاً: ب- الالتزامات القانونية والتعاقدية (6 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionField id="q4_4_exitClause" label="4. هل تقدمون برامج تدريبية مجانية لموظفي الجامعة؟ يرجى التوضيح: (عدد الدورات، عدد ساعات التدريب، هل هي حضورية أم إلكترونية؟)" value={formData.q4_4_exitClause} onChange={handleInputChange} isError={errors.includes('q4_4_exitClause')} />
              <QuestionField id="q4_5_liability" label="5. هل توافقون على حق الجامعة بفسخ العقد فورياً عند الإخلال الجوهري، أو بإشعار مسبق مدته (30) يوماً في الحالات الأخرى؟" value={formData.q4_5_liability} onChange={handleInputChange} isError={errors.includes('q4_5_liability')} />
              <QuestionField id="q4_6_jurisdiction" label="6. هل توافقون على تطبيق القانون العراقي النافذ، واختصاص محاكم محافظة بابل للفصل في أي نزاع؟" value={formData.q4_6_jurisdiction} onChange={handleInputChange} isError={errors.includes('q4_6_jurisdiction')} />
              <QuestionField id="q4_7_auditRight" label="7. في حال عدم التوصل إلى حل ودي خلال (15) يوماً، هل توافقون على اللجوء إلى التحكيم التجاري وفق الأنظمة العراقية المعمول بها؟" value={formData.q4_7_auditRight} onChange={handleInputChange} isError={errors.includes('q4_7_auditRight')} />
              <QuestionField id="q4_8_contractDuration" label="8. ما هي مدة العقد المقترحة؟ وما شروط التجديد والتعديل؟ وهل توافقون على إعادة التفاوض على الشروط عند كل تجديد؟" value={formData.q4_8_contractDuration} onChange={handleInputChange} isError={errors.includes('q4_8_contractDuration')} />
              <QuestionField id="q4_9_renewal" label="9. ما هي آلية استقبال ومعالجة شكاوى الطلبة؟ وما الحد الأقصى للمدة الزمنية لحل الشكوى؟" value={formData.q4_9_renewal} onChange={handleInputChange} isError={errors.includes('q4_9_renewal')} />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4 mb-6">خامساً: الخدمات الإضافية والميزات التنافسية (8 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionField id="q5_1_extraFeatures" label="1. هل تقدمون تطبيق هاتفي (iOS/Android)؟ ما الخدمات المتاحة فيه؟" value={formData.q5_1_extraFeatures} onChange={handleInputChange} isError={errors.includes('q5_1_extraFeatures')} />
              <QuestionField id="q5_2_innovation" label="2. هل تقدمون خدمات مصرفية إضافية مثل: محفظة رقمية، صرف راتب إلكتروني، حسابات توفير؟" value={formData.q5_2_innovation} onChange={handleInputChange} isError={errors.includes('q5_2_innovation')} />
              <QuestionField id="q5_3_scholarships" label="3. ما الحد الأقصى لعدد المعاملات اليومية التي يستطيع نظامكم معالجتها دون تدهور في الأداء؟ (مهم للتحقق من الطاقة الاستيعابية أيام الذروة)" value={formData.q5_3_scholarships} onChange={handleInputChange} isError={errors.includes('q5_3_scholarships')} />
              <QuestionField id="q5_4_staffTraining" label="4. هل تقدمون الدعم (Sponsor) لتغطية تكاليف الفعاليات والمؤتمرات العلمية لكليات الجامعة؟" value={formData.q5_4_staffTraining} onChange={handleInputChange} isError={errors.includes('q5_4_staffTraining')} />
              <QuestionField id="q5_5_mobileApp" label="5. هل هنالك تحديث دوري لأجهزة PoS والأنظمة الإلكترونية للحركات؟ ما التفاصيل؟" value={formData.q5_5_mobileApp} onChange={handleInputChange} isError={errors.includes('q5_5_mobileApp')} />
              <QuestionField id="q5_6_foreignStudents" label="6. هل هنالك إمكانية تسديد أجور بعملة الدولار إلى مصارف خارج البلد بالسعر الرسمي؟" value={formData.q5_6_foreignStudents} onChange={handleInputChange} isError={errors.includes('q5_6_foreignStudents')} />
              <QuestionField id="q5_7_complaints" label="7. هل تقدمون أي ميزات إضافية أو عروض تنافسية لصالح جامعة بابل تحديداً؟ يرجى التفصيل." value={formData.q5_7_complaints} onChange={handleInputChange} isError={errors.includes('q5_7_complaints')} />
              <QuestionField id="q5_8_socialResp" label="8. ذكر المؤسسات الحكومية المخدَّمة حالياً، وما هي التي تتعامل مع مصرف الرشيد؟" value={formData.q5_8_socialResp} onChange={handleInputChange} isError={errors.includes('q5_8_socialResp')} />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4">سادساً: المرفقات والملاحظات</h3>
              
              <div className={`bg-white p-10 rounded-[2.5rem] border-4 border-dashed transition-all ${errors.includes('documentUrl') ? 'border-red-300 bg-red-50' : 'border-blue-100'}`}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                    <FileCheck className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-blue-950 mb-3">إرفاق المستندات والوثائق الرسمية</h4>
                  <p className="text-sm text-gray-500 mb-8 max-w-md">يرجى رفع ملف PDF واحد يحتوي على (إجازة البنك المركزي، شهادات الأمن السيبراني، المخططات التقنية، وأي وثائق داعمة أخرى).</p>
                  
                  {formData.documentUrl ? (
                    <div className="w-full bg-emerald-50 border-2 border-emerald-100 p-6 rounded-2xl flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3 text-emerald-700 font-black">
                        <CheckCircle2 className="w-6 h-6" />
                        تم رفع الملف بنجاح
                      </div>
                      <div className="flex gap-4">
                        <a href={formData.documentUrl} target="_blank" rel="noreferrer" className="px-6 py-2 bg-white text-blue-600 rounded-xl font-black text-xs shadow-sm hover:shadow-md transition-all">فتح الملف</a>
                        <button type="button" onClick={() => setFormData(prev => ({...prev, documentUrl: ''}))} className="px-6 py-2 bg-red-50 text-red-500 rounded-xl font-black text-xs hover:bg-red-100 transition-all">حذف وإعادة الرفع</button>
                      </div>
                    </div>
                  ) : (
                    <label className={`group cursor-pointer flex flex-col items-center gap-4 px-12 py-8 rounded-[2rem] border-2 border-blue-50 hover:bg-blue-50 hover:border-blue-200 transition-all ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}>
                      <div className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-900/20 group-hover:scale-105 transition-transform">
                        {isSubmitting ? 'جاري رفع الملف...' : 'اختر ملف PDF للرفع'}
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الحد الأقصى 10MB</span>
                      <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isSubmitting} />
                    </label>
                  )}
                  {errors.includes('documentUrl') && <p className="text-red-500 text-xs font-black mt-4">! يرجى إرفاق المستندات المطلوبة للمتابعة</p>}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">ملاحظات إضافية (اختياري)</label>
                <textarea 
                  name="additionalNotes"
                  placeholder="مساحة كافية لإضافة أي تفاصيل لم تذكر في الأسئلة السابقة..."
                  className="w-full h-40 p-6 rounded-3xl bg-gray-50 border-2 border-transparent outline-none focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-blue-900/5 p-10 rounded-[3rem] border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-900/5 rounded-full -mr-16 -mt-16"></div>
              <h3 className="text-2xl font-black text-blue-950 mb-8 flex items-center gap-4 relative z-10">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                سابعاً: المصادقة والتوقيع الرسمي
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <InputField label="اسم الموقع (المفوض بالتوقيع)" name="signedBy" value={formData.signedBy} onChange={handleInputChange} isError={errors.includes('signedBy')} />
                <InputField label="الصفة الوظيفية" name="position" value={formData.position} onChange={handleInputChange} isError={errors.includes('position')} />
              </div>
              <div className="mt-10 p-6 bg-white/60 rounded-2xl border border-blue-100 text-sm text-blue-800 font-bold leading-relaxed">
                * أقر أنا الموقع أدناه بصحة جميع المعلومات الواردة في هذا العرض الفني والمالي، وأتحمل المسؤولية القانونية الكاملة عن أي بيانات غير دقيقة.
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Print Area - Only visible during print */}
      <div className="hidden print:block w-full bg-white">
        <PrintTemplate data={{ ...formData, username: user?.username }} />
      </div>

      {/* Screen Area - Hidden during print */}
      <div className="print:hidden">
        <header className="bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white p-1 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/10 border border-gray-50">
              <img src="./logo.jpg" alt="University Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-black text-blue-950">معايير التعاقد مع شركات الدفع الالكتروني</h1>
              <p className="text-[10px] font-bold text-gray-400">جامعة بابل - للعام الدراسي 2026/2027</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">أهلاً بك</p>
              <p className="text-sm font-black text-blue-950">{user?.name}</p>
            </div>
            <button onClick={logout} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {showSuccess ? (
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 p-12 text-center animate-fade-in border border-emerald-100">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-blue-950 mb-4">تم إرسال العرض بنجاح</h2>
            <p className="text-gray-500 font-bold mb-10">شكراً لكم. لقد تم استلام عرضكم الفني والمالي رسمياً. لا يمكن التعديل على البيانات بعد الإرسال.</p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button 
                onClick={handlePdfExport}
                className="px-10 py-5 bg-blue-900 text-white rounded-[2rem] font-black flex items-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20"
              >
                <FileCheck className="w-6 h-6" />
                تحميل نسخة من العرض المقدم (PDF)
              </button>
              <button 
                onClick={() => setShowSuccess(false)}
                className="px-10 py-5 bg-gray-100 text-gray-600 rounded-[2rem] font-black hover:bg-gray-200 transition-all"
              >
                تصفح العرض المقدم (للقراءة فقط)
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-white overflow-hidden">
            {/* Stepper Header */}
            <div className="bg-blue-900 p-10 text-white">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black">خطوات ملء الاستمارة</h2>
                  <p className="text-blue-200 text-xs font-bold mt-1">يرجى إكمال كافة الحقول بدقة لضمان قبول العرض</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-white/20">{currentStep}/9</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
                  <div 
                    key={step} 
                    className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${step <= currentStep ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/20'}`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10">
              <div className="mb-12">
                {renderStepContent()}
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-100">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <button 
                    type="button" 
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1 || isSubmitting}
                    className="flex-grow md:flex-grow-0 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all disabled:opacity-30"
                  >
                    السابق
                  </button>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-4">
                    <button 
                      type="button" 
                      onClick={handlePdfExport} 
                      disabled={isSubmitting}
                      className="px-6 py-4 rounded-2xl font-black transition-all border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? <span className="animate-spin">⌛</span> : <FileCheck className="w-5 h-5" />}
                      تحميل PDF
                    </button>
                    {!isSubmitted && (
                      <button type="button" onClick={saveDraft} className={`px-6 py-4 rounded-2xl font-black transition-all border-2 ${isSaved ? 'bg-green-50 border-green-200 text-green-600' : 'border-blue-100 text-blue-600 hover:bg-blue-50'}`}>
                        {isSaved ? 'تم حفظ المسودة ✓' : 'حفظ كمسودة'}
                      </button>
                    )}
                  </div>
                  
                  {isSubmitted && currentStep === 9 ? (
                    <button 
                      type="button"
                      onClick={() => setShowSuccess(true)}
                      className="flex-grow md:flex-grow-0 px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      العودة لصفحة النجاح
                    </button>
                  ) : (
                    <button 
                      type={isSubmitted ? "button" : "submit"}
                      onClick={isSubmitted ? () => currentStep < 9 && setCurrentStep(currentStep + 1) : undefined}
                      disabled={isSubmitting}
                      className="flex-grow md:flex-grow-0 px-12 py-4 bg-blue-900 text-white rounded-2xl font-black hover:bg-blue-800 shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? <span className="animate-spin">⌛</span> : (currentStep === 7 ? <Send className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 rotate-180" />)}
                      {currentStep === 7 ? (isSubmitted ? 'تم الإرسال' : 'إرسال العرض النهائي') : 'المرحلة التالية'}
                    </button>
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

const InputField = ({ label, name, value, onChange, type = 'text', isError }) => (
  <div className={`space-y-2 ${isError ? 'animate-shake' : ''}`}>
    <label className={`text-[10px] font-black uppercase tracking-widest mr-2 ${isError ? 'text-red-500' : 'text-gray-400'}`}>{label}</label>
    <input 
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full p-4 rounded-2xl border-2 outline-none transition-all font-bold ${isError ? 'bg-red-50 border-red-400 focus:border-red-500 text-red-900' : 'bg-gray-50 border-transparent focus:bg-white focus:border-blue-200 text-blue-950'}`}
    />
  </div>
);

const QuestionField = ({ id, label, value, onChange, isError }) => (
  <div className={`p-8 rounded-[2rem] border-2 transition-all group ${isError ? 'bg-red-50/50 border-red-200 animate-shake' : 'bg-gray-50/50 border-transparent hover:bg-white hover:border-blue-100 hover:shadow-xl'}`}>
    <label htmlFor={id} className={`block text-sm font-black mb-4 leading-relaxed transition-colors ${isError ? 'text-red-900' : 'text-blue-950 group-hover:text-blue-900'}`}>{label}</label>
    <textarea 
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className={`w-full h-32 p-6 rounded-2xl border-2 outline-none transition-all font-bold ${isError ? 'bg-red-50 border-red-400 focus:border-red-500 text-red-900' : 'bg-white border-gray-100 focus:border-blue-400'}`}
      placeholder="اكتب إجابتك هنا بتفصيل..."
    />
  </div>
);

export default Dashboard;
