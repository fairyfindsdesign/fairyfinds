'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/lib/types';

export interface OrderNotification {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  item_count: number;
  created_at: string;
}

interface OrderNotificationContextValue {
  unreadCount: number;
  notifications: OrderNotification[];
  latestOrder: Order | null;
  dismissNotification: (id: string) => void;
  setUnreadCount: (n: number) => void;
  decrementUnread: () => void;
}

const OrderNotificationContext = createContext<OrderNotificationContextValue>({
  unreadCount: 0,
  notifications: [],
  latestOrder: null,
  dismissNotification: () => {},
  setUnreadCount: () => {},
  decrementUnread: () => {},
});

export function useOrderNotifications() {
  return useContext(OrderNotificationContext);
}

interface Props {
  children: React.ReactNode;
  initialUnreadCount?: number;
}

export default function OrderNotificationProvider({ children, initialUnreadCount = 0 }: Props) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const channelRef = useRef<any>(null);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const decrementUnread = useCallback(() => {
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const fireDesktopNotification = useCallback((notif: OrderNotification) => {
    if (typeof Notification === 'undefined') return;
    const perm = Notification.permission;
    if (perm === 'granted') {
      new Notification('New Fairy Finds Order', {
        body: `#${notif.order_number} · ${notif.customer_name} · Rs. ${notif.total.toLocaleString()}`,
        icon: '/logo.png',
        tag: notif.id,
      });
    } else if (perm === 'default') {
      const asked = localStorage.getItem('ff_notif_asked');
      if (!asked) {
        localStorage.setItem('ff_notif_asked', '1');
        Notification.requestPermission().then((p) => {
          if (p === 'granted') {
            new Notification('New Fairy Finds Order', {
              body: `#${notif.order_number} · ${notif.customer_name} · Rs. ${notif.total.toLocaleString()}`,
              icon: '/logo.png',
              tag: notif.id,
            });
          }
        });
      }
    }
  }, []);

  const playPing = useCallback(() => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.3);
      });
      setTimeout(() => ctx.close(), 1200);
    } catch {}
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel('fairy-finds-new-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload: any) => {
          const row = payload.new as any;
          const notif: OrderNotification = {
            id: row.id,
            order_number: row.order_number,
            customer_name: row.customer_name,
            total: Number(row.total),
            item_count: Array.isArray(row.items) ? row.items.length : 1,
            created_at: row.created_at,
          };
          setNotifications((prev) => [notif, ...prev].slice(0, 5));
          setLatestOrder(row as Order);
          setUnreadCount((c) => c + 1);
          playPing();
          fireDesktopNotification(notif);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playPing, fireDesktopNotification]);

  return (
    <OrderNotificationContext.Provider value={{ unreadCount, notifications, latestOrder, dismissNotification, setUnreadCount, decrementUnread }}>
      {children}
    </OrderNotificationContext.Provider>
  );
}
