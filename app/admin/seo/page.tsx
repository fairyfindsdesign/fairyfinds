import React from 'react';
import { getSettings } from '@/lib/data/store';
import { initialSeoConfig } from '@/lib/data/initial-data';
import SeoManagerClient from '@/components/admin/SeoManagerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminSeoPage() {
  const settings = await getSettings();
  const seoConfig = settings.seo_config || initialSeoConfig;

  return <SeoManagerClient initialConfig={seoConfig} />;
}
