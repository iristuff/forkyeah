// ─────────────────────────────────────────────────────────────
// hooks/useAuth.ts  —  Mock current user state + update functions
// In a real app this would talk to a backend/Supabase/Firebase
// ─────────────────────────────────────────────────────────────
import { useState, useCallback } from 'react';
import type { User } from '../types';
import { CURRENT_USER } from '../constants/data';

interface UseAuthReturn {
  user: User;
  isLoggedIn: boolean;
  updateUser: (partial: Partial<User>) => void;
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  updateXP: (newXP: number) => void;
  updateStreak: (newStreak: number) => void;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Generic partial update — lets any screen update any field
  const updateUser = useCallback((partial: Partial<User>) => {
    setUser(prev => ({ ...prev, ...partial }));
  }, []);

  const addFriend = useCallback((friendId: string) => {
    setUser(prev => ({
      ...prev,
      friends: prev.friends.includes(friendId)
        ? prev.friends
        : [...prev.friends, friendId],
    }));
  }, []);

  const removeFriend = useCallback((friendId: string) => {
    setUser(prev => ({
      ...prev,
      friends: prev.friends.filter(id => id !== friendId),
    }));
  }, []);

  const updateXP = useCallback((newXP: number) => {
    setUser(prev => ({ ...prev, xp: newXP }));
  }, []);

  const updateStreak = useCallback((newStreak: number) => {
    setUser(prev => ({ ...prev, streak: newStreak }));
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    // In production: clear tokens, navigate to auth screen
  }, []);

  return {
    user,
    isLoggedIn,
    updateUser,
    addFriend,
    removeFriend,
    updateXP,
    updateStreak,
    logout,
  };
}
