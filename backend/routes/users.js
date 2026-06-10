const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const fs = require('fs');

const multer = require('multer');
const upload = multer({ dest: 'temp_uploads/' }); 

// A. Ambil semua user yang statusnya 'pending'
router.get('/pending', async (req, res) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  try {
    // Menghapus order('updated_at') untuk mencegah error 500 jika kolom tersebut tidak ada
    const { data, error } = await supabase.from('profiles').select('*').eq('status', 'pending');
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// B. Endpoint untuk mengambil riwayat kehadiran (kontribusi) user
router.get("/contributions/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        id,
        check_in,
        activities (
          title,
          date_start,
          location
        )
      `)
      .eq("user_id", userId)
      .order("check_in", { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error contributions:", error.message);
    res.status(500).json({ error: "Gagal mengambil riwayat kontribusi" });
  }
});

// 🚨 C. PERBAIKAN: Ambil SEMUA user beserta Nama Organisasinya (JOIN)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, organizations(name)') // Join dengan tabel organizations
      .order('updated_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Ambil semua user yang statusnya 'aktif'
router.get('/aktif', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, organizations(name, initial)')
      .eq('status', 'aktif');
      
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Ambil SATU data user
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) throw error;
    res.json(data);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

// D. Update status user (Terima/Tolak)
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    // Tambahkan .select() untuk memastikan baris benar-benar terupdate
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: status })
      .eq('id', id)
      .select();

    if (error) throw error;
    
    // Jika data kosong, berarti ID tidak ditemukan atau terblokir RLS
    if (!data || data.length === 0) {
      return res.status(400).json({ 
        error: "Gagal memperbarui. Data tidak ditemukan atau akses ditolak.",
        debug_id_diterima: id,
        debug_status_diterima: status
      });
    }

    res.json({ message: `User berhasil diperbarui menjadi ${status}` });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

// 🚨 E. PERBAIKAN: Edit Data User & Update Bio beserta Keterikatan Organisasi
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  // Tangkap organization_id dari frontend
  const { full_name, nim, email, role, status, posisi, bio, organization_id } = req.body; 

  try {
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (nim !== undefined) updateData.nim = nim;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (posisi !== undefined) updateData.posisi = posisi;
    if (bio !== undefined) updateData.bio = bio;
    // Update ID Organisasi (Jika kosong, set jadi null)
    if (organization_id !== undefined) updateData.organization_id = organization_id === "" ? null : organization_id;

    const { error } = await supabase.from('profiles').update(updateData).eq('id', id);
    if (error) throw error;
    res.json({ status: "sukses", message: "Data berhasil diperbarui" });
  } catch (error) { res.status(500).json({ status: "error", message: error.message }); }
});

// F. ROUTE KHUSUS UPLOAD FOTO PROFIL
router.put('/:id/upload-avatar', upload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.file) return res.status(400).json({ error: "File gambar tidak ditemukan!" });
    const fileData = fs.readFileSync(req.file.path);
    const base64Image = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`;
    const { error } = await supabase.from('profiles').update({ avatar_url: base64Image }).eq('id', id);
    fs.unlinkSync(req.file.path);
    if (error) throw error;
    res.json({ status: "sukses", url: base64Image, message: "Foto profil diupdate!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// G. Hapus / Tendang Akun User
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    res.json({ status: "sukses", message: "Akun berhasil dihapus permanen" });
  } catch (error) { res.status(500).json({ status: "error", message: error.message }); }
});

module.exports = router;