import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { initializeSampleData } from '@/utils/sampleData';
import { supabase, User, UserWithPassword, setupSupabaseSchema, ensureAdminUser } from '@/lib/supabase';
import { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';
import emailjs from '@emailjs/browser';

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
        // Setup database schema
        await setupSupabaseSchema();
        // Ensure admin user exists
        await ensureAdminUser();
        console.log('Supabase initialized successfully');
      } catch (error) {
        console.error('Error initializing Supabase:', error);
        // Fallback to localStorage if Supabase setup fails
        initializeFallbackData();
      }
    };

    // Always initialize localStorage fallback first to ensure data is available
    initializeFallbackData();
    // Then try to initialize Supabase if available
    initializeSupabase();
  }, []);
  
  // Check for authenticated session on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          // Fetch user details from the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userError) {
            throw userError;
          }
          
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              username: userData.username,
              isAdmin: userData.isAdmin,
              isApproved: userData.isApproved
            });
          }
        } else {
          // Fallback to localStorage if no Supabase session
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        // Fallback to localStorage if Supabase fails
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Save user to localStorage as fallback whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Initialize fallback local data if needed
  const initializeFallbackData = () => {
    const users = localStorage.getItem('users');
    if (!users) {
      const initialUsers: UserWithPassword[] = [
        {
          id: '1',
          email: 'admin@techsuptet.com',
          username: 'admin',
          password: 'admin123', // In a real app, this would be hashed
          isAdmin: true,
          isApproved: true
        },
      ];
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
    
    // Initialize sample data for drivers and guides
    initializeSampleData();
  };

  const login = async (email: string, password: string) => {
    try {
      // Try Supabase authentication first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.log("Supabase auth error:", signInError);
        
        // Fallback to localStorage if Supabase auth fails
        const users: UserWithPassword[] = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find(
          (u) => u.email === email && u.password === password
        );

        if (foundUser) {
          if (foundUser.isAdmin || foundUser.isApproved) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            
            // Initialize sample data when admin logs in
            if (foundUser.isAdmin) {
              initializeSampleData();
            }
            
            return true;
          } else {
            // User exists but not approved
            return "pending";
          }
        }
        return false;
      }

      if (signInData.user) {
        // Fetch user details from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', signInData.user.id)
          .single();

        if (userError) {
          throw userError;
        }

        if (userData) {
          if (userData.isAdmin || userData.isApproved) {
            setUser({
              id: userData.id,
              email: userData.email,
              username: userData.username,
              isAdmin: userData.isAdmin,
              isApproved: userData.isApproved
            });
            
            // Initialize sample data when admin logs in
            if (userData.isAdmin) {
              initializeSampleData();
            }
            
            return true;
          } else {
            // User exists but not approved
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
      // Try Supabase authentication first
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (signUpData.user) {
        // Create user record in the users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: signUpData.user.id,
            email,
            username,
            password, // In a real app, this would be handled by Auth
            isAdmin: false,
            isApproved: false // New users need admin approval
          });

        if (insertError) {
          throw insertError;
        }
        
        // Send registration notification email
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
        } catch (emailError) {
          console.log('Email notification failed:', emailError);
          // Don't fail registration if email fails
        }
        
        return "pending";
      }
      
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      
      // Fallback to localStorage if Supabase fails
      try {
        const users: UserWithPassword[] = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if user already exists
        if (users.some((u) => u.email === email)) {
          return false;
        }
        
        const newUser: UserWithPassword = {
          id: Date.now().toString(),
          email,
          username,
          password,
          isAdmin: false,
          isApproved: false, // New users need admin approval
        };
        
        localStorage.setItem('users', JSON.stringify([...users, newUser]));
        
        // Send registration notification email
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
        } catch (emailError) {
          console.log('Email notification failed:', emailError);
          // Don't fail registration if email fails
        }
        
        return "pending";
      } catch (fallbackError) {
        console.error("Fallback registration error:", fallbackError);
        return false;
      }
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local user state
      setUser(null);
      localStorage.removeItem('user');
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