import React from 'react';
import { getCustomDesigns } from '@/lib/data/store';
import CustomDesignsManagerClient from '@/components/admin/CustomDesignsManagerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Custom Designs Showcase | Fairy Finds Admin',
};

export default async function AdminCustomDesignsPage() {
  const designs = await getCustomDesigns();

  return <CustomDesignsManagerClient initialDesigns={designs} />;
}
