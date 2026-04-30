import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPdf = async (elementId, fileName = 'uob-report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('خطأ: لم يتم العثور على منطقة الطباعة (ID: ' + elementId + ')');
    return;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; 
    const pageHeight = 297; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add subsequent pages if content is longer than A4
    while (heightLeft > 2) { // 2mm buffer to avoid tiny empty pages
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    try {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'PDF Document',
            accept: { 'application/pdf': ['.pdf'] },
          }],
        });
        const writable = await handle.createWritable();
        const blob = pdf.output('blob');
        await writable.write(blob);
        await writable.close();
        alert('تم حفظ ملف الـ PDF بنجاح في المكان الذي حددته!');
        return;
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('File System Access API error:', e);
      } else {
        return; // User cancelled the save dialog
      }
    }

    // Fallback for browsers that don't support showSaveFilePicker (like Firefox/Safari)
    pdf.save(fileName);
    alert('تم تحميل ملف الـ PDF بنجاح! تجده في مجلد التنزيلات (Downloads) في جهازك.');
  } catch (error) {
    console.error('PDF Export Error:', error);
    alert('حدث خطأ تقني أثناء توليد ملف PDF. السبب: ' + error.message);
  }
};
