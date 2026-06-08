"use client";
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

export default function ScannerAbsensi() {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let scanner;
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(async (decodedText) => {
        scanner.clear();
        setIsScanning(false);
        handleAttendance(decodedText);
      });
    }
    return () => { if (scanner) scanner.clear(); };
  }, [isScanning]);

  const handleAttendance = async (qrData) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const activityId = qrData.replace("ABSENSI_", "");

      await axios.post("http://localhost:5000/api/kegiatan/absen", {
        activity_id: activityId,
        user_id: user.id
      });
      alert("Berhasil! Kehadiran Anda telah dicatat. 🔥");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal melakukan absensi.");
    }
  };

  return (
    <div className="w-full">
      {!isScanning ? (
        <button 
          onClick={() => setIsScanning(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-8 rounded-[2.5rem] font-black uppercase tracking-widest flex flex-col items-center gap-4 transition-all shadow-xl shadow-indigo-100"
        >
          <span className="material-symbols-outlined text-5xl">photo_camera</span>
          <span>Buka Kamera Scan</span>
        </button>
      ) : (
        <div className="space-y-4">
          <div id="reader" className="overflow-hidden rounded-3xl border-0"></div>
          <button 
            onClick={() => setIsScanning(false)}
            className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
          >
            Matikan Kamera
          </button>
        </div>
      )}
    </div>
  );
}