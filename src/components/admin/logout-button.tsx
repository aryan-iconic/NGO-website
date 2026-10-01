"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to log out", error);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={loading}
      className="text-sm font-bold text-red hover:bg-red/10 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
    >
      <LogOut size={16} /> {loading ? "Logging out..." : "Log out"}
    </button>
  );
}
