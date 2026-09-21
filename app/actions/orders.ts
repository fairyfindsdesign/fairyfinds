'use server';

import { revalidatePath } from 'next/cache';
import {
  saveOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  markOrderRead,
  getUnreadOrderCount,
  generateOrderNumber,
  updateOrderEmailStatus,
  deleteOrder,
} from '@/lib/data/orders';
import { CartItem, CustomerOrderDetails, Order, OrderStatus } from '@/lib/types';
import { generateOrderWhatsAppUrl } from '@/lib/whatsapp';
import { sendOrderEmailAlert, sendTestOrderEmail } from '@/lib/email/order-notification';
import { checkAdminSession } from './auth';

async function assertAdmin() {
  const ok = await checkAdminSession();
  if (!ok) throw new Error('Unauthorized');
}

/**
 * Called from CheckoutClient when customer submits their order.
 * Saves order to DB, returns order number + WhatsApp URL.
 * Never requires admin auth — it is a public storefront action.
 */
export async function saveOrderAction(
  items: CartItem[],
  customer: CustomerOrderDetails,
  settings: { whatsapp_number: string; currency_symbol: string }
): Promise<{
  success: boolean;
  orderNumber?: string;
  whatsappUrl?: string;
  error?: string;
}> {
  try {
    if (!items || items.length === 0) {
      return { success: false, error: 'Your bag is empty.' };
    }
    if (!customer.name?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
      return { success: false, error: 'Customer name, phone, and address are required.' };
    }

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = items.reduce(
      (acc, item) => acc + (Number(item.product.delivery_fee) || 0) * item.quantity,
      0
    );
    const total = subtotal + deliveryFee;

    const orderNumber = generateOrderNumber();

    const orderItems = items.map((item) => ({
      product_id: item.product.id,
      product_code: item.product.product_code || item.product.id,
      product_name: item.product.name,
      product_image: item.product.images?.[0] || '',
      size: item.size,
      quantity: item.quantity,
      unit_price: item.price,
      delivery_fee: Number(item.product.delivery_fee) || 0,
      line_total: item.price * item.quantity,
    }));

    const saved = await saveOrder({
      order_number: orderNumber,
      customer_name: customer.name.trim(),
      customer_phone: customer.phone.trim(),
      delivery_address: customer.address.trim(),
      items: orderItems,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      notes: customer.notes?.trim() || undefined,
      status: 'new',
      is_read: false,
    });

    const whatsappUrl = generateOrderWhatsAppUrl(
      items,
      customer,
      settings.currency_symbol || 'Rs.',
      settings.whatsapp_number,
      orderNumber
    );

    // Non-blocking, safe dispatch of order alert email to store owner
    sendOrderEmailAlert(saved, settings.currency_symbol || 'Rs.')
      .then(async (res) => {
        if (res.success) {
          await updateOrderEmailStatus(saved.id, 'sent');
        } else if (!res.skipped) {
          await updateOrderEmailStatus(saved.id, 'failed');
        }
      })
      .catch((err) => {
        console.error('[saveOrderAction] Email alert error:', err);
        updateOrderEmailStatus(saved.id, 'failed').catch(() => {});
      });

    revalidatePath('/admin/orders', 'page');
    revalidatePath('/admin', 'layout');

    return { success: true, orderNumber: saved.order_number, whatsappUrl };
  } catch (err: any) {
    console.error('[saveOrderAction] Error:', err);
    return { success: false, error: err?.message || 'Could not save your order. Please try again.' };
  }
}

export async function getOrdersAction(filters?: {
  status?: OrderStatus;
  search?: string;
}): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
  try {
    await assertAdmin();
    const orders = await getOrders(filters);
    return { success: true, orders };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    await updateOrderStatus(id, status);
    revalidatePath('/admin/orders', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function markOrderReadAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    await markOrderRead(id);
    revalidatePath('/admin/orders', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function getUnreadCountAction(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    await assertAdmin();
    const count = await getUnreadOrderCount();
    return { success: true, count };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function resendOrderEmailAction(orderId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await assertAdmin();
    const order = await getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const res = await sendOrderEmailAlert(order);
    if (res.success) {
      await updateOrderEmailStatus(order.id, 'sent');
      revalidatePath('/admin/orders', 'page');
      return { success: true };
    } else {
      await updateOrderEmailStatus(order.id, 'failed');
      revalidatePath('/admin/orders', 'page');
      return { success: false, error: res.error || 'Failed to send email notification' };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unauthorized or unexpected error' };
  }
}

export async function sendTestEmailAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await assertAdmin();
    const res = await sendTestOrderEmail();
    if (res.success) {
      return { success: true };
    } else {
      return { success: false, error: res.error || 'Failed to send test email' };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unauthorized or unexpected error' };
  }
}

export async function deleteOrderAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await assertAdmin();
    const ok = await deleteOrder(id);
    if (!ok) {
      return { success: false, error: 'Failed to delete order from database' };
    }
    revalidatePath('/admin/orders', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unauthorized or unexpected error' };
  }
}


