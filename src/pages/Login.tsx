import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result === true) {
        console.log("Login successful");
        navigate("/");
      } else if (result === "pending") {
        setLoginError("Your account is pending approval by an administrator");
      } else {
        setLoginError("Invalid email or password");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      setLoginError(error instanceof Error ? error.message : "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError("");
    setRegistrationSuccess(false);
    setIsLoading(true);
    
    if (!email || !password || !username) {
      setRegistrationError("All fields are required");
      setIsLoading(false);
      return;
    }
    
    try {
      // Fix parameter order to match AuthContext register function
      const result = await register(email, username, password);
      if (result === "pending") {
        setRegistrationSuccess(true);
        setUsername("");
        setEmail("");
        setPassword("");
      } else if (!result) {
        setRegistrationError("Email already in use");
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
      setRegistrationError(error instanceof Error ? error.message : "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-2">Account Access</h1>
      <p className="text-muted-foreground mb-6">
        Login or create an account to access TechSuptet support resources.
      </p>
      
      <Tabs defaultValue="login">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
        
          </form>
        </TabsContent>
        
        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {registrationError && (
              <p className="text-red-500 text-sm">{registrationError}</p>
            )}
            
            {registrationSuccess && (
              <p className="text-green-500 text-sm">
                Registration successful! Your account is pending approval. Once approved, you'll be able to login.
              </p>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </main>
  );
}