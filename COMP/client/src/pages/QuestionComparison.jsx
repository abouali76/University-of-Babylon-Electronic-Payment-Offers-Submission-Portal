import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Search, ChevronDown, ChevronUp, Download, Sparkles, X, Key } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

const CATEGORIES = [
  { id: 'all', label: 'الكل' },
  { id: 'financial', label: 'الجانب المالي', sections: ['financial'] },
  { id: 'technical', label: 'الجانب الفني والأمني', sections: ['technical', 'security', 'guarantees'] },
  { id: 'legal', label: 'الجانب القانوني والإداري', sections: ['general', 'legal', 'extra'] }
];

const QuestionComparison = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState({ general: true, financial: true, technical: true, security: true, guarantees: true, legal: true, extra: true });
  const [activeCategory, setActiveCategory] = useState('all');

  // Analysis State
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [analyzingQuestion, setAnalyzingQuestion] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const visibleSections = activeCategory === 'all' 
    ? SECTIONS 
    : SECTIONS.filter(sec => CATEGORIES.find(c => c.id === activeCategory)?.sections.includes(sec.id));

  const toggleSection = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const handlePrintAnalysis = () => {
    const printWindow = window.open('', '_blank');
    const content = document.getElementById('analysis-markdown-content');
    if (!content) return;
    
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>طباعة التقييم</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 30px; direction: rtl; color: #111; line-height: 1.6; }
            h3 { color: #1e1b4b; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; font-size: 18px; }
            h4 { color: #4338ca; margin-top: 25px; margin-bottom: 15px; font-size: 16px; }
            ul { list-style-type: none; padding-right: 0; }
            li { padding: 10px 0; border-bottom: 1px dashed #e5e7eb; }
            strong { color: #111827; }
            p { margin-bottom: 10px; }
            @media print {
              body { padding: 0; }
              @page { margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div id="print-content"></div>
        </body>
      </html>
    `);
    
    printWindow.document.getElementById('print-content').innerHTML = content.innerHTML;
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handlePrint = () => {
    // Expand all sections before printing to ensure everything is visible
    setOpenSections({ general: true, financial: true, technical: true, security: true, guarantees: true, legal: true, extra: true });
    
    // Give state time to update
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Local Heuristic Analysis Logic
  const handleAnalyzeClick = (question, isComprehensive = false) => {
    setAnalyzingQuestion(isComprehensive ? { label: 'التقييم الشامل لجميع الأقسام', isComprehensive: true } : question);
    runAnalysis(isComprehensive ? null : question, isComprehensive);
  };

  const runAnalysis = async (question, isComprehensive = false) => {
    setIsAnalysisModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult('');

    // Simulate analysis time for UX
    setTimeout(() => {
      let markdown = '';
      if (isComprehensive) {
        let globalScores = {};
        filteredCompanies.forEach(c => {
          globalScores[c.companyName] = { score: 0, answersCount: 0, strengths: [], weaknesses: [] };
        });

        visibleSections.forEach(section => {
          section.questions.forEach(q => {
            filteredCompanies.forEach(c => {
              const val = getValue(c, q) || '';
              const t = val.toLowerCase();
              if (val && val !== 'لم يتم تقديم إجابة' && val.trim() !== '') {
                globalScores[c.companyName].answersCount++;
                
                let qScore = 0;
                const positiveKw = ['نعم', 'متوفر', 'مجانا', 'فوري', '24/7', 'متكامل', 'يوجد', 'نلتزم', 'مجانية', 'كافة', 'مفتوح', 'دينار', 'دولار', 'متاح', 'يومي', 'مركزي'];
                positiveKw.forEach(kw => { if (t.includes(kw)) qScore += 2; });
                
                const negativeKw = ['لا', 'غير متوفر', 'قيد التطوير', 'لاحقا', 'كلا', 'غير ممكن'];
                negativeKw.forEach(kw => { if (t.includes(kw)) qScore -= 3; });
                
                qScore += Math.min(2, Math.floor(val.length / 50));

                globalScores[c.companyName].score += qScore;
                
                if (qScore >= 2 && globalScores[c.companyName].strengths.length < 5) {
                  if (!globalScores[c.companyName].strengths.includes(q.label)) globalScores[c.companyName].strengths.push(q.label);
                } else if (qScore < 0 && globalScores[c.companyName].weaknesses.length < 5) {
                  if (!globalScores[c.companyName].weaknesses.includes(q.label)) globalScores[c.companyName].weaknesses.push(q.label);
                }
              }
            });
          });
        });

        const sorted = Object.keys(globalScores).map(name => ({
          name,
          ...globalScores[name]
        })).sort((a, b) => b.score - a.score);

        markdown = `### ملخص التقييم الشامل لعروض الشركات\n\n`;
        
        markdown += `#### 🏆 الترتيب النهائي:\n`;
        sorted.forEach((c, idx) => {
          markdown += `${idx + 1}. **${c.name}** (مؤشر التقييم: ${c.score} نقطة)\n`;
        });

        markdown += `\n#### 📊 تفاصيل الأداء:\n`;
        sorted.forEach(c => {
          markdown += `- **${c.name}:** أجابت على ${c.answersCount} سؤالاً.\n`;
          if (c.strengths.length > 0) markdown += `  - **نقاط القوة:** تميزت في (${c.strengths.join('، ')}).\n`;
          if (c.weaknesses.length > 0) markdown += `  - **ملاحظات:** إجابات ضعيفة أو غير مكتملة في (${c.weaknesses.join('، ')}).\n`;
        });

      } else {
        const scoredCompanies = filteredCompanies.map(c => {
          let score = 0;
          const val = getValue(c, question) || '';
          const t = val.toLowerCase();
          
          if (!val || val === 'لم يتم تقديم إجابة' || val.trim() === '') {
            return { ...c, score: -999, status: 'لم تقدم إجابة', capabilities: 'لا توجد بيانات' };
          }

          const positiveKw = ['نعم', 'متوفر', 'مجانا', 'فوري', '24/7', 'متكامل', 'يوجد', 'نلتزم', 'مجانية', 'مفتوح', 'كافة', 'متاح', 'يومي', 'مركزي'];
          positiveKw.forEach(kw => { if (t.includes(kw)) score += 10; });

          const negativeKw = ['لا', 'غير متوفر', 'قيد التطوير', 'لاحقا', 'كلا', 'غير ممكن'];
          negativeKw.forEach(kw => { if (t.includes(kw)) score -= 15; });

          score += Math.min(5, Math.floor(val.length / 20));

          return { 
            ...c, 
            score, 
            status: score >= 10 ? 'ممتاز' : score >= 0 ? 'جيد/مقبول' : 'ضعيف',
            capabilities: val
          };
        });

        scoredCompanies.sort((a, b) => b.score - a.score);

        markdown = `### تقييم إجابات الشركات: ${question.label}\n\n`;
        markdown += `#### 🔍 تطابق الإجابات والإمكانيات المجهزة:\n`;
        scoredCompanies.forEach(c => {
          markdown += `- **شركة ${c.companyName}:** ${c.capabilities} *(التقييم: ${c.status})*\n`;
        });

        markdown += `\n#### 🏆 ترتيب الشركات (من الأفضل للأسوأ):\n`;
        let rank = 1;
        scoredCompanies.forEach((c) => {
          if (c.score === -999) {
              markdown += `- **${c.companyName}** - لم تقدم إجابة كافية للتقييم.\n`;
          } else {
              const reason = c.score >= 10 ? 'قدمت إجابة شاملة تتوافق مع المتطلبات' : c.score >= 0 ? 'وفرت الحد الأدنى من المتطلبات' : 'إجابتها لا تلبي الطموح أو سلبية';
              markdown += `${rank}. **${c.companyName}** - ${reason}.\n`;
              rank++;
          }
        });
      }

      setAnalysisResult(markdown);
      setIsAnalyzing(false);
    }, 800);
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
            <div className="relative print:hidden">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
              <input
                type="text"
                placeholder="بحث باسم الشركة..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pr-9 pl-4 py-2 text-sm border-2 border-gray-100 rounded-xl outline-none focus:border-indigo-500 font-bold w-52 transition-all"
              />
            </div>
            
            {filteredCompanies.length > 0 && (
              <button
                onClick={() => handleAnalyzeClick(null, true)}
                className="print:hidden flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl font-black text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200"
                title="تقييم شامل لجميع الأسئلة والأقسام"
              >
                <Sparkles className="w-4 h-4" />
                تقييم شامل
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-950 text-white px-5 py-2 rounded-xl font-black text-sm hover:bg-indigo-900 transition-all"
            >
              <Download className="w-4 h-4" />
              طباعة / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Categories / Specialties Filter */}
      <div className="max-w-[1800px] mx-auto px-6 py-4 print:hidden flex justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex gap-2 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                activeCategory === cat.id 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-indigo-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Legend */}
      {filteredCompanies.length > 0 && (
        <div className="max-w-[1800px] mx-auto px-6 pb-4 pt-0 print:hidden">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">دليل الألوان - الشركات المقارنة</p>
            <div className="flex flex-wrap gap-3">
              {filteredCompanies.map((c, idx) => (
                <button 
                  key={c.id || idx} 
                  onClick={() => navigate('/admin', { state: { selectedCompanyUsername: c.username } })}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer text-right group"
                  title="الذهاب إلى تفاصيل الشركة"
                >
                  <div className="w-3 h-3 rounded-full shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-xs font-black text-gray-700 group-hover:text-indigo-900 transition-colors">{c.companyName}</span>
                </button>
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
        {visibleSections.map(section => (
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
                          <button 
                            onClick={() => navigate('/admin', { state: { selectedCompanyUsername: c.username } })}
                            className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-pointer group text-right w-full"
                            title="الذهاب إلى تفاصيل الشركة"
                          >
                            <div className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                            <span className="group-hover:underline decoration-2 underline-offset-4">{c.companyName}</span>
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {section.questions.map((q, qIdx) => (
                      <tr key={q.key} className={qIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                        {/* Question label */}
                        <td className="px-5 py-4 sticky right-0 z-10 border-l border-gray-100" style={{ backgroundColor: qIdx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                          <div className="flex flex-col gap-3">
                            <p className="text-xs font-black text-gray-700 leading-relaxed">{q.label}</p>
                            <button
                              onClick={() => handleAnalyzeClick(q)}
                              className="print:hidden self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-[10px] font-black border border-indigo-100 shadow-sm"
                              title="التحليل الذكي للإجابات"
                            >
                              <Sparkles className="w-3 h-3" />
                              تحليل ذكي
                            </button>
                          </div>
                        </td>
                        {/* Each company answer */}
                        {filteredCompanies.map((c, idx) => {
                          const val = getValue(c, q);
                          return (
                            <td key={c.id || idx} className="px-4 py-4 align-top border-l border-gray-50 last:border-l-0">
                              {val ? (
                                <div
                                  className="text-xs font-bold leading-relaxed p-3 rounded-xl answer-box"
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
          @page { 
            size: A4 landscape; 
            margin: 8mm; 
          }
          
          /* Reset everything */
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body { 
            font-size: 16px !important; 
            font-family: 'Arial', 'Tahoma', sans-serif !important;
            direction: rtl !important;
            background: white !important;
            font-weight: bold !important;
          }
          
          /* Hide non-printable elements */
          .print\\:hidden { display: none !important; }
          .print\\:pointer-events-none { pointer-events: none !important; }
          nav, header, .sticky { position: static !important; }

          /* Container */
          #comparison-print-area {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            background: white !important;
          }
          #comparison-print-area > div {
            border-radius: 0 !important;
            box-shadow: none !important;
            margin-bottom: 12px !important;
            border: 1px solid #333 !important;
            page-break-inside: avoid;
          }

          /* Section headers */
          #comparison-print-area button {
            padding: 6px 10px !important;
            border-bottom: 2px solid #333 !important;
            background: #f0f0f0 !important;
          }
          #comparison-print-area button h2 {
            font-size: 18px !important;
            font-weight: 900 !important;
            color: #000 !important;
          }
          
          /* Table container */
          .overflow-x-auto { 
            overflow: visible !important; 
          }

          /* TABLE - strict formatting */
          table { 
            width: 100% !important; 
            max-width: 100% !important; 
            min-width: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            page-break-inside: auto !important;
            font-size: 16px !important;
            font-weight: bold !important;
          }

          /* Header row */
          thead tr {
            background: #e8e8e8 !important;
          }
          thead th {
            position: static !important;
            padding: 5px 6px !important;
            font-size: 16px !important;
            font-weight: 900 !important;
            color: #000 !important;
            border: 1px solid #999 !important;
            text-align: right !important;
            vertical-align: middle !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }
          /* First column (question) gets more width */
          thead th:first-child {
            width: 22% !important;
            min-width: 0 !important;
            background: #d9d9d9 !important;
          }

          /* Body cells */
          tbody td {
            position: static !important;
            padding: 4px 5px !important;
            font-size: 16px !important;
            font-weight: bold !important;
            color: #1a1a1a !important;
            border: 1px solid #bbb !important;
            text-align: right !important;
            vertical-align: top !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            line-height: 1.4 !important;
          }
          /* Question column styling */
          tbody td:first-child {
            width: 22% !important;
            min-width: 0 !important;
            background: #f5f5f5 !important;
            font-weight: 900 !important;
            font-size: 16px !important;
          }
          
          /* Alternating row colors */
          tbody tr:nth-child(even) {
            background: #fafafa !important;
          }
          tbody tr:nth-child(odd) {
            background: #ffffff !important;
          }
          
          /* Answer boxes inside cells */
          tbody td div.answer-box {
            padding: 2px !important;
            margin: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            border: none !important;
            border-right: 2px solid #666 !important;
            font-size: 16px !important;
            font-weight: bold !important;
          }
          
          /* Row breaks */
          tr { 
            page-break-inside: avoid !important; 
          }
          
          /* Remove all shadows and rounded corners */
          .shadow-sm, .shadow-xl, .shadow-2xl { box-shadow: none !important; }
          .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-full { border-radius: 0 !important; }
        }
      `}</style>

      {/* API Key Modal Removed */}

      {/* Analysis Modal */}
      {isAnalysisModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col" dir="rtl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-indigo-950 text-lg">تقييم إجابات الشركات</h3>
                  <p className="text-xs font-bold text-gray-500 mt-0.5 max-w-2xl truncate">
                    {analyzingQuestion?.label}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsAnalysisModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto text-indigo-600 w-6 h-6 animate-pulse" />
                  </div>
                  <p className="font-black text-indigo-950">جاري قراءة البيانات وتحليل الإجابات...</p>
                  <p className="text-xs font-bold text-gray-400">يتم ترتيب الشركات واستخراج الإمكانيات</p>
                </div>
              ) : (
                <div className="prose prose-sm md:prose-base prose-indigo max-w-none 
                  prose-headings:font-black prose-headings:text-indigo-950 
                  prose-p:font-bold prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-strong:font-black prose-strong:text-indigo-900
                  bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div id="analysis-markdown-content">
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex justify-end items-center">
              <button 
                onClick={handlePrintAnalysis}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                طباعة التقييم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionComparison;
