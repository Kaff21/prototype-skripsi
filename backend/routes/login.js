const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const jwt = require("jsonwebtoken");

router.post("/", async(req, res) => {
    const { email, password } = req.body;

    try {
        const { data: authData, error: authError } =
        await supabase.authClient.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            return res.status(401).json({ error: "Email atau kata sandi salah." });
        }

        // 🚨 PERBAIKAN: Kita tambahkan nim, posisi, bio, dan avatar_url di dalam select()
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select(
                `
        id, 
        full_name, 
        status, 
        role, 
        organization_id,
        nim,
        posisi,
        bio,
        avatar_url,
        organizations (name, initial, logo_url, color_theme)
      `,
            )
            .eq("id", authData.user.id)
            .single();

        if (profileError || !profile) {
            return res
                .status(404)
                .json({ error: "Profil pengguna tidak ditemukan." });
        }

        if (profile.status === "ditolak") {
            return res
                .status(403)
                .json({
                    error: "Mohon maaf, pendaftaran akun Anda ditolak oleh Admin.",
                });
        }

        if (profile.status === "pending") {
            return res
                .status(403)
                .json({ error: "Akun Anda belum aktif. Menunggu persetujuan Admin." });
        }

        const token = jwt.sign({
                id: profile.id,
                role: profile.role,
                organization_id: profile.organization_id,
            },
            process.env.JWT_SECRET || "secret_key", { expiresIn: "24h" },
        );

        // 🚨 PERBAIKAN: Pastikan data yang baru ditambahkan ikut dikirim ke frontend
        res.json({ 
      message: "Login Berhasil!", 
      token,
      user: { 
        id: profile.id,
        full_name: profile.full_name,
        email: authData.user.email,
        role: profile.role,
        organization_id: profile.organization_id,
        status: profile.status,
        nim: profile.nim,
        posisi: profile.posisi,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        // Data Organisasi hasil join
        org_name: profile.organizations?.name,
        org_logo: profile.organizations?.logo_url,
        org_initial: profile.organizations?.initial,
        // 🚨 UBAH / TAMBAHKAN BARIS INI:
        color_theme: profile.organizations?.color_theme, 
        org_theme: profile.organizations?.color_theme // (Biarkan saja untuk jaga-jaga)
      } 
    });
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan pada server." });
    }
});

module.exports = router;