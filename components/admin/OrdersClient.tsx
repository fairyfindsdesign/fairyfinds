'use client';

import React, { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@/lib/types';
import { updateOrderStatusAction, markOrderReadAction } from '@/app/actions/orders';
import { useOrderNotifications } from './OrderNotificationProvider';
import {
  Search, Filter, ShoppingBag, Clock, CheckCircle2, Truck, Package,
  XCircle, AlertCircle, ChevronDown, ChevronRight, Phone, MapPin,
  Calendar, Tag, Eye, MoreVertical, RefreshCw,
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

interface Props {
  initialOrders: Order[];
  initialUnreadCount: number;
  currencySymbol: string;
}

export default function OrdersClient({ initialOrders, initialUnreadCount, currencySymbol }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { decrementUnread, setUnreadCount } = useOrderNotifications();

  // Keep local unread count in sync with server
  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount, setUnreadCount]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light">Orders</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {orders.length} total · {newCount} new · {unreadFiltered} unread
          </p>
        </div>
        <button
          onClick={() => router.refresh()}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 px-3 py-2 border border-neutral-200 hover:border-neutral-400 rounded-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

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
                    </div>
                    <p className="text-xs font-semibold text-neutral-800">{order.customer_name}</p>
                    <p className="text-[11px] text-neutral-500">{order.customer_phone} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Price & time */}
                  <div className="text-right shrink-0 hidden xs:block">
                    <p className="text-sm font-bold text-[#1A1A1A]">{currencySymbol} {Number(order.total).toLocaleString()}</p>
                    <p className="text-[11px] text-neutral-400">{timeAgo(order.created_at)}</p>
                  </div>

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

                    {/* Status Changer */}
                    <div className="flex flex-wrap items-center gap-3">
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
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
