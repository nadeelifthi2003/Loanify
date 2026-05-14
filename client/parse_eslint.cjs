const fs = require('fs');
const data = JSON.parse(fs.readFileSync('eslint.json', 'utf8'));
data.filter(r => r.errorCount > 0 || r.warningCount > 0).forEach(r => {
  console.log(r.filePath);
  r.messages.forEach(m => console.log(`  ${m.line}:${m.column} ${m.message}`));
});
