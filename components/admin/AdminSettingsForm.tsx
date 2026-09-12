'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StoreSettings } from '@/lib/types';
import { saveSettingsAction } from '@/app/actions/store';
import { Phone, Save, CheckCircle2, ShieldCheck, Mail, MapPin } from 'lucide-react';

interface AdminSettingsFormProps {
  initialSettings: StoreSettings;
}

export default function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await saveSettingsAction(settings);
    router.refresh();
    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 max-w-3xl pb-24 sm:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light">
            Store & WhatsApp Settings
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-0.5 sm:mt-1">
            Configure your order routing phone number, boutique details, and announcement bar.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95"
        >
          {success ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </>
          )}
        </button>
      </div>

      {/* WhatsApp Section */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
          <Phone className="w-4 h-4 text-[#FF55D2]" />
          <span>WhatsApp Order Routing Number</span>
        </div>
        <p className="text-xs text-neutral-500 font-light">
          This number receives all customer orders from the bag checkout and all custom-made tailoring inquiries. Include country code (e.g. <code>+94 77 123 4567</code>).
        </p>

        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1">
            Business WhatsApp Phone Number *
          </label>
          <input
            type="text"
            required
            value={settings.whatsapp_number}
            onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs font-mono text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
          />
        </div>
      </div>

      {/* Boutique Identity */}
      <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-sm font-semibold text-[#1A1A1A]">
          Boutique Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1">
              Store Name
            </label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={settings.currency_symbol}
              onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1">
              Instagram Profile URL
            </label>
            <input
              type="url"
              value={settings.instagram_url}
              onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1">
            Atelier Physical Address
          </label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-700 font-semibold mb-1">
            Top Announcement Bar Text
          </label>
          <input
            type="text"
            value={settings.announcement_bar}
            onChange={(e) => setSettings({ ...settings, announcement_bar: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
          />
        </div>
      </div>

      {/* Sticky Bottom Save Bar for Mobile Viewports */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-neutral-200 z-30 shadow-lg flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-semibold">
            Boutique CMS
          </span>
          <span className="text-xs font-sans font-medium text-[#1A1A1A] truncate block">
            {settings.store_name || 'Store Settings'}
          </span>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-[44px] px-5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95 flex items-center gap-2 shrink-0"
        >
          {success ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
