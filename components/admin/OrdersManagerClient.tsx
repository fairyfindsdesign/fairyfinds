'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Order,
  OrderItem,
  OrderStatus,
  Product,
  StoreSettings,
} from '@/lib/types';
import {
  confirmOrderAction,
  updateOrderStatusAction,
  cancelAndDeleteOrderAction,
  createManualOrderAction,
} from '@/app/actions/store';
import { cleanPhoneNumber } from '@/lib/whatsapp';
import {
  CheckCircle2,
  Clock,
  Trash2,
  Phone,
  MessageCircle,
  Search,
  Plus,
  Printer,
  Package,
  Check,
  X,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Send,
  Loader2,
  ExternalLink,
  Calendar,
  MapPin,
  FileText,
  Copy,
  Database,
} from 'lucide-react';

interface OrdersManagerClientProps {
  initialOrders: Order[];
  products: Product[];
  settings: StoreSettings;
  dbStatus?: {
    isSupabaseConnected: boolean;
    hasOrdersTable: boolean;
    error?: string;
  };
}

export default function OrdersManagerClient({
  initialOrders,
  products,
  settings,
  dbStatus,
}: OrdersManagerClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED'>('ALL');
  const [copiedSql, setCopiedSql] = useState(false);

  // Confirmation Modal state
  const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);
  const [confirmNotes, setConfirmNotes] = useState('');
  const [deductStock, setDeductStock] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  // Manual Order Modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualProductId, setManualProductId] = useState(products[0]?.id || '');
  const [manualSize, setManualSize] = useState(products[0]?.variants?.[0]?.size || 'Standard');
  const [manualQty, setManualQty] = useState(1);
  const [manualStatus, setManualStatus] = useState<OrderStatus>('CONFIRMED');
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  // Packing Slip Printable Modal state
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Action status message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // KPIs
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const confirmedOrders = orders.filter((o) => o.status === 'CONFIRMED');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalRevenue = confirmedOrders.concat(completedOrders).reduce((acc, o) => acc + o.total, 0);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab !== 'ALL' && order.status !== activeTab) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = order.order_number.toLowerCase().includes(q);
        const matchesName = order.customer_name.toLowerCase().includes(q);
        const matchesPhone = order.customer_phone.toLowerCase().includes(q);
        const matchesAddress = order.delivery_address.toLowerCase().includes(q);
        const matchesItem = order.items.some(
          (it) =>
            it.product_name.toLowerCase().includes(q) ||
            (it.product_code && it.product_code.toLowerCase().includes(q))
        );
        return matchesNumber || matchesName || matchesPhone || matchesAddress || matchesItem;
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // Handle manual order confirmation (Validating the order)
  const handleConfirmOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingOrder) return;

    setIsConfirming(true);
    try {
      const res = await confirmOrderAction(confirmingOrder.id, confirmNotes, deductStock);
      if (!res.success || !res.order) {
        showToast(res.error || 'Failed to confirm order', 'error');
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === confirmingOrder.id ? (res.order as Order) : o))
      );
      showToast(`Order #${confirmingOrder.order_number} confirmed as a Valid Order!`, 'success');
      setConfirmingOrder(null);
      setConfirmNotes('');
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Error confirming order', 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  // Quick Status Transition (e.g. Mark Fulfilled / Completed)
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (!res.success || !res.order) {
        showToast(res.error || 'Failed to update order', 'error');
        return;
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? (res.order as Order) : o))
      );
      showToast(`Order marked as ${newStatus}`, 'success');
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Error updating order status', 'error');
    }
  };

  // Cancel & Delete order from DB completely
  const handleCancelAndDelete = async (order: Order) => {
    const isConfirmed = order.status === 'CONFIRMED';
    const msg = isConfirmed
      ? `Cancel and permanently delete order #${order.order_number} from the database? This will also restore variant stock quantities.`
      : `Cancel and delete order #${order.order_number} from the database? This log will be permanently removed.`;

    if (!window.confirm(msg)) {
      return;
    }

    try {
      const res = await cancelAndDeleteOrderAction(order.id, true);
      if (!res.success) {
        showToast(res.error || 'Failed to delete order', 'error');
        return;
      }
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      showToast(`Order #${order.order_number} was cancelled and removed from the database log.`, 'success');
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Error deleting order', 'error');
    }
  };

  // Create Manual Order
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) {
      alert('Customer name and phone are required.');
      return;
    }

    const selectedProduct = products.find((p) => p.id === manualProductId);
    if (!selectedProduct) {
      alert('Please select a valid product.');
      return;
    }

    setIsCreatingManual(true);
    try {
      const lineSubtotal = selectedProduct.price * manualQty;
      const orderPayload: Partial<Order> = {
        customer_name: manualName.trim(),
        customer_phone: manualPhone.trim(),
        delivery_address: manualAddress.trim() || 'Boutique Pickup / Walk-in',
        notes: manualNotes.trim() || undefined,
        status: manualStatus,
        currency_symbol: settings.currency_symbol || 'Rs.',
        subtotal: lineSubtotal,
        total: lineSubtotal,
        items: [
          {
            id: `item-${Date.now()}`,
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            product_code: selectedProduct.product_code || selectedProduct.id,
            image_url: selectedProduct.images?.[0],
            size: manualSize,
            quantity: manualQty,
            unit_price: selectedProduct.price,
            subtotal: lineSubtotal,
            sku: selectedProduct.variants?.find((v) => v.size === manualSize)?.sku,
          },
        ],
      };

      const res = await createManualOrderAction(orderPayload);
      if (!res.success || !res.order) {
        showToast(res.error || 'Failed to create manual order', 'error');
        return;
      }

      setOrders((prev) => [res.order as Order, ...prev]);
      showToast(`Manual Order #${res.order.order_number} created successfully!`, 'success');
      setIsManualModalOpen(false);
      setManualName('');
      setManualPhone('');
      setManualAddress('');
      setManualNotes('');
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Error creating manual order', 'error');
    } finally {
      setIsCreatingManual(false);
    }
  };

  // WhatsApp reply link to customer
  const getCustomerWhatsAppUrl = (order: Order) => {
    const cleanPhone = cleanPhoneNumber(order.customer_phone);
    const message = `Hello ${order.customer_name}, this is Fairy Finds Boutique regarding your order #${order.order_number}.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleCopyOrdersSql = () => {
    const sql = `-- Fairy Finds Boutique - Create Orders Table in Supabase
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency_symbol TEXT DEFAULT 'Rs.',
  status TEXT NOT NULL DEFAULT 'PENDING',
  confirmation_notes TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Create Orders" ON orders;
CREATE POLICY "Public Create Orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Orders" ON orders;
CREATE POLICY "Admin All Orders" ON orders FOR ALL USING (true) WITH CHECK (true);`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast notification */}
      {statusMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded-xs shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-[#1A1A1A] text-white border-l-4 border-[#FF55D2]'
              : 'bg-red-600 text-white'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-[#FF55D2]" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-light">
              Order Confirmation & Logs
            </h1>
            {pendingOrders.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 text-[10px] uppercase font-mono font-bold tracking-wider rounded-xs animate-pulse">
                {pendingOrders.length} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Orders placed via WhatsApp cart checkout are logged here. Manually confirm orders to mark them as valid.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold shadow-xs transition-colors rounded-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Manual Order</span>
          </button>
        </div>
      </div>

      {/* Database Connection Diagnostic Bar */}
      {dbStatus && (
        <>
          {dbStatus.isSupabaseConnected && dbStatus.hasOrdersTable && (
            <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center justify-between text-xs text-emerald-800 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="font-medium">
                  Live Cloud Database Connected: All orders and confirmation logs persist directly in Supabase.
                </span>
              </div>
              <span className="text-[11px] font-mono uppercase text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-xs">
                Active Sync
              </span>
            </div>
          )}

          {!dbStatus.isSupabaseConnected && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xs text-xs space-y-2 text-amber-900 shadow-xs">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Notice: Cloud Database Not Connected (Vercel Read-Only Mode)</span>
              </div>
              <p className="text-amber-800 leading-relaxed font-light">
                Your store is currently running without Supabase credentials. On Vercel, the filesystem is stateless and read-only, so orders exist in temporary serverless memory. To enable <strong>permanent cloud database saving</strong>, add your <strong>Supabase credentials</strong> (<code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code>) in your Vercel Project Settings.
              </p>
            </div>
          )}

          {dbStatus.isSupabaseConnected && !dbStatus.hasOrdersTable && (
            <div className="p-4 bg-blue-50 border border-blue-300 rounded-xs text-xs space-y-3 text-blue-950 shadow-xs">
              <div className="flex items-center gap-2 font-semibold text-blue-900">
                <Database className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Action Required: &apos;orders&apos; table not created in Supabase yet</span>
              </div>
              <p className="text-blue-800 leading-relaxed font-light">
                Supabase is connected, but the <code>orders</code> table needs to be created in your database. Click below to copy the SQL setup script, then paste and run it in your <strong>Supabase SQL Editor</strong> to enable permanent order saving.
              </p>
              <div>
                <button
                  type="button"
                  onClick={handleCopyOrdersSql}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'SQL Copied to Clipboard!' : 'Copy Supabase Orders SQL'}</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Total Orders */}
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] uppercase tracking-widest font-semibold">Total Logged</span>
            <ShoppingBag className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="font-sans text-3xl font-bold text-[#1A1A1A]">
            {totalOrders}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">All incoming orders</p>
        </div>

        {/* Pending Confirmation (Highlighted) */}
        <div className={`p-4 sm:p-5 shadow-xs border ${
          pendingOrders.length > 0
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-amber-800">
              Needs Confirmation
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-sans text-3xl font-bold text-amber-900">
            {pendingOrders.length}
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Unconfirmed orders</p>
        </div>

        {/* Confirmed / Valid */}
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-emerald-800">
              Valid Orders
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-sans text-3xl font-bold text-emerald-900">
            {confirmedOrders.length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Confirmed by owner</p>
        </div>

        {/* Revenue */}
        <div className="bg-white border border-neutral-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] uppercase tracking-widest font-semibold">Valid Value</span>
            <ShieldCheck className="w-4 h-4 text-[#FF55D2]" />
          </div>
          <div className="font-sans text-2xl sm:text-3xl font-bold text-[#1A1A1A] truncate">
            {settings.currency_symbol || 'Rs.'} {totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Confirmed & Fulfilled</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-neutral-200 p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-[#1A1A1A] text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            All ({totalOrders})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Confirmation ({pendingOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CONFIRMED')}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CONFIRMED'
                ? 'bg-emerald-700 text-white'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed Valid ({confirmedOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors whitespace-nowrap ${
              activeTab === 'COMPLETED'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Fulfilled ({completedOrders.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-12 text-center shadow-xs">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3 stroke-1" />
          <h3 className="font-serif text-xl text-neutral-800 font-light mb-1">
            No Orders Found
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
            {searchQuery
              ? `No orders match "${searchQuery}". Try clearing the search filter.`
              : activeTab === 'PENDING'
              ? 'Great news! There are no unconfirmed orders waiting for review.'
              : 'There are currently no orders in this status category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'PENDING';
            const isConfirmed = order.status === 'CONFIRMED';
            const isCompleted = order.status === 'COMPLETED';

            return (
              <div
                key={order.id}
                className={`bg-white border transition-all rounded-xs shadow-xs overflow-hidden ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : isConfirmed
                    ? 'border-emerald-200'
                    : 'border-neutral-200'
                }`}
              >
                {/* Order Top Strip */}
                <div
                  className={`px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b ${
                    isPending
                      ? 'bg-amber-50/80 border-amber-200'
                      : isConfirmed
                      ? 'bg-emerald-50/50 border-emerald-100'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-sm text-[#1A1A1A] tracking-wider">
                      #{order.order_number}
                    </span>

                    {/* Status Badge */}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>Pending Confirmation</span>
                      </span>
                    )}
                    {isConfirmed && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>Confirmed (Valid Order)</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-neutral-100 border border-neutral-300 text-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs">
                        <Package className="w-3 h-3 text-neutral-600" />
                        <span>Fulfilled / Delivered</span>
                      </span>
                    )}

                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      <span>{new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </span>
                  </div>

                  {/* Actions on Top Bar */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPrintingOrder(order)}
                      className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-xs transition-colors"
                      title="Print Packing Slip / Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <a
                      href={getCustomerWhatsAppUrl(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xs transition-colors"
                      title="Open WhatsApp Chat with Customer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Customer & Delivery Column */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400">
                      Customer Details
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="font-semibold text-neutral-900 text-sm">
                        {order.customer_name}
                      </div>

                      <div className="flex items-center gap-2 text-neutral-600">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="font-mono">{order.customer_phone}</span>
                      </div>

                      <div className="flex items-start gap-2 text-neutral-600 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{order.delivery_address}</span>
                      </div>

                      {order.notes && (
                        <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xs text-[11px] text-neutral-600 space-y-0.5">
                          <strong className="text-neutral-800 block uppercase tracking-wider text-[10px]">
                            Customer Note:
                          </strong>
                          <p>{order.notes}</p>
                        </div>
                      )}

                      {order.confirmed_at && (
                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xs text-[11px] text-emerald-900 space-y-0.5 mt-2">
                          <div className="flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Confirmed on {new Date(order.confirmed_at).toLocaleDateString()}</span>
                          </div>
                          {order.confirmation_notes && (
                            <p className="text-neutral-600 italic mt-0.5">
                              &ldquo;{order.confirmation_notes}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ordered Garments Column */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400">
                      Ordered Garments ({order.items.reduce((acc, it) => acc + it.quantity, 0)} pcs)
                    </div>

                    <div className="space-y-2.5 divide-y divide-neutral-100">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-3 pt-2 first:pt-0">
                          {/* Thumbnail */}
                          <div className="w-14 h-18 relative bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden rounded-xs">
                            <Image
                              src={
                                item.image_url ||
                                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200'
                              }
                              alt={item.product_name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="font-medium text-neutral-900 truncate">
                              {item.product_name}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                              <span className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 font-semibold rounded-xs">
                                Size: {item.size}
                              </span>
                              {item.product_code && (
                                <span className="font-mono text-neutral-600">
                                  ID: {item.product_code}
                                </span>
                              )}
                              <span>Qty: {item.quantity}</span>
                            </div>
                            <div className="text-neutral-900 font-semibold mt-1">
                              {order.currency_symbol || 'Rs.'} {item.subtotal.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total & Confirmation Control Column */}
                  <div className="lg:col-span-3 flex flex-col justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-xs space-y-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400 mb-1">
                        Total Amount
                      </div>
                      <div className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                        {order.currency_symbol || 'Rs.'} {order.total.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Courier to be coordinated on WhatsApp
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-neutral-200">
                      {/* If PENDING: Highlighted manual confirm button */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmingOrder(order);
                            setConfirmNotes('');
                            setDeductStock(true);
                          }}
                          className="w-full py-2.5 px-3 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Order</span>
                        </button>
                      )}

                      {/* If CONFIRMED: Mark as fulfilled option */}
                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                          className="w-full py-2 px-3 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Mark as Fulfilled</span>
                        </button>
                      )}

                      {/* Cancel and Delete Order button */}
                      <button
                        type="button"
                        onClick={() => handleCancelAndDelete(order)}
                        className="w-full py-1.5 px-3 text-red-600 hover:bg-red-50 text-[11px] uppercase tracking-wider font-medium rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Cancel and remove order from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel & Remove Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full p-6 border border-neutral-200 shadow-2xl rounded-xs space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif text-xl text-[#1A1A1A] font-light">
                  Confirm Order #{confirmingOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setConfirmingOrder(null)}
                className="text-neutral-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Manually confirming this order designates it as an official, verified boutique order.
            </p>

            <form onSubmit={handleConfirmOrderSubmit} className="space-y-4">
              {/* Optional note */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Atelier Verification Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bank transfer verified, customized length checked, package ready for courier."
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#FF55D2] rounded-xs resize-none"
                />
              </div>

              {/* Deduct stock checkbox */}
              <label className="flex items-start gap-2.5 p-3 bg-neutral-50 border border-neutral-200 rounded-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={deductStock}
                  onChange={(e) => setDeductStock(e.target.checked)}
                  className="mt-0.5 accent-[#FF55D2]"
                />
                <div className="text-xs text-neutral-700">
                  <span className="font-semibold block">Deduct garment stock automatically</span>
                  <span className="text-[11px] text-neutral-500">
                    Decrements variant stock count for all ordered items to avoid overselling.
                  </span>
                </div>
              </label>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setConfirmingOrder(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs uppercase tracking-wider font-medium hover:bg-neutral-50 rounded-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isConfirming}
                  className="px-5 py-2 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm as Valid Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Order Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-lg w-full p-6 border border-neutral-200 shadow-2xl rounded-xs space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="font-serif text-xl text-[#1A1A1A] font-light">
                Log Manual / Offline Order
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 font-light">
              Record an order received via direct phone consultation, boutique walk-in, or Instagram DM.
            </p>

            <form onSubmit={handleCreateManualOrder} className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nimasha Perera"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +94 77 123 4567"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Delivery Address / Store Pickup
                </label>
                <input
                  type="text"
                  placeholder="e.g. 45 Gallery Road, Colombo 07"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2]"
                />
              </div>

              {/* Product Selection */}
              <div className="pt-2 border-t border-neutral-200">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Garment Piece *
                </label>
                <select
                  value={manualProductId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setManualProductId(pid);
                    const prod = products.find((p) => p.id === pid);
                    if (prod?.variants?.[0]?.size) {
                      setManualSize(prod.variants[0].size);
                    }
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs focus:bg-white focus:outline-none focus:border-[#FF55D2]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {settings.currency_symbol || 'Rs.'} {p.price.toLocaleString()} ({p.product_code || p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                    Size
                  </label>
                  <select
                    value={manualSize}
                    onChange={(e) => setManualSize(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs"
                  >
                    {products
                      .find((p) => p.id === manualProductId)
                      ?.variants?.map((v) => (
                        <option key={v.id} value={v.size}>
                          {v.size} (Stock: {v.stock_quantity})
                        </option>
                      )) || <option value="Standard">Standard</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={manualQty}
                    onChange={(e) => setManualQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Initial Order Status
                </label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs"
                >
                  <option value="CONFIRMED">Confirmed (Valid Order Immediately)</option>
                  <option value="PENDING">Pending Confirmation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-800 mb-1">
                  Atelier Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash at atelier"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs rounded-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs uppercase tracking-wider font-medium hover:bg-neutral-50 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingManual}
                  className="px-5 py-2 bg-[#FF55D2] hover:bg-[#FD00B9] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingManual ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Save Order</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Packing Slip View Modal */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-xl w-full p-8 border border-neutral-300 shadow-2xl rounded-xs space-y-6 max-h-[90vh] overflow-y-auto print:p-0 print:border-none print:shadow-none animate-in zoom-in-95 duration-200">
            {/* Action Bar (hidden in print) */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 print:hidden">
              <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
                Packing Slip Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setPrintingOrder(null)}
                  className="p-1 text-neutral-400 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slip Printable Body */}
            <div className="space-y-6 text-[#1A1A1A]">
              <div className="flex justify-between items-start pb-4 border-b border-neutral-300">
                <div>
                  <h2 className="font-serif text-2xl font-semibold tracking-wide uppercase">
                    Fairy Finds Boutique
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {settings.address || 'Boutique Atelier, Colombo, Sri Lanka'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    WhatsApp: {settings.whatsapp_number}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold">
                    ORDER #{printingOrder.order_number}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Date: {new Date(printingOrder.created_at).toLocaleDateString()}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-neutral-100 border border-neutral-300">
                    Status: {printingOrder.status}
                  </span>
                </div>
              </div>

              {/* Delivery To */}
              <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xs text-xs space-y-1">
                <div className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                  Deliver To:
                </div>
                <div className="font-bold text-sm text-neutral-900">
                  {printingOrder.customer_name}
                </div>
                <div className="text-neutral-700">
                  Phone: {printingOrder.customer_phone}
                </div>
                <div className="text-neutral-700 leading-relaxed">
                  {printingOrder.delivery_address}
                </div>
                {printingOrder.notes && (
                  <div className="text-neutral-500 italic pt-1">
                    Special Instructions: {printingOrder.notes}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border border-neutral-200 divide-y divide-neutral-200">
                <thead className="bg-neutral-100 text-neutral-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Garment Item</th>
                    <th className="p-3">Size</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {printingOrder.items.map((it) => (
                    <tr key={it.id}>
                      <td className="p-3">
                        <div className="font-medium text-neutral-900">{it.product_name}</div>
                        {it.product_code && (
                          <div className="text-[10px] font-mono text-neutral-400">
                            Code: {it.product_code}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-neutral-700">{it.size}</td>
                      <td className="p-3 text-center font-semibold">{it.quantity}</td>
                      <td className="p-3 text-right font-medium">
                        {printingOrder.currency_symbol || 'Rs.'} {it.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-neutral-300 font-bold">
                    <td colSpan={3} className="p-3 text-right uppercase tracking-wider text-[11px]">
                      Order Total:
                    </td>
                    <td className="p-3 text-right text-sm">
                      {printingOrder.currency_symbol || 'Rs.'} {printingOrder.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Quality Checklist */}
              <div className="p-4 border border-dashed border-neutral-300 rounded-xs text-[11px] text-neutral-600 space-y-2">
                <div className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
                  Boutique Quality & Packaging Checklist:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" className="accent-neutral-800" />
                    <span>Garment Steamed</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" className="accent-neutral-800" />
                    <span>Tag & Label Verified</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" className="accent-neutral-800" />
                    <span>Wrapped in Boutique Tissue</span>
                  </label>
                </div>
              </div>

              <div className="text-center text-[10px] text-neutral-400 uppercase tracking-widest pt-2">
                Thank you for ordering with Fairy Finds Boutique
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
