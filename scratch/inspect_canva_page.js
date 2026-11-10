const fs = require('fs');
const content = fs.readFileSync('C:/Users/thevi/.gemini/antigravity/brain/8a545715-395c-435e-afb7-247d1415af27/.system_generated/steps/627/output.txt', 'utf8');
const firstLine = content.split('\n')[0];
const data = JSON.parse(firstLine);

console.log('Top keys:', Object.keys(data));
if (data.pages && data.pages.length > 0) {
  console.log('Page 0 keys:', Object.keys(data.pages[0]));
  console.log('Page 0 elements preview:', JSON.stringify(data.pages[0], null, 2).substring(0, 1500));
}
