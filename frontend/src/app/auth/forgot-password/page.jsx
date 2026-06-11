"use client";
import API_BASE_URL from "@/utils/api";
import { useState } from "react";
import Link from "next/link";
import AlertDialog, { useAlert } from "@/components/Alert";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { alertState, showAlert, handleClose } = useAlert();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/login/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok) {
                await showAlert({
                    type: "success",
                    title: "Email Terkirim!",
                    message: "Tautan untuk mengatur ulang kata sandi telah dikirim ke email Anda. Silakan periksa folder masuk atau spam email Anda."
                });
                setEmail("");
            } else {
                await showAlert({
                    type: "error",
                    title: "Gagal Mengirim!",
                    message: result.error || "Terjadi kesalahan saat mengirim tautan reset."
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

    return (
        <>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
                            <span className="material-symbols-outlined text-white text-3xl">mail</span>
                        </div>

                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lupa Kata Sandi?</h1>
                        <p className="text-sm text-slate-500 font-bold">Masukkan email terdaftar untuk menerima tautan reset</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Email Kampus</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 border-transparent outline-none transition-all placeholder:text-slate-400"
                                placeholder="masukkan email"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-4"
                        >
                            {loading ? "Mengirim Tautan..." : "Kirim Tautan Reset"}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-sm text-slate-500 font-medium">
                        Kembali ke{" "}
                        <Link href="/auth/login" className="text-indigo-600 font-black hover:underline">
                            Halaman Masuk
                        </Link>
                    </p>
                </div>
            </div>

            <AlertDialog alertState={alertState} onClose={handleClose} />
        </>
    );
}
