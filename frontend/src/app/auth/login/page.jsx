"use client";
import API_BASE_URL from "@/utils/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AlertDialog, { useAlert } from "@/components/Alert";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { alertState, showAlert, handleClose } = useAlert();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('token', result.token);
                // Simpan seluruh objek user termasuk data organisasi hasil join
                localStorage.setItem('user', JSON.stringify(result.user));

                console.log("Login Berhasil, Data Org:", result.user.org_name);
                router.push('/');
            } else {
                await showAlert({ type: "error", title: "Login Gagal!", message: result.error || "Email atau Password salah. Periksa kembali dan coba lagi." });
            }
        } catch (error) {
            await showAlert({ type: "error", title: "Koneksi Bermasalah!", message: "Gagal terhubung ke server. Pastikan internet Anda aktif." });
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
                            <span className="material-symbols-outlined text-white text-3xl">login</span>
                        </div>

                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Selamat Datang</h1>
                        <p className="text-sm text-slate-500 font-bold">Masuk ke SIM - ORMAWA STIKOM</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Email Kampus</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 border-transparent outline-none transition-all placeholder:text-slate-400"
                                placeholder="masukan email"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 border-transparent outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                            <div className="flex justify-end pr-1 pt-1">
                                <Link href="/auth/forgot-password" className="text-[11px] font-bold text-indigo-600 hover:underline">
                                    Lupa Kata Sandi?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-4"
                        >
                            {loading ? "Menghubungkan..." : "Masuk Sekarang"}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-sm text-slate-500 font-medium">
                        Belum punya akun ?{" "}
                        <Link href="/auth/register" className="text-indigo-600 font-black hover:underline">
                            Daftar Akun
                        </Link>
                    </p>
                </div>
            </div>

            <AlertDialog alertState={alertState} onClose={handleClose} />
        </>
    );
}
