import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className, mono = false }: { className?: string; mono?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image 
        src="/logo.PNG" 
        alt="Logo" 
        width={40} 
        height={40} 
        className={cn("object-contain", mono && "grayscale brightness-0 invert")}
      />
      <span
        className="font-serif text-lg leading-tight tracking-tight"
        style={{ color: mono ? "currentColor" : "var(--color-maroon)" }}
      >
        Shri Nityanikunj Trust
      </span>
    </div>
  );
}
