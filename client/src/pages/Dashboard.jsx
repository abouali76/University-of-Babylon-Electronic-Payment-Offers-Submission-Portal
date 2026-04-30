import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, Send, LogOut, CheckCircle2, AlertCircle, Building2, User, Phone, Mail, FileCheck, ShieldCheck, HelpCircle } from 'lucide-react';
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
    q3a_4_webIntegration: '',
    q3b_1_certificates: '',
    q3b_3_rto_bcp: '',
    q3b_4_backups: '',
    q3b_5_supportSla: '',
    q4_1_bankGuarantee: '',
    q4_3_dataOwnership: '',
    q4_6_jurisdiction: '',
    q4_8_contractDuration: '',
    q5_1_extraFeatures: '',
    additionalNotes: '',
    signedBy: '',
    position: ''
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'company') {
      navigate('/login');
    } else {
      setUser(currentUser);
      const allSubmissions = JSON.parse(localStorage.getItem('uob_all_submissions') || '[]');
      const existing = allSubmissions.find(s => s.username === currentUser.username);
      if (existing) {
        setFormData(existing);
        setIsSubmitted(true);
        setShowSuccess(true);
      } else {
        const draft = localStorage.getItem(`draft_${currentUser.username}`);
        if (draft) setFormData(JSON.parse(draft));
      }
    }
  }, [navigate]);

  const requiredFieldsByStep = {
    1: ['companyName', 'submissionDate', 'representativeName', 'phone', 'email', 'centralBankLicense', 'marketExperience', 'govInstitutionsCount', 'paidCapital', 'officialAddress'],
    2: ['q2_1_settlement', 'q2_2_commissions', 'q2_3_intermediary', 'q2_4_delayPenalty', 'q2_5_atmCommitment', 'q2_6_studentCards', 'q2_7_chargingCenters', 'q2_8_posCommitment'],
    3: ['q3a_1_integratedSystem', 'q3a_4_webIntegration'],
    4: ['q3b_1_certificates', 'q3b_3_rto_bcp', 'q3b_4_backups', 'q3b_5_supportSla'],
    5: ['q4_1_bankGuarantee', 'q4_3_dataOwnership', 'q4_6_jurisdiction', 'q4_8_contractDuration'],
    6: ['q5_1_extraFeatures'],
    7: ['additionalNotes', 'signedBy', 'position']
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

  const handlePdfExport = async () => {
    setIsSubmitting(true);
    await exportToPdf('print-area', `UOB_Offer_${user?.username}.pdf`);
    setIsSubmitting(false);
  };

  const saveDraft = () => {
    localStorage.setItem(`draft_${user.username}`, JSON.stringify(formData));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
      const allSubmissions = JSON.parse(localStorage.getItem('uob_all_submissions') || '[]');
      const newSubmission = {
        ...formData,
        username: user.username,
        lastUpdated: new Date().toISOString(),
        evaluation_score: 0
      };
      const filtered = allSubmissions.filter(s => s.username !== user.username);
      localStorage.setItem('uob_all_submissions', JSON.stringify([...filtered, newSubmission]));
      
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setShowSuccess(true);
        window.scrollTo(0, 0);
      }, 1500);
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
            <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4 mb-6">ثالثاً: أ- الالتزامات التقنية والأمنية (6 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionField id="q3a_1_integratedSystem" label="1. هل النظام متكامل مع تقارير لوحة تحكم (Dashboard) تظهر الحركات آنياً؟ يرجى إرفاق دليل تعريفي." value={formData.q3a_1_integratedSystem} onChange={handleInputChange} isError={errors.includes('q3a_1_integratedSystem')} />
              <QuestionField id="q3a_4_webIntegration" label="2. هل يمكن ربط النظام مع موقع الجامعة والأنظمة المالية الداخلية عبر API؟" value={formData.q3a_4_webIntegration} onChange={handleInputChange} isError={errors.includes('q3a_4_webIntegration')} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4 mb-6">ثالثاً: ب- الأمن السيبراني والاستمرارية (8 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionField id="q3b_1_certificates" label="1. ما هي الشهادات الأمنية العالمية الحاصل عليها النظام؟ (PCI-DSS, ISO 27001...)" value={formData.q3b_1_certificates} onChange={handleInputChange} isError={errors.includes('q3b_1_certificates')} />
              <QuestionField id="q3b_3_rto_bcp" label="2. ما هي خطة استمرارية الأعمال (BCP)؟ وما هي المدة الزمنية المستغرقة للتعافي من الكوارث (RTO)؟" value={formData.q3b_3_rto_bcp} onChange={handleInputChange} isError={errors.includes('q3b_3_rto_bcp')} />
              <QuestionField id="q3b_4_backups" label="3. ما هي سياسة النسخ الاحتياطي؟ وهل يوجد موقع بديل (DR Site) داخل العراق؟" value={formData.q3b_4_backups} onChange={handleInputChange} isError={errors.includes('q3b_4_backups')} />
              <QuestionField id="q3b_5_supportSla" label="4. هل يتوفر دعم فني 24/7؟ يرجى ذكر قنوات التواصل الرسمية." value={formData.q3b_5_supportSla} onChange={handleInputChange} isError={errors.includes('q3b_5_supportSla')} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4 mb-6">رابعاً: الالتزامات القانونية والتعاقدية (9 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionField id="q4_1_bankGuarantee" label="1. هل تلتزمون بتقديم خطاب ضمان مصرفي بقيمة العقد؟" value={formData.q4_1_bankGuarantee} onChange={handleInputChange} isError={errors.includes('q4_1_bankGuarantee')} />
              <QuestionField id="q4_3_dataOwnership" label="2. هل تلتزمون بأن كافة البيانات ملك لجامعة بابل ويمنع استخدامها أو بيعها لأي طرف ثالث؟" value={formData.q4_3_dataOwnership} onChange={handleInputChange} isError={errors.includes('q4_3_dataOwnership')} />
              <QuestionField id="q4_6_jurisdiction" label="3. هل توافقون على خضوع العقد للقوانين العراقية واختصاص المحاكم العراقية في حال النزاع؟" value={formData.q4_6_jurisdiction} onChange={handleInputChange} isError={errors.includes('q4_6_jurisdiction')} />
              <QuestionField id="q4_8_contractDuration" label="4. ما هي مدة العقد المقترحة؟ وشروط التجديد التلقائي؟" value={formData.q4_8_contractDuration} onChange={handleInputChange} isError={errors.includes('q4_8_contractDuration')} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4 mb-6">خامساً: الخدمات الإضافية والميزات التنافسية (8 أسئلة)</h3>
            <div className="space-y-6">
              <QuestionField id="q5_1_extraFeatures" label="ذكر أي ميزات أو خدمات إضافية مجانية تقدمها الشركة للجامعة (منح، تدريب، تطوير بنية تحتية...)" value={formData.q5_1_extraFeatures} onChange={handleInputChange} isError={errors.includes('q5_1_extraFeatures')} />
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-blue-900 border-r-4 border-blue-900 pr-4">سادساً: ملاحظات إضافية</h3>
              <textarea 
                name="additionalNotes"
                placeholder="مساحة كافية لإضافة أي تفاصيل لم تذكر في الأسئلة السابقة..."
                className={`w-full h-40 p-6 rounded-2xl border-2 outline-none transition-all font-bold ${errors.includes('additionalNotes') ? 'bg-red-50 border-red-300 animate-shake' : 'bg-gray-50 border-transparent focus:bg-white focus:border-blue-200'}`}
                value={formData.additionalNotes}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
              <h3 className="text-xl font-bold text-blue-900 mb-6">سابعاً: المصادقة والتوقيع</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="اسم الموقع (المفوض)" name="signedBy" value={formData.signedBy} onChange={handleInputChange} isError={errors.includes('signedBy')} />
                <InputField label="الصفة الوظيفية" name="position" value={formData.position} onChange={handleInputChange} isError={errors.includes('position')} />
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
      {/* Hidden Print Area */}
      <div id="print-area" style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <PrintTemplate data={{ ...formData, username: user?.username }} />
      </div>

      <header className="bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white p-1 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/10 border border-gray-50">
              <img src="./logo.jpg" alt="University Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-black text-blue-950">استمارة عروض الدفع الإلكتروني</h1>
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
                  <span className="text-4xl font-black text-white/20">{currentStep}/7</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((step) => (
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
                  
                  {isSubmitted && currentStep === 7 ? (
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
                      onClick={isSubmitted ? () => currentStep < 7 && setCurrentStep(currentStep + 1) : undefined}
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
      className={`w-full p-4 rounded-2xl border-2 outline-none transition-all font-bold ${isError ? 'bg-red-50 border-red-200 focus:border-red-400 text-red-900' : 'bg-gray-50 border-transparent focus:bg-white focus:border-blue-200 text-blue-950'}`}
      required
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
      className={`w-full h-32 p-6 rounded-2xl border-2 outline-none transition-all font-bold ${isError ? 'bg-white border-red-300 focus:border-red-500' : 'bg-white border-gray-100 focus:border-blue-400'}`}
      placeholder="اكتب إجابتك هنا بتفصيل..."
      required
    />
  </div>
);

export default Dashboard;
