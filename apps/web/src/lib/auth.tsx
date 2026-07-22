'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from './api';
import type { AuthUser, CompanyChoice, TokenPair } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, companyId?: string) => Promise<CompanyChoice | null>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  taxNumber: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await api.get<AuthUser>('/auth/me');
      setUser(profile);
    } catch {
      setUser(null);
      tokenStore.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const login = useCallback(
    async (email: string, password: string, companyId?: string) => {
      const result = await api.post<TokenPair | CompanyChoice>(
        '/auth/login',
        { email, password, companyId },
        { auth: false },
      );
      if ('companies' in result) {
        return result;
      }
      tokenStore.set(result);
      await loadProfile();
      return null;
    },
    [loadProfile],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await api.post<TokenPair>('/auth/register', input, { auth: false });
      tokenStore.set(result);
      await loadProfile();
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefresh();
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }, { auth: false }).catch(() => undefined);
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (resource: string, action: string) => {
      if (!user) return false;
      if (user.isSuperAdmin) return true;
      return user.permissions.includes(`${resource}:${action}`);
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshProfile: loadProfile, hasPermission }),
    [user, isLoading, login, register, logout, loadProfile, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
