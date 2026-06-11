"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar"; 
import Navbar from "@/components/Navbar";   

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ==========================================
  // 1. GERBANG AUTH & PROTEKSI UTAMA (Kaku & Stabil)
  // ==========================================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    // Jika tidak ada user login, tendang ke login
    if (!storedUser) {
      router.replace("/auth/login");
      return;
    } 
    
    setUser(storedUser);

    // Proteksi Rute Manajemen Akun langsung saat pertama kali layout dimuat
    const role = (storedUser.role || "").toLowerCase().trim();
    if (window.location.pathname === "/dashboard/akun" && role !== "superadmin" && role !== "bem") {
      alert("Anda tidak memiliki hak akses ke halaman Manajemen Akun!");
      router.replace("/dashboard");
    }
  }, []); // Menggunakan array kosong [] agar dipanggil SEKALI saja, anti error "changed size"

  // ==========================================
  // 2. WATCHER PERUBAHAN NAVIGASI RUTE
  // ==========================================
  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser) {
    router.replace("/auth/login");
    return;
  } 
  
  setUser(storedUser);

  // 🚨 AMANKAN STRING ROLE DI SINI
  const role = (storedUser.role || "").toLowerCase().trim();

  // Jalankan proteksi rute
  if (pathname === "/dashboard/akun" && role !== "superadmin" && role !== "bem") {
    alert(`Akses ditolak! Role Anda adalah: ${storedUser.role}`);
    router.replace("/dashboard");
  }
}, [router, pathname]);
  const handleLogout = () => {
    const konfirmasi = confirm("Yakin ingin keluar dari sistem?");
    if (konfirmasi) {
      localStorage.removeItem("user"); 
      router.replace("/auth/login");   
    }
  };

  const handleNavigate = (path) => {
    if (path === "profile") {
      router.push("/dashboard/profil"); 
    } else if (path === "pengaturan") {
      router.push("/dashboard/pengaturan"); 
    }
  };

  // Mencegah kedipan layout sebelum user ter-set
  if (!user) return null; 

  // Sinkronisasi string rute dengan activeMenu di Sidebar & Navbar
  let activeMenuPath = pathname.split("/").pop();
  if (activeMenuPath === "akun") {
    activeMenuPath = "manajemen_akun";
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden w-full">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        userData={user} 
      />

      <div className="flex-1 min-w-0 md:ml-64 flex flex-col h-screen transition-all duration-300 overflow-x-hidden">
        <Navbar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeMenu={activeMenuPath}
          userName={user.full_name}
          userOrg={user.role}
          userAvatar={user.avatar_url}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
