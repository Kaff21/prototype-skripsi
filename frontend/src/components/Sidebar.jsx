"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTheme } from "@/utils/theme";

export default function Sidebar({ isOpen, onClose, userData, dataUKM }) {
  const pathname = usePathname();

  const userRole = userData?.role || "anggota";
  const orgLogo = dataUKM?.logo_url || userData?.org_logo;
  const orgInitial = dataUKM?.initial || userData?.org_initial || "SIM";

  const rawColor = dataUKM?.color_theme || userData?.color_theme || userData?.org_theme || "bg-indigo-600";
  const theme = getTheme(rawColor);

  // 🚨 HAK AKSES BARU: BEM, Kemahasiswaan, dan Pembina ditambahkan ke menu penting
  // 🚨 HAK AKSES BARU: BEM disetarakan dengan Superadmin
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/dashboard", roles: ["superadmin", "admin_ukm", "anggota", "bem", "kemahasiswaan", "pembina"] },
    { id: "scan_absen", label: "Scan Absensi", icon: "qr_code_scanner", path: "/dashboard/scanner", roles: ["anggota"] },
    { id: "kegiatan", label: "Kegiatan", icon: "event_note", path: "/dashboard/kegiatan", roles: ["superadmin", "admin_ukm", "anggota", "bem", "kemahasiswaan", "pembina"] },
    { id: "anggota", label: "Anggota Aktif", icon: "groups", path: "/dashboard/anggota", roles: ["superadmin", "admin_ukm", "anggota", "bem", "kemahasiswaan", "pembina"] },
    
    // 🚨 BEM DITAMBAHKAN KE SINI:
    { id: "persetujuan", label: "Persetujuan", icon: "how_to_reg", path: "/dashboard/persetujuan", roles: ["superadmin", "admin_ukm", "bem"] },
    { id: "birokrasi", label: "Birokrasi Kegiatan", icon: "gavel", path: "/dashboard/birokrasi", roles: ["superadmin", "admin_ukm", "bem", "kemahasiswaan", "pembina"] },
    { id: "manajemen_ukm", label: "Manajemen UKM", icon: "account_tree", path: "/dashboard/ukm", roles: ["superadmin", "bem"] },
    { id: "manajemen_akun", label: "Manajemen Akun", icon: "manage_accounts", path: "/dashboard/akun", roles: ["superadmin", "bem"] },
    
    { id: "pengaturan-ukm", label: "Pengaturan UKM", icon: "corporate_fare", path: "/dashboard/pengaturan-ukm", roles: ["admin_ukm", "bem"] },
    { id: "pengaturan", label: "Pengaturan Akun", icon: "settings", path: "/dashboard/pengaturan", roles: ["superadmin", "admin_ukm", "anggota","kemahasiswaan", "pembina"] },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={onClose}></div>}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-slate-100 w-64 z-50 transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className={`w-10 h-10 ${theme.bg} rounded-xl flex items-center justify-center shadow-lg ${theme.shadow} text-white font-bold overflow-hidden`}>
              {userRole === "superadmin" || ["bem", "kemahasiswaan", "pembina"].includes(userRole) ? (
                <span className="material-symbols-outlined">rocket_launch</span>
              ) : orgLogo ? (
                <img src={orgLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-black">{orgInitial}</span>
              )}
            </div>
            <div className="overflow-hidden text-left">
              <h1 className="text-sm font-black text-slate-900 tracking-tighter truncate leading-none mb-1">
                {userRole === "superadmin" ? "SISTEM PUSAT" : ["bem", "kemahasiswaan", "pembina"].includes(userRole) ? "BIROKRASI" : orgInitial}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {userRole.replace('_', ' ')}
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              if (item.roles.includes(userRole)) {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.id} href={item.path} onClick={onClose} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${isActive ? `${theme.bg} text-white shadow-md ${theme.shadow}` : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}>
                    <span className={`material-symbols-outlined text-[22px] ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              }
              return null;
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 space-y-4">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center text-xs font-bold text-white border border-slate-200 uppercase`}>
              {userData?.full_name?.substring(0, 2) || "AD"}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-[11px] font-black text-slate-800 truncate leading-none mb-1">{userData?.full_name || "Admin"}</p>
              <p className="text-[9px] text-slate-400 truncate leading-none italic">{userData?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
