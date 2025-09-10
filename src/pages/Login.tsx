import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";


import AnimatedWelcome from "@/components/auth/AnimatedWelcome";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Panel from "@/assets/wtpth/panel.jpg";
import BackVideo from "@/assets/wtpth/backvi.mp4"; // ⬅️ add this next to Panel import

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
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
    // Force update with a setTimeout to break out of any React rendering cycles
    window.setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 0);
    // Already saved in the AnimatedWelcome component as a backup
    localStorage.setItem('hasSeenWelcome', 'true');
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

  if (username.length < 6) {
    setRegistrationError("Username must be at least 6 characters long");
    setIsLoading(false);
    return;
  }

  if (password.length < 6) {
    setRegistrationError("Password must be at least 6 characters long");
    setIsLoading(false);
    return;
  }

  try {
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
    setRegistrationError(
      error instanceof Error ? error.message : "An error occurred during registration"
    );
  } finally {
    setIsLoading(false);
  }
};


  // Animation variants for elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      {showWelcomeAnimation && (
        <AnimatedWelcome onContinue={handleWelcomeComplete} />
      )}
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
       <div className="absolute inset-0 z-0">
  <video
    className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
    autoPlay
    loop
    muted
    playsInline
  >
    <source src={BackVideo} type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 mix-blend-multiply" />
  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
</div>
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
          
          {/* Redirect notice */}
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
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Register
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          Email
                        </label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-primary/20 focus-visible:ring-primary/30"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          Password
                        </label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="border-primary/20 focus-visible:ring-primary/30"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      
                      {loginError && (
                        <div className="flex items-start gap-2 text-red-500 text-sm p-2 rounded-md bg-red-50/50 dark:bg-red-950/50">
                          <AlertCircle className="h-4 w-4 mt-0.5" />
                          <span>{loginError}</span>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className={cn(
                          "w-full relative overflow-hidden transition-all",
                          "bg-gradient-to-r from-primary to-purple-600",
                          "hover:from-purple-600 hover:to-primary"
                        )}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging in...
                          </span>
                        ) : "Sign in"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          Username
                        </label>
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="border-primary/20 focus-visible:ring-primary/30"
                          placeholder="johnsmith"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          Email
                        </label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-primary/20 focus-visible:ring-primary/30"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          Password
                        </label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="border-primary/20 focus-visible:ring-primary/30"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      
                      {registrationError && (
                        <div className="flex items-start gap-2 text-red-500 text-sm p-2 rounded-md bg-red-50/50 dark:bg-red-950/50">
                          <AlertCircle className="h-4 w-4 mt-0.5" />
                          <span>{registrationError}</span>
                        </div>
                      )}
                      
                      {registrationSuccess && (
                        <div className="flex items-start gap-2 text-green-500 text-sm p-2 rounded-md bg-green-50/50 dark:bg-green-950/50">
                          <CheckCircle2 className="h-4 w-4 mt-0.5" />
                          <span>Registration successful! Your account is pending approval. Once approved, you'll be able to login.</span>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className={cn(
                          "w-full relative overflow-hidden transition-all",
                          "bg-gradient-to-r from-primary to-purple-600",
                          "hover:from-purple-600 hover:to-primary"
                        )}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Registering...
                          </span>
                        ) : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              {/* Footer removed as requested */}
            </Card>
          </motion.div>

          {/* Welcome Preview removed as requested */}
        </motion.div>
      </div>
    </>
  );
}