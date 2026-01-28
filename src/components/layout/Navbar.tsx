import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, LogOut, ChevronDown, Activity, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedThemeToggle } from "@/components/ui/enhanced-theme-toggle";
import { cn } from "@/lib/utils";
import logoW from "@/assets/wtpth/logoW.png";
import logoB from "@/assets/wtpth/logoB.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navPillButton = cn(
    "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-all duration-300",
    "text-[10px] font-black uppercase tracking-[0.2em]",
    "bg-white/40 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/10",
    "hover:border-red-600/60 hover:shadow-[0_0_20px_-5px_rgba(220,38,38,0.3)] hover:text-red-600 active:scale-95"
  );

  const allNavigation = [
    { name: "Windows Images", href: "/windows", roles: ["admin", "user"] },
    { name: "Drivers", href: "/drivers", roles: ["admin", "user", "client"] },
    { name: "Guides", href: "/guides", roles: ["admin", "user", "client"] },
    { name: "Docs", href: "/docs", roles: ["admin", "user"] },
    { name: "Disassembly Guides", href: "/disassembly-guides", roles: ["admin", "user"] },
    { name: "Test Tools", href: "/test-tools", roles: ["admin", "user"] },
    { name: "Stock", href: "/stock", roles: ["admin", "user"] },
    { name: "Requests", href: "/requests", roles: ["admin", "user", "client"] },
  ];

  const navigation = user ? allNavigation.filter((item) => item.roles.includes(user.role)) : [];
  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled
          ? "bg-white/95 dark:bg-[#020202]/95 backdrop-blur-xl border-red-600/50 h-14"
          : "bg-background/80 backdrop-blur-md border-transparent h-16"
      )}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full relative">
          
          {/* LOGO AREA */}
          <div className="flex items-center gap-6 z-10">
            <Link to="/" className="flex items-center transition-opacity hover:opacity-80">
              <img src={logoB} className="h-9 sm:h-12 w-auto dark:hidden" alt="Logo" />
              <img src={logoW} className="h-9 sm:h-12 w-auto hidden dark:block" alt="Logo" />
            </Link>
          </div>

          {/* MAIN NAV (Desktop Only) */}
          <div className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
            {isAuthenticated && navigation.map((item) => (
              <Link 
                key={item.name} 
                to={item.href}
                className={cn(
                  "relative px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition-all",
                  isActive(item.href) 
                    ? "text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" 
                    : "text-slate-500 dark:text-zinc-500 hover:text-red-500"
                )}
              >
                {item.name}
                {isActive(item.href) && (
                  <motion.div layoutId="nav-glow" className="absolute bottom-0 left-2 right-2 h-[1px] bg-red-600 shadow-[0_0_10px_#dc2626]" />
                )}
              </Link>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-4 z-10">
            <EnhancedThemeToggle />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className={navPillButton}>
                  <ShieldCheck size={14} className="text-red-600" />
                  <span className="hidden sm:inline-block truncate max-w-[80px]">{user?.username}</span>
                  <ChevronDown size={12} className="opacity-30" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 mt-2 bg-white/95 dark:bg-zinc-950/95 border-red-600/30 shadow-2xl backdrop-blur-2xl">
                  {isAdmin && (
                    <DropdownMenuItem asChild className="focus:bg-red-600/10 cursor-pointer">
                      <Link to="/admin" className="w-full text-[10px] font-black uppercase tracking-widest text-red-600">Admin_Terminal</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => logout()} className="focus:bg-red-600/10 cursor-pointer text-[10px] font-black uppercase tracking-widest">
                    <LogOut size={12} className="mr-2" /> End_Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className={navPillButton}>
                <User size={14} className="text-red-600" />
                <span className="hidden sm:inline">Authenticate</span>
              </Link>
            )}

            {/* MOBILE MENU */}
            <div className="xl:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-red-600/10 border border-transparent active:border-red-600/40">
                    <MenuIcon className="h-6 w-6 text-red-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white/95 dark:bg-[#020202]/95 backdrop-blur-2xl border-l border-red-600/40 p-0 w-[280px]">
                  <div className="flex flex-col h-full">
                    {/* Industrial Header */}
                    <div className="p-6 pt-12 border-b border-zinc-200 dark:border-white/5">
                      <div className="text-[10px] font-black tracking-[0.4em] text-zinc-500 mb-2 flex items-center gap-2">
                         <Activity size={12} className="text-red-600 animate-pulse" /> SYSTEM_ROOT
                      </div>
                      <div className="text-[9px] font-mono opacity-50 uppercase tracking-widest">Access_Level: {user?.role || "Unauthorized"}</div>
                    </div>

                    {/* Nav Links */}
                    <div className="flex-1 py-4 overflow-y-auto">
                      {navigation.map((item) => (
                        <Link 
                          key={item.name} 
                          to={item.href} 
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "group block py-4 px-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative",
                            isActive(item.href) 
                              ? "text-red-600 bg-red-600/5 border-r-4 border-red-600" 
                              : "text-zinc-500 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-white/5 border-r-4 border-transparent"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            {item.name}
                            <span className={cn("text-[8px] opacity-0 group-hover:opacity-100 transition-opacity", isActive(item.href) && "opacity-100 animate-pulse")}>
                              {isActive(item.href) ? "ACTIVE" : "SELECT"}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Industrial Footer */}
                    <div className="p-6 border-t border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                      <Button 
    onClick={() => {
      logout();      // Logs the user out
      setIsOpen(false); // Closes the mobile side menu
    }} 
    variant="ghost" 
    className="w-full justify-start text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-600 p-0 h-auto"
  >
    <LogOut size={12} className="mr-2" /> Terminate_Session
  </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}