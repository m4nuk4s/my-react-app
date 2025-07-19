import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { initializeSampleData } from '@/utils/sampleData';
import { supabase, User, UserWithPassword, setupSupabaseSchema, ensureAdminUser } from '@/lib/supabase';
import { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';
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
        // Import the database fixes dynamically
        const { applyUserRegistrationFixes } = await import('../lib/apply-db-fixes');
        
        // Setup database schema
        await setupSupabaseSchema();
        
        // Ensure admin user exists
        await ensureAdminUser();
        
        // Apply specific fixes for user registration
        const fixResult = await applyUserRegistrationFixes();
        console.log('User registration fixes applied:', fixResult);
        
        // Fix any other database schema issues
        await fixAllDatabaseIssues();
        
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
              isAdmin: userData.isadmin, // Using lowercase column name
              isApproved: userData.isapproved // Using lowercase column name
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
          if (userData.isadmin || userData.isapproved) { // Using lowercase column names
            setUser({
              id: userData.id,
              email: userData.email,
              username: userData.username,
              isAdmin: userData.isadmin, // Using lowercase column name
              isApproved: userData.isapproved // Using lowercase column name
            });
            
            // Initialize sample data when admin logs in
            if (userData.isadmin) { // Using lowercase column name
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
      console.log("Starting user registration process...");
      
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
        console.error("Supabase auth signup error:", signUpError);
        throw signUpError;
      }

      console.log("Supabase auth sign up successful:", signUpData);

      if (signUpData.user) {
        // Debug the user ID
        console.log("New user ID:", signUpData.user.id);
        
        // Create user record in the users table
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert({
            id: signUpData.user.id,
            email,
            username,
            isadmin: false, // Using lowercase column name
            isapproved: false // Using lowercase column name - New users need admin approval
          })
          .select();

        if (insertError) {
          console.error("Supabase users table insert error:", insertError);
          // Don't throw here, try direct RPC call
          
          // Try alternative approach using direct SQL (RPC)
          const { error: rpcError } = await supabase.rpc('execute_sql', { 
            sql_query: `
              INSERT INTO users (id, email, username, isadmin, isapproved) 
              VALUES ('${signUpData.user.id}', '${email}', '${username}', false, false)
            `
          });
          
          if (rpcError) {
            console.error("Supabase RPC insert error:", rpcError);
            throw rpcError;
          } else {
            console.log("User inserted via RPC successfully");
          }
        } else {
          console.log("User inserted successfully:", insertData);
        }
        
        // Always update localStorage as fallback
        try {
          const users: UserWithPassword[] = JSON.parse(localStorage.getItem('users') || '[]');
          
          const newUser: UserWithPassword = {
            id: signUpData.user.id,
            email,
            username,
            password, // Store password in localStorage for fallback
            isAdmin: false,
            isApproved: false, // New users need admin approval
          };
          
          localStorage.setItem('users', JSON.stringify([...users, newUser]));
          console.log("User also saved to localStorage");
        } catch (localError) {
          console.error("Failed to save to localStorage:", localError);
          // Don't fail if localStorage fails
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
          console.log("Notification email sent successfully");
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
        console.log("User saved to localStorage as fallback");
        
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