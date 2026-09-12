'use client';

import React from 'react';

interface AnnouncementBarProps {
  message?: string;
}

export default function AnnouncementBar({
  message,
}: AnnouncementBarProps) {
  const displayMessage = message !== undefined ? message : 'Complimentary Styling Consultation • Direct Orders & Custom Fitting via WhatsApp';
  if (!displayMessage || !displayMessage.trim()) return null;

  return (
    <aside aria-label="Announcement" className="bg-[#1A1A1A] text-white text-xs tracking-widest uppercase py-2.5 px-4 text-center font-medium border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF55D2] animate-pulse"></span>
        <span>{displayMessage}</span>
      </div>
    </aside>
  );
}
