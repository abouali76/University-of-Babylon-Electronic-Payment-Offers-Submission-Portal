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
      fontFamily: 'Arial, sans-serif',
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
      paddingBottom: '2px',
      fontSize: '11px',
      marginBottom: '3px'
    },
    questionBox: {
      backgroundColor: '#f8fafc',
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #e2e8f0',
      marginBottom: '8px'
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
          <QuestionBox label="1. آلية التسوية المالية (12 ساعة)" value={getVal('q2_1_settlement')} styles={styles} />
          <QuestionBox label="2. العمولات والخصومات المقترحة" value={getVal('q2_2_commissions')} styles={styles} />
          <QuestionBox label="3. الوسيط المالي / البنك الوسيط" value={getVal('q2_3_intermediary')} styles={styles} />
          <QuestionBox label="4. قيمة غرامات التأخير" value={getVal('q2_4_delayPenalty')} styles={styles} />
          <QuestionBox label="5. الالتزام بأجهزة ATM داخل الجامعة" value={getVal('q2_5_atmCommitment')} styles={styles} />
          <QuestionBox label="6. تفاصيل إصدار بطاقات الطلبة" value={getVal('q2_6_studentCards')} styles={styles} />
          <QuestionBox label="7. مراكز التعبئة وساعات العمل" value={getVal('q2_7_chargingCenters')} styles={styles} />
          <QuestionBox label="8. مستلزمات PoS المجانية والصيانة" value={getVal('q2_8_posCommitment')} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>ثالثاً: أ- النظام الإلكتروني والتكامل (6 أسئلة)</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. النظام الإلكتروني والتقارير" value={getVal('q3a_1_integratedSystem')} styles={styles} />
          <QuestionBox label="2. بطاقات خاصة للوحدات الإدارية" value={getVal('q3a_2_techSpecs')} styles={styles} />
          <QuestionBox label="3. كشف حساب لحظي وتقارير دورية" value={getVal('q3a_3_appSupport')} styles={styles} />
          <QuestionBox label="4. التكامل مع موقع الجامعة" value={getVal('q3a_4_webIntegration')} styles={styles} />
          <QuestionBox label="5. خدمة التحويلات خارج العراق" value={getVal('q3a_5_reporting')} styles={styles} />
          <QuestionBox label="6. توفر رقم IBAN دولي" value={getVal('q3a_6_training')} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>ثالثاً: ب- الأمن السيبراني والاستمرارية (8 أسئلة)</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. شهادات الأمن (ISO, PCI-DSS)" value={getVal('q3b_1_certificates')} styles={styles} />
          <QuestionBox label="2. بروتوكولات التشفير المستخدمة" value={getVal('q3b_2_encryption')} styles={styles} />
          <QuestionBox label="3. خطة الاستمرارية (RTO / BCP)" value={getVal('q3b_3_rto_bcp')} styles={styles} />
          <QuestionBox label="4. سياسة النسخ الاحتياطي" value={getVal('q3b_4_backups')} styles={styles} />
          <QuestionBox label="5. الدعم الفني (24/7 SLA)" value={getVal('q3b_5_supportSla')} styles={styles} />
          <QuestionBox label="6. اختبارات الاختراق الدورية" value={getVal('q3b_6_penTest')} styles={styles} />
          <QuestionBox label="7. سياسة الاحتفاظ بالبيانات" value={getVal('q3b_7_monitoring')} styles={styles} />
          <QuestionBox label="8. طرائق الاتصال والبدائل" value={getVal('q3b_8_incident')} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>رابعاً: أ- الضمانات وملكية البيانات</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. خطاب الضمان المصرفي" value={getVal('q4_1_bankGuarantee')} styles={styles} />
          <QuestionBox label="2. سرية البيانات (NDA)" value={getVal('q4_2_penaltyClause')} styles={styles} />
          <QuestionBox label="3. ملكية البيانات واستردادها" value={getVal('q4_3_dataOwnership')} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>رابعاً: ب- الالتزامات القانونية والتعاقدية (7 أسئلة)</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="4. البرامج التدريبية المجانية" value={getVal('q4_4_exitClause')} styles={styles} />
          <QuestionBox label="5. شروط فسخ العقد" value={getVal('q4_5_liability')} styles={styles} />
          <QuestionBox label="6. القانون والاختصاص القضائي" value={getVal('q4_6_jurisdiction')} styles={styles} />
          <QuestionBox label="7. التحكيم التجاري العراقي" value={getVal('q4_7_auditRight')} styles={styles} />
          <QuestionBox label="8. مدة العقد وشروط التجديد" value={getVal('q4_8_contractDuration')} styles={styles} />
          <QuestionBox label="9. معالجة شكاوى الطلبة" value={getVal('q4_9_renewal')} styles={styles} />
          <QuestionBox label="10. القائمة السوداء والحظر (البنك المركزي)" value={getVal('q4_10_blacklist')} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>خامساً: الخدمات الإضافية والميزات التنافسية (8 أسئلة)</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. تطبيق الهاتف (iOS/Android)" value={getVal('q5_1_extraFeatures')} styles={styles} />
          <QuestionBox label="2. خدمات مصرفية إضافية" value={getVal('q5_2_innovation')} styles={styles} />
          <QuestionBox label="3. الطاقة الاستيعابية للنظام" value={getVal('q5_3_scholarships')} styles={styles} />
          <QuestionBox label="4. دعم الفعاليات والمؤتمرات" value={getVal('q5_4_staffTraining')} styles={styles} />
          <QuestionBox label="5. تحديث الأجهزة والأنظمة" value={getVal('q5_5_posUpdates', ['q5_5_mobileApp', 'mobileApp', 'posUpdates'])} styles={styles} />
          <QuestionBox label="6. تسديد الأجور بالدولار للخارج" value={getVal('q5_6_foreignPayments', ['q5_6_foreignStudents', 'foreignStudents', 'foreignPayments'])} styles={styles} />
          <QuestionBox label="7. ميزات إضافية لجامعة بابل" value={getVal('q5_7_complaints')} styles={styles} />
          <QuestionBox label="8. المؤسسات الحكومية المخدَّمة" value={getVal('q5_8_socialResp', ['socialResp'])} styles={styles} />
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
    <p style={{ fontWeight: 'bold', color: '#1e1b4b', marginBottom: '3px', fontSize: '11px' }}>{label}</p>
    <p style={{ lineHeight: '1.4', fontSize: '10.5px' }}>{value || 'لم يتم تقديم إجابة.'}</p>
  </div>
);

export default PrintTemplate;
