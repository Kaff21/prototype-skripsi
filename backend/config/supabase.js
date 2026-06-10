const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ENV Supabase belum kebaca!", {
    supabaseUrl,
    supabaseKey
  });
}

// Client utama untuk operasi database dengan hak akses superadmin (Service Role)
// Client ini TIDAK BOLEH digunakan untuk login/register karena akan kehilangan hak aksesnya
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Client khusus untuk autentikasi (login/register)
const supabaseAuth = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Tambahkan supabaseAuth sebagai properti dari supabase agar tidak merusak import di file lain
supabase.authClient = supabaseAuth;

module.exports = supabase;