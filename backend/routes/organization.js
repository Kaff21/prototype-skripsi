const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { upload } = require('../config/cloudinary');

// 1. GET ALL: Mengambil semua daftar organisasi
router.get('/', async (req, res) => {
  try {
    // UBAH DARI .select('*') MENJADI MENYEBUTKAN NAMA KOLOM SECARA SPESIFIK
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, initial, logo_url, color_theme, description, history, vision, mission'); // Tulis semua kolom yang kamu butuhkan

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Gagal memuat daftar organisasi" });
  }
});

// 2. POST: Menambahkan UKM Baru (SOLUSI ERROR KAMU)
router.post('/', async (req, res) => {
  const { name, initial, color_theme } = req.body;
  try {
    const { data, error } = await supabase
      .from('organizations')
      .insert([{ 
        name, 
        initial, 
        color_theme: color_theme || 'bg-indigo-600' 
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ status: "sukses", data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET BY ID: Mengambil satu organisasi
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('organizations').select('id, name, initial, logo_url, color_theme, description, history, vision, mission').eq('id', id).single();
    if (error || !data) return res.status(404).json({ error: "UKM tidak ditemukan" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. DELETE: Menghapus UKM
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('organizations').delete().eq('id', id);
    if (error) throw error;
    res.json({ status: "sukses", message: "Organisasi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. UPDATE: Mengupdate data organisasi
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, initial, description, history, color_theme, vision, mission, logo_url } = req.body;
  try {
    const { error } = await supabase
      .from('organizations')
      .update({ name, initial, description, history, color_theme, vision, mission, logo_url, updated_at: new Date() })
      .eq('id', id);
    if (error) throw error;
    res.json({ status: "sukses" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/upload-logo', upload.single('logo'), async (req, res) => {
  const { id } = req.params;
  
  // 1. KITA LOG ID-NYA BIAR KETAHUAN SIAPA YANG SALAH
  console.log("Menerima request upload logo untuk UKM ID:", id);
  
  try {
    if (!req.file) {
      console.log("File tidak terbaca oleh multer!");
      return res.status(400).json({ error: "File tidak ditemukan" });
    }

    const logoUrl = req.file.path;
    console.log("Cloudinary sukses, URL didapat:", logoUrl);

    // 2. TAMBAHKAN .select() DI AKHIR UNTUK MEMAKSA SUPABASE MENGEMBALIKAN HASILNYA
    const { data, error } = await supabase
      .from('organizations')
      .update({ logo_url: logoUrl })
      .eq('id', id)
      .select(); // <--- INI KUNCI DETEKSINYA

    if (error) throw error;

    // 3. CEK APAKAH BENAR-BENAR ADA BARIS YANG TER-UPDATE
    if (!data || data.length === 0) {
      console.log("❌ GAGAL SIMPAN: ID tidak ditemukan di tabel organizations!");
      return res.status(404).json({ error: `Gagal! UKM dengan ID ${id} tidak ada di database.` });
    }

    console.log("✅ BERHASIL SIMPAN KE DB!");
    res.json({ 
      status: "sukses", 
      message: "Logo berhasil diupload dan disimpan ke DB!",
      url: logoUrl 
    });
  } catch (error) {
    console.error("Error upload logo:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;