const fs = require('fs');
const cp = require('child_process');
const result = cp.execSync('Get-ChildItem -Path src -Recurse -File -Include *.js,*.jsx | Select-String -Pattern "API_BASE_URL" | Select-Object -ExpandProperty Path -Unique', {shell: 'powershell.exe'}).toString().trim().split('\r\n');
result.forEach(f => {
  if (f.includes('api.js')) return;
  const content = fs.readFileSync(f, 'utf8');
  if (!content.includes('import API_BASE_URL')) {
    console.log('Missing import in:', f);
  }
});
