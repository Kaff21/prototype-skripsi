const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: 'dgkvemu2o',
  api_key: '339727786427372',
  api_secret: 'Ihi5PvdWozoRUOFimsjjznTeALw'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ormawa_uploads', // Nama folder di Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Format yang diizinkan
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Resize otomatis (opsional)
  }
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };