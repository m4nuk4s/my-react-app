import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import WelcomePreview from "@/components/auth/WelcomePreview";
import AnimatedWelcome from "@/components/auth/AnimatedWelcome";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const { login, register } = useAuth();

  useEffect(() => {
    // Check if the user has already seen the welcome animation
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcomeAnimation(false);
    }
  }, []);

  const handleWelcomeComplete = () => {
    console.log("handleWelcomeComplete called");
    // Force update with a setTimeout to break out of any React rendering cycles
    window.setTimeout(() => {
      setShowWelcomeAnimation(false);
      console.log("setShowWelcomeAnimation(false) executed after timeout");
    }, 0);
    // Already saved in the AnimatedWelcome component as a backup
    localStorage.setItem('hasSeenWelcome', 'true');
    console.log("localStorage updated with hasSeenWelcome");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result === true) {
        console.log("Login successful");
        navigate(from);
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
    <>
      {showWelcomeAnimation && (
        <AnimatedWelcome onContinue={handleWelcomeComplete} />
      )}
      <main className="container max-w-md mx-auto py-10">
        <h1 className="text-2xl font-bold mb-2">Account Access</h1>
        <div className="mb-6">
          <p className="text-muted-foreground mb-2">
            Login or create an account to access TechSuptet support resources.
          </p>
          {location.state?.from && location.state.from !== '/' && (
            <p className="text-sm p-3 border rounded-md bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
              You need to login to access <strong>{location.state.from}</strong>
            </p>
          )}
        </div>
        
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
        {/* Welcome Preview Component */}
        <WelcomePreview />
      </main>
    </>
  );
}