"use client";
import { useState, useRef, useEffect } from "react";

// PENTING: Perhatikan baris di bawah ini, 'onNavigate' WAJIB ada di sini
export default function Navbar({ 
  onLogout, 
  onToggleSidebar, 
  activeMenu, 
  searchQuery, 
  onSearchChange, 
  userName, 
  userOrg,
  onNavigate 
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const titles = {
    kegiatan: "Manajemen Kegiatan",
    anggota: "Daftar Anggota Aktif",
    persetujuan: "Persetujuan Anggota",
    manajemen_ukm: "Master Data UKM",
    pengaturan: "Pengaturan Sistem",
    profile: "Profil Pengguna"
  };

  // Logika tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <nav className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-30">
      
      {/* KIRI: Hamburger & Judul */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden flex items-center justify-center p-2 text-slate-700 hover:text-indigo-600 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[26px]">menu</span>
        </button>
        <h2 className="text-sm font-bold text-slate-800 hidden sm:block truncate max-w-[150px]">
          {titles[activeMenu] || "Dashboard"}
        </h2>
      </div>

      {/* TENGAH: Search Bar */}
      <div className="flex-1 max-w-[180px] sm:max-w-md mx-2">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari..."
            className="w-full bg-slate-50 border border-slate-100 rounded-full py-2.5 pl-11 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* KANAN: Avatar & Dropdown */}
      <div className="flex items-center border-l border-slate-100 pl-4" ref={dropdownRef}>
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-md overflow-hidden bg-indigo-600 text-white font-bold text-lg uppercase"
          >
            {userName?.charAt(0) || 'U'}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-14 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-40 animate-in fade-in zoom-in duration-200">
              
              {/* Info Akun */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg uppercase">
                  {userName?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">{userName || 'User Name'}</h4>
                  <p className="text-[10px] uppercase font-medium text-slate-500 tracking-wider truncate">
                    {userOrg || 'Organisasi'}
                  </p>
                </div>
              </div>

              {/* Menu List */}
              <div className="space-y-1">
                <button 
                  onClick={() => {
                    onNavigate("profile"); // Memanggil fungsi dari page.js
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-indigo-600 text-sm font-medium transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Profil Saya
                </button>

                <button 
                  onClick={() => {
                    onNavigate("pengaturan");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-indigo-600 text-sm font-medium transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  Pengaturan
                </button>

                <div className="border-t border-slate-100 my-2"></div>

                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}