const fs = require('fs');

const files = [
  'src/app/auth/register/page.jsx',
  'src/app/dashboard/anggota/page.js',
  'src/app/dashboard/ukm/page.js',
  'src/app/dashboard/page.js',
  'src/components/dashboard/AdminUKMView.jsx',
  'src/components/dashboard/AnggotaView.jsx',
  'src/components/dashboard/BemView.jsx',
  'src/components/dashboard/KemahasiswaanView.jsx',
  'src/components/dashboard/PembinaView.jsx',
  'src/components/dashboard/SuperAdminView.jsx',
  'src/components/DashboardUKM.jsx',
  'src/components/ManajemenAkun.jsx',
  'src/components/ModalTambahKegiatan.jsx',
  'src/components/ScannerAbsensi.jsx'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('"use client";') && content.includes('import API_BASE_URL')) {
        // remove use client
        content = content.replace(/"use client";\r?\n?/g, '');
        // prepend use client
        content = '"use client";\n' + content;
        fs.writeFileSync(file, content);
        console.log('Fixed ' + file);
    }
  } catch (e) {
    console.error('Error on ' + file + ':', e.message);
  }
});
