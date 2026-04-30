const fs = require('fs');
const xml = fs.readFileSync('c:\\Users\\ALIENWARE\\Desktop\\استمارة الدفع الالكتروني\\temp_docx_v3\\word\\document.xml', 'utf8');

// Simple regex to extract <w:t> tags
const matches = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
if (matches) {
    const text = matches.map(m => m.replace(/<w:t[^>]*>|<\/w:t>/g, '')).join(' ');
    fs.writeFileSync('c:\\Users\\ALIENWARE\\Desktop\\استمارة الدفع الالكتروني\\extracted_text.txt', text);
    console.log('Extracted text to extracted_text.txt');
} else {
    console.log('No text found');
}
