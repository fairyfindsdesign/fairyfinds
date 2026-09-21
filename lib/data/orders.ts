import { Order, OrderItem, OrderStatus, EmailNotificationStatus } from '../types';
import { getAdminSupabase } from '../supabase/admin';
import fs from 'fs';
import path from 'path';

const LOCAL_ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

function readLocalOrders(): Order[] {
  try {
    if (!fs.existsSync(LOCAL_ORDERS_FILE)) return [];
    const raw = fs.readFileSync(LOCAL_ORDERS_FILE, 'utf-8');
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

function writeLocalOrders(orders: Order[]) {
  try {
    const dir = path.dirname(LOCAL_ORDERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('[orders] Failed to write local orders.json:', err);
  }
}

export function generateOrderNumber(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 900 + 100);
  return `FF${y}${m}${d}-${rand}`;
}

export async function saveOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const newOrder: Order = {
    ...order,
    id,
    email_notification_status: order.email_notification_status || 'pending',
    created_at: now,
    updated_at: now,
  };

  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const insertPayload: Record<string, any> = {
        id: newOrder.id,
        order_number: newOrder.order_number,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        delivery_address: newOrder.delivery_address,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        delivery_fee: newOrder.delivery_fee,
        total: newOrder.total,
        notes: newOrder.notes || null,
        status: newOrder.status,
        is_read: false,
        email_notification_status: newOrder.email_notification_status || 'pending',
      };
      let { data, error } = await supabase
        .from('orders')
        .insert(insertPayload)
        .select()
        .single();

      // If the column does not exist yet on Supabase, retry insert without it
      if (error && error.message && error.message.toLowerCase().includes('email_notification_status')) {
        delete insertPayload.email_notification_status;
        const retry = await supabase.from('orders').insert(insertPayload).select().single();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw new Error(error.message);
      const local = readLocalOrders();
      local.unshift(newOrder);
      writeLocalOrders(local);
      return data as Order;
    } catch (err) {
      console.error('[orders] Supabase save failed, using local fallback:', err);
    }
  }

  const local = readLocalOrders();
  local.unshift(newOrder);
  writeLocalOrders(local);
  return newOrder;
}

export interface OrdersFetchResult {
  orders: Order[];
  isSupabaseConnected: boolean;
  migrationNeeded: boolean;
  error?: string;
}

export async function getOrdersWithStatus(filters?: {
  status?: OrderStatus;
  is_read?: boolean;
  search?: string;
  limit?: number;
}): Promise<OrdersFetchResult> {
  const supabase = getAdminSupabase();
  let migrationNeeded = false;
  let errorMsg: string | undefined;

  if (supabase) {
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.is_read !== undefined) query = query.eq('is_read', filters.is_read);
      if (filters?.limit) query = query.limit(filters.limit);
      const { data, error } = await query;
      if (!error && data) {
        return {
          orders: data as Order[],
          isSupabaseConnected: true,
          migrationNeeded: false,
        };
      }
      if (error) {
        console.error('[orders] Supabase getOrders failed:', error.message, error.code);
        errorMsg = error.message;
        if (error.code === '42P01' || error.message.toLowerCase().includes('relation "orders" does not exist')) {
          migrationNeeded = true;
        }
      }
    } catch (err: any) {
      console.error('[orders] Supabase getOrders exception:', err);
      errorMsg = err?.message;
    }
  }

  let orders = readLocalOrders();
  if (filters?.status) orders = orders.filter((o) => o.status === filters.status);
  if (filters?.is_read !== undefined) orders = orders.filter((o) => o.is_read === filters.is_read);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.order_number.toLowerCase().includes(q)
    );
  }
  return {
    orders,
    isSupabaseConnected: !!supabase,
    migrationNeeded,
    error: errorMsg,
  };
}

export async function getOrders(filters?: {
  status?: OrderStatus;
  is_read?: boolean;
  search?: string;
  limit?: number;
}): Promise<Order[]> {
  const res = await getOrdersWithStatus(filters);
  return res.orders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (!error && data) return data as Order;
    } catch {}
  }
  return readLocalOrders().find((o) => o.id === id) || null;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const supabase = getAdminSupabase();
  const now = new Date().toISOString();
  if (supabase) {
    try {
      await supabase.from('orders').update({ status, updated_at: now }).eq('id', id);
    } catch (err) {
      console.error('[orders] Supabase updateOrderStatus failed:', err);
    }
  }
  const orders = readLocalOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) { orders[idx] = { ...orders[idx], status, updated_at: now }; writeLocalOrders(orders); }
}

export async function markOrderRead(id: string): Promise<void> {
  const supabase = getAdminSupabase();
  const now = new Date().toISOString();
  if (supabase) {
    try {
      await supabase.from('orders').update({ is_read: true, updated_at: now }).eq('id', id);
    } catch (err) {
      console.error('[orders] Supabase markOrderRead failed:', err);
    }
  }
  const orders = readLocalOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) { orders[idx] = { ...orders[idx], is_read: true, updated_at: now }; writeLocalOrders(orders); }
}

export async function getUnreadOrderCount(): Promise<number> {
  const supabase = getAdminSupabase();
  if (supabase) {
    try {
      const { count, error } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('is_read', false);
      if (!error && count !== null) return count;
    } catch {}
  }
  return readLocalOrders().filter((o) => !o.is_read).length;
}

export async function updateOrderEmailStatus(id: string, status: EmailNotificationStatus): Promise<void> {
  const supabase = getAdminSupabase();
  const now = new Date().toISOString();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ email_notification_status: status, updated_at: now })
        .eq('id', id);
      if (error) {
        console.error('[orders] Supabase updateOrderEmailStatus failed:', error.message);
      }
    } catch (err) {
      console.error('[orders] Supabase updateOrderEmailStatus exception:', err);
    }
  }
  const orders = readLocalOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], email_notification_status: status, updated_at: now };
    writeLocalOrders(orders);
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  const supabase = getAdminSupabase();
  let supabaseSuccess = true;

  if (supabase) {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) {
        console.error('[orders] Supabase deleteOrder failed:', error.message);
        supabaseSuccess = false;
      }
    } catch (err: any) {
      console.error('[orders] Supabase deleteOrder exception:', err);
      supabaseSuccess = false;
    }
  }

  // Also remove from local store fallback
  const orders = readLocalOrders();
  const nextOrders = orders.filter((o) => o.id !== id);
  writeLocalOrders(nextOrders);

  return supabaseSuccess;
}

