import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { motion, AnimatePresence } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User, AlertCircle, Clock, LogIn, UserPlus, AlertTriangle } from "lucide-react"; 
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
  "relative rounded-md px-6 py-2 text-sm font-bold uppercase tracking-widest " +
  "text-white !bg-red-600 !bg-none " + // !bg-none removes any existing gradients
  "transition-all duration-300 ease-in-out transform " +
  "hover:!bg-red-700 hover:scale-[1.02] active:scale-95 " +
  "shadow-lg shadow-red-500/40 dark:shadow-red-900/40 " +
  "border-none outline-none focus:ring-2 focus:ring-red-500/50";

  const tileClassName = "group relative overflow-hidden rounded-2xl p-1 backdrop-blur-xl border shadow-2xl transition-all duration-300 " + 
                       "bg-white/80 border-slate-200 text-slate-900 " + 
                       "dark:bg-zinc-900/90 dark:border-white/10 dark:text-white";

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
        navigate(from);
      } else if (result === "pending") {
        setShowPendingDialog(true);
      } else {
        setLoginError("Invalid User or Passsword.");
      }
    } catch (error: unknown) {
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
      setRegistrationError("All fields are required to create an account.");
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
        setRegistrationError("Registration failed. Please try a different email or check password criteria.");
      }
    } catch (error: unknown) {
      setRegistrationError(error instanceof Error ? error.message : "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#050505] text-foreground selection:bg-red-500/30 transition-colors duration-500">
      {showWelcomeAnimation && <AnimatedWelcome onContinue={handleWelcomeComplete} />}
      
   {/* Background Video Section */}
<div className="fixed inset-0 z-0 pointer-events-none">
  <video 
    className="w-full h-full object-cover opacity-80 dark:opacity-60 contrast-125 saturate-150 transition-opacity duration-500" 
    autoPlay 
    loop 
    muted 
    playsInline
  >
    <source src={BackVideo} type="video/mp4" />
  </video>
  
  {/* Minimal Adaptive Overlay - Ensures UI readability without washing out the video */}
  <div className="absolute inset-0 bg-white/5 dark:bg-black/40 backdrop-brightness-95 dark:backdrop-brightness-100 transition-colors duration-500" />
</div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Header - Simplified as requested */}
          <div className="mb-10 text-center">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
    WELCOME<span className="text-red-600 drop-shadow-[0_0_12px_rgba(220,38,38,0.7)]">.</span>
  </h1>
           <div className="flex justify-center">
  <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] font-bold py-2 px-6 
    /* Text: High-visibility Red */
    text-red-500 dark:text-red-400
    /* Borders: Glowing edges */
    border-y border-red-600 dark:border-red-500/50
    /* Glow: Adds the brightness you're looking for */
    drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]
    transition-all duration-500">
    Technical Support
  </p>
</div>
          </div>
          
          <div className={tileClassName}>
            <CardHeader className="pt-8 px-8">
              <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400"> Login</CardTitle>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 gap-2 bg-slate-200/50 dark:bg-white/10 p-1 mb-8 rounded-xl backdrop-blur-md border border-slate-300 dark:border-white/10 h-auto">
                  <TabsTrigger value="login" className="capitalize transition-all duration-200 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-zinc-400 rounded-lg py-2.5 flex items-center gap-2">
                    <LogIn className="h-4 w-4" /> Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="capitalize transition-all duration-200 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-zinc-400 rounded-lg py-2.5 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Register
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="login" className="space-y-6">
                    {loginError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                        <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/40 border-red-600 text-red-900 dark:text-white rounded-xl backdrop-blur-md mb-4">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertTitle className="font-bold uppercase text-xs">Access Denied</AlertTitle>
                          <AlertDescription className="text-sm font-medium">{loginError}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                          <Mail className="h-3 w-3" /> Email Address
                        </label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={emailPlaceholder}
                          onFocus={() => setEmailPlaceholder("")}
                          onBlur={() => setEmailPlaceholder("example@mail.com")}
                          className="bg-slate-100 dark:bg-zinc-800/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white h-12 focus:ring-red-600"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                          <Lock className="h-3 w-3" /> Password
                        </label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={passPlaceholder}
                          onFocus={() => setPassPlaceholder("")}
                          onBlur={() => setPassPlaceholder("••••••••")}
                          className="bg-slate-100 dark:bg-zinc-800/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white h-12 focus:ring-red-600"
                          required
                        />
                      </div>
					  
                     <Button 
  type="submit" 
  /* Removing variant prop ensures Shadcn doesn't inject default colors */
  className={cn("w-full py-7", outlinePillButton)} 
  disabled={isLoading}
>
  {isLoading ? "Verifying..." : "Sign In"}
</Button>
                    </form>
					{/* SUPPORT LINK FOOTER */}
<div className="mt-auto pt-8 flex justify-start w-full">
  <a 
    href="mailto:Operateur.sav.5@groupsfit.eu"
    className="group flex items-center gap-2 px-2 py-1
               /* Light Mode: Slate to Red */
               text-slate-600 hover:text-red-600 
               /* Dark Mode: Zinc to Red */
               dark:text-zinc-500 dark:hover:text-red-500"
  >
    {/* Support Icon */}
    <Mail className="h-4 w-4" />
    
    {/* Static Label */}
    <span className="text-xs font-bold uppercase tracking-[0.3em]">
      Support
    </span>

    {/* Subtle Red Indicator (Visible only on hover) */}
    <div className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
  </a>
</div>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-6">
                    {registrationError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                        <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/40 border-red-600 text-red-900 dark:text-white rounded-xl backdrop-blur-md mb-4">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertTitle className="font-bold uppercase text-xs">Registration Error</AlertTitle>
                          <AlertDescription className="text-sm font-medium">{registrationError}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                          <User className="h-3 w-3" /> Full Name
                        </label>
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={userPlaceholder}
                          onFocus={() => setUserPlaceholder("")}
                          onBlur={() => setUserPlaceholder("johnsmith")}
                          className="bg-slate-100 dark:bg-zinc-800/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white h-12"
                          required
                        />
                      </div>
					  
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                          <Mail className="h-3 w-3" /> Email Address
                        </label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-slate-100 dark:bg-zinc-800/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                          <Lock className="h-3 w-3" /> Password
                        </label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-slate-100 dark:bg-zinc-800/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white h-12"
                          required
                        />
                      </div>
                      <Button type="submit" className={cn("w-full py-7 font-bold uppercase tracking-widest", outlinePillButton)} disabled={isLoading}>
                        {isLoading ? "Processing..." : "Request Access"}
                      </Button>
                    </form>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </div>
        </motion.div>
		
      </div>
	  

      {/* Dialogs */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900/95 border-slate-200 dark:border-white/10 backdrop-blur-2xl text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 font-bold uppercase tracking-tighter">
              <Clock className="h-5 w-5" />
              Pending Approval
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-500 dark:text-zinc-400">
              Your account is currently under review by the administration. You will be notified once access is granted.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showRegSuccessDialog} onOpenChange={setShowRegSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900/95 border-slate-200 dark:border-white/10 backdrop-blur-2xl text-slate-900 dark:text-white">
          <div className="flex flex-col items-center justify-center text-center p-4 pt-8">
            <div className="relative w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 mb-6">
              <User className="h-10 w-10 text-green-500" />
              <div className="absolute bottom-0 right-0 p-1 rounded-full bg-green-500 text-white">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold uppercase tracking-tighter">Request Received</DialogTitle>
            <DialogDescription className="mt-2 text-slate-500 dark:text-zinc-400">
              Your registration request has been submitted for administrative approval.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}