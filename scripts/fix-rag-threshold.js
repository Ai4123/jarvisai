const fs = require('fs');
const path = require('path');

const workflowPath = path.join(__dirname, '../chat workflow - FIXED.json');

console.log('🔧 Fixing RAG retrieval threshold...\n');

let content = fs.readFileSync(workflowPath, 'utf8');

// Change similarityThreshold from 0.7 to 0.4
content = content.replace(
    /"similarityThreshold": 0.7,/,
    `"similarityThreshold": 0.4,`
);

fs.writeFileSync(workflowPath, content, 'utf8');

console.log('✅ Updated similarityThreshold to 0.4 in workflow JSON.');
console.log('👉 Please IMPORT this updated workflow into n8n to apply the fix.');
