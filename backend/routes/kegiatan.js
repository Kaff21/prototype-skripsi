const express = require("express");
const router = express.Router();
const supabase = require('../config/supabase');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// 1. KONEKSI KE SERVER CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. PENAMPUNGAN LOKAL SEMENTARA (MENJAGA BINER PDF AGAR TIDAK KORUP)
const storageSistem = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './temp_uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadSistem = multer({ storage: storageSistem });

// ======================================================================
// RUTE-RUTE API KEGIATAN
// ======================================================================

// A. TAMBAH KEGIATAN (Upload Cover Gambar Poster)
router.post("/tambah", uploadSistem.single('image'), async (req, res) => {
  req.setTimeout(600000); // Set timeout to 10 minutes for slower uploads
  const { judul, deskripsi, tanggal, waktu, lokasi, anggaran, organization_id } = req.body;
  let image_url = null;

  try {
    if (req.file) {
      // Kirim berkas ke Cloudinary dengan parameter resource_type: image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'kegiatan_ormawa/poster',
        resource_type: 'image'
      });
      image_url = result.secure_url;
      fs.unlinkSync(req.file.path); // Bersihkan sisa sampah di lokal server
    }

    const { data, error } = await supabase.from("activities").insert([{
      title: judul, description: deskripsi, location: lokasi, date_start: tanggal, waktu: waktu, anggaran: anggaran || 0, image_url: image_url, organization_id: organization_id, status: "Akan Datang"
    }]).select();
    
    if (error) throw error;
    res.status(200).json({ status: "sukses", data: data[0] });
  } catch (error) { 
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ status: "error", message: error.message }); 
  }
});

// B. UPLOAD PROPOSAL PDF (VERSI STABIL - AUTO DETECT)
router.post("/:id/upload-proposal", uploadSistem.single('proposal'), async (req, res) => {
  req.setTimeout(600000); // Set timeout to 10 minutes for slower uploads
  const { id } = req.params;
  try {
    if (!req.file) return res.status(400).json({ error: "File proposal tidak ditemukan!" });
    
    const namaAsliFile = path.parse(req.file.originalname).name.replace(/\s+/g, '_');

    // 🚨 KITA UBAH KE 'auto' AGAR LEBIH STABIL & PERMISIF TERHADAP DOKUMEN PDF
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'kegiatan_ormawa/proposal',
      resource_type: 'auto', 
      public_id: namaAsliFile + '_' + Date.now(),
    });

    const urlResmiPDF = result.secure_url;

    // Hapus file temporary lokal komputer server
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); 
    }

    // Masukkan data URL resmi Cloudinary ke database Supabase
    const { error } = await supabase.from("activities").update({ proposal_url: urlResmiPDF }).eq("id", id);
    if (error) {
      console.error("🚨 ERROR SUPABASE:", error);
      throw error;
    }

    // Response ganda agar frontend tidak bingung
    res.json({ success: true, status: "sukses", message: "Proposal diunggah!", url: urlResmiPDF });

  } catch (error) { 
    console.error("🚨 ERROR SAAT UPLOAD PDF:", error); // Cek terminal kalau gagal!
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, status: "error", error: error.message }); 
  }
});

// C. SISTEM PERSETUJUAN (BIROKRASI)
router.patch('/:id/persetujuan', async (req, res) => {
  const { id } = req.params;
  const { roleApprover, status, catatan_revisi } = req.body; 
  
  console.log(`\n================================`);
  console.log(`🚨 ADA YANG KLIK ACC!`);
  console.log(`Role: ${roleApprover} | Status: ${status} | ID: ${id}`);
  
  try {
    const { data: current, error: fetchError } = await supabase.from("activities").select("*").eq("id", id).single();
    if (fetchError) {
        console.log("❌ GAGAL CARI DATA KEGIATAN:", fetchError);
        throw fetchError;
    }

    let finalPembina = roleApprover === 'pembina' ? status : current.status_pembina;
    let finalBem = roleApprover === 'bem' ? status : current.status_bem;
    let finalKemahasiswaan = roleApprover === 'kemahasiswaan' ? status : current.status_kemahasiswaan;

    let updateData = {};
    if (roleApprover === 'pembina') updateData.status_pembina = status;
    if (roleApprover === 'bem') updateData.status_bem = status;
    if (roleApprover === 'kemahasiswaan') updateData.status_kemahasiswaan = status;
    
    if (status === 'revisi') { updateData.catatan_revisi = catatan_revisi; updateData.is_published = false; } 
    else if (status === 'approved') { updateData.catatan_revisi = null; }

    if (finalPembina === 'approved' && finalBem === 'approved' && finalKemahasiswaan === 'approved') {
      updateData.is_published = true;
    }

    console.log("📦 Data yang mau di-update ke Supabase:", updateData);

    const { data: updatedKegiatan, error: updateError } = await supabase.from('activities').update(updateData).eq('id', id).select().single();
    if (updateError) {
        console.log("❌ GAGAL UPDATE SUPABASE:", updateError);
        throw updateError;
    }
    
    console.log("✅ BERHASIL UPDATE!");
    res.json({ status: "sukses", data: updatedKegiatan });
  } catch (error) { 
    console.log("💥 ERROR SERVER:", error.message);
    res.status(500).json({ error: error.message }); 
  }
});

// D. AMBIL DATA KEGIATAN (DENGAN HAK AKSES PANTAUAN GLOBAL)
router.get("/", async (req, res) => {
  const { org_id, role } = req.query; 
  try {
    let query = supabase
      .from("activities")
      .select("*, organizations(name, initial)")
      .order("date_start", { ascending: true }); 

    const roleStr = (role || "").toLowerCase().trim();
    
    // 🚨 TAMBAHKAN TYPO 'kemasiswaan' di sini:
    const rolePemantauGlobal = ["superadmin", "bem", "kemahasiswaan", "kemasiswaan"]; 
    
    const isPemantauGlobal = rolePemantauGlobal.includes(roleStr); 

    if (!isPemantauGlobal) {
      if (org_id && org_id !== 'null' && org_id !== 'undefined') {
        query = query.eq('organization_id', org_id);
      } else if (roleStr === 'pembina' || roleStr === 'admin_ukm') {
        return res.json([]);
      }
    }

    if (roleStr === 'anggota') {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

// E. UPDATE / EDIT DATA KEGIATAN
router.put("/update/:id", uploadSistem.single('image'), async (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, tanggal, waktu, lokasi, anggaran, status } = req.body;
  let updateData = { title: judul, description: deskripsi, date_start: tanggal, waktu: waktu, location: lokasi, anggaran: anggaran, status: status };
  
  try {
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'kegiatan_ormawa/poster',
        resource_type: 'image'
      });
      updateData.image_url = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const { error } = await supabase.from("activities").update(updateData).eq("id", id);
    if (error) throw error;
    res.status(200).json({ status: "sukses" });
  } catch (error) { 
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ status: "error", message: error.message }); 
  }
});

// F. UPDATE STATUS CARD PELAKSANAAN
router.patch("/:id/status-pelaksanaan", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const { error } = await supabase.from("activities").update({ status }).eq("id", id);
    if (error) throw error;
    res.json({ status: "sukses" });
  } catch (error) { res.status(500).json({ status: "error", message: error.message }); }
});

// G. HAPUS DATA KEGIATAN
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await supabase.from("attendance").delete().eq("activity_id", id);
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({ status: "sukses" });
  } catch (error) { res.status(500).json({ status: "error", message: error.message }); }
});

// H. ABSENSI DIGITAL
router.post("/absen", async (req, res) => {
  const { activity_id, user_id } = req.body;
  try {
    const { data: existing } = await supabase.from("attendance").select("*").eq("activity_id", activity_id).eq("user_id", user_id).single();
    if (existing) return res.status(400).json({ status: "error", message: "Sudah absen!" });
    const { error } = await supabase.from("attendance").insert([{ activity_id, user_id, check_in: new Date() }]);
    if (error) throw error;
    res.status(200).json({ status: "sukses" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;