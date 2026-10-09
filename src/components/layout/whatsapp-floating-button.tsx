import { MessageCircle } from "lucide-react";

export function WhatsAppFloatingButton({ href }: { href: string | null }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="group fixed right-4 top-1/2 z-40 flex -translate-y-1/2 items-center gap-2 rounded-full bg-[#25D366] p-3 text-white shadow-lg transition duration-200 hover:scale-105 hover:bg-[#1ebe5d] md:hidden"
    >
      <MessageCircle size={24} aria-hidden="true" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-200 group-hover:max-w-36 group-hover:pr-1 group-focus-visible:max-w-36 group-focus-visible:pr-1">
        Chat on WhatsApp
      </span>
    </a>
  );
}
