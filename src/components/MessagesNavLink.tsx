"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { messages as messagesApi } from "@/lib/api";

type Props = {
  className?: string;
  mobile?: boolean;
};

export function MessagesNavLink({ className = "", mobile = false }: Props) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setTotalUnread(0);
      return;
    }
    const fetchUnread = () => {
      messagesApi.getUnreadCount().then((res) => setTotalUnread(res.totalUnread)).catch(() => setTotalUnread(0));
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const active = pathname === "/messages";

  if (mobile) {
    return (
      <Link
        href="/messages"
        className="flex flex-1 flex-col items-center gap-0.5 text-[10px]"
      >
        <span className="relative inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
          {totalUnread > 0 && (
            <span className="absolute -right-1.5 -top-1 min-w-[14px] rounded-full bg-amber-500 px-1 py-0.5 text-[9px] font-bold leading-none text-slate-950">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </span>
        <span className="truncate">Messages</span>
      </Link>
    );
  }

  return (
    <Link
      href="/messages"
      className={`relative inline-flex items-center text-xs font-medium uppercase tracking-[0.18em] ${active ? "text-sky-100" : "text-slate-400 hover:text-slate-100"} ${className}`}
    >
      Messages
      {totalUnread > 0 && (
        <span className="ml-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-950">
          {totalUnread > 99 ? "99+" : totalUnread}
        </span>
      )}
    </Link>
  );
}
