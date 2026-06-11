require('dotenv').config(); 
const express = require('express');
const cors = require('cors');

const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const statsRoutes = require('./routes/stats'); 
const userRoute = require('./routes/users');
const kegiatanRoutes = require("./routes/kegiatan");
const organizationRoutes = require('./routes/organization');

const app = express(); 

// CORS: izinkan Vercel (production), localhost (development), dan Capacitor (mobile app)
const corsOptions = {
  origin: function (origin, callback) {
    const allowed = [
      /\.vercel\.app$/,
      /^http:\/\/localhost/,
      /^https:\/\/localhost/,
      /^capacitor:\/\/localhost/,
      /^http:\/\/127\.0\.0\.1/
    ];
    if (!origin || allowed.some(pattern => pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('CORS tidak diizinkan: ' + origin));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
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