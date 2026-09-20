import React from 'react';
import { getOrdersWithStatus, getUnreadOrderCount } from '@/lib/data/orders';
import { getSettings } from '@/lib/data/store';
import OrdersClient from '@/components/admin/OrdersClient';
import { checkAdminSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Orders | Fairy Finds Admin',
};

export default async function AdminOrdersPage() {
  const isAuthed = await checkAdminSession();
  if (!isAuthed) redirect('/admin/login');

  const [ordersResult, unreadCount, settings] = await Promise.all([
    getOrdersWithStatus(),
    getUnreadOrderCount(),
    getSettings(),
  ]);

  return (
    <OrdersClient
      initialOrders={ordersResult.orders}
      initialUnreadCount={unreadCount}
      currencySymbol={settings.currency_symbol || 'Rs.'}
      migrationNeeded={ordersResult.migrationNeeded}
      isSupabaseConnected={ordersResult.isSupabaseConnected}
    />
  );
}
