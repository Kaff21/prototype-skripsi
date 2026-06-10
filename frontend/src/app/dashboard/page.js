import API_BASE_URL from "@/utils/api";
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// IMPORT SEMUA KOMPONEN VIEW
import SuperAdminView from "@/components/dashboard/SuperAdminView";
import BemView from "@/components/dashboard/BemView";
import KemahasiswaanView from "@/components/dashboard/KemahasiswaanView";
import PembinaView from "@/components/dashboard/PembinaView";
import AdminUKMView from "@/components/dashboard/AdminUKMView";
import AnggotaView from "@/components/dashboard/AnggotaView";

export default function DashboardUtama() {
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    const initData = async () => {
      try {
        const userString = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        // 1. Jika sama sekali tidak ada data, usir ke login
        if (!userString || !token) {
          localStorage.clear();
          router.push("/login"); 
          return; 
        }

        // 2. Parse data user (Pakai try-catch untuk jaga-jaga kalau formatnya bukan JSON)
        let stored;
        try {
          stored = JSON.parse(userString);
        } catch (e) {
          localStorage.clear();
          router.push("/login");
          return;
        }

        // 3. KUNCI ANTI-HANTU LOCALHOST: Validasi apakah ini benar-benar user SIM-ORMAWA
        const validRoles = ["superadmin", "bem", "kemahasiswaan", "pembina", "admin_ukm", "admin", "anggota"];
        const role = (stored.role || "").toLowerCase().trim();

        // Jika role-nya tidak terdaftar di sistem kita, berarti ini data dari proyek lain!
        if (!validRoles.includes(role)) {
          console.warn("Terdeteksi data dari project localhost lain! Menghapus memori...");
          localStorage.clear();
          router.push("/login");
          return;
        }

        // Jika lolos validasi, berarti ini sah akun SIM-ORMAWA
        setUserData(stored);
        const orgId = stored.organization_id; 

        let url = null;

        if (["superadmin", "bem", "kemahasiswaan"].includes(role)) {
          url = API_BASE_URL + "/api/stats/superadmin";
        } else if (["admin_ukm", "admin", "pembina"].includes(role)) {
          if (orgId && orgId !== "null" && orgId !== "undefined") {
            url = `${API_BASE_URL}/api/stats/admin/${orgId}`;
          }
        } else {
          if (orgId && orgId !== "null" && orgId !== "undefined") {
            url = `${API_BASE_URL}/api/organizations/${orgId}`;
          }
        }

        // Fetch data HANYA jika URL-nya valid
        if (url) {
          const res = await axios.get(url);
          setDashboardData(res.data);
        } else {
          setDashboardData({});
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        // Jika token expired atau ditolak backend
        if (err.response && (err.response.status === 401 || err.response.status === 403 || err.response.status === 404)) {
          localStorage.clear();
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-indigo-600 text-5xl">sync</span>
          <p className="text-slate-400 font-bold animate-pulse text-sm">Menyiapkan Ruang Kerja...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const role = (userData.role || "").toLowerCase().trim();

  switch (role) {
    case "superadmin":
      return <SuperAdminView data={dashboardData} />;
    case "bem":
      return <BemView data={dashboardData} />;
    case "kemahasiswaan":
      return <KemahasiswaanView data={dashboardData} />;
    case "pembina":
      return <PembinaView data={dashboardData} />;
    case "admin_ukm":
    case "admin":
      return <AdminUKMView data={dashboardData} />;
    default:
      return <AnggotaView data={dashboardData} />;
  }
}
