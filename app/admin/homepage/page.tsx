import React from 'react';
import { getHomepageSections } from '@/lib/data/store';
import HomepageCMSClient from '@/components/admin/HomepageCMSClient';

export const revalidate = 0;

export default async function AdminHomepageCMSPage() {
  const sections = await getHomepageSections();

  return <HomepageCMSClient initialSections={sections} />;
}
