const fs = require('fs');
let code = fs.readFileSync('client/src/pages/Dashboard.jsx', 'utf8');

const oldSubmit = `          const { error } = await supabase
            .from('submissions')
            .upsert([mapToDb({ 
              ...formData, 
              username: user.username, 
              status: 'final',
              lastUpdated: new Date().toISOString(),
              evaluation_score: formData.evaluation_score || 0
            })]);
            
          if (!error) {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setShowSuccess(true);
            window.scrollTo(0, 0);
          } else {
            alert('حدث خطأ أثناء إرسال العرض. يرجى المحاولة لاحقاً.');
            setIsSubmitting(false);
          }`;

const newSubmit = `          const payload = mapToDb({
            ...formData,
            username: user.username,
            status: 'final',
            lastUpdated: new Date().toISOString(),
            evaluation_score: formData.evaluation_score || 0
          });
          const { error } = await supabase
            .from('submissions')
            .upsert([payload], { onConflict: 'username' });
            
          if (!error) {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setShowSuccess(true);
            window.scrollTo(0, 0);
          } else {
            console.error('Submit error:', error);
            alert('خطأ: ' + error.message + '\\n\\nتأكد من تشغيل ملف add_columns.sql في Supabase.');
            setIsSubmitting(false);
          }`;

// Normalize line endings for comparison
const codeNorm = code.replace(/\r\n/g, '\n');
const oldNorm = oldSubmit.replace(/\r\n/g, '\n');

if (codeNorm.includes(oldNorm)) {
  const fixed = codeNorm.replace(oldNorm, newSubmit);
  fs.writeFileSync('client/src/pages/Dashboard.jsx', fixed);
  console.log('SUCCESS: submit handler fixed');
} else {
  console.log('NOT FOUND - checking partial...');
  console.log(codeNorm.includes('يرجى المحاولة لاحقاً') ? 'Arabic found' : 'Arabic not found');
}
