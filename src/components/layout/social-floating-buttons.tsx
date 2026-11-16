const defaultLinks = {
  instagram: "https://www.instagram.com/shri_nityanikunj_trust?stkn=MWM3cDdhZ3I4MXJieQ==",
  facebook: "https://www.facebook.com/share/18Zpv6VC14/",
  youtube: "https://youtube.com/@shrinityanikunjtrust?si=i-z2jCj2_6BysH5H",
  twitter: "https://x.com/ShriNitynikunj",
};

export function SocialFloatingButtons({ settings = {} }: { settings?: Record<string, string> }) {
  const links = [
    { name: "Instagram", href: settings["social.instagram"] || defaultLinks.instagram, icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg> },
    { name: "Facebook", href: settings["social.facebook"] || defaultLinks.facebook, icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V13h2.7v8z"/></svg> },
    { name: "YouTube", href: settings["social.youtube"] || defaultLinks.youtube, icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23 7.1a3 3 0 0 0-2.1-2.2C19 4.4 12 4.4 12 4.4s-7 0-8.9.5A3 3 0 0 0 1 7.1 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.2c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.2 31 31 0 0 0 .5-4.9 31 31 0 0 0-.5-4.9ZM9.8 15.5v-7l6 3.5z"/></svg> },
    { name: "Twitter/X", href: settings["social.twitter"] || defaultLinks.twitter, icon: <span aria-hidden="true" className="text-base font-bold">𝕏</span> },
  ];

  return (
    <nav aria-label="Follow us on social media" className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+6rem)] z-40 flex flex-col gap-2">
      {links.map(({ name, href, icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          title={name}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/90 bg-white text-maroon shadow-[0_6px_18px_rgba(0,0,0,0.2)] transition hover:scale-105 hover:bg-cream focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          {icon}
        </a>
      ))}
    </nav>
  );
}
