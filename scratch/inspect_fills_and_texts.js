const fs = require('fs');
const content = fs.readFileSync('C:/Users/thevi/.gemini/antigravity/brain/8a545715-395c-435e-afb7-247d1415af27/.system_generated/steps/627/output.txt', 'utf8');
const firstLine = content.split('\n')[0];
const data = JSON.parse(firstLine);

console.log('--- FILLS ---');
console.log(JSON.stringify(data.fills, null, 2));

console.log('--- RICHTEXTS SAMPLE (first 5) ---');
console.log(JSON.stringify(data.richtexts?.slice(0, 5), null, 2));
