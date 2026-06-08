"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PersetujuanAdmin from "@/components/PersetujuanAdmin";

export default function PersetujuanPage() {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    // Proteksi: Hanya superadmin dan admin_ukm yang boleh masuk[cite: 1]
    if (user?.role === "anggota") {
      router.push("/dashboard");
    }
  }, [router]);

  return <PersetujuanAdmin />;
}