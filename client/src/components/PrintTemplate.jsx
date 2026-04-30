import React from 'react';

const PrintTemplate = ({ data }) => {
  if (!data) return null;

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
        <img src="./logo.jpg" alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
        <div style={{ textAlign: 'left', fontSize: '9px', fontWeight: 'bold', color: '#64748b' }}>
          <p style={{ margin: 0 }}>التاريخ: {new Date().toLocaleDateString('ar-IQ')}</p>
          <p style={{ margin: 0 }}>الرقم المرجعي: UOB-{data.username?.toUpperCase()}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '900', border: '1.5px solid #1e1b4b', display: 'inline-block', padding: '6px 25px', borderRadius: '8px' }}>استمارة معايير التعاقد مع شركات الدفع الالكتروني (نسخة رسمية)</h2>
      </div>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>أولاً: معلومات الشركة العامة</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 30px' }}>
          <InfoRow label="اسم الشركة" value={data.companyName} styles={styles} />
          <InfoRow label="تاريخ التقديم" value={data.submissionDate} styles={styles} />
          <InfoRow label="الممثل الرسمي" value={data.representativeName} styles={styles} />
          <InfoRow label="رقم الهاتف" value={data.phone} styles={styles} />
          <InfoRow label="البريد الإلكتروني" value={data.email} styles={styles} />
          <InfoRow label="إجازة البنك المركزي" value={data.centralBankLicense} styles={styles} />
          <InfoRow label="سنوات الخبرة" value={data.marketExperience} styles={styles} />
          <InfoRow label="المؤسسات الحكومية" value={data.govInstitutionsCount} styles={styles} />
          <InfoRow label="الملاءة المالية" value={data.paidCapital} styles={styles} />
          <InfoRow label="العنوان الرسمي" value={data.officialAddress} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>ثانياً: الالتزامات التشغيلية والمالية</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. آلية التسوية المالية" value={data.q2_1_settlement} styles={styles} />
          <QuestionBox label="2. العمولات والخصومات" value={data.q2_2_commissions} styles={styles} />
          <QuestionBox label="3. البنك الوسيط" value={data.q2_3_intermediary} styles={styles} />
          <QuestionBox label="4. غرامات التأخير" value={data.q2_4_delayPenalty} styles={styles} />
          <QuestionBox label="5. الالتزام بأجهزة ATM" value={data.q2_5_atmCommitment} styles={styles} />
          <QuestionBox label="6. بطاقات الطلبة" value={data.q2_6_studentCards} styles={styles} />
          <QuestionBox label="7. مراكز التعبئة" value={data.q2_7_chargingCenters} styles={styles} />
          <QuestionBox label="8. صيانة PoS" value={data.q2_8_posCommitment} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>ثالثاً: التقنية والأمن السيبراني</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. تقارير Dashboard" value={data.q3a_1_integratedSystem} styles={styles} />
          <QuestionBox label="2. الربط عبر API" value={data.q3a_4_webIntegration} styles={styles} />
          <QuestionBox label="3. الشهادات الأمنية" value={data.q3b_1_certificates} styles={styles} />
          <QuestionBox label="4. خطة الاستمرارية" value={data.q3b_3_rto_bcp} styles={styles} />
          <QuestionBox label="5. النسخ الاحتياطي" value={data.q3b_4_backups} styles={styles} />
          <QuestionBox label="6. الدعم الفني" value={data.q3b_5_supportSla} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>رابعاً: الالتزامات القانونية</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="1. خطاب الضمان" value={data.q4_1_bankGuarantee} styles={styles} />
          <QuestionBox label="2. ملكية البيانات" value={data.q4_3_dataOwnership} styles={styles} />
          <QuestionBox label="3. الاختصاص القضائي" value={data.q4_6_jurisdiction} styles={styles} />
          <QuestionBox label="4. مدة العقد" value={data.q4_8_contractDuration} styles={styles} />
        </div>
      </section>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>خامساً: الخدمات والملاحظات</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="الميزات التنافسية" value={data.q5_1_extraFeatures} styles={styles} />
          <QuestionBox label="ملاحظات الشركة" value={data.additionalNotes} styles={styles} />
        </div>
      </section>

      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', textAlign: 'center' }}>
        <div>
          <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '35px' }}>ختم وتوقيع الشركة</p>
          <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold' }}>{data.signedBy || '........................'}</p>
            <p style={{ fontSize: '9px', color: '#64748b' }}>{data.position}</p>
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
