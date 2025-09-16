import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "../lib/supabase";

// User type
type UserWithPassword = {
  id: string;
  username: string;
  email: string;
  password: string;
  isApproved?: boolean;
  role: "administrator" | "user" | "client";
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
  const [role, setRole] = useState<"administrator" | "user" | "client">("user");

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
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (userData) {
        setUsername(userData.username);
        setEmail(userData.email);
        setRole(userData.role || "user");
        return;
      }

      const storedUsers = localStorage.getItem("users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const localUserData = users.find((u: UserWithPassword) => u.id === userId);
        if (localUserData) {
          setUsername(localUserData.username);
          setEmail(localUserData.email);
          setRole(localUserData.role);
        } else {
          toast.error("User not found");
          navigate("/admin");
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
      navigate("/admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!username.trim()) return toast.error("Username is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Invalid email format");

    if (isNew) {
      if (!password) return toast.error("Password is required for new users");
      if (password !== confirmPassword) return toast.error("Passwords don't match");
    } else if (password && password !== confirmPassword) {
      return toast.error("Passwords don't match");
    }

    try {
      setIsLoading(true);

      // save the role exactly as chosen (administrator/user/client)
      const normalizedRole = role.toLowerCase();

      if (isNew) {
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { username },
          });

          if (signUpError) throw signUpError;

          if (signUpData.user) {
            const { error: insertError } = await supabase.from("users").insert({
              id: signUpData.user.id,
              email,
              username,
              role: normalizedRole,
              isapproved: true,
            });
            if (insertError) throw insertError;
          }
          toast.success("User created successfully in database!");
        } catch (supabaseError) {
          console.error("Supabase user creation failed:", supabaseError);
          console.log("Falling back to localStorage for user creation");
        }

        const storedUsers = localStorage.getItem("users") || "[]";
        const users = JSON.parse(storedUsers);
        const newUser: UserWithPassword = {
          id: Date.now().toString(),
          username,
          email,
          password,
          isApproved: true,
          role: role, // keep UI role in localStorage
        };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        toast.success("User created successfully!");
      } else {
        try {
          const { error: updateError } = await supabase
            .from("users")
            .update({ username, email, role: normalizedRole })
            .eq("id", id);
          if (updateError) throw updateError;

          if (password) {
            const { error: passwordError } = await supabase.auth.admin.updateUserById(id!, { password });
            if (passwordError) throw passwordError;
          }

          toast.success("User updated successfully in database!");
        } catch (supabaseError) {
          console.error("Supabase user update failed:", supabaseError);
        }

        const storedUsers = localStorage.getItem("users") || "[]";
        const users = JSON.parse(storedUsers);
        const updatedUsers = users.map((u: UserWithPassword) =>
          u.id === id
            ? { ...u, username, email, role, ...(password && { password }) }
            : u
        );
        localStorage.setItem("users", JSON.stringify(updatedUsers));
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

  if (isLoading) return <div className="container py-6">Loading...</div>;

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate("/admin")} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? "Create New User" : "Edit User"}</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin")}>Cancel</Button>
          <Button onClick={handleSaveUser} className="flex items-center gap-1">
            <Save className="h-4 w-4" /> Save User
          </Button>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isNew ? "New User Information" : "Edit User Information"}</CardTitle>
          <CardDescription>
            {isNew ? "Create a new user account" : "Update user information and permissions"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username*</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="email">Email Address*</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="password">{isNew ? "Password*" : "New Password (leave blank to keep current)"}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            {/* Improved Role Dropdown */}
            <div>
  <Label htmlFor="role" className="flex items-center gap-2 text-base font-semibold">
    <span className="text-blue-500">⚡</span> User Role*
  </Label>
  <select
    id="role"
    className="w-full mt-2 px-3 py-2 text-sm rounded-lg border 
               border-gray-300 dark:border-gray-600 
               bg-gray-50 dark:bg-gray-800 
               text-gray-900 dark:text-gray-100
               focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition"
    value={role}
    onChange={(e) =>
      setRole(e.target.value as "administrator" | "user" | "client")
    }
  >
    <option value="administrator">Administrator – Full access</option>
    <option value="user">User – Standard access</option>
    <option value="client">Client – Restricted access</option>
  </select>
  <p className="text-xs text-muted-foreground mt-2">
    Choose the appropriate role for this account
  </p>
</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserEditor;
