import { EnhancedThemeToggle } from "@/components/ui/enhanced-theme-toggle";
import { Link } from "react-router-dom";
import { Github, Twitter, Mail, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const footerLinks = [
    { label: "Windows", href: "/windows" },
    { label: "Drivers", href: "/drivers" },
    { label: "Guides", href: "/guides" },
    { label: "Test Tools", href: "/test-tools" },
    { label: "Support", href: "/requests" },
  ];

  // Social links removed as requested

  return (
    <footer className="mt-auto border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company info */}
          <div>
            <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Thomson Support</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Your comprehensive resource center for hardware and software support. We're here to help you resolve technical issues efficiently.
            </p>
            {/* Social icons removed as requested */}
          </div>
          
          {/* Quick links section removed as requested */}
          
          {/* Theme toggle */}
          <div>
            <h3 className="font-bold text-lg mb-4">Preferences</h3>
            <div className="flex items-center space-x-2 mb-4">
              <EnhancedThemeToggle />
              <span className="text-sm">Toggle theme</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Thomson Support
            </p>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-8 pt-4 border-t border-border/50 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground mb-2 md:mb-0">
            All rights reserved.
          </p>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-3 w-3 mx-1 text-red-500" />
            <span>by Tech Support Team</span>
          </div>
        </div>
      </div>
      
      {/* Remove the fixed theme toggle since we have it in the footer now */}
    </footer>
  );
}