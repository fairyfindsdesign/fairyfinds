import React from 'react';
import { getSettings, checkSeoDbStatus } from '@/lib/data/store';
import { initialSeoConfig } from '@/lib/data/initial-data';
import SeoManagerClient from '@/components/admin/SeoManagerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminSeoPage() {
  const [settings, dbStatus] = await Promise.all([
    getSettings(),
    checkSeoDbStatus(),
  ]);

  const seoConfig = settings.seo_config || initialSeoConfig;

  return (
    <SeoManagerClient
      initialConfig={seoConfig}
      isMissingDbColumn={dbStatus.isSupabaseConnected && !dbStatus.hasSeoColumn}
      isNotConnected={!dbStatus.isSupabaseConnected}
      dbError={dbStatus.error}
    />
  );
}

