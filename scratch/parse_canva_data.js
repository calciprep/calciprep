const fs = require('fs');
const content = fs.readFileSync('C:/Users/thevi/.gemini/antigravity/brain/8a545715-395c-435e-afb7-247d1415af27/.system_generated/steps/627/output.txt', 'utf8');

// The file might contain json on line 1 and resource notes below
const firstLine = content.split('\n')[0];
try {
  const data = JSON.parse(firstLine);
  console.log('Transaction ID:', data.transaction_id);
  console.log('Pages count:', data.pages ? data.pages.length : 0);
  
  const fonts = new Set();
  const colors = new Set();
  
  function scan(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') {
        if (/#[0-9a-f]{3,8}|rgba?/i.test(v)) colors.add(v);
        if (/font/i.test(k) || /helios|neue|grotesk|sans|serif|oswald|inter/i.test(v)) fonts.add(`${k}: ${v}`);
      }
      if (typeof v === 'object') scan(v);
    }
  }
  scan(data);
  console.log('Fonts:', Array.from(fonts));
  console.log('Colors:', Array.from(colors));
} catch(e) {
  console.error('Parse error:', e.message);
  console.log('Length:', content.length, 'Preview:', content.substring(0, 500));
}
