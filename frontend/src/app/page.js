"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/auth/login"); 
    } else {
      router.replace("/dashboard"); 
    }
  }, [router]);

  return null; 
}
