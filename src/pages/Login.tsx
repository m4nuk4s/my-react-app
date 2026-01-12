import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import AnimatedWelcome from "@/components/auth/AnimatedWelcome";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// ✨ MODIFIED: Removed CheckCircle2, UserCheck is no longer needed directly. Custom SVG will be used.
import { Mail, Lock, User, AlertCircle, Clock, LogIn, UserPlus } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BackVideo from "@/assets/wtpth/backvi.mp4";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [showRegSuccessDialog, setShowRegSuccessDialog] = useState(false);

  // States to manage placeholders disappearing on click
  const [emailPlaceholder, setEmailPlaceholder] = useState("example@mail.com");
  const [passPlaceholder, setPassPlaceholder] = useState("••••••••");
  const [userPlaceholder, setUserPlaceholder] = useState("johnsmith");

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const { login, register } = useAuth();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcomeAnimation(false);
    }
  }, []);

const outlinePillButton =
  "relative rounded-md px-6 py-2 text-sm font-medium " +
  "border border-gray-300 dark:border-gray-700 " +
  "text-gray-900 dark:text-gray-100 bg-transparent " +
  "transition-all duration-300 ease-in-out transform " +
  "hover:bg-gray-100 dark:hover:bg-red-600/20 " +
  "focus:outline-none focus:ring-2 focus:ring-gray-400/40 focus:ring-offset-2 focus:ring-offset-transparent " +
  "before:absolute before:inset-0 before:rounded-md before:border-2 " +
  "before:border-red-500 dark:before:border-white " +
  "before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out " +
  "hover:before:opacity-100 " +
  "active:scale-95";

  
  const handleWelcomeComplete = () => {
    window.setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 0);
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
        setShowPendingDialog(true);
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
    setIsLoading(true);
    
    if (!email || !password || !username) {
      setRegistrationError("All fields are required");
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await register(email, username, password);
      if (result === "pending") {
        setShowRegSuccessDialog(true);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
      
      {/* Dialog for pending approval status on LOGIN */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Account Pending Approval
            </DialogTitle>
            <DialogDescription className="pt-2 text-left">
              Your account has been created but is still awaiting approval from an administrator.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      
      {/* ✨ NEW: Professional dialog for successful REGISTRATION with combined user and check icon */}
      <Dialog open={showRegSuccessDialog} onOpenChange={setShowRegSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center text-center p-4 pt-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            >
              <div className="relative w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="lucide lucide-user h-14 w-14 text-green-600"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute bottom-2 right-2 p-1 rounded-full bg-green-500 text-white shadow-lg"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="lucide lucide-check h-6 w-6"
                  >
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            <DialogTitle className="mt-5 text-2xl font-bold">
              Registration Submitted
            </DialogTitle>
            <DialogDescription className="mt-2 text-center text-muted-foreground">
              Your account is pending approval from an administrator. You'll be able to log in once it has been activated.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            autoPlay loop muted playsInline
          >
            <source src={BackVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </div>

        <motion.div 
          className="w-full max-w-md space-y-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ✨ REPLACED: Professional Welcome Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-7xl md:text-8xl font-extralight tracking-tighter text-white mb-2">
              Welcome
            </h1>
            <div className="h-[1px] w-16 bg-red-600 mx-auto mb-4 opacity-80" />
            <p className="text-slate-400 text-xs uppercase tracking-[0.3em] font-medium">
              Technical Support Portal
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
                <CardDescription className="text-center">
                  Access your tech support account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent p-0">
                    <TabsTrigger value="login" className={cn(outlinePillButton, "flex items-center gap-2")}>
                      <LogIn className="h-4 w-4" /> Login
                    </TabsTrigger>
                    <TabsTrigger value="register" className={cn(outlinePillButton, "flex items-center gap-2")}>
                      <UserPlus className="h-4 w-4" /> Register
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" /> Email
                        </label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={emailPlaceholder}
                          onFocus={() => setEmailPlaceholder("")}
                          onBlur={() => setEmailPlaceholder("example@mail.com")}
                          className="border-primary/20 focus-visible:ring-primary/30"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" /> Password
                        </label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={passPlaceholder}
                          onFocus={() => setPassPlaceholder("")}
                          onBlur={() => setPassPlaceholder("••••••••")}
                          className="border-primary/20 focus-visible:ring-primary/30"
                          required
                        />
                      </div>
                      {loginError && <p className="text-red-500 text-xs font-medium">{loginError}</p>}
                      <Button type="submit" variant="outline" className={cn("w-full py-6 flex items-center justify-center gap-2", outlinePillButton)} disabled={isLoading}>
                        {isLoading ? "Signing in..." : <><LogIn className="h-4 w-4" /> Sign In</>}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" /> Username
                        </label>
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={userPlaceholder}
                          onFocus={() => setUserPlaceholder("")}
                          onBlur={() => setUserPlaceholder("johnsmith")}
                          className="border-primary/20 focus-visible:ring-primary/30"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" /> Email
                        </label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={emailPlaceholder}
                          onFocus={() => setEmailPlaceholder("")}
                          onBlur={() => setEmailPlaceholder("example@mail.com")}
                          className="border-primary/20 focus-visible:ring-primary/30"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" /> Password
                        </label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={passPlaceholder}
                          onFocus={() => setPassPlaceholder("")}
                          onBlur={() => setPassPlaceholder("••••••••")}
                          className="border-primary/20 focus-visible:ring-primary/30"
                          required
                        />
                      </div>
                      {registrationError && <p className="text-red-500 text-xs font-medium">{registrationError}</p>}
                      <Button type="submit" variant="outline" className={cn("w-full py-6 flex items-center justify-center gap-2", outlinePillButton)} disabled={isLoading}>
                        {isLoading ? "Processing..." : <><UserPlus className="h-4 w-4" /> Create Account</>}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}