"use client";
import API_BASE_URL from "@/utils/api";
import { useEffect, useState } from "react";
import axios from "axios";
import ProfileView from "@/components/ProfileView";

export default function ProfilPage() {
  const [userData, setUserData] = useState(null);

  // Fungsi untuk memuat data awal dari LocalStorage
  const loadUserFromStorage = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUserData(storedUser);
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // FUNGSI PENTING: Untuk menarik data terbaru dari database setelah di-edit
  const fetchUpdatedProfile = async () => {
    if (!userData?.id) return;
    
    try {
      // Ambil data user terbaru dari database
      const res = await axios.get(`${API_BASE_URL}/api/users/${userData.id}`);
      const updatedUser = res.data;

      // Update state di layar
      setUserData(updatedUser);
      
      // Update LocalStorage agar saat direfresh tidak kembali ke data lama
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Gagal refresh profil:", error);
    }
  };

  if (!userData) return <div className="p-10 text-center animate-pulse">Memuat Profil...</div>;

  return (
    <div className="p-2">
      <ProfileView 
        userProfile={userData} 
        isOwnProfile={true} // 🚨 WAJIB TRUE agar tombol edit muncul
        onProfileUpdate={fetchUpdatedProfile} // 🚨 Panggil refresh setelah save
      />
    </div>
  );
}
