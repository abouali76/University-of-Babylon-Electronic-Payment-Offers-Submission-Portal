const fs = require('fs');

const path = 'c:/Users/ALIENWARE/Desktop/استمارة الدفع الالكتروني/client/src/pages/DashboardRound2.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Component Name
content = content.replace(/const Dashboard = \(\{ isReadOnly \}\) => \{/g, 'const DashboardRound2 = () => {\n  const isReadOnly = false;');
content = content.replace(/export default Dashboard;/g, 'export default DashboardRound2;');

// 2. formData
const newFormData = `
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
`;
content = content.replace(/const \[formData, setFormData\] = useState\(\{[\s\S]*?documentUrl: ''\n  \}\);/, newFormData.trim());

// 3. Steps
const newSteps = `
  const steps = [
    { id: 1, title: 'معلومات الشركة' },
    { id: 2, title: 'الالتزامات التشغيلية والمالية' },
    { id: 3, title: 'النظام الإلكتروني والأمن' },
    { id: 4, title: 'الالتزامات القانونية' },
    { id: 5, title: 'الخدمات الإضافية والمرفقات' },
    { id: 6, title: 'المصادقة والتوقيع النهائي' }
  ];
`;
content = content.replace(/const steps = \[[\s\S]*?\} \/\/ Answers handled separately\n  \};/, newSteps.trim() + `
  const STEP_FIELDS = {
    1: ['companyName', 'submissionDate', 'representativeName', 'phone', 'email', 'centralBankLicense', 'officialAddress'],
    2: ['q2_1_deposit_within_short_period', 'q2_2_process_end_of_month_payments', 'q2_3_guarantee_movements_in_rashid', 'q2_4_commissions_and_discounts', 'q2_5_provide_atms_in_university', 'q2_6_student_cards_free_or_cheap', 'q2_7_charging_centers_in_university', 'q2_8_pos_maintenance_and_free_supplies', 'q2_9_laptop_and_printer', 'q2_10_partnership_with_rashid'],
    3: ['q3_1_integrated_system', 'q3_2_safe_link_payment', 'q3_3_iban_available', 'q4_1_confidentiality', 'q4_2_backups', 'q4_3_technical_support'],
    4: ['q5_1_data_ownership', 'q5_2_free_training', 'q5_3_contract_duration', 'q5_4_partial_updates', 'q5_5_contract_termination_and_fines'],
    5: ['q6_1_sponsor_support', 'additionalNotes', 'documentUrl'],
    6: ['signedBy', 'position']
  };
`);

// 4. FIELD LABELS
const newFieldLabels = `
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
`;
content = content.replace(/const FIELD_LABELS = \{[\s\S]*?position: 'الصفة الوظيفية للموقع'\n  \};/, newFieldLabels.trim());

// 5. DB Payloads mapping
content = content.replace(/from\('submissions'\)/g, "from('submissions_round2')");

// 6. DB Fields Mapping (fromDbPayload & toDbPayload)
const newFromDbPayload = `
  const fromDbPayload = (dbData) => {
    if (!dbData) return {};
    const data = { ...dbData };
    data.documentUrl = dbData.document_url || dbData.documentUrl;
    return data;
  };
`;
content = content.replace(/const fromDbPayload = \([\s\S]*?return data;\n  \};/, newFromDbPayload.trim());

// 7. Render step content
const newRenderStepContent = `
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
            <SectionHeader title="أولاً: معلومات الشركة" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputField label="اسم الشركة" value={formData.companyName} {...inputProps('companyName')} />
              <InputField label="تاريخ تقديم العرض" type="date" value={formData.submissionDate} {...inputProps('submissionDate')} />
              <InputField label="اسم ممثل الشركة" value={formData.representativeName} {...inputProps('representativeName')} />
              <InputField label="رقم الهاتف" value={formData.phone} {...inputProps('phone')} />
              <InputField label="البريد الإلكتروني" type="email" value={formData.email} {...inputProps('email')} />
              <InputField label="رقم إجازة البنك المركزي" value={formData.centralBankLicense} {...inputProps('centralBankLicense')} />
              <InputField label="العنوان" value={formData.officialAddress} {...inputProps('officialAddress')} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="ثانياً: الالتزامات التشغيلية والمالية" />
            <div className="space-y-6">
              <QuestionBox id="q2_1_deposit_within_short_period" label="1. هل تلتزمون بإيداع المبالغ في مصرف الرشيد خلال مدة قصيرة؟ (نعم/كلا/غير معلوم)" value={formData.q2_1_deposit_within_short_period} {...inputProps('q2_1_deposit_within_short_period')} />
              <QuestionBox id="q2_2_process_end_of_month_payments" label="2. هل بالإمكان معالجة مشكلة التسديدات التي تتم في اليوم الأخير من الشهر، بحيث لا تظهر ضمن حسابات الشهر اللاحق في المصرف؟ (نعم/كلا)" value={formData.q2_2_process_end_of_month_payments} {...inputProps('q2_2_process_end_of_month_payments')} />
              <QuestionBox id="q2_3_guarantee_movements_in_rashid" label="3. ضمان ظهور جميع الحركات في حسابات مصرف الرشيد. (نعم/كلا)" value={formData.q2_3_guarantee_movements_in_rashid} {...inputProps('q2_3_guarantee_movements_in_rashid')} />
              <QuestionBox id="q2_4_commissions_and_discounts" label="4. ما هي نسب العمولات والخصومات المقترحة والتي يتم ارجاعها الى جامعة بابل... (النسبة المسترجعة)" value={formData.q2_4_commissions_and_discounts} {...inputProps('q2_4_commissions_and_discounts')} />
              <QuestionBox id="q2_5_provide_atms_in_university" label="5. هل بالامكان توفير عدد من اجهزة الصراف آلي (ATM) داخل الجامعة؟" value={formData.q2_5_provide_atms_in_university} {...inputProps('q2_5_provide_atms_in_university')} />
              <QuestionBox id="q2_6_student_cards_free_or_cheap" label="6. هل يتم إصدار بطاقات للطلبة مجانا او باجور بسيطة تختلف عن غير طلبة وتدريسي جامعة بابل حصرا؟" value={formData.q2_6_student_cards_free_or_cheap} {...inputProps('q2_6_student_cards_free_or_cheap')} />
              <QuestionBox id="q2_7_charging_centers_in_university" label="7. هل يمكن توفير مراكز تعبئة داخل الجامعة؟" value={formData.q2_7_charging_centers_in_university} {...inputProps('q2_7_charging_centers_in_university')} />
              <QuestionBox id="q2_8_pos_maintenance_and_free_supplies" label="8. هل تلتزمون بتوفير مستلزمات التشغيل والصيانة والاستبدال مجاناً؟" value={formData.q2_8_pos_maintenance_and_free_supplies} {...inputProps('q2_8_pos_maintenance_and_free_supplies')} />
              <QuestionBox id="q2_9_laptop_and_printer" label="9. هل تلتزمون بتوفير حاسبة لاب توب وطابعة ليزرية جديدتان الى شعبة الحسابات مجاناً؟" value={formData.q2_9_laptop_and_printer} {...inputProps('q2_9_laptop_and_printer')} />
              <QuestionBox id="q2_10_partnership_with_rashid" label="10. هل لديكم تعاون متميز وشراكة دائمة مع مصرف الرشيد لحل جميع المشاكل؟" value={formData.q2_10_partnership_with_rashid} {...inputProps('q2_10_partnership_with_rashid')} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="ثالثاً: النظام الإلكتروني والتكامل والأمن السيبراني" />
            <div className="space-y-6">
              <QuestionBox id="q3_1_integrated_system" label="أ-1. هل يتوفر لديكم نظام إلكتروني متكامل يُبيّن جميع الحركات المالية؟" value={formData.q3_1_integrated_system} {...inputProps('q3_1_integrated_system')} />
              <QuestionBox id="q3_2_safe_link_payment" label="أ-2. هل يمكن توفير الية التسديد عبر رابط آمن دون الحاجة للحضور الشخصي او استخدام اجهزة PoS؟" value={formData.q3_2_safe_link_payment} {...inputProps('q3_2_safe_link_payment')} />
              <QuestionBox id="q3_3_iban_available" label="أ-3. هل يتوفر رقم IBAN لكل بطاقة؟" value={formData.q3_3_iban_available} {...inputProps('q3_3_iban_available')} />
              
              <h4 className="mt-8 mb-4 text-xl font-bold text-blue-900">ب - الأمن السيبراني والاستمرارية</h4>
              <QuestionBox id="q4_1_confidentiality" label="ب-1. هل جميع الانظمة والعمليات والبيانات المالية بسرية تامة؟" value={formData.q4_1_confidentiality} {...inputProps('q4_1_confidentiality')} />
              <QuestionBox id="q4_2_backups" label="ب-2. هل توفرون نسخاً احتياطية للبيانات ولسنوات طويلة؟" value={formData.q4_2_backups} {...inputProps('q4_2_backups')} />
              <QuestionBox id="q4_3_technical_support" label="ب-3. هل هنالك دعم فني متوفر على مدار الساعة (24/7) ورقم استجابة سريعة ومتابعة شخصية؟" value={formData.q4_3_technical_support} {...inputProps('q4_3_technical_support')} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="رابعاً: الالتزامات القانونية والتعاقدية" />
            <div className="space-y-6">
              <QuestionBox id="q5_1_data_ownership" label="1. أن ملكية البيانات تعود للجامعة حصراً، وأنه يحق لها استردادها كاملة بأي وقت؟" value={formData.q5_1_data_ownership} {...inputProps('q5_1_data_ownership')} />
              <QuestionBox id="q5_2_free_training" label="2. هل تقدمون برامج تدريبية مجانية لموظفي الجامعة عند الحاجة؟" value={formData.q5_2_free_training} {...inputProps('q5_2_free_training')} />
              <QuestionBox id="q5_3_contract_duration" label="3. مدة العقد المقترحة سنتان وقابلة للتجديد لفترة لا تقل عن سنة بعد التجديد؟" value={formData.q5_3_contract_duration} {...inputProps('q5_3_contract_duration')} />
              <QuestionBox id="q5_4_partial_updates" label="4. بالامكان اضافة اي تحديث جزئي ضمن الاتفاق الموجود لتسهيل الدفع الالكتروني لجامعة بابل؟" value={formData.q5_4_partial_updates} {...inputProps('q5_4_partial_updates')} />
              <QuestionBox id="q5_5_contract_termination_and_fines" label="5. فسخ العقد وتسديد الغرامات المالية ان وجدت وتحمل كافة التبعات القانونية في حالة عدم الالتزام بالشروط؟" value={formData.q5_5_contract_termination_and_fines} {...inputProps('q5_5_contract_termination_and_fines')} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="خامساً وسادساً: الخدمات الإضافية والمرفقات" />
            <div className="space-y-6">
              <QuestionBox id="q6_1_sponsor_support" label="1. هل تستاهمون بالدعم (Sponsor) لتغطية بعض التكاليف لعدد من فعاليات ومؤتمرات لكليات الجامعة؟" value={formData.q6_1_sponsor_support} {...inputProps('q6_1_sponsor_support')} />
              <QuestionBox id="additionalNotes" label="ملاحظات إضافية باختصار" value={formData.additionalNotes} {...inputProps('additionalNotes')} />
              
              <div className={\`bg-white p-12 rounded-[2rem] border-4 border-dashed transition-all flex flex-col items-center text-center \${errors.includes('documentUrl') ? 'border-red-500 bg-red-50' : 'border-gray-100'}\`}>
                <FileCheck className={\`w-20 h-20 mb-6 opacity-20 \${errors.includes('documentUrl') ? 'text-red-500' : 'text-blue-900'}\`} />
                <h4 className={\`text-xl font-black mb-2 \${errors.includes('documentUrl') ? 'text-red-900' : 'text-blue-950'}\`}>تحميل المرفقات (PDF)</h4>
                
                {formData.documentUrl ? (
                  <div className="bg-emerald-50 px-8 py-4 rounded-2xl flex items-center gap-4 mt-6">
                    <span className="text-emerald-700 font-black text-sm">تم رفع المستند بنجاح ✓</span>
                    {!isLocked && <button onClick={() => setFormData(p => ({...p, documentUrl: ''}))} className="text-red-500 text-xs font-bold underline">حذف</button>}
                  </div>
                ) : (
                  <div className="relative mt-6">
                    <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={isLocked} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <button type="button" disabled={isSubmitting || isLocked} className="px-8 py-3 bg-blue-50 text-blue-900 rounded-xl font-bold border border-blue-100 shadow-sm pointer-events-none">اختيار ملف</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8 animate-fade-in">
            <SectionHeader title="سابعاً: التوقيع والختم" />
            <div className="bg-white p-10 rounded-[2rem] border-2 border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField label="الاسم الكامل" value={formData.signedBy} {...inputProps('signedBy')} />
                <InputField label="المنصب" value={formData.position} {...inputProps('position')} />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
`;
content = content.replace(/const renderStepContent = \(\) => \{[\s\S]*?default:\n        return null;\n    \}\n  \};/, newRenderStepContent.trim());

// 8. Fix validation call in next button
content = content.replace(/validateStep\(8\)/g, "validateStep(6)");
content = content.replace(/currentStep < 8/g, "currentStep < 5");
content = content.replace(/currentStep === 8/g, "currentStep === 5");

fs.writeFileSync(path, content, 'utf8');
console.log('Done mapping fields in DashboardRound2.jsx');
