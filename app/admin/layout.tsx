import React from 'react';
import AdminNavClient from '@/components/admin/AdminNavClient';

export const metadata = {
  title: 'Owner Portal | Fairy Finds Boutique',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminNavClient>{children}</AdminNavClient>;
}
