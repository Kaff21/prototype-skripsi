const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.post('/', async (req, res) => {
  const { email, password, full_name, nim, organization_id } = req.body;

  console.log("=== [REGISTER] REQUEST MASUK ===");
  // Cek apakah data dari frontend benar-benar sampai ke sini
  console.log("Data diterima backend:", { full_name, nim, email });

  try {
    // 1. SignUp ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("❌ AUTH ERROR:", authError.message);
      return res.status(400).json({ error: authError.message });
    }

    // 2. Tentukan Role & Status secara default
    let finalRole = 'anggota'; 
    let finalStatus = 'pending'; 

    // Pengecekan ketat menggunakan email utama kamu
    if (email === 'kafillaworkhrd@gmail.com') {
      finalRole = 'superadmin';
      finalStatus = 'aktif';
    }

    // 3. Simpan profil ke database dengan perlindungan data kosong
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: email,
          // Memberikan teks cadangan jika data dari frontend ternyata kosong
          full_name: full_name || "Mahasiswa SIM-ORMAWA", 
          nim: nim || "-", 
          organization_id: organization_id || null,
          role: finalRole,
          status: finalStatus
        }
      ]);

    if (profileError) {
      console.error("❌ DATABASE ERROR:", profileError.message);
      return res.status(400).json({ error: profileError.message });
    }

    console.log(`✅ BERHASIL: User ${email} sebagai ${finalRole}`);
    res.json({ message: `Berhasil daftar sebagai ${finalRole}` });

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

module.exports = router;