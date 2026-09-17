import React from 'react';
import { getOrders, getProducts, getSettings } from '@/lib/data/store';
import OrdersManagerClient from '@/components/admin/OrdersManagerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Order Management & Confirmation | Fairy Finds Boutique Admin',
};

export default async function AdminOrdersPage() {
  const [orders, products, settings] = await Promise.all([
    getOrders(),
    getProducts(),
    getSettings(),
  ]);

  return (
    <OrdersManagerClient
      initialOrders={orders}
      products={products}
      settings={settings}
    />
  );
}
