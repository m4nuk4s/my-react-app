import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { initializeSampleData } from '@/utils/sampleData';
import { supabase, User, setupSupabaseSchema, ensureAdminUser } from '@/lib/supabase';
import emailjs from '@emailjs/browser';
import { fixAllDatabaseIssues } from '@/lib/databaseFixes';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean | "pending">;
  register: (email: string, username: string, password: string) => Promise<boolean | "pending">;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const { applyUserRegistrationFixes } = await import('../lib/apply-db-fixes');
        await setupSupabaseSchema();
        await ensureAdminUser();
        await applyUserRegistrationFixes();
        await fixAllDatabaseIssues();
      } catch (error) {
        console.error('Error initializing Supabase:', error);
      }
    };
    initializeSupabase();
  }, []);

// Inside AuthContext.tsx
useEffect(() => {
  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if we are currently in a recovery flow
      const isRecovering = window.location.search.includes('type=recovery');

      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData && (userData.isadmin || userData.isapproved)) {
          // ONLY set the user state if NOT in recovery mode
          // This prevents the protected routes from redirecting the user away
          if (!isRecovering) {
            setUser({
              id: userData.id,
              email: userData.email,
              username: userData.username,
              isAdmin: userData.isadmin,
              isApproved: userData.isapproved,
              role: userData.role
            });
          }
        } else {
          await supabase.auth.signOut();
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Session check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  checkSession();
}, []);

  const login = async (email: string, password: string) => {
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) return false;
      if (signInData.user) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', signInData.user.id).single();
        if (userData?.isadmin || userData?.isapproved) {
          setUser({
            id: userData.id,
            email: userData.email,
            username: userData.username,
            isAdmin: userData.isadmin,
            isApproved: userData.isapproved,
            role: userData.role
          });
          if (userData.isadmin) initializeSampleData();
          return true;
        } else {
          await supabase.auth.signOut();
          return "pending";
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (signUpError) throw signUpError;
      if (signUpData.user) {
        await supabase.from('users').insert({
          id: signUpData.user.id,
          email,
          username,
          isadmin: false,
          isapproved: false,
          role: 'client'
        });
        await supabase.auth.signOut();
        return "pending";
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // --- NEW RECOVERY METHODS ---
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?type=recovery`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, logout, resetPassword, updatePassword, 
      isAuthenticated: !!user, isAdmin: user?.isAdmin || false 
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};