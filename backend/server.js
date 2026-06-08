require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
// Hapus createClient di sini jika sudah ada di config/supabase.js

const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const statsRoutes = require('./routes/stats'); 
const userRoute = require('./routes/users');
const kegiatanRoutes = require("./routes/kegiatan"); // Pastikan file-nya ada!
const organizationRoutes = require('./routes/organization');

const app = express(); 

// Middleware Global
app.use(cors());
app.use(express.json());

// Anti-Cache (Sudah benar kamu pasang ini)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// --- API ROUTES ---
app.use('/api/register', registerRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoute);
app.use('/api/kegiatan', kegiatanRoutes); // <--- Jantung fitur kegiatan
app.use('/api/organizations', organizationRoutes);

app.get('/', (req, res) => {
  res.json({ status: "Online", message: "Backend SIM-ORMAWA lari kencang!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});