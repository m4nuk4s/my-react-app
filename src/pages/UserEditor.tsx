import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "../lib/supabase";

type UserWithPassword = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  password: string;
  isApproved?: boolean;
};

const UserEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const isNew = id === "new" || !id;

  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin, if not redirect to home
    if (!user || !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
      return;
    }

    // If editing an existing user, load their data
    if (!isNew && id) {
      loadUserData(id);
    } else {
      setIsLoading(false);
    }
  }, [user, isAdmin, navigate, isNew, id]);

  const loadUserData = async (userId: string): Promise<void> => {
    try {
      // Try to load from Supabase first
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error loading user from Supabase:", error);
        throw error; // Fall back to localStorage
      }
      
      if (userData) {
        console.log("User data loaded from Supabase:", userData);
        setUsername(userData.username);
        setEmail(userData.email);
        setIsUserAdmin(userData.isadmin); // Using lowercase column name
        return; // Successfully loaded from Supabase
      }
      
      // If not found in Supabase or error occurred, try localStorage
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const localUserData = users.find((u: UserWithPassword) => u.id === userId);
        
        if (localUserData) {
          console.log("User data loaded from localStorage:", localUserData);
          setUsername(localUserData.username);
          setEmail(localUserData.email);
          setIsUserAdmin(localUserData.isAdmin);
          // Don't set password for security reasons
        } else {
          toast.error("User not found");
          navigate("/admin");
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      
      // Final fallback to localStorage
      try {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const userData = users.find((u: UserWithPassword) => u.id === userId);
          
          if (userData) {
            setUsername(userData.username);
            setEmail(userData.email);
            setIsUserAdmin(userData.isAdmin);
          } else {
            toast.error("User not found");
            navigate("/admin");
          }
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        toast.error("Failed to load user data");
        navigate("/admin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async () => {
    // Basic validation
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // For new users, password is required
    if (isNew) {
      if (!password) {
        toast.error("Password is required for new users");
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }
    } else if (password && password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      setIsLoading(true);
      
      if (isNew) {
        // Try to create the user in Supabase first
        try {
          // Attempt to sign up user via Supabase auth
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { 
                username: username,
                isAdmin: isUserAdmin
              }
            }
          });
          
          if (signUpError) {
            console.error("Supabase auth user creation error:", signUpError);
            // Don't throw error, just log it and continue with localStorage
            console.log("Continuing with localStorage for user creation");
          } else if (signUpData.user) {
            console.log("User created in Supabase auth:", signUpData.user);
            
            // Try to create user in the users table
            try {
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: signUpData.user.id,
                  email,
                  username,
                  isadmin: isUserAdmin, // Using lowercase column name
                  isapproved: true // Auto-approve users created by admin
                });

              if (insertError) {
                console.error("Supabase users table insert error:", insertError);
                // Continue with localStorage if this fails
              } else {
                toast.success("User created successfully in database!");
              }
            } catch (insertError) {
              console.error("Error adding user to database table:", insertError);
            }
          }
        } catch (supabaseError) {
          console.error("Supabase user creation failed:", supabaseError);
          
          // Fall back to localStorage if Supabase fails
          console.log("Falling back to localStorage for user creation");
        }
        
        // Always update localStorage as fallback
        const storedUsers = localStorage.getItem('users') || '[]';
        const users = JSON.parse(storedUsers);
        
        // Create a new user in localStorage
        const newUser: UserWithPassword = {
          id: Date.now().toString(),
          username,
          email,
          isAdmin: isUserAdmin,
          password,
          isApproved: true // Auto-approve users created by admin
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        toast.success("User created successfully!");
      } else {
        // Try to update user in Supabase
        try {
          // Update user data in the users table
          const { error: updateError } = await supabase
            .from('users')
            .update({
              username,
              email,
              isadmin: isUserAdmin // Using lowercase column name
            })
            .eq('id', id);

          if (updateError) {
            console.error("Supabase user update error:", updateError);
            throw updateError;
          }

          // Update password if provided
          if (password) {
            const { error: passwordError } = await supabase.auth.admin.updateUserById(
              id,
              { password }
            );

            if (passwordError) {
              console.error("Supabase password update error:", passwordError);
              throw passwordError;
            }
          }

          toast.success("User updated successfully in database!");
        } catch (supabaseError) {
          console.error("Supabase user update failed:", supabaseError);
          // Fall back to localStorage if Supabase fails
        }
        
        // Always update localStorage as fallback
        const storedUsers = localStorage.getItem('users') || '[]';
        const users = JSON.parse(storedUsers);
        
        // Update existing user in localStorage
        const updatedUsers = users.map((u: UserWithPassword) => {
          if (u.id === id) {
            return {
              ...u,
              username,
              email,
              isAdmin: isUserAdmin,
              ...(password && { password }) // Only update password if provided
            };
          }
          return u;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        toast.success("User updated successfully!");
      }
      
      navigate("/admin");
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container py-6">Loading...</div>;
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? "Create New User" : "Edit User"}</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin")}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveUser} className="flex items-center gap-1">
            <Save className="h-4 w-4" /> Save User
          </Button>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isNew ? "New User Information" : "Edit User Information"}</CardTitle>
          <CardDescription>
            {isNew 
              ? "Create a new user account" 
              : "Update user information and permissions"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username*</Label>
              <Input 
                id="username" 
                placeholder="e.g., john_smith" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address*</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="e.g., john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="password">
                {isNew ? "Password*" : "New Password (leave blank to keep current)"}
              </Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="text-sm font-medium">Admin Privileges</h3>
                <p className="text-sm text-muted-foreground">
                  Allow this user to access the admin panel
                </p>
              </div>
              <Switch
                checked={isUserAdmin}
                onCheckedChange={setIsUserAdmin}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserEditor;