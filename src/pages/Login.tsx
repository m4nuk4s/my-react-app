import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AnimatedWelcome from "@/components/auth/AnimatedWelcome";
import { motion, AnimatePresence } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User, AlertCircle, Clock, LogIn, UserPlus, AlertTriangle, KeyRound, CheckCircle2, ShieldCheck, ChevronRight, Activity, Eye, EyeOff, Loader2, Sparkles, Unlock, Send, ShieldAlert, RefreshCw, Fingerprint, Terminal, Cpu, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BackVideo from "@/assets/wtpth/backvi.mp4";
import { toast } from "sonner";

export default function Login() {
  const { login, register, resetPassword, updatePassword, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const formRef = useRef<HTMLDivElement>(null);

  // --- UI & TAB STATE ---
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // --- FORM STATE ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  
  // --- DIALOG STATE ---
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [showRegSuccessDialog, setShowRegSuccessDialog] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"init" | "sent" | "verifying">("init");

  // --- FORM VALIDATION ---
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // --- STYLING CONSTANTS (Matches Windows.tsx) ---
  const outlinePillButton =
    "relative rounded-md px-6 py-2 text-sm font-bold uppercase tracking-widest " +
    "text-white !bg-red-600 !bg-none transition-all duration-300 ease-in-out transform " +
    "hover:!bg-red-700 hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-500/40 " +
    "border-none outline-none focus:ring-2 focus:ring-gree-500/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const tileClassName = "relative overflow-hidden rounded-3xl p-1 backdrop-blur-2xl border transition-all duration-500 " + 
                       "bg-white/70 border-white/40 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] " + 
                       "dark:bg-zinc-950/70 dark:border-white/5 dark:text-white hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]";

  // --- DYNAMIC CONTENT LOGIC ---
  const getStageContent = () => {
    if (showRecoveryDialog) return { main: "Account", sub: "Recovery", tag: "SEC_RECOVER", color: "text-red-600", icon: ShieldAlert };
    if (activeTab === "register") return { main: "Create", sub: "Account", tag: "NEW_USER", color: "text-slate-900 dark:text-white", icon: UserPlus };
    return { main: "Portal", sub: "Access", tag: "Login", color: "text-red-600", icon: ShieldCheck };
  };

  const stage = getStageContent();

  // --- VALIDATION FUNCTIONS ---
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = (type: 'login' | 'register') => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (type === 'register' && !validatePassword(password)) {
      errors.password = "Password must be at least 8 characters";
    }

    if (type === 'register' && !username.trim()) {
      errors.username = "Name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomeAnimation(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("type") === "recovery" || window.location.hash.includes("type=recovery")) {
      setShowResetDialog(true);
    }

    // Auto-focus email input on mount
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput && activeTab === "login") {
      setTimeout(() => emailInput.focus(), 300);
    }
  }, [location, activeTab]);

  // --- HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm('login')) return;
    
    setLoginError("");
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result === true) {
        toast.success("Authentication successful", {
          description: "Redirecting to dashboard...",
          duration: 2000,
        });
        setTimeout(() => navigate(from), 500);
      } else if (result === "pending") {
        setShowPendingDialog(true);
      } else {
        setLoginError("Invalid credentials. Please try again.");
        formRef.current?.animate([
          { transform: 'translateX(0px)' },
          { transform: 'translateX(-10px)' },
          { transform: 'translateX(10px)' },
          { transform: 'translateX(0px)' }
        ], { duration: 300 });
      }
    } catch (error: any) {
      setLoginError(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm('register')) return;
    
    setRegistrationError("");
    setIsLoading(true);
    
    try {
      const result = await register(email, username, password);
      if (result === "pending") {
        setShowRegSuccessDialog(true);
        toast.success("Registration submitted", {
          description: "Awaiting administrator approval",
          duration: 4000,
        });
      } else if (!result) {
        setRegistrationError("Registration failed. Please try again.");
      }
    } catch (error: any) {
      setRegistrationError(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRecovery = async () => {
    if (!recoveryEmail || !validateEmail(recoveryEmail)) {
      toast.error("Please enter a valid email");
      return;
    }
    
    setIsLoading(true);
    setRecoveryStep("verifying");
    try {
      await resetPassword(recoveryEmail);
      setRecoveryStep("sent");
      setRecoverySent(true);
      toast.success("Recovery email sent", {
        description: "Check your inbox for instructions",
        duration: 5000,
      });
    } catch (err: any) {
      setRecoveryStep("init");
      toast.error("Recovery failed", {
        description: err.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !validatePassword(newPassword)) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);
    try {
      await updatePassword(newPassword);
      await logout();
      setShowResetDialog(false);
      toast.success("Password updated", {
        description: "Please login with your new credentials",
        duration: 5000,
      });
      navigate('/login', { replace: true });
    } catch (err: any) {
      toast.error("Update failed", {
        description: err.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFormErrors({});
    setLoginError("");
    setRegistrationError("");
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#020202] text-foreground selection:bg-red-500/30 overflow-hidden font-sans">
      
      {showWelcomeAnimation && (
        <div className="fixed inset-0 z-[100]">
          <AnimatedWelcome onComplete={() => setShowWelcomeAnimation(false)} />
        </div>
      )}

      {/* LEFT PANEL: CINEMATIC MEDIA */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-[60%] flex-col items-center justify-center overflow-hidden border-r border-white/10">
        <video 
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 contrast-125" 
          autoPlay 
          loop 
          muted 
          playsInline
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23020202'/%3E%3C/svg%3E"
        >
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fa]/60 via-transparent to-transparent dark:from-[#020202] dark:via-[#020202]/80" />

        <div className="relative z-10 p-12 text-left w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="mb-6 flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase text-slate-600 dark:text-zinc-500">
              <Activity size={14} className="text-red-600 animate-pulse" /> 
              AUTH_SYSTEM // {stage.tag}
              <Sparkles size={12} className="text-amber-500 animate-pulse" />
            </div>
            
            <h1 className="text-7xl lg:text-[8rem] font-black tracking-tighter text-slate-950 dark:text-white leading-[0.8] uppercase">
              {stage.main} <br />
              <span className="outline-text">{stage.sub}</span>
            </h1>
            
            <p className="max-w-lg mt-8 text-slate-600 dark:text-zinc-400 font-medium text-lg leading-relaxed border-l-2 border-red-600 pl-6">
              {activeTab === "login" 
                ? "Access to technical Support Center" 
                : "Request access to the technical support system. Your account will require administrator approval."}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-12 right-12 flex justify-between items-end">
          <div className="flex items-center gap-3">
		  
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
			
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              System Status: <span className="text-green-500 font-black">Operational</span>
            </div>
			
          </div>
          <div className="text-right">
           
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: AUTH FORMS */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 z-10">
        <motion.div 
          ref={formRef}
        
          className="w-full max-w-md mx-auto"
        >
          <div className={tileClassName}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              
              <CardHeader className="pt-10 px-10">
                <CardTitle className="text-xs font-bold uppercase tracking-[0.4em] flex items-center gap-3">
                  <span className="h-px w-8 bg-red-600 transition-all duration-500"></span>
                  <div className="relative h-4 overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={stage.tag}
                        
                      
                        className={cn("block whitespace-nowrap", stage.color)}
                      >
                        {stage.tag}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <stage.icon className="h-4 w-4" />
                </CardTitle>
              </CardHeader>

              <CardContent className="px-10 pb-10">
                <TabsList className="grid grid-cols-2 gap-3 bg-white/40 dark:bg-white/5 p-1.5 mb-10 rounded-xl h-auto border border-slate-200/50 dark:border-white/10 backdrop-blur-md">
                  <TabsTrigger 
                    value="login" 
                    className="rounded-lg py-2 text-sm font-black tracking-tight data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    <LogIn className="h-3.5 w-3.5 mr-2" /> Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="rounded-lg py-2 text-sm font-black tracking-tight data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-300"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-2" /> Register
                  </TabsTrigger>
                </TabsList>

                {/* Error Messages */}
                <AnimatePresence>
                  {(loginError || registrationError) && (
                    <motion.div
                      
                      className="mb-6"
                    >
                      <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Authentication Error</AlertTitle>
                        <AlertDescription>
                          {loginError || registrationError}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <TabsContent value="login" className="space-y-6 outline-none">
                    <form onSubmit={handleLogin} className="space-y-6">
                      {/* Email Field with Icon Above */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            formErrors.email 
                              ? "bg-red-100 dark:bg-red-900/20 text-red-600" 
                              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                          )}>
                            <Mail className="h-5 w-5" />
                          </div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex-1">
                            Email Address
                          </label>
                          {formErrors.email && (
                            <span className="text-xs text-red-500 font-medium">{formErrors.email}</span>
                          )}
                        </div>
                        <Input 
                          type="email" 
                          value={email} 
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (formErrors.email) setFormErrors({...formErrors, email: ''});
                          }}
                          placeholder="admin@thomson.eu" 
                          className={cn(
                            "bg-slate-50/50 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 h-14 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 pl-6",
                            formErrors.email && "border-red-500"
                          )} 
                          required 
                        />
                      </div>

                      {/* Password Field with Icon Above */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            formErrors.password 
                              ? "bg-red-100 dark:bg-red-900/20 text-red-600" 
                              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                          )}>
                            <Lock className="h-5 w-5" />
                          </div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex-1">
                            Password
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setShowRecoveryDialog(true)} 
                            className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:text-red-700 transition-colors"
                          >
                            Forgot?
                          </button>
                        </div>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (formErrors.password) setFormErrors({...formErrors, password: ''});
                            }}
                            placeholder="••••••••" 
                            className={cn(
                              "bg-slate-50/50 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 h-14 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 pr-12 pl-6",
                              formErrors.password && "border-red-500"
                            )} 
                            required 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-zinc-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-zinc-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className={cn("w-full py-8 text-md group mt-8", outlinePillButton)} 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Validating...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Login
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
<div className="mt-10 flex flex-col items-center">
              <a href="mailto:Operateur.sav.5@groupsfit.eu" className="group flex flex-col items-center gap-2 text-slate-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-500 transition-all">
                <div className="h-8 w-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-red-500/50 group-hover:bg-red-500/5 transition-all">
                    <Mail className="h-3.5 w-3.5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Contact Support</span>
              </a>
          </div>
                  <TabsContent value="register" className="space-y-6 outline-none">
                    <form onSubmit={handleRegister} className="space-y-6">
                      {/* Username Field with Icon Above */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            formErrors.username 
                              ? "bg-red-100 dark:bg-red-900/20 text-red-600" 
                              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                          )}>
                            <User className="h-5 w-5" />
                          </div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex-1">
                            User Name
                          </label>
                          {formErrors.username && (
                            <span className="text-xs text-red-500 font-medium">{formErrors.username}</span>
                          )}
                        </div>
                        <Input 
                          value={username} 
                          onChange={(e) => {
                            setUsername(e.target.value);
                            if (formErrors.username) setFormErrors({...formErrors, username: ''});
                          }}
                          placeholder="John Doe" 
                          className={cn(
                            "bg-slate-50/50 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 h-14 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 pl-6",
                            formErrors.username && "border-red-500"
                          )} 
                          required 
                        />
                      </div>

                      {/* Email Field with Icon Above */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            formErrors.email 
                              ? "bg-red-100 dark:bg-red-900/20 text-red-600" 
                              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                          )}>
                            <Mail className="h-5 w-5" />
                          </div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex-1">
                            Email Address
                          </label>
                          {formErrors.email && (
                            <span className="text-xs text-red-500 font-medium">{formErrors.email}</span>
                          )}
                        </div>
                        <Input 
                          type="email" 
                          value={email} 
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (formErrors.email) setFormErrors({...formErrors, email: ''});
                          }}
                          placeholder="john@example.com"
                          className={cn(
                            "bg-slate-50/50 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 h-14 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 pl-6",
                            formErrors.email && "border-red-500"
                          )} 
                          required 
                        />
                      </div>

                      {/* Password Field with Icon Above */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            formErrors.password 
                              ? "bg-red-100 dark:bg-red-900/20 text-red-600" 
                              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                          )}>
                            <Lock className="h-5 w-5" />
                          </div>
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex-1">
                            Password
                          </label>
                          {formErrors.password && (
                            <span className="text-xs text-red-500 font-medium">{formErrors.password}</span>
                          )}
                        </div>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (formErrors.password) setFormErrors({...formErrors, password: ''});
                            }}
                            placeholder="Minimum 8 characters"
                            className={cn(
                              "bg-slate-50/50 dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 h-14 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 pr-12 pl-6",
                              formErrors.password && "border-red-500"
                            )} 
                            required 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-zinc-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-zinc-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 ml-1">
                          Must be at least 8 characters long
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        className={cn("w-full py-8 mt-8", outlinePillButton)} 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Request Access
                          </span>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </AnimatePresence>
              </CardContent>
            </Tabs>
          </div>

            
          
        </motion.div>
      </div>

      {/* ENHANCED RECOVERY DIALOG */}
      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-900 border-slate-200/50 dark:border-white/10 backdrop-blur-xl p-0 overflow-hidden">
          {/* Animated Header */}
          <div className="relative h-32 bg-gradient-to-r from-red-900/20 via-red-800/30 to-red-900/20 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <KeyRound className="h-16 w-16 text-red-500 animate-pulse" />
                <div className="absolute inset-0 bg-red-500/20 blur-xl"></div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          </div>

          <DialogHeader className="px-8 pt-8 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Unlock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-red-600">
                SECURE RECOVERY PROTOCOL
              </DialogTitle>
            </div>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400 text-sm">
              Initiate account recovery procedure. A secure verification link will be dispatched to your registered email.
            </DialogDescription>
          </DialogHeader>

          <div className="px-8 pb-8 space-y-6">
            {recoveryStep === "sent" ? (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center py-8">
                  <div className="relative inline-block mb-6">
                    <CheckCircle2 className="h-20 w-20 text-green-500 animate-bounce" />
                    <div className="absolute inset-0 bg-green-500/20 blur-xl"></div>
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">RECOVERY INITIATED</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Security protocol activated. Check <span className="font-bold text-white">{recoveryEmail}</span> for further instructions.
                  </p>
                </div>
                
                <div className="bg-slate-100 dark:bg-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm text-amber-600 mb-1">SECURITY NOTICE</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        • Recovery link expires in 24 hours<br/>
                        • Check your spam folder if not received<br/>
                        • Contact support if issues persist
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Input State */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      recoveryStep === "verifying" 
                        ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" 
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                    )}>
                      {recoveryStep === "verifying" ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <Mail className="h-5 w-5" />
                      )}
                    </div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex-1">
                      RECOVERY EMAIL
                    </label>
                  </div>
                  <Input 
                    type="email" 
                    placeholder="registered.email@domain.com" 
                    value={recoveryEmail} 
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="bg-slate-100 dark:bg-zinc-800/50 h-14 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 pl-6 text-lg border-2 border-slate-200 dark:border-white/10"
                    disabled={recoveryStep === "verifying"}
                  />
                </div>

                <Button 
                  onClick={handleSendRecovery} 
                  className={cn(
                    "w-full py-8 text-lg font-black tracking-widest relative overflow-hidden",
                    outlinePillButton
                  )}
                  disabled={isLoading || recoveryStep === "verifying"}
                >
                  {recoveryStep === "verifying" ? (
                    <span className="flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      VERIFYING IDENTITY...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <Send className="h-5 w-5" />
                      INITIATE RECOVERY
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Button>
              </motion.div>
            )}

            <DialogFooter className="pt-6 border-t border-slate-200 dark:border-white/10">
              <div className="w-full">
                
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* PENDING APPROVAL DIALOG */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-slate-200/50 dark:border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-amber-600 flex items-center gap-2 font-black uppercase">
              <Clock className="h-5 w-5" />
              Account Pending
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-zinc-600 dark:text-zinc-300">
              Your account is pending administrator approval.
            </p>
            <Button 
              onClick={() => setShowPendingDialog(false)}
              className={cn("w-full py-8 text-md group mt-8", outlinePillButton)} 
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* REGISTRATION SUCCESS DIALOG */}
      <Dialog open={showRegSuccessDialog} onOpenChange={setShowRegSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-slate-200/50 dark:border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2 font-black uppercase">
              <CheckCircle2 className="h-5 w-5" />
              Request Submitted
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-zinc-600 dark:text-zinc-300">
              Your registration request has been submitted successfully. An administrator will review your application and aproove the account.
            </p>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <AlertTriangle className="h-4 w-4" />
              <span>Processing may take up to 24 hours</span>
            </div>
            <Button 
              onClick={() => {
                setShowRegSuccessDialog(false);
                setActiveTab("login");
              }}
              className={cn("w-full py-8 text-md group mt-8", outlinePillButton)} 
            >
              Return to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* STYLES */}
      <style>{`
        .outline-text {
          -webkit-text-stroke: 2px #dc2626;
          color: transparent;
        }
        @media (max-width: 1024px) {
          .outline-text { -webkit-text-stroke: 1.5px #dc2626; }
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: inherit;
          -webkit-box-shadow: 0 0 0px 1000px rgba(248, 250, 252, 0.5) inset;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        .dark input:-webkit-autofill,
        .dark input:-webkit-autofill:hover,
        .dark input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(9, 9, 11, 0.5) inset;
          -webkit-text-fill-color: #fff;
        }
      `}</style>
    </div>
  );
}