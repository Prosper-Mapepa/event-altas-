const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("eventatlas_token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      data?.message ?? data?.error ?? "Request failed",
      res.status,
      data
    );
  }

  return data as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Auth
export type AuthUser = { id: string; email: string; name: string | null; role?: string };
export type AuthResponse = { user: AuthUser; token: string; expiresIn: string };

export const auth = {
  signUp: (body: { email: string; password: string; name?: string; role?: "explorer" | "business" | "admin" }) =>
    api<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  signIn: (body: { email: string; password: string }) =>
    api<AuthResponse>("/auth/signin", { method: "POST", body: JSON.stringify(body) }),
  me: () => api<{ user: AuthUser }>("/auth/me"),
  forgotPassword: (body: { email: string }) =>
    api<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  resetPassword: (body: { token: string; newPassword: string }) =>
    api<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// Events
export type ApiEvent = {
  id: string;
  name: string;
  category: string;
  location: string;
  distance: string;
  time: string;
  attendees: string;
  price: string;
  highlight: string;
  lat: number;
  lng: number;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
};

export type ApiEventDetail = ApiEvent & {
  description?: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  host?: { id: string; name: string | null; role: string } | null;
  tiers: Array<{ name: string; description?: string; price: number }>;
};

export const events = {
  getNearby: (params?: { lat?: number; lng?: number; radiusKm?: number; category?: string; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.lat != null) sp.set("lat", String(params.lat));
    if (params?.lng != null) sp.set("lng", String(params.lng));
    if (params?.radiusKm != null) sp.set("radiusKm", String(params.radiusKm));
    if (params?.category) sp.set("category", params.category);
    if (params?.limit != null) sp.set("limit", String(params.limit));
    const q = sp.toString();
    return api<{ events: ApiEvent[] }>(`/events/nearby${q ? `?${q}` : ""}`);
  },
  getById: (id: string) => api<ApiEventDetail>(`/events/${id}`),
  create: (body: {
    name: string;
    category: string;
    location: string;
    lat: number;
    lng: number;
    startAt: string;
    endAt?: string;
    capacity?: number;
    highlight?: string;
    description?: string;
    priceFrom?: number;
    priceTo?: number;
    imageUrl?: string;
    imageUrls?: string[];
    tiers?: Array<{ name: string; description?: string; price: number }>;
  }) =>
    api<{ id: string }>("/events", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<{
    name: string;
    category: string;
    location: string;
    lat: number;
    lng: number;
    startAt: string;
    endAt: string;
    capacity: number;
    highlight: string;
    description: string;
    priceFrom: number;
    priceTo: number;
    imageUrl: string;
    imageUrls: string[];
    tiers: Array<{ name: string; description?: string; price: number }>;
    status: string;
  }>) =>
    api<{ id: string }>(`/events/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  getPending: () => api<{ events: unknown[] }>("/events/pending"),
};

// Users
export const users = {
  getMe: () => api<{ user: AuthUser }>("/users/me"),
  updateMe: (body: { name?: string; email?: string }) =>
    api<{ user: AuthUser }>("/users/me", { method: "PATCH", body: JSON.stringify(body) }),
};

// Upload (multipart - use FormData, no JSON Content-Type)
export async function uploadEventImage(file: File): Promise<{ url: string }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("eventatlas_token") : null;
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/upload/events/image`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }
  );
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error ?? "Upload failed", res.status, data);
  return data;
}

// Tickets
export type ApiTicket = {
  id: string;
  eventId: string;
  eventName: string;
  eventLocation: string;
  eventTime: string;
  tier: string;
  price: number;
  quantity: number;
  status: string;
};

// Engagement: saved events, RSVP, follow
export const engagement = {
  saveEvent: (eventId: string) =>
    api<{ saved: boolean }>("/engagement/saved", { method: "POST", body: JSON.stringify({ eventId }) }),
  unsaveEvent: (eventId: string) =>
    api<{ saved: boolean }>(`/engagement/saved/${eventId}`, { method: "DELETE" }),
  getSaved: () =>
    api<{ saved: Array<{ id: string; name: string; category: string; location: string; startAt: string; imageUrl?: string; attendees: number; priceFrom?: number; priceTo?: number; status: string; savedAt: string }> }>(
      "/engagement/saved"
    ),
  rsvp: (eventId: string, status?: "going" | "interested") =>
    api<{ rsvp: boolean; status: string }>("/engagement/rsvp", {
      method: "POST",
      body: JSON.stringify({ eventId, status: status ?? "going" }),
    }),
  unrsvp: (eventId: string) =>
    api<{ rsvp: boolean }>(`/engagement/rsvp/${eventId}`, { method: "DELETE" }),
  getRsvps: () =>
    api<{ rsvps: Array<{ id: string; name: string; category: string; location: string; startAt: string; imageUrl?: string; attendees: number; priceFrom?: number; priceTo?: number; status: string; rsvpStatus: string; rsvpAt: string }> }>(
      "/engagement/rsvp"
    ),
  checkEvent: (eventId: string) =>
    api<{ saved: boolean; rsvp: "going" | "interested" | null }>(`/engagement/check/${eventId}`),
  follow: (userId: string) =>
    api<{ following: boolean }>("/engagement/follow", { method: "POST", body: JSON.stringify({ userId }) }),
  unfollow: (userId: string) =>
    api<{ following: boolean }>(`/engagement/follow/${userId}`, { method: "DELETE" }),
  getFollowing: () =>
    api<{ following: Array<{ id: string; name: string | null; email: string; role: string }> }>(
      "/engagement/follow"
    ),
  checkFollow: (userId: string) =>
    api<{ following: boolean }>(`/engagement/follow/check/${userId}`),
};

// Dashboards
export const dashboard = {
  explorer: () =>
    api<{
      stats: { savedEvents: number; rsvps: number; following: number; tickets: number };
      upcomingRsvps: Array<unknown>;
      savedEvents: Array<unknown>;
    }>("/dashboard/explorer"),
  business: () =>
    api<{
      stats: { totalEvents: number; approved: number; pending: number; drafts: number; rejected: number; totalAttendees: number; totalTickets: number; rsvps: number; followers: number };
      recentEvents: Array<unknown>;
    }>("/dashboard/business"),
  admin: () =>
    api<{
      stats: { totalUsers: number; totalEvents: number; pendingEvents: number; totalTickets: number; totalRsvps: number };
      usersByRole: Record<string, number>;
      eventsByStatus: Record<string, number>;
      recentUsers: Array<{ id: string; email: string; name: string | null; role: string; createdAt: string; updatedAt: string }>;
      pendingList: Array<unknown>;
      approvedList: Array<unknown>;
    }>("/dashboard/admin"),
};

export const tickets = {
  getMyTickets: () => api<{ tickets: ApiTicket[] }>("/tickets"),
  createOrder: (body: { eventId: string; items: Array<{ tier: string; price: number; quantity: number }> }) =>
    api<{ orderId: string; tickets: Array<{ id: string; eventId: string; tier: string; quantity: number }> }>(
      "/tickets",
      { method: "POST", body: JSON.stringify(body) }
    ),
};

// Messages (real-time: explorer ↔ business, business ↔ admin)
export type ApiMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: { id: string; name: string | null; email: string };
};

export type ApiConversationSummary = {
  id: string;
  otherUser: { id: string; name: string | null; email: string; role: string };
  lastMessage: { id: string; content: string; senderId: string; createdAt: string } | null;
  updatedAt: string;
  unreadCount: number;
};

export const messages = {
  getAdmins: () => api<{ admins: Array<{ id: string; name: string | null; email: string }> }>("/messages/admins"),
  getUnreadCount: () => api<{ totalUnread: number }>("/messages/unread-count"),
  getConversations: () =>
    api<{ conversations: ApiConversationSummary[]; totalUnread: number }>("/messages/conversations"),
  getOrCreateConversation: (otherUserId: string) =>
    api<{ conversation: { id: string; otherUser: { id: string; name: string | null; email: string; role: string }; updatedAt: string } }>(
      "/messages/conversations",
      { method: "POST", body: JSON.stringify({ otherUserId }) }
    ),
  getConversation: (id: string) =>
    api<{ conversation: { id: string; otherUser: { id: string; name: string | null; email: string; role: string }; updatedAt: string } }>(
      `/messages/conversations/${id}`
    ),
  getMessages: (conversationId: string, limit?: number) =>
    api<{ messages: ApiMessage[] }>(
      `/messages/conversations/${conversationId}/messages${limit != null ? `?limit=${limit}` : ""}`
    ),
  sendMessage: (conversationId: string, content: string) =>
    api<{ message: ApiMessage }>(`/messages/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};

/** Base URL for Socket.io (same host as API, no /api path). */
export function getSocketUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return base.replace(/\/api\/?$/, "");
}
