import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  adminName: string;
  adminInitials: string;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authorized admin email whitelist
const AUTHORIZED_ADMIN_EMAILS = [
  'caryadmin@gmail.com',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkIsAdmin = (u: User | null): boolean => {
    if (!u) return false;
    const role = (u.user_metadata?.['role'] || u.app_metadata?.['role'] || '').toString().toLowerCase();
    if (role === 'admin' || role === 'operator' || role === 'superadmin') return true;
    if (u.email && AUTHORIZED_ADMIN_EMAILS.includes(u.email.toLowerCase())) return true;
    return false;
  };

  useEffect(() => {
    // 1. Fetch initial session
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!mounted) return;
      if (error) {
        console.error('[Auth] Error getting initial session:', error);
      }
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    }).catch((err) => {
      if (!mounted) return;
      console.error('[Auth] getSession failed:', err);
      setIsLoading(false);
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = useMemo(() => checkIsAdmin(user), [user]);

  const adminName = useMemo(() => {
    if (!user) return 'Admin';
    if (user.user_metadata?.['name']) return user.user_metadata['name'];
    if (user.user_metadata?.['full_name']) return user.user_metadata['full_name'];
    if (user.email) {
      const prefix = user.email.split('@')[0] || '';
      if (prefix.length > 0) {
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }
    }
    return 'Admin';
  }, [user]);

  const adminInitials = useMemo(() => {
    if (!adminName) return 'AD';
    const parts = adminName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return adminName.slice(0, 2).toUpperCase();
  }, [adminName]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password.trim(),
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Sign in failed: no user returned.' };
      }

      // Check if user has admin privileges
      if (!checkIsAdmin(data.user)) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Access denied: Your account does not have administrator privileges for Cary Mission Control.',
        };
      }

      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred during sign in.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Auth] Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        adminName,
        adminInitials,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
