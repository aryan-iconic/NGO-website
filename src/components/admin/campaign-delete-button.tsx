"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function CampaignDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/campaigns");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error?.message || "Failed to delete campaign");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="text-red hover:bg-red/10 border-red/20"
    >
      <Trash2 size={16} className="mr-1.5" />
      {isDeleting ? "Deleting..." : "Delete Campaign"}
    </Button>
  );
}
