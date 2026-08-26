'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

type SocialLink = {
  label: string;
  href: string;
  icon: ReactNode;
};

function IconShell({ children }: { children: ReactNode }) {
  return <span className="flex h-10 w-10 flex-none items-center justify-center">{children}</span>;
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <path d="M14 3c.5 2.8 2.3 4.6 5 5v3.2c-1.8 0-3.5-.5-5-1.5v6.5a4.8 4.8 0 1 1-4.8-4.8c.4 0 .8 0 1.2.1v3.2a1.6 1.6 0 1 0 1.6 1.6V3h2Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <rect x="3" y="6.5" width="18" height="11" rx="3" />
      <path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
      <path d="M14 9h2.5V6.5H14c-1.7 0-3 1.3-3 3V12H9v2.5h2V20h2.5v-5.5h2l.5-2.5h-2.5V9.5c0-.3.2-.5.5-.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const socialLinks: SocialLink[] = [
  { label: 'TikTok', href: 'https://www.tiktok.com', icon: <TikTokIcon /> },
  { label: 'YouTube', href: 'https://www.youtube.com', icon: <YouTubeIcon /> },
  { label: 'Instagram', href: 'https://www.instagram.com', icon: <InstagramIcon /> },
  { label: 'Facebook', href: 'https://www.facebook.com', icon: <FacebookIcon /> },
];

export function ExpandableSocialLinks() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {socialLinks.map((social) => {
        const isActive = activeLabel === social.label;

        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={social.label}
            onMouseEnter={() => setActiveLabel(social.label)}
            onMouseLeave={() => setActiveLabel(null)}
            onFocus={() => setActiveLabel(social.label)}
            onBlur={() => setActiveLabel(null)}
            className={[
              'group inline-flex h-10 items-center overflow-hidden rounded-full border',
              'border-white/12 bg-[#1b1e25] text-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.22)]',
              'transition-[width,background-color,border-color,color,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
              'hover:bg-[#252933] hover:border-white/18 hover:text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070707]',
              isActive ? 'w-[118px]' : 'w-10',
            ].join(' ')}
          >
            <IconShell>{social.icon}</IconShell>
            <span
              className={[
                'whitespace-nowrap text-xs font-semibold transition-all duration-200',
                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1',
              ].join(' ')}
            >
              {social.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}
