@echo off
echo ====================================================
echo       PUSH PERUBAHAN KE GITHUB PROTOTYPE-SKRIPSI
echo ====================================================
echo.

git init
git config --global --add safe.directory "%CD%"

echo Memeriksa remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/Kaff21/prototype-skripsi.git

echo Menambahkan file ke Git...
git add .

echo Membuat commit perubahan...
git commit -m "Update fitur presensi QR: pengelolaan kegiatan, dynamic QR 15s popup, optimized scanner, riwayat dan rekapitulasi kehadiran"

echo Memastikan branch main...
git branch -M main

echo Mengirim (push) perubahan ke GitHub...
git push -u origin main

echo.
echo ====================================================
echo Selesai! Jika muncul prompt login, silakan login ke GitHub Anda.
echo ====================================================
pause
