import React from 'react';

const PrintTemplate = ({ data, isBlank = false, round = 1 }) => {
  if (!data && !isBlank) return null;
  
  // Create dummy data for blank mode if none provided
  const displayData = isBlank ? {} : (data || {});

  // Robust value lookup (same logic as AdminPanel)
  const getVal = (key, aliases = []) => {
    if (displayData[key]) return displayData[key];
    if (aliases) {
      for (const alias of aliases) {
        if (displayData[alias]) return displayData[alias];
      }
    }
    const lowerKey = key.toLowerCase();
    if (displayData[lowerKey]) return displayData[lowerKey];
    const noPrefix = key.replace(/^q\d[a-z]?_\d_/, '');
    if (displayData[noPrefix]) return displayData[noPrefix];
    const noPrefixLower = noPrefix.toLowerCase();
    if (displayData[noPrefixLower]) return displayData[noPrefixLower];
    return '';
  };

  const styles = {
    container: {
      width: '100%',
      minHeight: '100%',
      backgroundColor: '#ffffff',
      color: '#000000',
      direction: 'rtl',
      fontFamily: "'IBM Plex Sans Arabic', Arial, sans-serif",
      padding: '0 20mm', // Let the browser handle page margins via @page
      boxSizing: 'border-box'
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
      padding: '8px 15px',
      fontWeight: '900',
      fontSize: '14px',
      marginBottom: '15px',
      borderRadius: '4px',
      marginTop: '20px'
    },
    label: {
      color: '#1e1b4b',
      fontWeight: 'bold',
      width: '45%'
    },
    row: {
      display: 'flex',
      borderBottom: '1px solid #f1f5f9',
      paddingBottom: '8px',
      fontSize: '15px',
      marginBottom: '8px'
    },
    questionBox: {
      backgroundColor: '#f8fafc',
      padding: '12px 18px',
      borderRadius: '8px',
      border: '1.5px solid #e2e8f0',
      marginBottom: '12px',
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
        <div style={{ textAlign: 'left', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>
          <p style={{ margin: 0 }}>التاريخ: {new Date().toLocaleDateString('ar-IQ')}</p>
          <p style={{ margin: 0 }}>الرقم المرجعي: UOB-{String(displayData.username || 'BLANK').toUpperCase()}</p>
          {!isBlank && <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#1e1b4b', fontWeight: '900' }}>تقييم اللجنة: {displayData.evaluation_score || 0} / 10</p>}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '900', border: '1.5px solid #1e1b4b', display: 'inline-block', padding: '6px 25px', borderRadius: '8px' }}>
          {isBlank ? 'استمارة عروض الدفع الالكتروني (نسخة للمطالعة الورقية)' : 'استمارة معايير التعاقد مع شركات الدفع الالكتروني (نسخة رسمية)'}
        </h2>
      </div>

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>أولاً: معلومات الشركة العامة</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 30px' }}>
          <InfoRow label="اسم الشركة" value={getVal('companyName', ['companyname'])} styles={styles} isBlank={isBlank} />
          <InfoRow label="تاريخ التقديم" value={getVal('submissionDate', ['submissiondate'])} styles={styles} isBlank={isBlank} />
          <InfoRow label="الممثل الرسمي" value={getVal('representativeName', ['representativename'])} styles={styles} isBlank={isBlank} />
          <InfoRow label="رقم الهاتف" value={getVal('phone')} styles={styles} isBlank={isBlank} />
          <InfoRow label="البريد الإلكتروني" value={getVal('email')} styles={styles} isBlank={isBlank} />
          <InfoRow label="إجازة البنك المركزي" value={getVal('centralBankLicense', ['centralbanklicense'])} styles={styles} isBlank={isBlank} />
          <InfoRow label="سنوات الخبرة" value={getVal('marketExperience', ['marketexperience'])} styles={styles} isBlank={isBlank} />
          <InfoRow label="المؤسسات الحكومية" value={getVal('govInstitutionsCount', ['govinstitutionscount'])} styles={styles} isBlank={isBlank} />
          <InfoRow label="الملاءة المالية" value={getVal('paidCapital', ['paidcapital'])} styles={styles} isBlank={isBlank} />
          <InfoRow label="العنوان الرسمي" value={getVal('officialAddress', ['officialaddress'])} styles={styles} isBlank={isBlank} />
          <InfoRow label="العنوان (المقر في الحلة)" value={getVal('hillaAddress', ['hilla_address', 'hillaaddress'])} styles={styles} isBlank={isBlank} />
        </div>
      </section>

      {round === 1 ? (
        <>
          <section style={{ marginBottom: '15px' }}>
            <div style={styles.sectionTitle}>ثانياً: الالتزامات التشغيلية والمالية (8 أسئلة)</div>
            <div style={{ fontSize: '10px' }}>
              <QuestionBox label="1. ما هي الآلية المعتمدة لإجراء التسوية المالية (المقاصة) مع مصرف الرشيد؟ وهل تلتزمون بالإيداع خلال 12 ساعة عمل؟" value={getVal('q2_1_settlement')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="2. ما هي نسب العمولات والخصومات المقترحة؟ وهل توافقون على مراجعتها دورياً وإشعار الجامعة قبل 30 يوماً من أي تعديل؟" value={getVal('q2_2_commissions')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="3. هل يوجد وسيط (مصرف آخر) لنقل المبالغ أم مباشرة؟ يرجى ذكر تفاصيل سير الحركات المالية." value={getVal('q2_3_intermediary')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="4. ما قيمة غرامة التأخير المقترحة عن كل ساعة تجاوز مدة التسوية المتفق عليها؟" value={getVal('q2_4_delayPenalty')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="5. هل تلتزمون بتوفير جهاز صراف آلي (ATM) يملأ دائماً داخل الجامعة؟" value={getVal('q2_5_atmCommitment')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="6. ما هي تفاصيل إصدار بطاقات الطلبة؟ (رسوم الإصدار، التجديد، بدل الضائع، مدة الإصدار)" value={getVal('q2_6_studentCards')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="7. هل توفرون مراكز تعبئة كافية داخل الكليات؟ وما هي ساعات العمل المقترحة لها؟" value={getVal('q2_7_chargingCenters')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="8. هل تلتزمون بتجهيز نقاط البيع (PoS) والورق الحراري مجاناً؟ وما هو زمن الاستجابة للصيانة (SLA)؟" value={getVal('q2_8_posCommitment')} styles={styles} isBlank={isBlank} />
            </div>
          </section>

          <section style={{ marginBottom: '15px' }}>
            <div style={styles.sectionTitle}>ثالثاً: أ- النظام الإلكتروني والتكامل (6 أسئلة)</div>
            <div style={{ fontSize: '10px' }}>
              <QuestionBox label="1. هل يتوفر لديكم نظام إلكتروني متكامل يُبيّن جميع الحركات المالية؟" value={getVal('q3a_1_integratedSystem')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="2. هل يمكن إصدار بطاقات خاصة بكل كلية أو وحدة إدارية بدون عمولات تحويل داخلية؟" value={getVal('q3a_2_techSpecs')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="3. هل يمكن للجامعة الحصول على كشف حساب لحظي (Real-time) في أي وقت؟" value={getVal('q3a_3_appSupport')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="4. هل يمكن تحقيق تكامل إلكتروني مع موقع الجامعة يتيح التسديد عبر رابط آمن أو QR كود؟" value={getVal('q3a_4_webIntegration')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="5. هل توفرون خدمة التحويلات خارج العراق؟ يرجى بيان العمولات والحدود اليومية." value={getVal('q3a_5_reporting')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="6. هل يتوفر رقم IBAN لكل بطاقة؟ وهل هو متوافق مع معايير الدفع الدولية؟" value={getVal('q3a_6_training')} styles={styles} isBlank={isBlank} />
            </div>
          </section>

          <section style={{ marginBottom: '15px' }}>
            <div style={styles.sectionTitle}>ثالثاً: ب- الأمن السيبراني والاستمرارية (8 أسئلة)</div>
            <div style={{ fontSize: '10px' }}>
              <QuestionBox label="1. ما هي شهادات الأمن المعتمدة لديكم؟ (PCI-DSS / ISO 27001 / غيرها)" value={getVal('q3b_1_certificates')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="2. ما هو بروتوكول التشفير المستخدم في المعاملات؟" value={getVal('q3b_2_encryption')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="3. ما هو الحد الأقصى لوقت استعادة الخدمة عند الانقطاع (RTO)؟" value={getVal('q3b_3_rto_bcp')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="4. هل توفرون نسخاً احتياطية يومية للبيانات؟ أين تُخزَّن؟" value={getVal('q3b_4_backups')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="5. ما هو نظام الدعم الفني؟ هل يتوفر على مدار الساعة (24/7)؟" value={getVal('q3b_5_supportSla')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="6. هل تُجرون اختبارات اختراق أمني (Penetration Testing) دورية؟" value={getVal('q3b_6_penTest')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="7. ما هي سياسة شركتكم في الاحتفاظ بالبيانات؟ (المدة الزمنية، مكان التخزين)" value={getVal('q3b_7_monitoring')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="8. ما هي طرائق الاتصال والحاجة للإنترنت؟" value={getVal('q3b_8_incident')} styles={styles} isBlank={isBlank} />
            </div>
          </section>

          <section style={{ marginBottom: '15px' }}>
            <div style={styles.sectionTitle}>رابعاً: أ- الضمانات وملكية البيانات</div>
            <div style={{ fontSize: '10px' }}>
              <QuestionBox label="1. خطاب الضمان المصرفي: هل تقدمون خطاب ضمان مصرفي غير مشروط لصالح الجامعة؟" value={getVal('q4_1_bankGuarantee')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="2. سرية البيانات: هل تلتزمون بسرية البيانات وتوقيع اتفاقية (NDA) رسمية؟" value={getVal('q4_2_penaltyClause')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="3. ملكية البيانات واستردادها: هل توافقون على أن ملكية البيانات تعود للجامعة حصراً؟" value={getVal('q4_3_dataOwnership')} styles={styles} isBlank={isBlank} />
            </div>
          </section>

          <section style={{ marginBottom: '15px' }}>
            <div style={styles.sectionTitle}>رابعاً: ب- الالتزامات القانونية والتعاقدية (7 أسئلة)</div>
            <div style={{ fontSize: '10px' }}>
              <QuestionBox label="4. هل تقدمون برامج تدريبية مجانية لموظفي الجامعة؟" value={getVal('q4_4_exitClause')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="5. هل توافقون على حق الجامعة بفسخ العقد فورياً عند الإخلال الجوهري؟" value={getVal('q4_5_liability')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="6. هل توافقون على تطبيق القانون العراقي النافذ، واختصاص محاكم محافظة بابل؟" value={getVal('q4_6_jurisdiction')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="7. هل توافقون على اللجوء إلى التحكيم التجاري وفق الأنظمة العراقية؟" value={getVal('q4_7_auditRight')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="8. ما هي مدة العقد المقترحة؟ وما شروط التجديد والتعديل؟" value={getVal('q4_8_contractDuration')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="9. ما هي آلية استقبال ومعالجة شكاوى الطلبة؟ وما الحد الأقصى للمدة؟" value={getVal('q4_9_renewal')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="10. هل الشركة مسجلة ضمن القائمة السوداء حسب اعمامات البنك المركزي العراقي أو محظور التعامل معها داخل او خارج العراق؟" value={getVal('q4_10_blacklist')} styles={styles} isBlank={isBlank} />
            </div>
          </section>

          <section style={{ marginBottom: '15px' }}>
            <div style={styles.sectionTitle}>خامساً: الخدمات الإضافية والميزات التنافسية (8 أسئلة)</div>
            <div style={{ fontSize: '10px' }}>
              <QuestionBox label="1. هل تقدمون تطبيق هاتفي (iOS/Android)؟ ما الخدمات المتاحة فيه؟" value={getVal('q5_1_extraFeatures')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="2. هل تقدمون خدمات مصرفية إضافية مثل: محفظة رقمية، صرف راتب إلكتروني؟" value={getVal('q5_2_innovation')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="3. ما الحد الأقصى لعدد المعاملات اليومية التي يستطيع نظامكم معالجتها؟" value={getVal('q5_3_scholarships')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="4. هل تقدمون الدعم (Sponsor) لتغطية تكاليف الفعاليات والمؤتمرات العلمية؟" value={getVal('q5_4_staffTraining')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="5. هل هنالك تحديث دوري لأجهزة PoS والأنظمة الإلكترونية؟" value={getVal('q5_5_posUpdates', ['q5_5_mobileApp', 'mobileApp', 'posUpdates'])} styles={styles} isBlank={isBlank} />
              <QuestionBox label="6. هل هنالك إمكانية تسديد أجور بعملة الدولار إلى مصارف خارج البلد؟" value={getVal('q5_6_foreignPayments', ['q5_6_foreignStudents', 'foreignStudents', 'foreignPayments'])} styles={styles} isBlank={isBlank} />
              <QuestionBox label="7. هل تقدمون أي ميزات إضافية أو عروض تنافسية لصالح جامعة بابل تحديداً؟" value={getVal('q5_7_complaints')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="8. ذكر المؤسسات الحكومية المخدَّمة حالياً، وما هي التي تتعامل مع مصرف الرشيد؟" value={getVal('q5_8_socialResp', ['socialResp'])} styles={styles} isBlank={isBlank} />
            </div>
          </section>
        </>
      ) : (
        <>
          <section style={{ marginBottom: '15px' }}>
            <div style={styles.sectionTitle}>ثانياً: الالتزامات التشغيلية والمالية (الجولة الثانية)</div>
            <div style={{ fontSize: '10px' }}>
              <QuestionBox label="1. هل تلتزمون بإيداع المبالغ في مصرف الرشيد خلال مدة قصيرة؟" value={getVal('q2_1_deposit_within_short_period')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="2. هل بالإمكان معالجة مشكلة التسديدات التي تتم في اليوم الأخير من الشهر، بحيث لا تظهر ضمن حسابات الشهر اللاحق في المصرف؟" value={getVal('q2_2_process_end_of_month_payments')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="3. ضمان ظهور جميع الحركات في حسابات مصرف الرشيد." value={getVal('q2_3_guarantee_movements_in_rashid')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="4. ما هي نسب العمولات والخصومات المقترحة والتي يتم ارجاعها الى جامعة مع مراجعتها بشكل دوري وإشعار الجامعة؟ (النسبة المسترجعة من نسبة ارباحكم الخاصة)" value={getVal('q2_4_commissions_and_discounts')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="5. هل بالامكان توفير عدد من اجهزة الصراف آلي (ATM) داخل الجامعة؟" value={getVal('q2_5_provide_atms_in_university')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="6. هل يتم إصدار بطاقات للطلبة مجانا او باجور بسيطة تختلف عن غير طلبة وتدريسي جامعة بابل حصرا؟" value={getVal('q2_6_student_cards_free_or_cheap')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="7. هل يمكن توفير مراكز تعبئة داخل الجامعة؟" value={getVal('q2_7_charging_centers_in_university')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="8. هل تلتزمون بتوفير مستلزمات التشغيل والصيانة والاستبدال (اجهزة PoS حديثة، ورق، بطاريات، الخ) مجاناً؟ (تعاد لاحقا الى الشركة عند انتهاء العقد)" value={getVal('q2_8_pos_maintenance_and_free_supplies')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="9. هل تلتزمون بتوفير حاسبة لاب توب وطابعة ليزرية جديدتان الى شعبة الحسابات للكليات ورئاسة الجامعة مجاناً؟ (تبقى ملك للجامعة)" value={getVal('q2_9_laptop_and_printer')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="10. هل لديكم تعاون متميز وشراكة دائمة مع مصرف الرشيد فرع الحله الرئيسي لحل جميع المشاكل؟" value={getVal('q2_10_partnership_with_rashid')} styles={styles} isBlank={isBlank} />
            </div>
          </section>

          <section style={{ marginBottom: '15px' }}>
            <div style={styles.sectionTitle}>ثالثاً: النظام الإلكتروني والأمن (الجولة الثانية)</div>
            <div style={{ fontSize: '10px' }}>
              <QuestionBox label="1. هل يتوفر لديكم نظام إلكتروني متكامل يُبيّن جميع الحركات المالية ويقدم التقارير المطلوبة متوفر دائما ولفترات طويلة وقابل للتحديث حسب حاجة الجامعة؟" value={getVal('q3_1_integrated_system')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="2. هل يمكن توفير الية التسديد عبر رابط آمن دون الحاجة للحضور الشخصي او استخدام اجهزة PoS؟" value={getVal('q3_2_safe_link_payment')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="3. هل يتوفر رقم IBAN لكل بطاقة؟" value={getVal('q3_3_iban_available')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="4. هل جيع الانظمة والعمليات والبيانات المالية بسرية تامة؟" value={getVal('q4_1_confidentiality')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="5. هل توفرون نسخاً احتياطية للبيانات ولسنوات طويلة؟" value={getVal('q4_2_backups')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="6. هل هنالك دعم فني متوفر على مدار الساعة (24/7) ؟" value={getVal('q4_3_technical_support') + 
                 (getVal('q4_3_support_options') ? ' - ' + (Array.isArray(getVal('q4_3_support_options')) ? getVal('q4_3_support_options').join('، ') : getVal('q4_3_support_options')) : '') + 
                 (getVal('q4_3_support_other') ? ' (' + getVal('q4_3_support_other') + ')' : '')
              } styles={styles} isBlank={isBlank} />
            </div>
          </section>

          <section style={{ marginBottom: '15px' }}>
            <div style={styles.sectionTitle}>رابعاً: الالتزامات القانونية والتعاقدية (الجولة الثانية)</div>
            <div style={{ fontSize: '10px' }}>
              <QuestionBox label="1. أن ملكية البيانات تعود للجامعة حصراً، وأنه يحق لها استردادها كاملةً باي وقت تحتاجه؟" value={getVal('q5_1_data_ownership')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="2. هل تقدمون برامج تدريبية مجانية لموظفي الجامعة عند الحاجة؟" value={getVal('q5_2_free_training')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="3. مدة العقد المقترحة سنتان (2 سنة) ؟ وقابلة للتجديد لفترة لا تقل عن سنة بعد إعادة التفاوض على الشروط عند كل تجديد ان وجد اي تحديث؟" value={getVal('q5_3_contract_duration')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="4. بالامكان اضافة اي تحديث جزئي ضمن الاتفاق الموجود لتسهيل الدفع الالكتروني لجامعة بابل. (يكون رسميا الى الشركة من قبل مدير المالية او الرقابة في الجامعة)" value={getVal('q5_4_partial_updates')} styles={styles} isBlank={isBlank} />
              <QuestionBox label="5. فسخ العقد و تسديد الغرامات المالية ان وجدت وتحمل كافة التبعات القانونية في حالة عدم الالتزام بالشروط المتفق عليها، هذا بعد تنبيه الشركة خلال اسبوعان وبعد تشكيل لجنة تدقيقة من الطرفين تبين وتاكد وجود عدم الالتزام." value={getVal('q5_5_contract_termination_and_fines')} styles={styles} isBlank={isBlank} />
            </div>
          </section>

          <section style={{ marginBottom: '15px' }}>
            <div style={styles.sectionTitle}>خامساً: الخدمات الإضافية والمرفقات (الجولة الثانية)</div>
            <div style={{ fontSize: '10px' }}>
              <QuestionBox label="1. هل تستاهمون بالدعم (Sponsor) (تغطية بعض التكاليف) لعدد من فعاليات والمؤتمرات العلمية لكليات الجامعة؟ (بعد الاتفاق معكم وموافقة رئيس الجامعة)" value={getVal('q6_1_sponsor_support')} styles={styles} isBlank={isBlank} />
            </div>
          </section>
        </>
      )}

      <section style={{ marginBottom: '15px' }}>
        <div style={styles.sectionTitle}>سادساً: الملاحظات والوثائق</div>
        <div style={{ fontSize: '10px' }}>
          <QuestionBox label="المستندات المرفقة" value={getVal('documentUrl', ['document_url', 'document_path']) ? "تم إرفاق الملف رسمياً عبر البوابة الإلكترونية" : "لم يتم إرفاق ملفات."} styles={styles} isBlank={isBlank} />
          <QuestionBox label="ملاحظات إضافية من الشركة" value={getVal('additionalNotes', ['additionalnotes'])} styles={styles} isBlank={isBlank} />
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

const InfoRow = ({ label, value, styles, isBlank }) => {
  const valStr = String(value || '');
  const isEmpty = !valStr || valStr.trim() === '' || valStr === '---' || valStr === 'undefined' || valStr === 'null';
  if (!isBlank && isEmpty) return null;
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}:</span>
      <span style={{ width: '55%' }}>{isEmpty ? '---' : value}</span>
    </div>
  );
};

const QuestionBox = ({ label, value, styles, isBlank }) => {
  const valStr = String(value || '');
  const isEmpty = !valStr || valStr.trim() === '' || valStr === 'لم يتم تقديم إجابة.' || valStr === 'لم يتم إرفاق ملفات.' || valStr === 'undefined' || valStr === 'null';
  if (!isBlank && isEmpty) return null;
  return (
    <div style={styles.questionBox}>
      <p style={{ fontWeight: '900', color: '#1e1b4b', marginBottom: '10px', fontSize: '16px', lineHeight: '1.6' }}>{label}</p>
      <p style={{ lineHeight: '1.8', fontSize: '15px', color: '#1e293b', whiteSpace: 'pre-wrap', fontWeight: 'bold' }}>
        {isBlank ? '' : value}
      </p>
      {isBlank && <div style={{ height: '40px' }}></div>}
    </div>
  );
};

export default PrintTemplate;
