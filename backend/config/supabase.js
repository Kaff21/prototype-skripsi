const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Gunakan Service Role agar backend bisa bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;