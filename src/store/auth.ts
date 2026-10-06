"use client";

import type { Address, User } from "@/types";
import { SEED } from "@/data/seed";
import { createPersisted, PREFIX } from "./persist";

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthState {
  users: User[];
  /** customer session */
  userId: string | null;
  /** back-office session, independent from the storefront session */
  adminId: string | null;
  remember: boolean;

  register: (input: RegisterInput) => Result<{ user: User }>;
  login: (email: string, password: string, remember: boolean) => Result<{ user: User }>;
  logout: () => void;
  adminLogin: (email: string, password: string) => Result<{ user: User }>;
  adminLogout: () => void;
  enforceSessionPolicy: () => void;

  updateProfile: (id: string, patch: Partial<Pick<User, "name" | "phone" | "email" | "gender" | "dateOfBirth" | "preferences">>) => Result;
  changePassword: (id: string, current: string, next: string) => Result;
  setUserStatus: (id: string, status: User["status"]) => void;

  addAddress: (userId: string, address: Omit<Address, "id">) => Address;
  updateAddress: (userId: string, address: Address) => void;
  deleteAddress: (userId: string, addressId: string) => void;
  setDefaultAddress: (userId: string, addressId: string) => void;
}

const normalize = (email: string) => email.trim().toLowerCase();
const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const markAlive = () => {
  try {
    sessionStorage.setItem(PREFIX + "alive", "1");
  } catch {
    /* ignore */
  }
};

function withUser(users: User[], id: string, fn: (u: User) => User) {
  return users.map((u) => (u.id === id ? fn(u) : u));
}

export const useAuthStore = createPersisted<AuthState>("auth", (set, get) => ({
  users: SEED.users,
  userId: null,
  adminId: null,
  remember: true,

  register: ({ name, email, phone, password }) => {
    const e = normalize(email);
    if (get().users.some((u) => u.email === e)) return { ok: false, error: "An account with this email already exists. Try signing in." };
    const user: User = {
      id: uid("usr"),
      name: name.trim(),
      email: e,
      phone: phone.trim(),
      password,
      role: "customer",
      status: "active",
      createdAt: new Date().toISOString(),
      addresses: [],
      preferences: { newsletter: true, orderUpdates: true, smsAlerts: true, offers: true },
    };
    set((s) => ({ users: [...s.users, user], userId: user.id, remember: true }));
    markAlive();
    return { ok: true, user };
  },

  login: (email, password, remember) => {
    const user = get().users.find((u) => u.email === normalize(email) && u.role === "customer");
    if (!user || user.password !== password) return { ok: false, error: "Email or password is incorrect." };
    if (user.status === "blocked") return { ok: false, error: "This account has been suspended. Please contact care@aadyam.in." };
    set({ userId: user.id, remember });
    markAlive();
    return { ok: true, user };
  },

  logout: () => set({ userId: null }),

  adminLogin: (email, password) => {
    const user = get().users.find((u) => u.email === normalize(email) && u.role === "admin");
    if (!user || user.password !== password) return { ok: false, error: "Invalid admin credentials." };
    set({ adminId: user.id });
    return { ok: true, user };
  },

  adminLogout: () => set({ adminId: null }),

  enforceSessionPolicy: () => {
    const s = get();
    if (s.userId && !s.remember) {
      let alive = false;
      try {
        alive = !!sessionStorage.getItem(PREFIX + "alive");
      } catch {
        /* ignore */
      }
      if (!alive) set({ userId: null });
    }
  },

  updateProfile: (id, patch) => {
    if (patch.email) {
      const e = normalize(patch.email);
      if (get().users.some((u) => u.id !== id && u.email === e)) return { ok: false, error: "That email is already in use." };
      patch = { ...patch, email: e };
    }
    set((s) => ({ users: withUser(s.users, id, (u) => ({ ...u, ...patch })) }));
    return { ok: true };
  },

  changePassword: (id, current, next) => {
    const user = get().users.find((u) => u.id === id);
    if (!user || user.password !== current) return { ok: false, error: "Your current password is incorrect." };
    set((s) => ({ users: withUser(s.users, id, (u) => ({ ...u, password: next })) }));
    return { ok: true };
  },

  setUserStatus: (id, status) => set((s) => ({ users: withUser(s.users, id, (u) => ({ ...u, status })) })),

  addAddress: (userId, address) => {
    const created: Address = { ...address, id: uid("adr") };
    set((s) => ({
      users: withUser(s.users, userId, (u) => {
        const makeDefault = created.isDefault || u.addresses.length === 0;
        const rest = makeDefault ? u.addresses.map((a) => ({ ...a, isDefault: false })) : u.addresses;
        return { ...u, addresses: [...rest, { ...created, isDefault: makeDefault }] };
      }),
    }));
    return created;
  },

  updateAddress: (userId, address) =>
    set((s) => ({
      users: withUser(s.users, userId, (u) => ({
        ...u,
        addresses: u.addresses.map((a) => {
          if (a.id === address.id) return address;
          return address.isDefault ? { ...a, isDefault: false } : a;
        }),
      })),
    })),

  deleteAddress: (userId, addressId) =>
    set((s) => ({
      users: withUser(s.users, userId, (u) => {
        const removed = u.addresses.find((a) => a.id === addressId);
        const remaining = u.addresses.filter((a) => a.id !== addressId);
        if (removed?.isDefault && remaining.length) remaining[0] = { ...remaining[0], isDefault: true };
        return { ...u, addresses: remaining };
      }),
    })),

  setDefaultAddress: (userId, addressId) =>
    set((s) => ({
      users: withUser(s.users, userId, (u) => ({ ...u, addresses: u.addresses.map((a) => ({ ...a, isDefault: a.id === addressId })) })),
    })),
}));
