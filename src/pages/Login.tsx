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
import { 
  Mail, Lock, User, AlertCircle, Clock, LogIn, UserPlus, 
  AlertTriangle, KeyRound, CheckCircle2, ShieldCheck, 
  ChevronRight, Activity, Eye, EyeOff, Loader2, 
  Sparkles, Unlock, Send, ShieldAlert, RefreshCw 
} from "lucide-react"; 
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

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [showRegSuccessDialog, setShowRegSuccessDialog] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"init" | "sent" | "verifying">("init");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // --- STYLING ---
  const outlinePillButton =
    "relative rounded-md px-6 py-2 text-sm font-bold uppercase tracking-widest " +
    "text-white !bg-red-600 !bg-none transition-all duration-300 ease-in-out transform " +
    "hover:!bg-red-700 hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-500/40 " +
    "border-none outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const tileClassName = "relative overflow-hidden rounded-3xl p-1 backdrop-blur-2xl border transition-all duration-500 " + 
                       "bg-white/70 border-white/40 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] " + 
                       "dark:bg-zinc-950/70 dark:border-white/5 dark:text-white hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]";

  // --- DYNAMIC UI HELPERS ---
  const getStageContent = () => {
    if (showRecoveryDialog) return { main: "Account", sub: "Recovery", tag: "SEC_RECOVER", color: "text-red-600", icon: ShieldAlert };
    if (activeTab === "register") return { main: "Create", sub: "Account", tag: "NEW_USER", color: "text-slate-900 dark:text-white", icon: UserPlus };
    return { main: "Portal", sub: "Access", tag: "Login", color: "text-red-600", icon: ShieldCheck };
  };
  const stage = getStageContent();

  // --- VALIDATION ---
  const validateForm = (type: 'login' | 'register') => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) errors.email = "Email is required";
    else if (!emailRegex.test(email)) errors.email = "Invalid email format";
    if (!password) errors.password = "Password is required";
    else if (type === 'register' && password.length < 8) errors.password = "Min. 8 characters";
    if (type === 'register' && !username.trim()) errors.username = "Name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) setShowWelcomeAnimation(true);

    const params = new URLSearchParams(window.location.search);
    if (params.get("type") === "recovery" || window.location.hash.includes("type=recovery")) {
      setShowResetDialog(true);
    }
  }, [location]);

  // --- HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm('login')) return;
    setLoginError("");
    setIsLoading(true);
    const result = await login(email, password);
    if (result === true) {
      toast.success("Authenticated");
      navigate(from);
    }
    else if (result === "pending") setShowPendingDialog(true);
    else {
      setLoginError("Invalid User or Password.");
      formRef.current?.animate([{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 200 });
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm('register')) return;
    setRegistrationError("");
    setIsLoading(true);
    const result = await register(email, username, password);
    if (result === "pending") setShowRegSuccessDialog(true);
    else if (!result) setRegistrationError("Registration failed.");
    setIsLoading(false);
  };

  const handleSendRecovery = async () => {
    setIsLoading(true);
    setRecoveryStep("verifying");
    try {
      await resetPassword(recoveryEmail);
      setRecoverySent(true);
      setRecoveryStep("sent");
    } catch (err: any) {
      setRecoveryStep("init");
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setIsLoading(true);
    try {
      await updatePassword(newPassword);
      await logout();
      setShowResetDialog(false);
      toast.success("Password updated! Please login.");
      navigate('/login', { replace: true });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWelcomeComplete = () => {
    window.setTimeout(() => setShowWelcomeAnimation(false), 0);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#020202] text-foreground selection:bg-red-500/30 overflow-hidden font-sans">
      
      {showWelcomeAnimation && (
        <div className="fixed inset-0 z-[100]">
          <AnimatedWelcome onComplete={handleWelcomeComplete} />
        </div>
      )}

      {/* LEFT PANEL: CINEMATIC MEDIA */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-[60%] flex-col items-center justify-center overflow-hidden border-r border-white/10">
        <video className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 contrast-125" autoPlay loop muted playsInline>
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fa]/60 via-transparent to-transparent dark:from-[#020202] dark:via-[#020202]/80" />

        <div className="relative z-10 p-12 text-left w-full">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
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
              {activeTab === "login" ? "Access to technical Support Center" : "Request access to the technical support system."}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-12 right-12 flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">System Status: <span className="text-green-500 font-black">Operational</span></div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: AUTH FORMS */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 z-10">
        <motion.div ref={formRef} className="w-full max-w-md mx-auto">
          <div className={tileClassName}>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setFormErrors({}); }} className="w-full">
              <CardHeader className="pt-10 px-10">
                <CardTitle className="text-xs font-bold uppercase tracking-[0.4em] flex items-center gap-3">
                  <span className="h-px w-8 bg-red-600"></span>
                  <span className={cn("block whitespace-nowrap", stage.color)}>{stage.tag}</span>
                  <stage.icon className="h-4 w-4" />
                </CardTitle>
              </CardHeader>

              <CardContent className="px-10 pb-10">
                <TabsList className="grid grid-cols-2 gap-3 bg-white/40 dark:bg-white/5 p-1.5 mb-10 rounded-xl h-auto border border-slate-200/50 dark:border-white/10 backdrop-blur-md">
                  <TabsTrigger value="login" className="rounded-lg py-2 text-sm font-black tracking-tight data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-300">
                    <LogIn className="h-3.5 w-3.5 mr-2" /> Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="rounded-lg py-2 text-sm font-black tracking-tight data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-300">
                    <UserPlus className="h-3.5 w-3.5 mr-2" /> Register
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="login" className="space-y-6 outline-none">
                    {loginError && (
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="font-bold text-xs uppercase">Access Denied</AlertTitle>
                        <AlertDescription>{loginError}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2"><Mail className="h-4 w-4" /> Email Address</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@thomson.eu" className="bg-slate-50/50 dark:bg-zinc-900/50 h-14 rounded-xl" required />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2"><Lock className="h-4 w-4" /> Password</label>
                          <button type="button" onClick={() => setShowRecoveryDialog(true)} className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline">Forgot?</button>
                        </div>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-slate-50/50 dark:bg-zinc-900/50 h-14 rounded-xl pr-12" required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className={cn("w-full py-8 text-md group", outlinePillButton)} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2"/> : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-6 outline-none">
                    {registrationError && (
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/50"><AlertTriangle className="h-4 w-4" /><AlertDescription>{registrationError}</AlertDescription></Alert>
                    )}
                    <form onSubmit={handleRegister} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2"><User className="h-4 w-4" /> Full Name</label>
                        <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="John Doe" className="bg-slate-50/50 dark:bg-zinc-900/50 h-14 rounded-xl" required />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2"><Mail className="h-4 w-4" /> Email Address</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50/50 dark:bg-zinc-900/50 h-14 rounded-xl" required />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2"><Lock className="h-4 w-4" /> Password</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className="bg-slate-50/50 dark:bg-zinc-900/50 h-14 rounded-xl" required />
                      </div>
                      <Button type="submit" className={cn("w-full py-8 text-md", outlinePillButton)} disabled={isLoading}>Request Access</Button>
                    </form>
                  </TabsContent>
                </AnimatePresence>

                {/* RESTORED SUPPORT LINK */}
               
              </CardContent>
            </Tabs>
          </div>
        </motion.div>
      </div>

   {/* RECOVERY DIALOG - FINAL STYLE ALIGNMENT */}
<Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
  <DialogContent className="sm:max-w-md bg-white/95 dark:bg-[#050505]/95 backdrop-blur-2xl border-slate-200/50 dark:border-white/10 shadow-[0_0_50px_-12px_rgba(220,38,38,0.3)] rounded-2xl p-0 overflow-hidden font-sans">
    
    {/* Animated Top Accent */}
    <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent" />

    <div className="p-10">
      {/* Red Aura Icon - Matches your card hover logic */}
      <div className="mb-8 flex justify-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-red-600/30 blur-3xl rounded-full group-hover:bg-red-600/50 transition-all duration-700" />
          <div className="relative bg-white dark:bg-zinc-950 border border-red-600/40 p-5 rounded-xl shadow-2xl">
            <KeyRound className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <DialogHeader className="text-center space-y-3 mb-10">
        <div className="flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.4em] uppercase text-slate-500">
          <Activity size={12} className="text-red-600 animate-pulse" /> SECURITY_RECOVERY
        </div>
        <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-slate-950 dark:text-white leading-none">
          Password <span className="outline-text" style={{ WebkitTextStroke: '1.5px #dc2626' }}>Recovery</span>
        </DialogTitle>
        <DialogDescription className="text-slate-600 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] border-y border-red-600/20 py-3 mx-auto max-w-[280px]">
          Enter your Email to recovery the Password.
        </DialogDescription>
      </DialogHeader>

      {recoveryStep === "sent" ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-red-600/5 p-6 rounded-xl border border-red-600/20 text-center">
            <CheckCircle2 className="h-10 w-10 text-red-600 mx-auto mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-white">
              Transmission Sent to: <br/>
              <span className="text-red-600 font-mono mt-1 block lowercase">{recoveryEmail}</span>
            </p>
          </div>
          {/* Using your exact constant for the button style */}
          <Button 
            variant="ghost" 
            className={`${outlinePillButton} w-full border border-slate-200/50 dark:border-white/10`} 
            onClick={() => setRecoveryStep("idle")}
          >
            Different Identity
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500 ml-1">Email Address</label>
            <Input 
              type="email" 
              placeholder="AUTH@SYSTEM.LOCAL" 
              value={recoveryEmail} 
              onChange={(e) => setRecoveryEmail(e.target.value)} 
              className="h-14 px-5 rounded-md border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 focus:border-red-600 focus:ring-0 transition-all text-sm uppercase" 
            />
          </div>

          {/* THE FIXED BUTTON: Uses outlinePillButton but with a primary Red state */}
          <Button 
            onClick={handleSendRecovery} 
            disabled={isLoading || recoveryStep === "verifying"}
            className={`${outlinePillButton} w-full h-14 bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-600/20 active:scale-95`}
          >
            {recoveryStep === "verifying" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-3 font-black uppercase tracking-[0.2em]">
                Send <Send className="h-4 w-4" />
              </span>
            )}
          </Button>

          <button 
            onClick={() => setShowRecoveryDialog(false)}
            className="w-full text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-red-600 transition-colors py-2"
          >
            [ ABORT_PROCESS ]
          </button>
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>
      {/* UPDATE PASSWORD DIALOG */}
      {/* UPDATE PASSWORD DIALOG - SYNCED WITH WINDOWS.TSX */}
<Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
  <DialogContent className="sm:max-w-md bg-white/90 dark:bg-[#050505]/90 backdrop-blur-2xl border-slate-200/50 dark:border-white/10 shadow-2xl rounded-2xl p-0 overflow-hidden font-sans">
    
    {/* Red Accent Bar */}
    <div className="h-1.5 w-full bg-red-600" />

    <div className="p-10">
      <DialogHeader className="text-center space-y-3 mb-10">
        <div className="flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.4em] uppercase text-slate-500">
          <Activity size={12} className="text-red-600 animate-pulse" /> SECURITY_ENFORCEMENT
        </div>
        <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-slate-950 dark:text-white leading-none">
          New <span className="outline-text" style={{ WebkitTextStroke: '1.2px #dc2626' }}>Password</span>
        </DialogTitle>
        <DialogDescription className="text-slate-600 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] border-l-2 border-red-600 pl-4 py-1 mx-auto max-w-[280px]">
          Define your new system credentials to finalize the recovery.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="space-y-2 group">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">Security_Key</label>
            <span className="text-[9px] font-mono text-red-600/50">8_CHAR_MIN</span>
          </div>
          <Input 
            type="password" 
            placeholder="••••••••" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            className="h-14 px-5 rounded-xl border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 focus:border-red-600 focus:ring-0 transition-all font-mono text-lg" 
          />
        </div>

        {/* FIXED BUTTON: Exact match to your "Submit Request" button style */}
        <Button 
          onClick={handleUpdatePassword} 
          disabled={isLoading || newPassword.length < 8}
          className={cn(
            "w-full h-14 bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-600/20 active:scale-95 transition-all duration-200",
            "font-black uppercase tracking-[0.2em] text-sm", // Exact match to your Submit Request style
            outlinePillButton // Inherits your global button transformations
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-3">
              Update Credentials <KeyRound className="h-4 w-4" />
            </span>
          )}
        </Button>

        <button 
          onClick={() => setShowResetDialog(false)}
          className="w-full text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-red-600 transition-colors py-2"
        >
          [ ABORT_UPDATE ]
        </button>
      </div>
    </div>
  </DialogContent>
</Dialog>

      {/* STATUS DIALOGS */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-amber-600 flex items-center gap-2 font-black uppercase"><Clock className="h-5 w-5" /> Pending Approval</DialogTitle>
            <DialogDescription className="pt-2 text-slate-500 dark:text-zinc-400">Your account is currently under review by the administration.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowPendingDialog(false)} className={cn("w-full py-8 mt-4", outlinePillButton)}>OK</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showRegSuccessDialog} onOpenChange={setShowRegSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-white/10 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center text-center p-4 pt-8">
            <div className="relative w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 mb-6"><User className="h-10 w-10 text-green-500" /></div>
            <DialogTitle className="text-2xl font-bold uppercase tracking-tighter">Request Received</DialogTitle>
            <DialogDescription className="mt-2 text-slate-500 dark:text-zinc-400">Your registration request has been submitted for approval. Processing may take up to 24 hours.</DialogDescription>
            <Button onClick={() => { setShowRegSuccessDialog(false); setActiveTab("login"); }} className={cn("w-full py-8 mt-6", outlinePillButton)}>Return to Login</Button>
          </div>
        </DialogContent>
      </Dialog>

     <style>{`
  .outline-text { -webkit-text-stroke: 2px #dc2626; color: transparent; }
  @media (max-width: 1024px) { .outline-text { -webkit-text-stroke: 1.5px #dc2626; } }
  
  /* --- AUTOFILL FIX --- */
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active {
    /* This transitions the background color to transparent over a long period */
    -webkit-transition: "color 9999s ease-out, background-color 9999s ease-out";
    -webkit-transition-delay: 9999s;
    
    /* This handles the text color specifically */
    -webkit-text-fill-color: inherit !important;
    caret-color: white; 
  }
`}</style>
    </div>
  );
}