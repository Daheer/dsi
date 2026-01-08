import { create } from 'zustand';
import type { User } from '@/types';
import { usersApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Simple store without persist middleware to avoid conflicts
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setToken: (token: string) => {
    // Store in localStorage directly
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
    set({ token, isAuthenticated: true });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth-storage');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  fetchUser: async () => {
    try {
      const user = await usersApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      get().logout();
    }
  },

  initialize: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    
    const token = localStorage.getItem('access_token');
    if (token) {
      set({ token, isAuthenticated: true });
      await get().fetchUser();
    } else {
      set({ isLoading: false });
    }
  },
}));
