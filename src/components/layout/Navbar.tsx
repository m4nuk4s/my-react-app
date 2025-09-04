import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedThemeToggle } from "@/components/ui/enhanced-theme-toggle";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/wtpth/logo.png";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { settings } = useSettings();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const navigation = [
    { name: "💻Windows", href: "/windows" },
    { name: "🛠️Drivers", href: "/drivers" },
    { name: "🗒Guides", href: "/guides" },
    { name: "📜Docs", href: "/docs" },
    { name: "🪛Disassembly Guides", href: "/disassembly-guides" },
    { name: "📊Test Tools", href: "/test-tools" },
    { name: "❓Requests", href: "/requests" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-200",
        scrolled
          ? "bg-background/95 shadow-md border-b"
          : "bg-background border-b border-transparent"
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center relative w-full">
          {/* Left: Logo + Support Center */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center absolute left-4"
          >
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <motion.img
                whileHover={{ rotate: 0, scale: 1.1 }}
                transition={{ type: "mass", stiffness: 400, damping: 10 }}
                src={logo}
                alt="Logo"
                className="h-10 w-10 mr-2"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-primary transition-all duration-300">
                Support Center
              </span>
            </Link>
          </motion.div>

          {/* Center: Navigation + Auth */}
          <div className="flex-1 flex justify-center items-center">
            <div className="hidden md:flex md:space-x-1 md:items-center">
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                  className="flex space-x-1 items-center"
                >
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Button
                        asChild
                        variant={isActive(item.href) ? "default" : "ghost"}
                        className={cn(
                          "rounded-full px-4 transition-all",
                          isActive(item.href)
                            ? "bg-primary/90 text-primary-foreground hover:bg-primary/80"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                        size="sm"
                      >
                        <Link to={item.href}>{item.name}</Link>
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <div className="flex items-center ml-4 space-x-2">
                <EnhancedThemeToggle />

                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 rounded-full border-primary/30 hover:border-primary"
                      >
                        <User className="h-4 w-4 mr-2 text-primary" />
                        <span className="max-w-[100px] truncate">
                          {user?.username}
                        </span>
                        <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 animate-in fade-in-80 shadow-lg"
                    >
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link
                            to="/admin"
                            className="w-full cursor-pointer text-red-600 font-semibold"
                          >
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary transition-all duration-300"
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Mobile menu button */}
          <div className="flex items-center md:hidden absolute right-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] border-l border-primary/20"
              >
                <div className="mt-6 flow-root">
                  <div className="py-4">
                    <div className="flex flex-col gap-2">
                      {isAuthenticated && (
                        <>
                          {navigation.map((item) => (
                            <Button
                              key={item.name}
                              asChild
                              variant={isActive(item.href) ? "default" : "ghost"}
                              className={cn(
                                "justify-start",
                                isActive(item.href)
                                  ? "bg-primary/90 text-primary-foreground"
                                  : ""
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              <Link to={item.href}>{item.name}</Link>
                            </Button>
                          ))}
                        </>
                      )}

                      <div className="flex items-center px-3 py-2">
                        <EnhancedThemeToggle />
                        <span className="ml-2 text-sm font-medium">
                          Toggle theme
                        </span>
                      </div>

                      <div className="pt-4 mt-4 border-t border-primary/20">
                        {isAuthenticated ? (
                          <>
                            <div className="flex items-center px-3 py-2 text-sm font-medium mb-2">
                              <User className="h-4 w-4 mr-2 text-primary" />
                              <span className="max-w-[200px] truncate">
                                {user?.username}
                              </span>
                            </div>
                            {isAdmin && (
                              <Button
                                asChild
                                variant="destructive"
                                className="justify-start w-full font-bold"
                                onClick={() => setIsOpen(false)}
                              >
                                <Link to="/admin">Admin Dashboard</Link>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              className="w-full justify-start mt-2"
                              onClick={handleLogout}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Logout
                            </Button>
                          </>
                        ) : (
                          <Button
                            asChild
                            variant="default"
                            className="w-full justify-start bg-gradient-to-r from-primary to-purple-600"
                            onClick={() => setIsOpen(false)}
                          >
                            <Link to="/login">Login</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
