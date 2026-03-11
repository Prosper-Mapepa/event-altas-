"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { getSocketUrl } from "@/lib/api";

type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
  onMessage: (handler: (msg: unknown) => void) => () => void;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef<Set<(msg: unknown) => void>>(new Set());

  const onMessage = useCallback((handler: (msg: unknown) => void) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("eventatlas_token") : null;
    if (!token || !user?.id) {
      setSocket(null);
      setConnected(false);
      return;
    }

    const url = getSocketUrl();
    const s = io(url, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("message", (payload: unknown) => {
      handlersRef.current.forEach((h) => {
        try {
          h(payload);
        } catch (_) {}
      });
    });

    setSocket(s);
    return () => {
      s.close();
      setSocket(null);
      setConnected(false);
    };
  }, [user?.id]);

  const value: SocketContextValue = {
    socket,
    connected,
    onMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return ctx;
}
