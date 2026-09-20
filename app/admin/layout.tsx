import React from 'react';
import AdminNavClient from '@/components/admin/AdminNavClient';
import { getUnreadOrderCount } from '@/lib/data/orders';
import { checkAdminSession } from '@/app/actions/auth';

export const metadata = {
  title: 'Owner Portal | Fairy Finds Boutique',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Pre-fetch unread count for the badge — guests get 0 (nav still renders correctly)
  let unreadCount = 0;
  try {
    const isAuthed = await checkAdminSession();
    if (isAuthed) {
      unreadCount = await getUnreadOrderCount();
    }
  } catch {}

  return <AdminNavClient initialUnreadCount={unreadCount}>{children}</AdminNavClient>;
}
