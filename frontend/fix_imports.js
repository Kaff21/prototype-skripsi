const fs = require('fs');

const files = [
  'src/app/dashboard/birokrasi/page.js',
  'src/app/dashboard/pengaturan-ukm/page.js',
  'src/app/dashboard/profil/page.js',
  'src/components/ActivityCard.jsx',
  'src/components/PengaturanUKM.jsx',
  'src/components/PersetujuanAdmin.jsx',
  'src/components/ProfileView.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import API_BASE_URL')) {
    if (content.includes('"use client";')) {
      content = content.replace('"use client";', '"use client";\nimport API_BASE_URL from "@/utils/api";');
    } else {
      content = 'import API_BASE_URL from "@/utils/api";\n' + content;
    }
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
