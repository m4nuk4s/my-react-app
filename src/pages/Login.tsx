import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedWelcome from "@/components/auth/AnimatedWelcome";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BackVideo from "@/assets/wtpth/backvi.mp4";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(
    !localStorage.getItem('hasSeenWelcome')
  );
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const { login, register } = useAuth();

  const handleWelcomeComplete = () => {
    setShowWelcomeAnimation(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  // Clears all form fields and messages when switching tabs
  const handleTabChange = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setLoginError("");
    setRegistrationError("");
    setRegistrationSuccess(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setRegistrationError("");
    setRegistrationSuccess(false);
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result === true) {
        navigate(from, { replace: true });
      } else if (result === "pending") {
        setLoginError("Your account is pending approval by an administrator.");
      } else {
        setLoginError("Invalid email or password.");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setLoginError(`Login failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError("");
    setLoginError("");
    setRegistrationSuccess(false);
    setIsLoading(true);

    if (!email || !password || !username) {
      setRegistrationError("All fields are required.");
      setIsLoading(false);
      return;
    }
    if (username.length < 6) {
      setRegistrationError("Username must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setRegistrationError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(email, username, password);
      if (result === "pending") {
        setRegistrationSuccess(true);
        handleTabChange(); // Clear fields on success
      } else if (!result) {
        setRegistrationError("This email is already in use.");
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setRegistrationError(`Registration failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover object-center opacity-60"
          autoPlay loop muted playsInline
        >
          <source src={BackVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {showWelcomeAnimation ? (
        <AnimatedWelcome onContinue={handleWelcomeComplete} />
      ) : (
        <motion.div 
          className="w-full max-w-md space-y-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-6xl font-bold tracking-tight mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent drop-shadow-lg transition-all duration-300 hover:scale-105 cursor-default">
              Welcome
            </h1>
            <p className="text-sm text-white font-medium drop-shadow">
              Login or create an account to access Tech Support 
            </p>
          </motion.div>
          
          {location.state?.from && location.state.from !== '/' && (
            <motion.div variants={itemVariants}>
              <Alert variant="warning" className="bg-amber-50/70 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription>
                  You need to login to access <strong>{location.state.from}</strong>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 shadow-xl bg-card/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardDescription>
                  Access your tech support Center
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full" onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2">
                        <label htmlFor="login-email" className="text-sm font-medium flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          Email
                        </label>
                        <Input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="login-password" className="text-sm font-medium flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          Password
                        </label>
                        <Input
                          id="login-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      
                      {loginError && (
                        <Alert variant="destructive" className="text-red-600 bg-red-50/80 dark:bg-red-950/80 dark:text-red-400">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{loginError}</AlertDescription>
                        </Alert>
                      )}
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Signing In...
                          </span>
                        ) : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-5">
                      <div className="space-y-2">
                        <label htmlFor="register-username" className="text-sm font-medium flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          Username
                        </label>
                        <Input
                          id="register-username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="johnsmith"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="register-email" className="text-sm font-medium flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          Email
                        </label>
                        <Input
                          id="register-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="register-password" className="text-sm font-medium flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          Password
                        </label>
                        <Input
                          id="register-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          required
                        />
                      </div>
                      
                      {registrationError && (
                        <Alert variant="destructive" className="text-red-600 bg-red-50/80 dark:bg-red-950/80 dark:text-red-400">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{registrationError}</AlertDescription>
                        </Alert>
                      )}
                      
                      {registrationSuccess && (
                         <Alert variant="success" className="text-green-600 bg-green-50/80 dark:bg-green-950/80 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>Success! Your account is pending approval.</AlertDescription>
                        </Alert>
                      )}
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? (
                           <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Registering...
                          </span>
                        ) : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}