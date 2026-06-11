"use client";
import API_BASE_URL from "@/utils/api";
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import AlertDialog, { useAlert } from "@/components/Alert";

export default function ScannerAbsensi() {
  const [isScanning, setIsScanning] = useState(false);
  const { alertState, showAlert, handleClose } = useAlert();

  useEffect(() => {
    let scanner;
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(
        async (decodedText) => {
          try {
            await scanner.clear();
          } catch (err) {
            console.error("Gagal menghentikan scanner:", err);
          }
          setIsScanning(false);
          handleAttendance(decodedText);
        },
        (error) => {
          // Abaikan error pembacaan frame QR
        }
      );
    }
    return () => {
      if (scanner) {
        scanner.clear().catch((err) => console.error("Gagal menghentikan scanner saat unmount:", err));
      }
    };
  }, [isScanning]);

  const handleAttendance = async (qrData) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const activityId = qrData.replace("ABSENSI_", "");

      await axios.post(API_BASE_URL + "/api/kegiatan/absen", {
        activity_id: activityId,
        user_id: user.id
      });
      await showAlert({ type: "success", title: "Absensi Berhasil! 🔥", message: "Kehadiran Anda telah berhasil dicatat. Terima kasih!" });
    } catch (err) {
      await showAlert({ type: "error", title: "Absensi Gagal!", message: err.response?.data?.message || "Gagal melakukan absensi. Coba lagi." });
    }
  };

  return (
    <>
      <div className="w-full">
        {/* Tombol Buka Kamera hanya muncul jika tidak sedang scan */}
        <button 
          onClick={() => setIsScanning(true)}
          className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white p-8 rounded-[2.5rem] font-black uppercase tracking-widest flex-col items-center gap-4 transition-all shadow-xl shadow-indigo-100 ${isScanning ? 'hidden' : 'flex'}`}
        >
          <span className="material-symbols-outlined text-5xl">photo_camera</span>
          <span>Buka Kamera Scan</span>
        </button>

        {/* Kontainer Kamera: Harus tetap ter-render di DOM agar tidak crash saat scanner.clear() dipanggil */}
        <div className={`space-y-4 ${isScanning ? 'block' : 'hidden'}`}>
          <div id="reader" className="overflow-hidden rounded-3xl border-0"></div>
          <button 
            onClick={async () => {
              setIsScanning(false);
            }}
            className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
          >
            Matikan Kamera
          </button>
        </div>
      </div>

      <AlertDialog alertState={alertState} onClose={handleClose} />
    </>
  );
}
