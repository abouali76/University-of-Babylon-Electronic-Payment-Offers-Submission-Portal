import React from 'react';

const PrintTemplate = ({ data }) => {
  if (!data) return null;

  // Robust value lookup (same logic as AdminPanel)
  const getVal = (key, aliases = []) => {
    if (data[key]) return data[key];
    if (aliases) {
      for (const alias of aliases) {
        if (data[alias]) return data[alias];
      }
    }
    const lowerKey = key.toLowerCase();
    if (data[lowerKey]) return data[lowerKey];
    const noPrefix = key.replace(/^q\d[a-z]?_\d_/, '');
    if (data[noPrefix]) return data[noPrefix];
    const noPrefixLower = noPrefix.toLowerCase();
    if (data[noPrefixLower]) return data[noPrefixLower];
    return '';
  };

  const styles = {
    container: {
      width: '210mm',
      backgroundColor: '#ffffff',
      color: '#000000',
      direction: 'rtl',
      fontFamily: "'IBM Plex Sans Arabic', Arial, sans-serif",
      padding: '20px 40px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '3px solid #1e1b4b',
      paddingBottom: '15px',
      marginBottom: '20px'
    },
    sectionTitle: {
      backgroundColor: '#1e1b4b',
      color: '#ffffff',
      padding: '4px 12px',
      fontWeight: 'bold',
      fontSize: '13px',
      marginBottom: '10px',
      borderRadius: '2px'
    },
    label: {
      color: '#1e1b4b',
      fontWeight: 'bold',
      width: '45%'
    },
    row: {
      display: 'flex',
      borderBottom: '1px solid #f1f5f9',
      paddingBottom: '4px',
      fontSize: '11.5px',
      marginBottom: '5px'
    },
    questionBox: {
      backgroundColor: '#f8fafc',
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #e2e8f0',
      marginBottom: '8px',
      pageBreakInside: 'avoid'
    }
  };

  return (
    <div id="print-area" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e1b4b', margin: 0 }}>جامعة بابل</h1>
          <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '2px 0 0 0' }}>لجنة معايير التعاقد مع شركات الدفع الالكتروني</p>
        </div>
        <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
        <div style={{ textAlign: 'left', fontSize: '9px', fontWeight: 'bold', color: '#64748b' }}>
          <p style={{ margin: 0 }}>التاريخ: {new Date().toLocaleDateString('ar-IQ')}</p>
          <p style={{ margin: 0 }}>الرقم المرجعي: UOB-{String(data.username || '').toUpperCase()}</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#1e1b4b', fontWeight: '900' }}>تقييم اللجنة: {data.evaluation_score || 0} / 10</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '900', border: '1.5px solid #1e1b4b', display: 'inline-block', padding: '6px 25px', borderRadius: '8px' }}>استمارة معايير التعاقد مع شركات الدفع الالكتروني (نسخة رسمية)</h2>
      </div>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>أولاً: معلومات الشركة العامة</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 30px' }}>
          <InfoRow label="اسم الشركة" value={getVal('companyName', ['companyname'])} styles={styles} />
          <InfoRow label="تاريخ التقديم" value={getVal('submissionDate', ['submissiondate'])} styles={styles} />
          <InfoRow label="الممثل الرسمي" value={getVal('representativeName', ['representativename'])} styles={styles} />
          <InfoRow label="رقم الهاتف" value={getVal('phone')} styles={styles} />
          <InfoRow label="البريد الإلكتروني" value={getVal('email')} styles={styles} />
          <InfoRow label="إجازة البنك المركزي" value={getVal('centralBankLicense', ['centralbanklicense'])} styles={styles} />
          <InfoRow label="سنوات الخبرة" value={getVal('marketExperience', ['marketexperience'])} styles={styles} />
          <InfoRow label="المؤسسات الحكومية" value={getVal('govInstitutionsCount', ['govinstitutionscount'])} styles={styles} />
          <InfoRow label="الملاءة المالية" value={getVal('paidCapital', ['paidcapital'])} styles={styles} />
          <InfoRow label="العنوان الرسمي" value={getVal('officialAddress', ['officialaddress'])} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>ثانياً: الالتزامات التشغيلية والمالية (8 أسئلة)</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. ما هي الآلية المعتمدة لإجراء التسوية المالية (المقاصة) مع مصرف الرشيد؟ وهل تلتزمون بالإيداع خلال 12 ساعة عمل؟" value={getVal('q2_1_settlement')} styles={styles} />
          <QuestionBox label="2. ما هي نسب العمولات والخصومات المقترحة؟ وهل توافقون على مراجعتها دورياً وإشعار الجامعة قبل 30 يوماً من أي تعديل؟" value={getVal('q2_2_commissions')} styles={styles} />
          <QuestionBox label="3. هل يوجد وسيط (مصرف آخر) لنقل المبالغ أم مباشرة؟ يرجى ذكر تفاصيل سير الحركات المالية." value={getVal('q2_3_intermediary')} styles={styles} />
          <QuestionBox label="4. ما قيمة غرامة التأخير المقترحة عن كل ساعة تجاوز مدة التسوية المتفق عليها؟" value={getVal('q2_4_delayPenalty')} styles={styles} />
          <QuestionBox label="5. هل تلتزمون بتوفير جهاز صراف آلي (ATM) يملأ دائماً داخل الجامعة؟" value={getVal('q2_5_atmCommitment')} styles={styles} />
          <QuestionBox label="6. ما هي تفاصيل إصدار بطاقات الطلبة؟ (رسوم الإصدار، التجديد، بدل الضائع، مدة الإصدار)" value={getVal('q2_6_studentCards')} styles={styles} />
          <QuestionBox label="7. هل توفرون مراكز تعبئة كافية داخل الكليات؟ وما هي ساعات العمل المقترحة لها؟" value={getVal('q2_7_chargingCenters')} styles={styles} />
          <QuestionBox label="8. هل تلتزمون بتجهيز نقاط البيع (PoS) والورق الحراري مجاناً؟ وما هو زمن الاستجابة للصيانة (SLA)؟" value={getVal('q2_8_posCommitment')} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>ثالثاً: أ- النظام الإلكتروني والتكامل (6 أسئلة)</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. هل يتوفر لديكم نظام إلكتروني متكامل يُبيّن جميع الحركات المالية؟" value={getVal('q3a_1_integratedSystem')} styles={styles} />
          <QuestionBox label="2. هل يمكن إصدار بطاقات خاصة بكل كلية أو وحدة إدارية بدون عمولات تحويل داخلية؟" value={getVal('q3a_2_techSpecs')} styles={styles} />
          <QuestionBox label="3. هل يمكن للجامعة الحصول على كشف حساب لحظي (Real-time) في أي وقت؟" value={getVal('q3a_3_appSupport')} styles={styles} />
          <QuestionBox label="4. هل يمكن تحقيق تكامل إلكتروني مع موقع الجامعة يتيح التسديد عبر رابط آمن أو QR كود؟" value={getVal('q3a_4_webIntegration')} styles={styles} />
          <QuestionBox label="5. هل توفرون خدمة التحويلات خارج العراق؟ يرجى بيان العمولات والحدود اليومية." value={getVal('q3a_5_reporting')} styles={styles} />
          <QuestionBox label="6. هل يتوفر رقم IBAN لكل بطاقة؟ وهل هو متوافق مع معايير الدفع الدولية؟" value={getVal('q3a_6_training')} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>ثالثاً: ب- الأمن السيبراني والاستمرارية (8 أسئلة)</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. ما هي شهادات الأمن المعتمدة لديكم؟ (PCI-DSS / ISO 27001 / غيرها)" value={getVal('q3b_1_certificates')} styles={styles} />
          <QuestionBox label="2. ما هو بروتوكول التشفير المستخدم في المعاملات؟" value={getVal('q3b_2_encryption')} styles={styles} />
          <QuestionBox label="3. ما هو الحد الأقصى لوقت استعادة الخدمة عند الانقطاع (RTO)؟" value={getVal('q3b_3_rto_bcp')} styles={styles} />
          <QuestionBox label="4. هل توفرون نسخاً احتياطية يومية للبيانات؟ أين تُخزَّن؟" value={getVal('q3b_4_backups')} styles={styles} />
          <QuestionBox label="5. ما هو نظام الدعم الفني؟ هل يتوفر على مدار الساعة (24/7)؟" value={getVal('q3b_5_supportSla')} styles={styles} />
          <QuestionBox label="6. هل تُجرون اختبارات اختراق أمني (Penetration Testing) دورية؟" value={getVal('q3b_6_penTest')} styles={styles} />
          <QuestionBox label="7. ما هي سياسة شركتكم في الاحتفاظ بالبيانات؟ (المدة الزمنية، مكان التخزين)" value={getVal('q3b_7_monitoring')} styles={styles} />
          <QuestionBox label="8. ما هي طرائق الاتصالات المستخدمة وهل تحتاج انترنت؟" value={getVal('q3b_8_incident')} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>رابعاً: أ- الضمانات وملكية البيانات</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. خطاب الضمان المصرفي: هل تقدمون خطاب ضمان مصرفي غير مشروط لصالح الجامعة؟" value={getVal('q4_1_bankGuarantee')} styles={styles} />
          <QuestionBox label="2. سرية البيانات: هل تلتزمون بسرية البيانات وتوقيع اتفاقية (NDA) رسمية؟" value={getVal('q4_2_penaltyClause')} styles={styles} />
          <QuestionBox label="3. ملكية البيانات واستردادها: هل توافقون على أن ملكية البيانات تعود للجامعة حصراً؟" value={getVal('q4_3_dataOwnership')} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>رابعاً: ب- الالتزامات القانونية والتعاقدية (7 أسئلة)</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="4. هل تقدمون برامج تدريبية مجانية لموظفي الجامعة؟" value={getVal('q4_4_exitClause')} styles={styles} />
          <QuestionBox label="5. هل توافقون على حق الجامعة بفسخ العقد فورياً عند الإخلال الجوهري؟" value={getVal('q4_5_liability')} styles={styles} />
          <QuestionBox label="6. هل توافقون على تطبيق القانون العراقي النافذ، واختصاص محاكم محافظة بابل؟" value={getVal('q4_6_jurisdiction')} styles={styles} />
          <QuestionBox label="7. هل توافقون على اللجوء إلى التحكيم التجاري وفق الأنظمة العراقية؟" value={getVal('q4_7_auditRight')} styles={styles} />
          <QuestionBox label="8. ما هي مدة العقد المقترحة؟ وما شروط التجديد والتعديل؟" value={getVal('q4_8_contractDuration')} styles={styles} />
          <QuestionBox label="9. ما هي آلية استقبال ومعالجة شكاوى الطلبة؟ وما الحد الأقصى للمدة؟" value={getVal('q4_9_renewal')} styles={styles} />
          <QuestionBox label="10. هل الشركة مسجلة ضمن القائمة السوداء حسب اعمامات البنك المركزي العراقي أو محظور التعامل معها داخل او خارج العراق؟" value={getVal('q4_10_blacklist')} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>خامساً: الخدمات الإضافية والميزات التنافسية (8 أسئلة)</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. هل تقدمون تطبيق هاتفي (iOS/Android)؟ ما الخدمات المتاحة فيه؟" value={getVal('q5_1_extraFeatures')} styles={styles} />
          <QuestionBox label="2. هل تقدمون خدمات مصرفية إضافية مثل: محفظة رقمية، صرف راتب إلكتروني؟" value={getVal('q5_2_innovation')} styles={styles} />
          <QuestionBox label="3. ما الحد الأقصى لعدد المعاملات اليومية التي يستطيع نظامكم معالجتها؟" value={getVal('q5_3_scholarships')} styles={styles} />
          <QuestionBox label="4. هل تقدمون الدعم (Sponsor) لتغطية تكاليف الفعاليات والمؤتمرات العلمية؟" value={getVal('q5_4_staffTraining')} styles={styles} />
          <QuestionBox label="5. هل هنالك تحديث دوري لأجهزة PoS والأنظمة الإلكترونية؟" value={getVal('q5_5_posUpdates', ['q5_5_mobileApp', 'mobileApp', 'posUpdates'])} styles={styles} />
          <QuestionBox label="6. هل هنالك إمكانية تسديد أجور بعملة الدولار إلى مصارف خارج البلد؟" value={getVal('q5_6_foreignPayments', ['q5_6_foreignStudents', 'foreignStudents', 'foreignPayments'])} styles={styles} />
          <QuestionBox label="7. هل تقدمون أي ميزات إضافية أو عروض تنافسية لصالح جامعة بابل تحديداً؟" value={getVal('q5_7_complaints')} styles={styles} />
          <QuestionBox label="8. ذكر المؤسسات الحكومية المخدَّمة حالياً، وما هي التي تتعامل مع مصرف الرشيد؟" value={getVal('q5_8_socialResp', ['socialResp'])} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>سادساً: الملاحظات والوثائق</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="المستندات المرفقة" value={getVal('documentUrl', ['document_url', 'document_path']) ? "تم إرفاق الملف رسمياً عبر البوابة الإلكترونية" : "لم يتم إرفاق ملفات."} styles={styles} />
          <QuestionBox label="ملاحظات إضافية من الشركة" value={getVal('additionalNotes', ['additionalnotes'])} styles={styles} />
        </div>
      </section>

      <section style={{ marginTop: '20px', padding: '10px', border: '1px solid #1e1b4b', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
        <p style={{ fontSize: '10px', fontWeight: '900', color: '#1e1b4b', marginBottom: '5px' }}>إقرار وتعهد الشركة:</p>
        <p style={{ fontSize: '9.5px', fontWeight: 'bold', lineHeight: '1.5', margin: 0 }}>
          تقر الشركة بصحة كافة البيانات والمعلومات الواردة في هذا العرض. وفي حالة عدم صحة المعلومات المقدمة من قبل الشركة، يحق للجامعة فسخ العقد دون اللجوء إلى المحاكم المختصة، وتحتفظ الجامعة بحقها الكامل في المطالبة بكافة التعويضات القانونية المترتبة على ذلك.
        </p>
      </section>

      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', textAlign: 'center' }}>
        <div>
          <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '35px' }}>ختم وتوقيع الشركة</p>
          <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold' }}>{getVal('signedBy', ['signedby']) || '........................'}</p>
            <p style={{ fontSize: '9px', color: '#64748b' }}>{getVal('position')}</p>
          </div>
        </div>
        <div>
          <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '35px' }}>مصادقة جامعة بابل</p>
          <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#cbd5e1' }}>ختم اللجنة الرسمية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, styles }) => (
  <div style={styles.row}>
    <span style={styles.label}>{label}:</span>
    <span style={{ width: '55%' }}>{value || '---'}</span>
  </div>
);

const QuestionBox = ({ label, value, styles }) => (
  <div style={styles.questionBox}>
    <p style={{ fontWeight: '900', color: '#1e1b4b', marginBottom: '5px', fontSize: '11.5px', lineHeight: '1.4' }}>{label}</p>
    <p style={{ lineHeight: '1.6', fontSize: '11px', color: '#334155', whiteSpace: 'pre-wrap' }}>{value || 'لم يتم تقديم إجابة.'}</p>
  </div>
);

export default PrintTemplate;
