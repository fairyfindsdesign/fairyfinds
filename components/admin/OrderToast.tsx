'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Clock } from 'lucide-react';
import { useOrderNotifications, OrderNotification } from './OrderNotificationProvider';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function OrderToastItem({ notif }: { notif: OrderNotification }) {
  const { dismissNotification } = useOrderNotifications();
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => dismissNotification(notif.id), 12000);
    return () => clearTimeout(t);
  }, [notif.id, dismissNotification]);

  return (
    <div
      className="flex items-start gap-3 bg-white border border-neutral-200 shadow-xl rounded-xs p-4 cursor-pointer group w-80 animate-in slide-in-from-right-4 duration-300"
      onClick={() => {
        dismissNotification(notif.id);
        router.push('/admin/orders');
      }}
      role="button"
      aria-label={`New order from ${notif.customer_name}`}
    >
      <div className="w-9 h-9 rounded-full bg-[#FF55D2]/10 border border-[#FF55D2]/30 flex items-center justify-center shrink-0">
        <ShoppingBag className="w-4 h-4 text-[#FF55D2]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#FF55D2]">New Order</span>
        </div>
        <p className="text-xs font-semibold text-[#1A1A1A] truncate">#{notif.order_number}</p>
        <p className="text-xs text-neutral-600 truncate">{notif.customer_name}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs font-bold text-[#1A1A1A]">Rs. {notif.total.toLocaleString()}</span>
          <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
            <Clock className="w-3 h-3" />{timeAgo(notif.created_at)}
          </span>
        </div>
        <p className="text-[10px] text-neutral-400 mt-1">{notif.item_count} item{notif.item_count !== 1 ? 's' : ''} · Tap to view</p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id); }}
        className="shrink-0 text-neutral-300 hover:text-neutral-600 transition-colors mt-0.5"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function OrderToastContainer() {
  const { notifications } = useOrderNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 items-end pointer-events-none">
      {notifications.slice(0, 3).map((notif) => (
        <div key={notif.id} className="pointer-events-auto">
          <OrderToastItem notif={notif} />
        </div>
      ))}
    </div>
  );
}
