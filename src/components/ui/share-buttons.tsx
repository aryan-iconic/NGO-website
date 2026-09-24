"use client";

import { useEffect, useState } from "react";
import { Link2, Twitter, Facebook } from "lucide-react";

export function ShareButtons({ title, text }: { title: string; text: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy link");
    }
  };

  if (!url) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted font-medium mr-1">Share:</span>
      
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-full transition-colors"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      </a>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
        className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
      >
        <Twitter size={18} />
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
      >
        <Facebook size={18} />
      </a>

      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="p-2 bg-cream hover:bg-border/60 text-maroon rounded-full transition-colors relative"
      >
        <Link2 size={18} />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-maroon text-white text-[10px] py-1 px-2 rounded font-medium shadow-sm whitespace-nowrap">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
}
