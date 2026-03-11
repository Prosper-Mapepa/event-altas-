"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { messages as messagesApi } from "@/lib/api";
import type { ApiConversationSummary, ApiMessage } from "@/lib/api";

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");
  const contactAdmin = searchParams.get("contact") === "admin";
  const [conversations, setConversations] = useState<ApiConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { onMessage, connected } = useSocket();

  const loadConversations = useCallback(async () => {
    try {
      const res = await messagesApi.getConversations();
      setConversations(res.conversations ?? []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function formatMessageTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dDate.getTime() === today.getTime()) {
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    if (dDate.getTime() === yesterday.getTime()) {
      return `Yesterday ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    }
    if (now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return d.toLocaleDateString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadConversations();
  }, [user, loadConversations]);

  // Open conversation with ?with=userId
  useEffect(() => {
    if (!user || !withUserId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await messagesApi.getOrCreateConversation(withUserId);
        if (cancelled) return;
        setSelectedId(res.conversation.id);
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === res.conversation.id);
          if (exists) return prev;
          return [
            {
              id: res.conversation.id,
              otherUser: res.conversation.otherUser,
              lastMessage: null,
              updatedAt: res.conversation.updatedAt,
              unreadCount: 0,
            },
            ...prev,
          ];
        });
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, withUserId]);

  // Contact admin: fetch admins, open conversation with first admin
  useEffect(() => {
    if (!user || user.role !== "business" || !contactAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await messagesApi.getAdmins();
        if (cancelled || !res.admins?.length) return;
        const firstAdmin = res.admins[0];
        const conv = await messagesApi.getOrCreateConversation(firstAdmin.id);
        if (cancelled) return;
        setSelectedId(conv.conversation.id);
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === conv.conversation.id);
          if (exists) return prev;
          return [
            {
              id: conv.conversation.id,
              otherUser: conv.conversation.otherUser,
              lastMessage: null,
              updatedAt: conv.conversation.updatedAt,
              unreadCount: 0,
            },
            ...prev,
          ];
        });
        window.history.replaceState({}, "", "/messages");
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, contactAdmin]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingChat(true);
    try {
      const res = await messagesApi.getMessages(conversationId);
      setChatMessages(res.messages ?? []);
    } catch {
      setChatMessages([]);
    } finally {
      setLoadingChat(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
    } else {
      setChatMessages([]);
    }
  }, [selectedId, loadMessages]);

  // Real-time: append message when received for current conversation
  useEffect(() => {
    return onMessage((payload: unknown) => {
      const msg = payload as { conversationId?: string; id?: string; senderId?: string; content?: string; createdAt?: string; sender?: { id: string; name: string | null; email: string } };
      if (msg?.conversationId === selectedId && msg.id && msg.senderId != null) {
        const newMsg: ApiMessage = {
          id: msg.id,
          conversationId: msg.conversationId ?? "",
          senderId: msg.senderId,
          content: msg.content ?? "",
          createdAt: msg.createdAt ?? new Date().toISOString(),
          sender: msg.sender,
        };
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
      if (msg?.conversationId) {
        loadConversations();
      }
    });
  }, [selectedId, onMessage, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!selectedId || !text || sending) return;
    setSending(true);
    try {
      const res = await messagesApi.sendMessage(selectedId, text);
      setChatMessages((prev) => [...prev, res.message]);
      setInput("");
      loadConversations();
    } catch {
      // show error?
    } finally {
      setSending(false);
    }
  };

  const selected = conversations.find((c) => c.id === selectedId);

  if (!user) {
    return (
      <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center gap-4 px-4">
        <p className="text-base text-slate-400">Sign in to use messages.</p>
        <Link href="/auth/sign-in" className="text-sky-400 hover:text-sky-300">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col md:flex-row">
      <div className="glow-orbit" />
      <div className="grain" />

      <aside className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/80 md:w-80 md:border-b-0 md:border-r md:border-slate-800/80">
        <div className="flex items-center justify-between border-b border-slate-700/80 px-4 py-3">
          <h1 className="text-lg font-semibold text-slate-50">Messages</h1>
          {connected && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          )}
        </div>
        <div className="max-h-[40vh] overflow-y-auto md:max-h-[calc(100vh-64px-60px)]">
          {loading ? (
            <div className="p-4 text-center text-sm text-slate-400">Loading…</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No conversations yet. Message a host from an event or contact admin from the business dashboard.
            </div>
          ) : (
            <ul className="divide-y divide-slate-800/60">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-slate-900/80 ${
                      selectedId === c.id ? "bg-slate-800/80" : ""
                    } ${c.unreadCount > 0 ? "bg-slate-900/60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-sm font-medium truncate ${c.unreadCount > 0 ? "font-semibold text-slate-50" : "text-slate-100"}`}>
                        {c.otherUser.name || c.otherUser.email}
                      </span>
                      {(c.lastMessage?.createdAt ?? c.updatedAt) && (
                        <span className="shrink-0 text-[11px] text-slate-500">
                          {formatMessageTime(c.lastMessage?.createdAt ?? c.updatedAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-slate-500">{c.otherUser.role}</span>
                      {c.unreadCount > 0 && (
                        <span className="rounded-full bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-950">
                          {c.unreadCount > 99 ? "99+" : c.unreadCount}
                        </span>
                      )}
                    </div>
                    {c.lastMessage && (
                      <span className={`truncate block text-xs ${c.unreadCount > 0 ? "text-slate-200 font-medium" : "text-slate-400"}`}>
                        {c.lastMessage.content}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className="relative z-10 flex flex-1 flex-col bg-slate-950/50">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <p className="text-base text-slate-500">Select a conversation or start a new one.</p>
            {user.role === "business" && (
              <Link
                href="/messages?contact=admin"
                className="rounded-xl bg-slate-800/80 px-4 py-2 text-sm font-medium text-sky-400 hover:bg-slate-700/80 hover:text-sky-300"
              >
                Contact admin
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-slate-700/80 px-4 py-3">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-slate-50">
                  {selected.otherUser.name || selected.otherUser.email}
                </span>
                <span className="text-xs text-slate-500">{selected.otherUser.role}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loadingChat ? (
                <div className="flex justify-center py-8 text-sm text-slate-400">Loading messages…</div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((m) => {
                    const isMe = m.senderId === user.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            isMe
                              ? "bg-sky-500/90 text-slate-50"
                              : "bg-slate-800/90 text-slate-100"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                          <p className={`mt-0.5 text-[10px] ${isMe ? "text-sky-100/80" : "text-slate-500"}`}>
                            {new Date(m.createdAt).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <div className="border-t border-slate-700/80 p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 rounded-xl border border-slate-600/80 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="rounded-xl bg-sky-500/90 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-opacity hover:bg-sky-400 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center">
        <p className="text-slate-400">Loading messages…</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
