import React from 'react';
import { getOrders, getUnreadOrderCount } from '@/lib/data/orders';
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

  const [orders, unreadCount, settings] = await Promise.all([
    getOrders(),
    getUnreadOrderCount(),
    getSettings(),
  ]);

  return (
    <OrdersClient
      initialOrders={orders}
      initialUnreadCount={unreadCount}
      currencySymbol={settings.currency_symbol || 'Rs.'}
    />
  );
}
