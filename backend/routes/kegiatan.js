const express = require("express");
const router = express.Router();
const supabase = require('../config/supabase');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// 1. KONEKSI KE SERVER CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. PENAMPUNGAN LOKAL SEMENTARA (MENJAGA BINER PDF AGAR TIDAK KORUP)
const storageSistem = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
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

// In-memory cache untuk performa tinggi & fallback jika tabel migration sedang disinkronkan
const activeSessionsCache = new Map();
const dynamicTokensCache = new Map();

// Helper: Bersihkan token kadaluwarsa dari cache berkala
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of dynamicTokensCache.entries()) {
    if (data.expiredAt < now) {
      dynamicTokensCache.delete(token);
    }
  }
}, 60000);

// ======================================================================
// H. MANAJEMEN SESI PRESENSI DIGITAL & QR DINAMIS
// ======================================================================

// 1. BUAT / BUKA SESI PRESENSI BARU UNTUK KEGIATAN
router.post("/:id/sesi", async (req, res) => {
  const { id: kegiatan_id } = req.params;
  const { durasi_menit = 30 } = req.body;

  try {
    const waktuMulai = new Date();
    const waktuSelesai = new Date(waktuMulai.getTime() + parseInt(durasi_menit, 10) * 60 * 1000);

    // Tutup sesi aktif sebelumnya jika ada di Supabase
    try {
      await supabase
        .from("sesi_presensi")
        .update({ status: "ditutup" })
        .eq("kegiatan_id", kegiatan_id)
        .eq("status", "aktif");
    } catch (e) {
      console.warn("Info: Supabase sesi_presensi update fallback:", e.message);
    }

    let sessionData = {
      id: crypto.randomUUID(),
      kegiatan_id,
      waktu_mulai: waktuMulai.toISOString(),
      waktu_selesai: waktuSelesai.toISOString(),
      status: "aktif"
    };

    // Simpan ke Supabase jika tabel tersedia
    try {
      const { data, error } = await supabase
        .from("sesi_presensi")
        .insert([{
          kegiatan_id,
          waktu_mulai: sessionData.waktu_mulai,
          waktu_selesai: sessionData.waktu_selesai,
          status: "aktif"
        }])
        .select()
        .single();

      if (!error && data) {
        sessionData = data;
      }
    } catch (dbErr) {
      console.warn("Gagal simpan ke DB Supabase sesi_presensi, menggunakan cache memori:", dbErr.message);
    }

    // Simpan ke memory cache
    activeSessionsCache.set(kegiatan_id, sessionData);
    activeSessionsCache.set(sessionData.id, sessionData);

    res.status(200).json({
      status: "sukses",
      message: "Sesi presensi berhasil dibuka!",
      data: sessionData
    });
  } catch (error) {
    console.error("Error buat sesi presensi:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 2. CEK SESI PRESENSI AKTIF UNTUK KEGIATAN
router.get("/:id/sesi/aktif", async (req, res) => {
  const { id: kegiatan_id } = req.params;

  try {
    let activeSession = null;

    // Cek di Supabase terlebih dahulu
    try {
      const { data, error } = await supabase
        .from("sesi_presensi")
        .select("*")
        .eq("kegiatan_id", kegiatan_id)
        .eq("status", "aktif")
        .order("waktu_mulai", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        // Cek apakah waktu selesai sudah lewat
        if (new Date(data.waktu_selesai) > new Date()) {
          activeSession = data;
        } else {
          // Otomatis tandai ditutup jika waktu sudah habis
          await supabase.from("sesi_presensi").update({ status: "ditutup" }).eq("id", data.id);
        }
      }
    } catch (e) {
      console.warn("Supabase fetch sesi aktif fallback:", e.message);
    }

    // Fallback ke cache jika DB belum ada
    if (!activeSession && activeSessionsCache.has(kegiatan_id)) {
      const cached = activeSessionsCache.get(kegiatan_id);
      if (cached.status === "aktif" && new Date(cached.waktu_selesai) > new Date()) {
        activeSession = cached;
      }
    }

    // Ambil jumlah peserta yang sudah hadir pada kegiatan ini
    let totalHadir = 0;
    try {
      const { count } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("activity_id", kegiatan_id);
      totalHadir = count || 0;
    } catch (e) {
      console.warn("Count attendance error:", e.message);
    }

    res.status(200).json({
      status: "sukses",
      data: activeSession,
      total_hadir: totalHadir
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 3. TUTUP SESI PRESENSI
router.patch("/sesi/:sesiId/tutup", async (req, res) => {
  const { sesiId } = req.params;

  try {
    try {
      await supabase
        .from("sesi_presensi")
        .update({ status: "ditutup" })
        .eq("id", sesiId);
    } catch (e) {
      console.warn("Tutup sesi di Supabase fallback:", e.message);
    }

    if (activeSessionsCache.has(sesiId)) {
      const s = activeSessionsCache.get(sesiId);
      s.status = "ditutup";
      activeSessionsCache.delete(s.kegiatan_id);
    }

    res.status(200).json({ status: "sukses", message: "Sesi presensi berhasil ditutup." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 4. GENERATE TOKEN QR DINAMIS (UUID v4 & Expired TTL 20 Detik)
router.get("/sesi/:sesiId/token", async (req, res) => {
  const { sesiId } = req.params;

  try {
    // Validasi apakah sesi masih aktif
    let session = activeSessionsCache.get(sesiId);

    if (!session) {
      try {
        const { data } = await supabase
          .from("sesi_presensi")
          .select("*")
          .eq("id", sesiId)
          .single();
        session = data;
      } catch (e) {}
    }

    if (!session || session.status !== "aktif" || new Date(session.waktu_selesai) <= new Date()) {
      return res.status(400).json({
        status: "error",
        message: "Sesi presensi sudah berakhir atau ditutup!"
      });
    }

    // Generate UUID v4 Token
    const token = crypto.randomUUID();
    const ttlSeconds = 15; // 15 detik per refresh token (sesuai spesifikasi penelitian)
    const expiredAt = new Date(Date.now() + ttlSeconds * 1000);

    // Simpan ke Supabase jika tabel qr_tokens ada
    try {
      await supabase.from("qr_tokens").insert([{
        sesi_id: sesiId,
        token_hash: token,
        expired_at: expiredAt.toISOString()
      }]);
    } catch (dbErr) {
      // Abaikan jika tabel belum termigrasi, token tetap tervalidasi via cache
    }

    // Simpan ke memori untuk validasi cepat
    dynamicTokensCache.set(token, {
      sesi_id: sesiId,
      kegiatan_id: session.kegiatan_id,
      expiredAt: expiredAt.getTime()
    });

    res.status(200).json({
      status: "sukses",
      token: token,
      expired_at: expiredAt.toISOString(),
      ttl_seconds: ttlSeconds,
      sesi_id: sesiId,
      kegiatan_id: session.kegiatan_id
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 5. VALIDASI & PENCATATAN PRESENSI DINAMIS (Sesuai Activity Diagram To-Be Gambar 4)
router.post("/absen-dinamis", async (req, res) => {
  const { token, activity_id, sesi_id, user_id } = req.body;

  try {
    // ==============================================================
    // TAHAP 1: VALIDASI IDENTITAS ANGGOTA
    // ==============================================================
    if (!user_id) {
      return res.status(400).json({
        status: "error",
        message: "Identitas pengguna tidak ditemukan. Pastikan Anda sudah login."
      });
    }

    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("id, full_name, nim, email, role, status")
      .eq("id", user_id)
      .single();

    if (userError || !userProfile) {
      return res.status(403).json({
        status: "error",
        message: "Identitas anggota tidak valid atau tidak terdaftar dalam sistem SIM-ORMAWA."
      });
    }

    if (userProfile.status === "pending") {
      return res.status(403).json({
        status: "error",
        message: "Akun Anda masih berstatus pending dan belum disetujui pengurus."
      });
    }

    // ==============================================================
    // TAHAP 2: VALIDASI QR CODE & BATAS WAKTU (TOKEN VALID & EXPIRED CHECK)
    // ==============================================================
    let targetActivityId = activity_id;
    let targetSesiId = sesi_id;
    let isValidToken = false;

    // Cek di cache memori
    if (dynamicTokensCache.has(token)) {
      const cachedToken = dynamicTokensCache.get(token);
      if (Date.now() <= cachedToken.expiredAt) {
        isValidToken = true;
        targetActivityId = targetActivityId || cachedToken.kegiatan_id;
        targetSesiId = targetSesiId || cachedToken.sesi_id;
      } else {
        return res.status(400).json({
          status: "error",
          message: "QR Code telah kedaluwarsa (Expired). Silakan lakukan pemindaian ulang pada QR Code terbaru di layar."
        });
      }
    }

    // Jika tidak di cache, periksa tabel qr_tokens di Supabase
    if (!isValidToken) {
      try {
        const { data: dbToken, error: tokenError } = await supabase
          .from("qr_tokens")
          .select("*, sesi_presensi(id, kegiatan_id, status, waktu_selesai)")
          .eq("token_hash", token)
          .single();

        if (!tokenError && dbToken) {
          if (new Date() <= new Date(dbToken.expired_at)) {
            isValidToken = true;
            targetSesiId = dbToken.sesi_id;
            targetActivityId = targetActivityId || dbToken.sesi_presensi?.kegiatan_id;
          } else {
            return res.status(400).json({
              status: "error",
              message: "QR Code telah kedaluwarsa. Silakan scan QR Code terbaru di layar."
            });
          }
        }
      } catch (err) {}
    }

    // Dukungan backward-compatibility jika scan QR statis lama
    if (!isValidToken && token === `ABSENSI_${activity_id}`) {
      isValidToken = true;
    }

    if (!isValidToken) {
      return res.status(400).json({
        status: "error",
        message: "QR Code tidak valid atau telah kedaluwarsa. Silakan arahkan kamera ke QR Code yang sedang aktif."
      });
    }

    // Validasi batas waktu sesi presensi
    if (targetSesiId) {
      let sesiObj = activeSessionsCache.get(targetSesiId);
      if (!sesiObj) {
        try {
          const { data } = await supabase
            .from("sesi_presensi")
            .select("*")
            .eq("id", targetSesiId)
            .single();
          sesiObj = data;
        } catch (e) {}
      }

      if (sesiObj) {
        if (sesiObj.status !== "aktif" || new Date() > new Date(sesiObj.waktu_selesai)) {
          return res.status(400).json({
            status: "error",
            message: "Sesi presensi untuk kegiatan ini telah berakhir atau telah ditutup oleh pengurus."
          });
        }
      }
    }

    if (!targetActivityId) {
      return res.status(400).json({
        status: "error",
        message: "ID Kegiatan tidak ditemukan pada token presensi."
      });
    }

    // ==============================================================
    // TAHAP 3: PENCEGAHAN PRESENSI BERULANG (PADA KEGIATAN YANG SAMA)
    // ==============================================================
    const { data: existingAttendance } = await supabase
      .from("attendance")
      .select("id, check_in")
      .eq("activity_id", targetActivityId)
      .eq("user_id", user_id)
      .maybeSingle();

    if (existingAttendance) {
      const jamAbsen = new Date(existingAttendance.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      return res.status(400).json({
        status: "error",
        message: `Anda sudah melakukan presensi pada kegiatan ini sebelumnya pada pukul ${jamAbsen} WIB!`
      });
    }

    // ==============================================================
    // TAHAP 4: SIMPAN DATA KEHADIRAN KE SUPABASE
    // ==============================================================
    const waktuPresensi = new Date();
    const statusKehadiran = "Hadir";

    const insertPayload = {
      activity_id: targetActivityId,
      user_id: user_id,
      check_in: waktuPresensi.toISOString(),
      status: statusKehadiran
    };

    if (targetSesiId) {
      insertPayload.sesi_id = targetSesiId;
    }

    const { error: insertError } = await supabase
      .from("attendance")
      .insert([insertPayload]);

    if (insertError) {
      console.error("Insert attendance error:", insertError);
      // Jika kolom sesi_id atau status belum ada di DB, coba insert dasar
      if (insertError.message?.includes("column") || insertError.code === "42703") {
        const { error: retryError } = await supabase
          .from("attendance")
          .insert([{ activity_id: targetActivityId, user_id, check_in: waktuPresensi }]);
        if (retryError) throw retryError;
      } else {
        throw insertError;
      }
    }

    // Ambil judul kegiatan untuk konfirmasi
    let activityTitle = "Kegiatan Ormawa";
    try {
      const { data: act } = await supabase
        .from("activities")
        .select("title")
        .eq("id", targetActivityId)
        .single();
      if (act) activityTitle = act.title;
    } catch (e) {}

    return res.status(200).json({
      status: "sukses",
      message: "Presensi berhasil dicatat secara resmi!",
      data: {
        nama: userProfile.full_name,
        nim: userProfile.nim,
        kegiatan: activityTitle,
        waktu_presensi: waktuPresensi.toISOString(),
        status: statusKehadiran
      }
    });

  } catch (error) {
    console.error("Error presensi dinamis:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan sistem saat memproses presensi: " + error.message
    });
  }
});

// 6. ENDPOINT REKAPITULASI & RIWAYAT PRESENSI UNTUK AKUNTABILITAS ORGANISASI
router.get("/:id/rekap-presensi", async (req, res) => {
  const { id: kegiatan_id } = req.params;

  try {
    // 1. Ambil detail kegiatan
    const { data: kegiatan, error: kegiatanError } = await supabase
      .from("activities")
      .select("id, title, date_start, location, description, status")
      .eq("id", kegiatan_id)
      .single();

    if (kegiatanError || !kegiatan) {
      return res.status(404).json({ status: "error", message: "Kegiatan tidak ditemukan." });
    }

    // 2. Ambil data presensi
    const { data: attendances, error: attError } = await supabase
      .from("attendance")
      .select(`
        id,
        check_in,
        status,
        user_id
      `)
      .eq("activity_id", kegiatan_id)
      .order("check_in", { ascending: true });

    if (attError) throw attError;

    // 3. Ambil data profil pengguna yang hadir
    const userIds = (attendances || []).map(a => a.user_id).filter(Boolean);
    let profilesMap = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, nim, email, posisi, avatar_url, role")
        .in("id", userIds);

      (profiles || []).forEach(p => {
        profilesMap[p.id] = p;
      });
    }

    // Gabungkan data kehadiran dengan profil
    const rekapData = (attendances || []).map((att, index) => {
      const prof = profilesMap[att.user_id] || {};
      return {
        nomor: index + 1,
        id: att.id,
        user_id: att.user_id,
        nama: prof.full_name || "Tanpa Nama",
        nim: prof.nim || "-",
        email: prof.email || "-",
        posisi: prof.posisi || prof.role || "Anggota",
        avatar_url: prof.avatar_url || null,
        waktu_presensi: att.check_in,
        status: att.status || "Hadir"
      };
    });

    res.status(200).json({
      status: "sukses",
      kegiatan: kegiatan,
      total_hadir: rekapData.length,
      data: rekapData
    });
  } catch (error) {
    console.error("Error get rekap presensi:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 7. LEGACY ABSENSI DIGITAL (Tetap dipertahankan untuk kompatibilitas ke belakang)
router.post("/absen", async (req, res) => {
  const { activity_id, user_id } = req.body;
  try {
    const { data: existing } = await supabase.from("attendance").select("*").eq("activity_id", activity_id).eq("user_id", user_id).single();
    if (existing) return res.status(400).json({ status: "error", message: "Anda sudah melakukan presensi sebelumnya!" });
    const { error } = await supabase.from("attendance").insert([{ activity_id, user_id, check_in: new Date(), status: "Hadir" }]);
    if (error) throw error;
    res.status(200).json({ status: "sukses", message: "Presensi berhasil dicatat!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
