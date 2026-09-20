import React from 'react';
import { getSizeCharts } from '@/lib/data/store';
import SizeChartsManagerClient from '@/components/admin/SizeChartsManagerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Size Charts | Fairy Finds Admin',
};

export default async function AdminSizeChartsPage() {
  const sizeCharts = await getSizeCharts();

  return <SizeChartsManagerClient initialCharts={sizeCharts} />;
}
