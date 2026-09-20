'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { StoreSettings } from '@/lib/types';

interface WhatsAppFloatingButtonProps {
  settings?: StoreSettings | null;
}

export default function WhatsAppFloatingButton({ settings }: WhatsAppFloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const rawNumber = settings?.whatsapp_number || '6282629144';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  // Normalize Indian mobile number with country code if needed
  const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  const defaultMessage = 'Hello Fairy Finds Boutique, I have a question about your collection.';
  const href = `https://wa.me/${finalNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-22 sm:bottom-6 left-4 sm:left-6 z-40 flex items-center gap-2 group select-none">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-12 h-12 sm:w-13 sm:h-13 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white rounded-full flex items-center justify-center shadow-lg shadow-black/15 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 relative border border-white/20"
        aria-label="Chat with Fairy Finds Boutique on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white text-white" />
        <span className="sr-only">Chat on WhatsApp</span>

        {/* Pulse Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />
      </a>

      {/* Slide-out Tooltip Label */}
      <span
        className={`hidden sm:inline-block px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-medium rounded-full shadow-md tracking-wide transition-all duration-300 pointer-events-none ${
          isHovered
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-2'
        }`}
      >
        Chat with Us
      </span>
    </div>
  );
}
