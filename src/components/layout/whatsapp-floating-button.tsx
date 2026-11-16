export function WhatsAppFloatingButton({ href }: { href: string | null }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
      className="group fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/90 bg-white p-0 text-maroon shadow-[0_6px_18px_rgba(0,0,0,0.2)] transition duration-200 hover:scale-105 hover:bg-cream focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-95"
    >
      <svg viewBox="0 0 32 32" className="h-5 w-5 shrink-0" aria-hidden="true">
        <path
          d="M16 3.25a12.4 12.4 0 0 0-10.62 18.8L3.7 28.25l6.36-1.66A12.45 12.45 0 1 0 16 3.25Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
        <path
          d="M12.15 10.1c-.3-.67-.62-.68-.91-.69h-.78c-.27 0-.71.1-1.08.51-.37.4-1.42 1.39-1.42 3.39s1.45 3.93 1.65 4.2c.2.26 2.8 4.48 6.92 6.1 3.42 1.35 4.12 1.08 4.86 1.01.75-.07 2.4-.98 2.74-1.93.34-.95.34-1.76.24-1.93-.1-.17-.37-.27-.78-.48-.4-.2-2.4-1.18-2.77-1.32-.37-.13-.64-.2-.91.2-.27.41-1.05 1.32-1.29 1.59-.24.27-.47.3-.88.1-.4-.2-1.7-.63-3.23-2-1.2-1.07-2.01-2.4-2.25-2.81-.24-.4-.03-.62.18-.82.18-.18.4-.47.61-.71.2-.24.27-.4.4-.68.14-.27.07-.51-.03-.71-.1-.2-.9-2.2-1.27-3.02Z"
          fill="currentColor"
        />
      </svg>
    </a>
  );
}
