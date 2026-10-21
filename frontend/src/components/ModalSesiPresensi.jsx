"use client";
import API_BASE_URL from "@/utils/api";
import { QRCodeCanvas } from "qrcode.react";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import AlertDialog, { useAlert } from "@/components/Alert";

export default function ModalSesiPresensi({ isOpen, onClose, kegiatan, onOpenRekap }) {
  const [sesi, setSesi] = useState(null);
  const [token, setToken] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const [sesiCountdown, setSesiCountdown] = useState("");
  const [totalHadir, setTotalHadir] = useState(0);
  const [loading, setLoading] = useState(false);
  const [durasiMenit, setDurasiMenit] = useState(30);
  const tokenInterval = useRef(null);
  const countdownInterval = useRef(null);
  const sesiTimerInterval = useRef(null);
  const { alertState, showAlert, handleClose: handleAlertClose } = useAlert();

  // Bersihkan semua interval saat modal ditutup / unmount
  const clearAllIntervals = useCallback(() => {
    if (tokenInterval.current) clearInterval(tokenInterval.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    if (sesiTimerInterval.current) clearInterval(sesiTimerInterval.current);
    tokenInterval.current = null;
    countdownInterval.current = null;
    sesiTimerInterval.current = null;
  }, []);

  // Reset state ketika modal ditutup
  useEffect(() => {
    if (!isOpen) {
      clearAllIntervals();
      setSesi(null);
      setToken(null);
      setCountdown(15);
      setSesiCountdown("");
      setTotalHadir(0);
    }
  }, [isOpen, clearAllIntervals]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => clearAllIntervals();
  }, [clearAllIntervals]);

  // Cek sesi aktif saat modal dibuka
  useEffect(() => {
    if (isOpen && kegiatan?.id) {
      cekSesiAktif();
    }
  }, [isOpen, kegiatan?.id]);

  // Hitung mundur sesi presensi (waktu tersisa sesi)
  useEffect(() => {
    if (!sesi?.waktu_selesai) return;
    sesiTimerInterval.current = setInterval(() => {
      const now = new Date();
      const end = new Date(sesi.waktu_selesai);
      const diff = end - now;
      if (diff <= 0) {
        setSesiCountdown("Waktu Habis");
        clearAllIntervals();
        setSesi(null);
        setToken(null);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setSesiCountdown(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => {
      if (sesiTimerInterval.current) clearInterval(sesiTimerInterval.current);
    };
  }, [sesi?.waktu_selesai]);

  const cekSesiAktif = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/kegiatan/${kegiatan.id}/sesi/aktif`);
      if (res.data?.data) {
        setSesi(res.data.data);
        setTotalHadir(res.data.total_hadir || 0);
        startTokenRefresh(res.data.data.id);
      }
    } catch (err) {
      console.warn("Cek sesi aktif:", err.message);
    }
  };

  const buatSesiBaru = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/kegiatan/${kegiatan.id}/sesi`, {
        durasi_menit: durasiMenit,
      });
      if (res.data?.data) {
        setSesi(res.data.data);
        setTotalHadir(0);
        startTokenRefresh(res.data.data.id);
        await showAlert({
          type: "success",
          title: "Sesi Dibuka! 🎯",
          message: `Sesi presensi aktif selama ${durasiMenit} menit. QR Code akan berubah otomatis setiap 15 detik.`,
        });
      }
    } catch (err) {
      await showAlert({
        type: "error",
        title: "Gagal Membuka Sesi",
        message: err.response?.data?.message || "Terjadi kesalahan saat membuka sesi presensi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const tutupSesi = async () => {
    const confirmed = await showAlert({
      type: "confirm",
      title: "Tutup Sesi Presensi?",
      message: "Setelah ditutup, anggota tidak bisa lagi melakukan presensi pada sesi ini.",
    });
    if (!confirmed) return;
    try {
      await axios.patch(`${API_BASE_URL}/api/kegiatan/sesi/${sesi.id}/tutup`);
      clearAllIntervals();
      setSesi(null);
      setToken(null);
      setCountdown(15);
      await showAlert({
        type: "success",
        title: "Sesi Ditutup ✅",
        message: `Total ${totalHadir} anggota tercatat hadir pada sesi ini.`,
      });
    } catch (err) {
      await showAlert({
        type: "error",
        title: "Gagal!",
        message: "Gagal menutup sesi. Coba lagi.",
      });
    }
  };

  const fetchToken = async (sesiId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/kegiatan/sesi/${sesiId}/token`);
      if (res.data?.token) {
        const qrPayload = JSON.stringify({
          type: "SIM_ORMAWA_PRESENSI",
          token: res.data.token,
          activity_id: kegiatan.id,
          sesi_id: sesiId,
          ts: Date.now(),
        });
        setToken(qrPayload);
        setCountdown(15);
      }
    } catch (err) {
      console.error("Token fetch error:", err.message);
      if (err.response?.status === 400) {
        clearAllIntervals();
        setSesi(null);
        setToken(null);
      }
    }
    // Refresh total hadir
    try {
      const res = await axios.get(`${API_BASE_URL}/api/kegiatan/${kegiatan.id}/sesi/aktif`);
      setTotalHadir(res.data?.total_hadir || totalHadir);
    } catch (e) {}
  };

  const startTokenRefresh = (sesiId) => {
    clearAllIntervals();
    fetchToken(sesiId);

    // Refresh token setiap 15 detik
    tokenInterval.current = setInterval(() => {
      fetchToken(sesiId);
    }, 15000);

    // Countdown visual setiap detik
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 15;
        return prev - 1;
      });
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 fade-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-600">qr_code_2</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-tight">Sesi Presensi QR</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {kegiatan?.judul}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {!sesi ? (
              /* ========== BELUM ADA SESI AKTIF ========== */
              <div className="text-center space-y-6">
                <div className="inline-flex p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] shadow-inner">
                  <span className="material-symbols-outlined text-6xl text-indigo-400">event_available</span>
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg mb-1">Buka Sesi Presensi</h3>
                  <p className="text-sm text-slate-500 font-medium">
                    QR Code akan ditampilkan dan berubah otomatis setiap <strong className="text-indigo-600">15 detik</strong> untuk keamanan.
                  </p>
                </div>

                {/* Durasi Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Durasi Sesi Presensi
                  </label>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {[15, 30, 45, 60, 90].map((m) => (
                      <button
                        key={m}
                        onClick={() => setDurasiMenit(m)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          durasiMenit === m
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {m} Menit
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={buatSesiBaru}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Membuka Sesi...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">play_circle</span>
                      Mulai Sesi Presensi
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* ========== SESI AKTIF - QR DINAMIS ========== */
              <div className="space-y-5">
                {/* Status Bar */}
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                      Sesi Aktif
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700">
                    <span className="material-symbols-outlined text-sm">timer</span>
                    <span className="font-mono font-black text-sm">{sesiCountdown}</span>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-[2rem] border border-slate-200 flex flex-col items-center shadow-inner">
                  {/* Countdown ring visual */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                    <div className="relative w-5 h-5">
                      <svg className="w-5 h-5 -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={countdown <= 3 ? "#ef4444" : "#6366f1"}
                          strokeWidth="3"
                          strokeDasharray={`${(countdown / 15) * 100}, 100`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                    </div>
                    <span className={`font-mono font-black text-xs ${countdown <= 3 ? "text-red-600" : "text-indigo-600"}`}>
                      {countdown}s
                    </span>
                  </div>

                  {/* QR Canvas */}
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 mb-3">
                    {token ? (
                      <QRCodeCanvas
                        value={token}
                        size={220}
                        level="H"
                        marginSize={2}
                        bgColor="#ffffff"
                        fgColor="#1e293b"
                      />
                    ) : (
                      <div className="w-[220px] h-[220px] flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    QR berubah otomatis setiap 15 detik
                  </p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(15)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          i < countdown ? "bg-indigo-400" : "bg-slate-200"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center">
                    <p className="text-2xl font-black text-indigo-600">{totalHadir}</p>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                      Tercatat Hadir
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                    <p className="text-2xl font-black text-amber-600">{durasiMenit}</p>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-1">
                      Menit Durasi
                    </p>
                  </div>
                </div>

                {/* Info Kegiatan Mini */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="material-symbols-outlined text-sm text-indigo-500">event</span>
                    <span className="font-bold">{kegiatan?.tanggal}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="material-symbols-outlined text-sm text-indigo-500">location_on</span>
                    <span className="font-bold">{kegiatan?.lokasi}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onOpenRekap}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-slate-200"
                  >
                    <span className="material-symbols-outlined text-[16px]">groups</span>
                    Lihat Rekap
                  </button>
                  <button
                    onClick={tutupSesi}
                    className="bg-rose-500 hover:bg-rose-600 text-white py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-rose-200"
                  >
                    <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                    Tutup Sesi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog alertState={alertState} onClose={handleAlertClose} />
    </>
  );
}
