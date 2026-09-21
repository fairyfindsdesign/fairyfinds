'use client';

import React, { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@/lib/types';
import { updateOrderStatusAction, markOrderReadAction, resendOrderEmailAction, sendTestEmailAction, deleteOrderAction } from '@/app/actions/orders';
import { useOrderNotifications } from './OrderNotificationProvider';
import OrderReceiptModal from './OrderReceiptModal';
import {
  Search, Filter, ShoppingBag, Clock, CheckCircle2, Truck, Package,
  XCircle, AlertCircle, ChevronDown, ChevronRight, Phone, MapPin,
  Calendar, Tag, Eye, MoreVertical, RefreshCw, Mail, Printer, Trash2, AlertTriangle,
} from 'lucide-react';

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-red-100 text-red-700 border-red-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  preparing: 'bg-amber-100 text-amber-700 border-amber-200',
  ready: 'bg-violet-100 text-violet-700 border-violet-200',
  shipped: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-neutral-100 text-neutral-500 border-neutral-200',
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const MIGRATION_SQL = `-- 1. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'new',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Safely add any columns that may be missing on existing tables
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_notification_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE orders SET is_read = false WHERE is_read IS NULL;
UPDATE orders SET delivery_fee = 0 WHERE delivery_fee IS NULL;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_is_read ON orders(is_read);

-- 3. Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin All Orders" ON orders;
CREATE POLICY "Admin All Orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- 4. Enable Realtime broadcast
ALTER TABLE orders REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;`;

interface Props {
  initialOrders: Order[];
  initialUnreadCount: number;
  currencySymbol: string;
  migrationNeeded?: boolean;
  isSupabaseConnected?: boolean;
}

export default function OrdersClient({
  initialOrders,
  initialUnreadCount,
  currencySymbol,
  migrationNeeded = false,
  isSupabaseConnected = true,
}: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ message: string; isError: boolean } | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { decrementUnread, setUnreadCount, latestOrder } = useOrderNotifications();

  // Sync orders with server whenever initialOrders updates
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Prepend live incoming orders from WebSocket broadcast
  useEffect(() => {
    if (latestOrder) {
      setOrders((prev) => {
        if (prev.some((o) => o.id === latestOrder.id)) return prev;
        return [latestOrder, ...prev];
      });
    }
  }, [latestOrder]);

  // Keep local unread count in sync with server
  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount, setUnreadCount]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    startTransition(() => {
      router.refresh();
      setTimeout(() => setIsRefreshing(false), 800);
    });
  };

  const handleResendEmail = async (orderId: string) => {
    setResendingId(orderId);
    try {
      const res = await resendOrderEmailAction(orderId);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, email_notification_status: 'sent' } : o))
        );
        alert('Order notification email re-sent successfully!');
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, email_notification_status: 'failed' } : o))
        );
        alert(`Email dispatch failed: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Could not resend email'}`);
    } finally {
      setResendingId(null);
      router.refresh();
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendTestEmailAction();
      if (res.success) {
        setTestResult({ message: '✓ Test order email sent! Check your store owner inbox.', isError: false });
      } else {
        setTestResult({ message: `⚠ ${res.error || 'Failed to send test email. Verify RESEND_API_KEY.'}`, isError: true });
      }
    } catch (err: any) {
      setTestResult({ message: `⚠ ${err?.message || 'Could not dispatch test email.'}`, isError: true });
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setTestResult(null), 8000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      const res = await deleteOrderAction(deletingOrder.id);
      if (res.success) {
        if (!deletingOrder.is_read) {
          decrementUnread();
        }
        setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id));
        setDeletingOrder(null);
        router.refresh();
      } else {
        alert(`Failed to delete order: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Error deleting order: ${err?.message || 'Unexpected error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter) result = result.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          o.order_number.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, search, statusFilter]);

  const unreadFiltered = orders.filter((o) => !o.is_read).length;

  const handleExpand = (order: Order) => {
    const alreadyOpen = expandedId === order.id;
    setExpandedId(alreadyOpen ? null : order.id);

    // Mark as read when opened
    if (!order.is_read && !alreadyOpen) {
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, is_read: true } : o));
      decrementUnread();
      startTransition(() => {
        markOrderReadAction(order.id);
      });
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    startTransition(() => {
      updateOrderStatusAction(orderId, newStatus);
    });
  };

  const newCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Supabase Migration Notice Banner */}
      {migrationNeeded && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-xs text-amber-900 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-950">Action Required: Supabase "orders" Table Missing</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                The <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px] font-semibold">orders</code> table has not been created in your Supabase project yet. Because of this, incoming customer orders cannot be registered or alerted in real time.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 pl-7">
            <button
              onClick={() => {
                navigator.clipboard.writeText(MIGRATION_SQL);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 3000);
              }}
              className="px-3.5 py-1.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs font-semibold rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSql ? '✓ Copied SQL to Clipboard!' : 'Copy Migration SQL'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-medium rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh After Running SQL
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light">Orders</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {orders.length} total · {newCount} new · {unreadFiltered} unread
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendTestEmail}
            disabled={isSendingTest}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-black px-3 py-2 border border-neutral-200 hover:border-neutral-400 bg-white rounded-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Sends a mock boutique order notification to verify Resend connectivity"
          >
            <Mail className="w-3.5 h-3.5 text-[#FF55D2]" />
            {isSendingTest ? 'Sending Test...' : 'Send Test Email'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 px-3 py-2 border border-neutral-200 hover:border-neutral-400 rounded-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {testResult && (
        <div className={`p-3 rounded-xs text-xs font-medium border transition-all ${
          testResult.isError ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-emerald-50 text-emerald-900 border-emerald-300'
        }`}>
          {testResult.message}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF55D2] rounded-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="px-3 py-2 bg-white border border-neutral-200 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF55D2] rounded-xs"
        >
          <option value="">All Statuses</option>
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Order List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-3 stroke-1" />
            <p className="text-sm text-neutral-500">No orders found</p>
            {search || statusFilter ? (
              <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="mt-2 text-xs text-[#FF55D2] hover:underline">Clear filters</button>
            ) : (
              <p className="text-xs text-neutral-400 mt-1">Orders will appear here when customers place them.</p>
            )}
          </div>
        ) : (
          filtered.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                className={`bg-white border rounded-xs overflow-hidden transition-all duration-200 ${
                  !order.is_read ? 'border-l-4 border-l-[#FF55D2] border-neutral-200' : 'border-neutral-200'
                }`}
              >
                {/* Order Row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50/60 transition-colors"
                  onClick={() => handleExpand(order)}
                >
                  {/* Unread dot */}
                  <div className="shrink-0 w-2 h-2">
                    {!order.is_read && <span className="block w-2 h-2 rounded-full bg-[#FF55D2] animate-pulse" />}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-[#1A1A1A]">#{order.order_number}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-semibold border rounded-full uppercase tracking-wide ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      {!order.is_read && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#FF55D2]/10 text-[#FF55D2] border border-[#FF55D2]/30 rounded-full uppercase tracking-wide">Unread</span>
                      )}
                      {order.email_notification_status === 'sent' && (
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-0.5" title="Owner email notification sent">
                          <Mail className="w-2.5 h-2.5" /> Email
                        </span>
                      )}
                      {order.email_notification_status === 'failed' && (
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-0.5" title="Owner email alert failed">
                          <Mail className="w-2.5 h-2.5" /> Failed
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-neutral-800">{order.customer_name}</p>
                    <p className="text-[11px] text-neutral-500">{order.customer_phone} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Price & time */}
                  <div className="text-right shrink-0 hidden xs:block">
                    <p className="text-sm font-bold text-[#1A1A1A]">{currencySymbol} {Number(order.total).toLocaleString()}</p>
                    <p className="text-[11px] text-neutral-400">{timeAgo(order.created_at)}</p>
                  </div>

                  {/* Quick Receipt trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReceiptOrder(order);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-xs hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="View / Print Receipt"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>

                  <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 p-4 space-y-4 bg-neutral-50/40">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Customer</p>
                        <p className="font-semibold text-neutral-800">{order.customer_name}</p>
                        <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1 text-[#FF55D2] hover:underline">
                          <Phone className="w-3 h-3" />{order.customer_phone}
                        </a>
                        <p className="text-neutral-600 flex items-start gap-1"><MapPin className="w-3 h-3 shrink-0 mt-0.5" />{order.delivery_address}</p>
                        {order.notes && <p className="text-neutral-500 italic">Note: {order.notes}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Order Info</p>
                        <p className="flex items-center gap-1 text-neutral-600"><Calendar className="w-3 h-3" />{formatDate(order.created_at)}</p>
                        <p className="flex items-center gap-1 text-neutral-600"><Tag className="w-3 h-3" />Order #{order.order_number}</p>
                        
                        {/* Owner Email Alert Status */}
                        <div className="pt-1.5 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-neutral-400" /> Owner Email:
                          </span>
                          {order.email_notification_status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Sent
                            </span>
                          ) : order.email_notification_status === 'failed' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              ⚠ Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                              Pending
                            </span>
                          )}
                          <button
                            onClick={() => handleResendEmail(order.id)}
                            disabled={resendingId === order.id}
                            className="text-[11px] text-[#FF55D2] hover:text-[#FD00B9] font-semibold hover:underline disabled:opacity-50 ml-1 inline-flex items-center gap-1 cursor-pointer"
                            title="Resend owner notification email via Resend"
                          >
                            <RefreshCw className={`w-2.5 h-2.5 ${resendingId === order.id ? 'animate-spin' : ''}`} />
                            {resendingId === order.id ? 'Sending...' : 'Resend'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-2">Items Ordered</p>
                      <div className="border border-neutral-200 rounded-xs overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-neutral-100">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-neutral-600">Product</th>
                              <th className="px-3 py-2 text-center font-semibold text-neutral-600">Size</th>
                              <th className="px-3 py-2 text-center font-semibold text-neutral-600">Qty</th>
                              <th className="px-3 py-2 text-right font-semibold text-neutral-600">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {order.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-neutral-50">
                                <td className="px-3 py-2">
                                  <p className="font-medium text-neutral-800">{item.product_name}</p>
                                  <p className="text-[10px] text-neutral-400">{item.product_code}</p>
                                </td>
                                <td className="px-3 py-2 text-center text-neutral-700">{item.size}</td>
                                <td className="px-3 py-2 text-center text-neutral-700">{item.quantity}</td>
                                <td className="px-3 py-2 text-right font-semibold text-neutral-800">{currencySymbol} {Number(item.line_total).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="border border-neutral-200 rounded-xs p-3 bg-white space-y-1.5 text-xs">
                      <div className="flex justify-between text-neutral-600">
                        <span>Subtotal</span><span>{currencySymbol} {Number(order.subtotal).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Delivery Fee</span>
                        <span>{Number(order.delivery_fee) > 0 ? `${currencySymbol} ${Number(order.delivery_fee).toLocaleString()}` : 'Free'}</span>
                      </div>
                      <div className="flex justify-between font-bold text-neutral-900 pt-1.5 border-t border-neutral-200 text-sm">
                        <span>Total</span><span>{currencySymbol} {Number(order.total).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Status Changer & Order Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200/80">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-neutral-500">Update Status:</label>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          disabled={isPending}
                          className="px-3 py-1.5 bg-white border border-neutral-200 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF55D2] rounded-xs disabled:opacity-60"
                        >
                          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                        <a
                          href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded-xs hover:bg-[#128C7E] transition-colors"
                        >
                          <Phone className="w-3 h-3" /> WhatsApp Customer
                        </a>
                        <button
                          type="button"
                          onClick={() => setReceiptOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-xs hover:bg-black transition-colors cursor-pointer"
                          title="View, print, or share official order receipt"
                        >
                          <Printer className="w-3 h-3 text-[#FF55D2]" /> Receipt
                        </button>
                      </div>

                      {/* Danger: Delete Order */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setDeletingOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                          title="Delete this order permanently"
                        >
                          <Trash2 className="w-3 h-3" /> Delete Order
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Boutique Order Receipt Modal */}
      {receiptOrder && (
        <OrderReceiptModal
          order={receiptOrder}
          currencySymbol={currencySymbol}
          onClose={() => setReceiptOrder(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-md p-6 rounded-sm shadow-2xl border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Delete Order?</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Are you sure you want to permanently delete order{' '}
                  <span className="font-semibold text-neutral-900">#{deletingOrder.order_number}</span>?
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xs p-3 text-xs text-neutral-700 mb-4 space-y-1">
              <p><span className="text-neutral-500">Customer:</span> <span className="font-semibold">{deletingOrder.customer_name}</span> ({deletingOrder.customer_phone})</p>
              <p><span className="text-neutral-500">Items:</span> {deletingOrder.items.length} item{deletingOrder.items.length !== 1 ? 's' : ''}</p>
              <p><span className="text-neutral-500">Total:</span> <span className="font-bold text-neutral-900">{currencySymbol} {Number(deletingOrder.total).toLocaleString()}</span></p>
            </div>

            <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xs mb-5">
              Warning: This action is permanent and cannot be undone. The order will be removed from Supabase and local records.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
