import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { initializeSampleData } from '@/utils/sampleData';
import { supabase, User, setupSupabaseSchema, ensureAdminUser } from '@/lib/supabase';
import emailjs from '@emailjs/browser';
import { fixAllDatabaseIssues } from '@/lib/databaseFixes';

// Note: We're importing apply-db-fixes dynamically in the useEffect to avoid circular dependencies

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean | "pending">;
  register: (email: string, username: string, password: string) => Promise<boolean | "pending">;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Supabase schema and admin user on component mount
  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const { applyUserRegistrationFixes } = await import('../lib/apply-db-fixes');
        await setupSupabaseSchema();
        await ensureAdminUser();
        const fixResult = await applyUserRegistrationFixes();
        console.log('User registration fixes applied:', fixResult);
        await fixAllDatabaseIssues();
        console.log('Supabase initialized successfully');
      } catch (error) {
        console.error('Error initializing Supabase:', error);
      }
    };

    initializeSupabase();
  }, []);

  // Check for authenticated session on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) throw userError;

          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              username: userData.username,
              isAdmin: userData.isadmin,
              isApproved: userData.isapproved
            });
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
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.log("Supabase auth error:", signInError);
        return false;
      }

      if (signInData.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', signInData.user.id)
          .single();

        if (userError) throw userError;

        if (userData) {
          if (userData.isadmin || userData.isapproved) {
            setUser({
              id: userData.id,
              email: userData.email,
              username: userData.username,
              isAdmin: userData.isadmin,
              isApproved: userData.isapproved
            });

            if (userData.isadmin) {
              initializeSampleData();
            }

            return true;
          } else {
            return "pending";
          }
        }
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      console.log("Starting user registration process...");

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (signUpError) {
        console.error("Supabase auth signup error:", signUpError);
        throw signUpError;
      }

      console.log("Supabase auth sign up successful:", signUpData);

      if (signUpData.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: signUpData.user.id,
            email,
            username,
            isadmin: false,
            isapproved: false
          });

        if (insertError) {
          console.error("Supabase users table insert error:", insertError);
          throw insertError;
        }

        try {
          await emailjs.send(
            'service_3nte2w8',
            'template_ynyayik',
            {
              name: username,
              email: email,
              phone: 'N/A',
              requestType: 'New User Registration - Pending Approval',
              subject: 'New User Registration Pending Approval - ' + username,
              message: `A new user has registered on TechSuptet and is awaiting admin approval:\n\nUsername: ${username}\nEmail: ${email}\n\nPlease log into the admin panel to approve this account.`,
              deviceModel: 'N/A',
              osVersion: 'N/A',
            },
            '_FaISaFJ5SBxVUtzl'
          );
          console.log("Notification email sent successfully");
        } catch (emailError) {
          console.log('Email notification failed:', emailError);
        }

        return "pending";
      }

      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
