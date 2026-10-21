"use client";
import API_BASE_URL from "@/utils/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AlertDialog, { useAlert } from "@/components/Alert";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const router = useRouter();
    const { alertState, showAlert, handleClose } = useAlert();

    useEffect(() => {
        // Ekstrak token dari hash URL (#access_token=...&...)
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.replace("#", "?"));
            const token = params.get("access_token");
            if (token) {
                setAccessToken(token);
                setVerifying(false);
                return;
            }
        }
        
        // Cek juga di query params (?access_token=...) jika ada redirect case lain
        const urlParams = new URLSearchParams(window.location.search);
        const queryToken = urlParams.get("access_token");
        if (queryToken) {
            setAccessToken(queryToken);
            setVerifying(false);
            return;
        }

        setVerifying(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            await showAlert({
                type: "error",
                title: "Sandi Terlalu Pendek!",
                message: "Kata sandi minimal harus 6 karakter."
            });
            return;
        }

        if (password !== confirmPassword) {
            await showAlert({
                type: "error",
                title: "Sandi Tidak Cocok!",
                message: "Konfirmasi kata sandi tidak cocok. Harap periksa kembali."
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/login/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ access_token: accessToken, password })
            });

            const result = await response.json();

            if (response.ok) {
                await showAlert({
                    type: "success",
                    title: "Kata Sandi Diperbarui!",
                    message: "Kata sandi Anda berhasil diubah. Silakan masuk kembali menggunakan kata sandi baru."
                });
                router.push("/auth/login");
            } else {
                await showAlert({
                    type: "error",
                    title: "Gagal Mengubah Sandi!",
                    message: result.error || "Gagal mengatur ulang kata sandi. Silakan minta tautan baru."
                });
            }
        } catch (error) {
            await showAlert({
                type: "error",
                title: "Koneksi Bermasalah!",
                message: "Gagal terhubung ke server. Pastikan internet Anda aktif."
            });
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center font-bold text-slate-400 animate-pulse">
                    Memverifikasi token reset...
                </div>
            </div>
        );
    }

    if (!accessToken) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-50">
                        <span className="material-symbols-outlined text-3xl">gpp_bad</span>
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight mb-2">Akses Ditolak</h1>
                    <p className="text-sm text-slate-500 font-bold mb-6">Tautan reset tidak valid, kadaluarsa, atau tidak terdeteksi.</p>
                    <button
                        onClick={() => router.push("/auth/forgot-password")}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        Minta Tautan Baru
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
                            <span className="material-symbols-outlined text-white text-3xl">lock_open</span>
                        </div>

                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Atur Ulang Kata Sandi</h1>
                        <p className="text-sm text-slate-500 font-bold">Masukkan kata sandi baru untuk akun Anda</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Kata Sandi Baru</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 border-transparent outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Konfirmasi Kata Sandi</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 border-transparent outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-6"
                        >
                            {loading ? "Menyimpan..." : "Ubah Kata Sandi"}
                        </button>
                    </form>
                </div>
            </div>

            <AlertDialog alertState={alertState} onClose={handleClose} />
        </>
    );
}
