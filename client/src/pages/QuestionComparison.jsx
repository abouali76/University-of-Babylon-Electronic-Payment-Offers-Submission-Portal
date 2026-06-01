import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Search, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { exportToPdf } from '../utils/exportPdf';

// جميع أقسام الأسئلة مع مفاتيح البيانات
const SECTIONS = [
  {
    id: 'general',
    title: 'أولاً: المعلومات العامة',
    color: '#6366f1',
    bg: '#eef2ff',
    questions: [
      { key: 'centralBankLicense', aliases: ['centralbanklicense'], label: 'رقم إجازة البنك المركزي العراقي' },
      { key: 'marketExperience', aliases: ['marketexperience'], label: 'سنوات الخبرة في السوق المحلي' },
      { key: 'govInstitutionsCount', aliases: ['govinstitutionscount'], label: 'عدد المؤسسات الحكومية المخدَّمة' },
      { key: 'paidCapital', aliases: ['paidcapital'], label: 'رأس المال المدفوع / الملاءة المالية' },
      { key: 'officialAddress', aliases: ['officialaddress'], label: 'العنوان الرسمي / المقر الرئيسي' },
    ]
  },
  {
    id: 'financial',
    title: 'ثانياً: الالتزامات التشغيلية والمالية',
    color: '#059669',
    bg: '#ecfdf5',
    questions: [
      { key: 'q2_1_settlement', label: 'آلية التسوية المالية (المقاصة) مع مصرف الرشيد' },
      { key: 'q2_2_commissions', label: 'نسب العمولات والخصومات المقترحة' },
      { key: 'q2_3_intermediary', label: 'هل يوجد وسيط (مصرف آخر) لنقل المبالغ؟' },
      { key: 'q2_4_delayPenalty', aliases: ['q2_4_delaypenalty'], label: 'قيمة غرامة التأخير المقترحة' },
      { key: 'q2_5_atmCommitment', aliases: ['q2_5_atmcommitment'], label: 'الالتزام بتوفير جهاز ATM داخل الجامعة' },
      { key: 'q2_6_studentCards', aliases: ['q2_6_studentcards'], label: 'تفاصيل إصدار بطاقات الطلبة (رسوم، تجديد، بدل ضائع)' },
      { key: 'q2_7_chargingCenters', aliases: ['q2_7_chargingcenters'], label: 'مراكز التعبئة داخل الكليات وساعات العمل' },
      { key: 'q2_8_posCommitment', aliases: ['q2_8_poscommitment'], label: 'تجهيز نقاط البيع PoS والورق الحراري والصيانة' },
    ]
  },
  {
    id: 'technical',
    title: 'ثالثاً: أ- النظام الإلكتروني والتكامل',
    color: '#0ea5e9',
    bg: '#f0f9ff',
    questions: [
      { key: 'q3a_1_integratedSystem', aliases: ['q3a_1_integratedsystem'], label: 'توفر نظام إلكتروني متكامل للحركات المالية' },
      { key: 'q3a_2_techSpecs', aliases: ['q3a_2_techspecs'], label: 'إصدار بطاقات خاصة بكل كلية أو وحدة إدارية' },
      { key: 'q3a_3_appSupport', aliases: ['q3a_3_appsupport'], label: 'كشف حساب لحظي Real-time للجامعة' },
      { key: 'q3a_4_webIntegration', aliases: ['q3a_4_webintegration'], label: 'التكامل مع موقع الجامعة (QR / رابط آمن)' },
      { key: 'q3a_5_reporting', label: 'خدمة التحويلات خارج العراق' },
      { key: 'q3a_6_training', label: 'توفر رقم IBAN لكل بطاقة' },
    ]
  },
  {
    id: 'security',
    title: 'ثالثاً: ب- الأمن السيبراني والاستمرارية',
    color: '#7c3aed',
    bg: '#f5f3ff',
    questions: [
      { key: 'q3b_1_certificates', label: 'شهادات الأمن المعتمدة (PCI-DSS / ISO 27001)' },
      { key: 'q3b_2_encryption', label: 'بروتوكول التشفير المستخدم في المعاملات' },
      { key: 'q3b_3_rto_bcp', label: 'وقت استعادة الخدمة عند الانقطاع (RTO)' },
      { key: 'q3b_4_backups', label: 'نسخ احتياطية يومية للبيانات ومكان التخزين' },
      { key: 'q3b_5_supportSla', aliases: ['q3b_5_supportsla'], label: 'نظام الدعم الفني (24/7)' },
      { key: 'q3b_6_penTest', aliases: ['q3b_6_pentest'], label: 'اختبارات اختراق أمني دورية' },
      { key: 'q3b_7_monitoring', label: 'سياسة الاحتفاظ بالبيانات (المدة والتخزين)' },
      { key: 'q3b_8_incident', label: 'طرائق الاتصالات والحاجة للإنترنت' },
    ]
  },
  {
    id: 'guarantees',
    title: 'رابعاً: أ- الضمانات وملكية البيانات',
    color: '#d97706',
    bg: '#fffbeb',
    questions: [
      { key: 'q4_1_bankGuarantee', aliases: ['q4_1_bankguarantee'], label: 'خطاب الضمان المصرفي غير المشروط' },
      { key: 'q4_2_penaltyClause', aliases: ['q4_2_penaltyclause'], label: 'الالتزام بسرية البيانات (NDA)' },
      { key: 'q4_3_dataOwnership', aliases: ['q4_3_dataownership'], label: 'ملكية البيانات تعود للجامعة حصراً' },
    ]
  },
  {
    id: 'legal',
    title: 'رابعاً: ب- الالتزامات القانونية والتعاقدية',
    color: '#dc2626',
    bg: '#fff1f2',
    questions: [
      { key: 'q4_4_exitClause', aliases: ['q4_4_exitclause'], label: 'برامج تدريبية مجانية لموظفي الجامعة' },
      { key: 'q4_5_liability', label: 'حق الجامعة بفسخ العقد فورياً عند الإخلال' },
      { key: 'q4_6_jurisdiction', label: 'القانون العراقي واختصاص محاكم محافظة بابل' },
      { key: 'q4_7_auditRight', aliases: ['q4_7_auditright'], label: 'اللجوء للتحكيم التجاري وفق الأنظمة العراقية' },
      { key: 'q4_8_contractDuration', aliases: ['q4_8_contractduration'], label: 'مدة العقد المقترحة وشروط التجديد' },
      { key: 'q4_9_renewal', label: 'آلية استقبال ومعالجة شكاوى الطلبة' },
      { key: 'q4_10_blacklist', label: 'تسجيل في القائمة السوداء للبنك المركزي' },
    ]
  },
  {
    id: 'extra',
    title: 'خامساً: الخدمات الإضافية والميزات التنافسية',
    color: '#0d9488',
    bg: '#f0fdfa',
    questions: [
      { key: 'q5_1_extraFeatures', aliases: ['q5_1_extrafeatures'], label: 'تطبيق هاتفي (iOS/Android) والخدمات المتاحة' },
      { key: 'q5_2_innovation', label: 'خدمات مصرفية إضافية ومحافظ رقمية' },
      { key: 'q5_3_scholarships', label: 'الطاقة الاستيعابية لمعالجة المعاملات اليومية' },
      { key: 'q5_4_staffTraining', aliases: ['q5_4_stafftraining'], label: 'دعم الفعاليات والمؤتمرات العلمية (Sponsor)' },
      { key: 'q5_5_posUpdates', aliases: ['q5_5_posupdates'], label: 'التحديث الدوري لأجهزة PoS والأنظمة' },
      { key: 'q5_6_foreignPayments', aliases: ['q5_6_foreignpayments'], label: 'إمكانية تسديد أجور بالدولار لمصارف خارجية' },
      { key: 'q5_7_complaints', label: 'ميزات إضافية لصالح جامعة بابل تحديداً' },
      { key: 'q5_8_socialResp', aliases: ['q5_8_socialresp'], label: 'المؤسسات الحكومية المخدَّمة والمتعاملة مع مصرف الرشيد' },
    ]
  }
];

const getValue = (company, question) => {
  // Try main key (exact and lowercase)
  let val = company[question.key] || company[question.key?.toLowerCase()];
  if (val) return val;

  // Try aliases
  if (question.aliases) {
    for (const alias of question.aliases) {
      val = company[alias] || company[alias?.toLowerCase()];
      if (val) return val;
    }
  }

  // Try inside nested data object
  const data = company.data || {};
  val = data[question.key] || data[question.key?.toLowerCase()];
  if (val) return val;

  if (question.aliases) {
    for (const alias of question.aliases) {
      val = data[alias] || data[alias?.toLowerCase()];
      if (val) return val;
    }
  }

  return null;
};

const COLORS = ['#6366f1', '#059669', '#d97706', '#dc2626', '#0ea5e9', '#7c3aed', '#0d9488', '#f59e0b'];

const QuestionComparison = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState({ general: true, financial: true, technical: true, security: true, guarantees: true, legal: true, extra: true });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data: subs, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'final')
        .order('last_updated', { ascending: false });

      if (error) throw error;

      const mapped = (subs || []).map(sub => ({
        ...sub,
        ...(sub.data || {}),
        companyName: (sub.data?.companyName) || sub.companyname || sub.companyName || sub.username,
        representativeName: (sub.data?.representativeName) || sub.representativename || '---',
      }));

      setCompanies(mapped);
    } catch (err) {
      console.error('Error fetching:', err);
      alert('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c =>
    (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSection = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = async () => {
    setIsExporting(true);
    // Expand all sections before printing to ensure everything is visible
    setOpenSections({ general: true, financial: true, technical: true, security: true, guarantees: true, legal: true, extra: true });
    
    // Give state time to update and DOM to render
    setTimeout(async () => {
      await exportToPdf('comparison-print-area', 'مقارنة-الشركات-المتقدمة.pdf');
      setIsExporting(false);
    }, 500);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-black text-indigo-950 text-lg">جاري تحميل بيانات الشركات...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm print:hidden sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-indigo-600 font-black hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all text-sm"
            >
              <ArrowRight className="w-4 h-4" />
              لوحة الإدارة
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <div>
              <h1 className="text-xl font-black text-indigo-950">مقارنة الشركات سؤالاً بسؤال</h1>
              <p className="text-xs text-gray-400 font-bold">{filteredCompanies.length} شركة مقدِّمة للعرض النهائي</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
              <input
                type="text"
                placeholder="بحث باسم الشركة..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pr-9 pl-4 py-2 text-sm border-2 border-gray-100 rounded-xl outline-none focus:border-indigo-500 font-bold w-52 transition-all"
              />
            </div>
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="flex items-center gap-2 bg-indigo-950 text-white px-5 py-2 rounded-xl font-black text-sm hover:bg-indigo-900 transition-all disabled:opacity-50"
            >
              {isExporting ? <span className="animate-spin">⌛</span> : <Download className="w-4 h-4" />}
              طباعة / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Companies Legend */}
      {filteredCompanies.length > 0 && (
        <div className="max-w-[1800px] mx-auto px-6 py-4 print:hidden">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">دليل الألوان - الشركات المقارنة</p>
            <div className="flex flex-wrap gap-3">
              {filteredCompanies.map((c, idx) => (
                <div key={c.id || idx} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-xs font-black text-gray-700">{c.companyName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No data */}
      {filteredCompanies.length === 0 && !loading && (
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
          <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-400">لا توجد شركات بعروض نهائية</h3>
          <p className="text-sm text-gray-300 font-bold mt-2">ستظهر المقارنة بمجرد إرسال الشركات لعروضها النهائية</p>
        </div>
      )}

      {/* Sections Area - Wrap with ID for PDF Export */}
      <div id="comparison-print-area" className="max-w-[1800px] mx-auto px-6 pb-20 space-y-4 bg-slate-50 pt-4" style={{ direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
        {SECTIONS.map(section => (
          <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all print:pointer-events-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: section.color }}></div>
                <h2 className="text-base font-black" style={{ color: section.color }}>{section.title}</h2>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{section.questions.length} سؤال</span>
              </div>
              <div className="print:hidden">
                {openSections[section.id] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </button>

            {/* Questions Table */}
            {(openSections[section.id] || true) && (
              <div className="overflow-x-auto border-t border-gray-100">
                <table className="w-full text-right" style={{ minWidth: `${Math.max(600, filteredCompanies.length * 280 + 260)}px` }}>
                  <thead>
                    <tr style={{ backgroundColor: section.bg }}>
                      <th className="px-5 py-4 text-sm font-black text-gray-700 w-64 sticky right-0" style={{ backgroundColor: section.bg }}>
                        السؤال
                      </th>
                      {filteredCompanies.map((c, idx) => (
                        <th key={c.id || idx} className="px-4 py-4 text-sm font-black min-w-[250px]" style={{ color: COLORS[idx % COLORS.length] }}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                            {c.companyName}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {section.questions.map((q, qIdx) => (
                      <tr key={q.key} className={qIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                        {/* Question label */}
                        <td className="px-5 py-4 sticky right-0 z-10 border-l border-gray-100" style={{ backgroundColor: qIdx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                          <p className="text-xs font-black text-gray-700 leading-relaxed">{q.label}</p>
                        </td>
                        {/* Each company answer */}
                        {filteredCompanies.map((c, idx) => {
                          const val = getValue(c, q);
                          return (
                            <td key={c.id || idx} className="px-4 py-4 align-top border-l border-gray-50 last:border-l-0">
                              {val ? (
                                <div
                                  className="text-xs font-bold leading-relaxed p-3 rounded-xl"
                                  style={{
                                    backgroundColor: `${COLORS[idx % COLORS.length]}08`,
                                    borderRight: `3px solid ${COLORS[idx % COLORS.length]}`,
                                    color: '#1e293b'
                                  }}
                                >
                                  {val}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-300 font-bold p-3 text-center">
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { font-size: 11px; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default QuestionComparison;
