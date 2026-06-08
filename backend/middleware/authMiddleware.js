const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Ambil string setelah "Bearer "

  if (!token) return res.status(403).json({ error: "Token tidak ditemukan, silakan login ulang." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Menyimpan info user (id & role) ke dalam request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token tidak valid atau sudah kadaluarsa." });
  }
};

module.exports = verifyToken;