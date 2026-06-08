const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ENV Supabase belum kebaca!", {
    supabaseUrl,
    supabaseKey
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;