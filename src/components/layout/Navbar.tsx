import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedThemeToggle } from "@/components/ui/enhanced-theme-toggle";
import { useSettings } from "@/contexts/SettingsContext";
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

  const outlinePillButton =
    "!rounded-md bg-transparent border border-transparent " +
    "text-gray-900 dark:text-gray-100 px-6 py-2 text-sm font-medium " +
    "transition-all duration-200 ease-out " +
    "hover:border-gray-400 hover:bg-gray-100 hover:-translate-y-[1px] hover:shadow-sm " +
    "dark:hover:border-gray-500 dark:hover:bg-gray-800 " +
    "active:translate-y-0 active:shadow-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/40";

  const allNavigation = [
    { name: "Windows Images", href: "/windows", roles: ["admin", "user"] },
    { name: "Drivers", href: "/drivers", roles: ["admin", "user", "client"] },
    { name: "Guides", href: "/guides", roles: ["admin", "user", "client"] },
    { name: "Docs", href: "/docs", roles: ["admin", "user"] },
    {
      name: "Disassembly Guides",
      href: "/disassembly-guides",
      roles: ["admin", "user"],
    },
    { name: "Test Tools", href: "/test-tools", roles: ["admin", "user"] },
	{ name: "Stock", href: "/stock", roles: ["admin", "user"] },
    { name: "Requests", href: "/requests", roles: ["admin", "user", "client"] },
  ];

  const navigation = user
    ? allNavigation.filter((item) => item.roles.includes(user.role))
    : [];

  const isActive = (path: string) => location.pathname === path;

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
        "sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-200 border-b-2",
        scrolled
          ? "bg-background/95 shadow-md border-red-600 dark:border-white"
          : "bg-background border-red-600 dark:border-white"
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between relative w-full">
          
          {/* LEFT: Logo Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center z-10"
          >
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="relative">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  src={logoB}
                  alt="Logo"
                  className="h-[60px] w-auto block dark:hidden"
                />
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  src={logoW}
                  alt="Logo White"
                  className="hidden dark:block h-[60px] w-auto"
                />
              </div>
            </Link>
          </motion.div>

          {/* CENTER: Navigation Links (Absolutely centered) */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center">
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                      variant="ghost"
                      className={cn(
                        "rounded-none h-9 px-4 bg-transparent transition-all duration-200",
                        isActive(item.href)
                          ? "font-bold text-red-600 dark:text-white"
                          : "text-foreground hover:!text-red-600 hover:!font-bold dark:hover:!text-white"
                      )}
                    >
                      <Link to={item.href}>{item.name}</Link>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* RIGHT: Auth & Theme (Right aligned) */}
          <div className="hidden md:flex items-center space-x-4 z-10">
            <EnhancedThemeToggle />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={outlinePillButton}
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
                variant="outline"
                size="sm"
                className={cn(outlinePillButton, "font-semibold")}
              >
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>

          {/* MOBILE: Menu Button (Anchored right) */}
          <div className="flex items-center md:hidden">
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