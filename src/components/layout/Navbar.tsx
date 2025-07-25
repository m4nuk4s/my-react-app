import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedThemeToggle } from "@/components/ui/enhanced-theme-toggle";
import { useSettings } from "@/contexts/SettingsContext";
import logo from "@/assets/wtpth/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { settings } = useSettings();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Windows", href: "/windows" },
    { name: "Drivers", href: "/drivers" },
    { name: "Guides", href: "/guides" },
    { name: "Disassembly Guides", href: "/disassembly-guides" },
    { name: "Test Tools", href: "/test-tools" },
    { name: "Requests", href: "/requests" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="bg-background shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
              <span className="text-xl font-bold text-primary">Support Center</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:ml-6 md:flex md:space-x-2 md:items-center">
            {navigation.map((item) => (
              <Button
                key={item.name}
                asChild
                variant={isActive(item.href) ? "default" : "ghost"}
                className={isActive(item.href) ? "" : ""}
                size="sm"
              >
                <Link to={item.href}>{item.name}</Link>
              </Button>
            ))}
            

            
            {/* Theme Toggle button if enabled */}
            {settings?.showThemeButton && (
              <EnhancedThemeToggle />
            )}

            {/* Authentication buttons */}
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button
                    asChild
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    <Link to="/admin">Admin</Link>
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout} className="flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
                <div className="flex items-center ml-2 text-sm font-medium">
                  <User className="h-4 w-4 mr-1" />
                  {user?.username}
                </div>
              </>
            ) : (
              <Button
                asChild
                variant={isActive("/login") ? "default" : "outline"}
                className={isActive("/login") ? "" : ""}
              >
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="mt-6 flow-root">
                  <div className="py-4">
                    <div className="flex flex-col gap-2">
                      {navigation.map((item) => (
                        <Button
                          key={item.name}
                          asChild
                          variant={isActive(item.href) ? "default" : "ghost"}
                          className="justify-start"
                          onClick={() => setIsOpen(false)}
                        >
                          <Link to={item.href}>{item.name}</Link>
                        </Button>
                      ))}
                      

                      
                      {/* Theme toggle button for mobile if enabled */}
                      {settings?.showThemeButton && (
                        <div className="flex justify-start px-3 py-2">
                          <EnhancedThemeToggle />
                          <span className="ml-2">Toggle theme</span>
                        </div>
                      )}
                        
                      {/* Auth buttons for mobile */}
                      <div className="pt-4 mt-4 border-t border-gray-200">
                        {isAuthenticated ? (
                          <>
                            <div className="flex items-center px-3 py-2 text-sm font-medium mb-2">
                              <User className="h-4 w-4 mr-2" />
                              {user?.username}
                            </div>
                            {isAdmin && (
                              <Button
                                asChild
                                variant="destructive"
                                className="justify-start bg-red-600 hover:bg-red-700 text-white font-bold"
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
                            variant={isActive("/login") ? "default" : "outline"}
                            className={`w-full justify-start ${isActive("/login") ? "bg-blue-600 text-white" : ""}`}
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
    </nav>
  );
}