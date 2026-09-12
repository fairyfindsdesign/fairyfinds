import React from 'react';
import { getSettings } from '@/lib/data/store';
import AdminSettingsForm from '@/components/admin/AdminSettingsForm';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return <AdminSettingsForm initialSettings={settings} />;
}
