"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ManajemenAkun from "@/components/ManajemenAkun";

export default function AkunPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = (user?.role || "").toLowerCase().trim();

    // 🚨 PERBAIKAN UTAMA: Izinkan superadmin DAN bem untuk lolos
    if (role === "superadmin" || role === "bem") {
      setIsAuthorized(true);
    } else {
      alert("Akses ditolak! Anda tidak memiliki wewenang Manajemen Akun.");
      router.push("/dashboard");
    }
  }, [router]);

  // Cegah kedipan layar render sebelum validasi role selesai
  if (!isAuthorized) return null;

  return <ManajemenAkun />;
}
