const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// =======================================================
// 1. ENDPOINT: Mengambil Statistik untuk Superadmin
// =======================================================
router.get('/superadmin', async (req, res) => {
  try {
    const { data: orgs } = await supabase.from('organizations').select('id');
    
    // 🚨 PERBAIKAN: Hanya hitung yang statusnya 'aktif' (yang ditolak & pending diabaikan)
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .eq('status', 'aktif'); 
      
    // Hitung khusus yang masih pending
    const { data: pendingUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('status', 'pending');

    // 🚀 TAMBAHAN: Variabel pelengkap untuk Dashboard komponen
    const { count: total_activities } = await supabase.from('activities').select('*', { count: 'exact', head: true });
    const { count: proposal_pending } = await supabase.from('activities').select('*', { count: 'exact', head: true }).eq('is_published', false);
    const { count: proposal_acc } = await supabase.from('activities').select('*', { count: 'exact', head: true }).eq('is_published', true);

    res.json({
      // Variabel Lama
      total_organisasi: orgs ? orgs.length : 0,
      total_akun: users ? users.length : 0,
      menunggu_persetujuan: pendingUsers ? pendingUsers.length : 0,
      // Variabel Baru
      total_users: users ? users.length : 0,
      total_orgs: orgs ? orgs.length : 0,
      total_activities: total_activities || 0,
      total_pending: proposal_pending || 0,
      total_approved: proposal_acc || 0
    });

  } catch (error) {
    console.error("Error load stats:", error.message);
    res.status(500).json({ error: "Gagal memuat statistik global" });
  }
});


// =======================================================
// 2. ENDPOINT: Mengambil Statistik KHUSUS untuk Admin UKM & Pembina
// =======================================================
router.get('/admin/:orgId', async (req, res) => {
  const { orgId } = req.params;
  
  // 🚨 Berikan nilai default 0 untuk SEMUA variabel jika org_id kosong
  if (!orgId || orgId === 'null' || orgId === 'undefined') {
    return res.json({ total_anggota: 0, kegiatan_aktif: 0, org_name: "Organisasi", active_events: 0, kegiatan_selesai: 0, proposal_menunggu: 0, anggaran_terpakai: 0 });
  }

  try {
    const { data: orgData } = await supabase.from('organizations').select('name').eq('id', orgId).single();

    const { data: anggota } = await supabase
      .from('profiles')
      .select('id')
      .eq('organization_id', orgId)
      .eq('status', 'aktif')
      .neq('role', 'superadmin');

    // 🚀 PERBAIKAN: Ganti tabel 'kegiatan' menjadi 'activities' agar terbaca
    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('organization_id', orgId);

    let active_events = 0;
    let kegiatan_selesai = 0;
    let proposal_menunggu = 0;
    let anggaran_terpakai = 0;

    if (activities) {
      activities.forEach(act => {
        if (act.status === 'Selesai') {
          kegiatan_selesai++;
        } else {
          active_events++;
        }

        if (!act.is_published) {
          proposal_menunggu++;
        }

        anggaran_terpakai += Number(act.anggaran || 0);
      });
    }

    res.json({
      // Variabel Lama
      total_anggota: anggota ? anggota.length : 0,
      kegiatan_aktif: active_events,
      // Variabel Baru Dashboard
      org_name: orgData ? orgData.name : "Organisasi",
      active_events: active_events,
      kegiatan_selesai: kegiatan_selesai,
      proposal_menunggu: proposal_menunggu,
      anggaran_terpakai: anggaran_terpakai
    });

  } catch (error) {
    console.error("Error load admin stats:", error.message);
    res.status(500).json({ error: "Gagal memuat statistik UKM" });
  }
});

// =======================================================
// 3. ENDPOINT: Mengambil kontribusi/absensi user (TIDAK BERUBAH)
// =======================================================
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;