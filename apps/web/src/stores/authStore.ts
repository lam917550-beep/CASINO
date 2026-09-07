import { create } from 'zustand';

interface User {
  id: string;
  telegramId: string;
  username: string;
  displayName: string;
  gameUsername: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  rank: string;
  coins: number;
  gems: number;
  tickets: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('auth_token'),
  user: null,
  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ token: null, user: null });
  },
}));
