"use client";
import API_BASE_URL from "@/utils/api";
import { useEffect, useState, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import AlertDialog, { useAlert } from "@/components/Alert";

export default function ScannerAbsensi() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastSuccessData, setLastSuccessData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cameraList, setCameraList] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // "success" | "error" | "processing"
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const { alertState, showAlert, handleClose } = useAlert();

  // Dapatkan daftar kamera saat pertama kali
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        setCameraList(devices);
        // Pilih kamera belakang sebagai default jika ada
        const backCam = devices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("belakang") ||
            d.label.toLowerCase().includes("rear") ||
            d.label.toLowerCase().includes("environment")
        );
        setSelectedCamera(backCam?.id || devices[0]?.id || null);
      })
      .catch((err) => {
        console.error("Gagal mendapatkan kamera:", err);
      });
  }, []);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          // SCANNING
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn("Stop scanner warning:", err);
      }
      try {
        scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
  };

  const startScanner = async () => {
    setLastSuccessData(null);
    setStatusMessage("");
    setStatusType("");
    setIsScanning(true);

    await stopScanner();

    const cameraId = selectedCamera;
    if (!cameraId) {
      await showAlert({
        type: "error",
        title: "Kamera Tidak Ditemukan",
        message: "Tidak ada kamera yang tersedia. Pastikan akses kamera diizinkan.",
      });
      setIsScanning(false);
      return;
    }

    try {
      const scanner = new Html5Qrcode("qr-reader-container", { verbose: false });
      scannerRef.current = scanner;

      await scanner.start(
        cameraId,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.max(Math.floor(minEdge * 0.72), 160);
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          if (!isProcessingRef.current) {
            isProcessingRef.current = true;
            handleAttendance(decodedText);
          }
        },
        () => {
          // Abaikan error per-frame
        }
      );
    } catch (err) {
      console.error("Gagal memulai scanner:", err);
      await showAlert({
        type: "error",
        title: "Kamera Gagal Dibuka",
        message: "Pastikan Anda mengizinkan akses kamera pada browser dan tidak ada aplikasi lain yang menggunakan kamera.",
      });
      setIsScanning(false);
    }
  };

  const handleStopScanning = async () => {
    await stopScanner();
    setIsScanning(false);
    setStatusMessage("");
    setStatusType("");
  };

  const handleAttendance = async (qrData) => {
    setProcessing(true);
    setStatusMessage("Memverifikasi QR Code...");
    setStatusType("processing");

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.id) {
        setStatusMessage("Sesi login habis. Silakan login ulang.");
        setStatusType("error");
        await showAlert({
          type: "error",
          title: "Sesi Habis",
          message: "Identitas pengguna tidak ditemukan. Silakan login kembali ke SIM-ORMAWA.",
        });
        return;
      }

      // Parsing format data QR (Mendukung Dynamic JSON & Legacy Static)
      let payload = { user_id: user.id };

      try {
        const parsed = JSON.parse(qrData);
        if (parsed.type === "SIM_ORMAWA_PRESENSI" || parsed.token) {
          payload.token = parsed.token;
          payload.activity_id = parsed.activity_id;
          payload.sesi_id = parsed.sesi_id;
        } else {
          payload.token = qrData;
          payload.activity_id = parsed.activity_id || qrData.replace("ABSENSI_", "");
        }
      } catch (e) {
        payload.token = qrData;
        payload.activity_id = qrData.replace("ABSENSI_", "");
      }

      setStatusMessage("Mengirim data ke server...");

      const res = await axios.post(`${API_BASE_URL}/api/kegiatan/absen-dinamis`, payload);

      if (res.data?.status === "sukses") {
        setLastSuccessData(res.data.data);
        setStatusMessage("Presensi berhasil dicatat! ✓");
        setStatusType("success");

        // Stop scanner setelah berhasil
        await stopScanner();
        setIsScanning(false);

        await showAlert({
          type: "success",
          title: "Presensi Berhasil! 🎉",
          message: `Kehadiran Anda pada "${res.data.data?.kegiatan || "Kegiatan"}" telah resmi tercatat.`,
        });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Gagal melakukan presensi. Pastikan koneksi stabil dan coba lagi.";
      setStatusMessage(errorMsg);
      setStatusType("error");

      await showAlert({
        type: "error",
        title: "Presensi Ditolak!",
        message: errorMsg,
      });

      // Izinkan scan ulang setelah 2 detik
      setTimeout(() => {
        isProcessingRef.current = false;
        setStatusMessage("Arahkan kamera ke QR Code...");
        setStatusType("");
      }, 2000);
    } finally {
      setProcessing(false);
    }
  };

  const handleScanAgain = () => {
    isProcessingRef.current = false;
    setLastSuccessData(null);
    setStatusMessage("");
    setStatusType("");
    startScanner();
  };

  return (
    <>
      <div className="w-full space-y-4">
        {/* Bukti Kehadiran Terakhir */}
        {lastSuccessData && !isScanning && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-3xl space-y-3 animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wider">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg">verified</span>
              </div>
              <span>Presensi Berhasil Tercatat</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Nama Anggota</span>
                <span className="font-black text-slate-800">{lastSuccessData.nama}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">NIM</span>
                <span className="font-mono font-bold text-slate-700">{lastSuccessData.nim}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Kegiatan</span>
                <span className="font-bold text-indigo-700 truncate max-w-[200px]">{lastSuccessData.kegiatan}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Status</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  {lastSuccessData.status || "Hadir"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Waktu Presensi</span>
                <span className="font-mono text-slate-700">
                  {new Date(lastSuccessData.waktu_presensi).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}{" "}
                  WIB
                </span>
              </div>
            </div>

            {/* Tombol Scan Lagi */}
            <button
              onClick={handleScanAgain}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-200 mt-2"
            >
              <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
              Scan Kegiatan Lain
            </button>
          </div>
        )}

        {/* Tombol Buka Kamera */}
        {!isScanning && !lastSuccessData && (
          <div className="space-y-4">
            {/* Pilih Kamera (jika lebih dari 1) */}
            {cameraList.length > 1 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Pilih Kamera
                </label>
                <select
                  value={selectedCamera || ""}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium text-slate-700"
                >
                  {cameraList.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Kamera ${cam.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={startScanner}
              disabled={processing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-8 rounded-[2.5rem] font-black uppercase tracking-widest flex flex-col items-center gap-4 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
            >
              <div className="relative">
                <span className="material-symbols-outlined text-5xl">photo_camera</span>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse border-2 border-white"></div>
              </div>
              <span>{processing ? "Memproses Data..." : "Buka Kamera Scan QR"}</span>
              <span className="text-indigo-200 text-[10px] font-medium normal-case tracking-normal -mt-2">
                Arahkan kamera ke QR Code yang ditampilkan pengurus
              </span>
            </button>
          </div>
        )}

        {/* Kontainer Kamera */}
        {isScanning && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            {/* Status Indicator */}
            {statusMessage && (
              <div
                className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-bold transition-all ${
                  statusType === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : statusType === "error"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {statusType === "success" ? "check_circle" : statusType === "error" ? "error" : "pending"}
                </span>
                <span>{statusMessage}</span>
                {statusType === "processing" && (
                  <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin ml-auto"></div>
                )}
              </div>
            )}

            {/* Scanner Area */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-inner">
              {/* Corner guides overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px]">
                  {/* Top-left */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg"></div>
                  {/* Top-right */}
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg"></div>
                  {/* Bottom-left */}
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg"></div>
                  {/* Bottom-right */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-lg"></div>
                  {/* Scanning line animation */}
                  <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-scan-line opacity-75"></div>
                </div>
              </div>
              <div id="qr-reader-container" className="w-full"></div>
            </div>

            {/* Camera switch + stop buttons */}
            <div className="flex gap-3">
              {cameraList.length > 1 && (
                <button
                  onClick={async () => {
                    const currentIdx = cameraList.findIndex((c) => c.id === selectedCamera);
                    const nextIdx = (currentIdx + 1) % cameraList.length;
                    setSelectedCamera(cameraList[nextIdx].id);
                    await handleStopScanning();
                    setTimeout(() => {
                      startScanner();
                    }, 300);
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">cameraswitch</span>
                  Ganti Kamera
                </button>
              )}
              <button
                onClick={handleStopScanning}
                className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 border border-rose-200"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Matikan Kamera
              </button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog alertState={alertState} onClose={handleClose} />
    </>
  );
}
