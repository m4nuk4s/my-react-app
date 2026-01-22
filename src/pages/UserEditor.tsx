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
  const [userRole, setUserRole] = useState("user");
  const [editStock, setEditStock] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
      return;
    }

    if (!isNew && id) {
      loadUserData(id);
    } else {
      setIsLoading(false);
    }
  }, [user, isAdmin, navigate, isNew, id]);

  const loadUserData = async (userId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, username, email, isadmin, role, editstock')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (userData) {
        setUsername(userData.username);
        setEmail(userData.email);
        setIsUserAdmin(userData.isadmin);
        setUserRole(userData.role || "user");
		setEditStock(userData.editstock || false); // Set the state
      } else {
        toast.error("User not found in database.");
        navigate("/admin");
      }
    } catch (error: any) {
      console.error("Error loading user from Supabase:", error);
      toast.error("Failed to load user data: " + error.message);
      navigate("/admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!username.trim() || !email.trim()) {
      toast.error("Username and Email are required.");
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setIsLoading(true);
    try {
      if (isNew) {
        if (!password) {
          toast.error("Password is required for new users.");
          setIsLoading(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { username }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (signUpData.user) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: signUpData.user.id,
              email,
              username,
              isadmin: isUserAdmin,
              role: userRole,
              isapproved: true,
			  editstock: editStock // Added here
			  
            });

          if (insertError) {
            throw insertError;
          }

          toast.success("User created successfully!");
          navigate("/admin");
        }
      } else {
        const updates: any = {
          username,
          email,
          isadmin: isUserAdmin,
          role: userRole,
		  editstock: editStock, // Added here
        };

        const { error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', id);

        if (updateError) {
          throw updateError;
        }

        if (password) {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(
            id,
            { password }
          );
          if (passwordError) {
            throw passwordError;
          }
        }

        toast.success("User updated successfully!");
        navigate("/admin");
      }
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user: " + error.message);
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
          <Button onClick={handleSaveUser} className="flex items-center gap-1" disabled={isLoading}>
            <Save className="h-4 w-4" /> Save User
          </Button>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="space-y-6">
          <div className="space-y-4 pt-6">
            <h2 className="text-xl font-bold">User Information</h2>
            <div className="grid gap-2">
              <Label htmlFor="username">Username*</Label>
              <Input 
                id="username" 
                placeholder="e.g., john_smith" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address*</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="e.g., john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4 pt-6">
            <h2 className="text-xl font-bold">Credentials</h2>
            <div className="grid gap-2">
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
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Permissions</h2>
              <span className="text-sm font-semibold text-muted-foreground">
                Current Role: {userRole}
              </span>
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
			{/* NEW: Edit Stock Switch */}
  <div className="flex items-center justify-between pt-2">
    <div>
      <h3 className="text-sm font-medium">Edit Stock</h3>
      <p className="text-sm text-muted-foreground">
        Allow this user to modify inventory levels
      </p>
    </div>
    <Switch
      checked={editStock}
      onCheckedChange={setEditStock}
    />
  </div>
            <div className="grid gap-2 pt-4">
              <Label htmlFor="role">User Role</Label>
              <select
                id="role"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-background text-foreground"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserEditor;