import { EnhancedThemeToggle } from "@/components/ui/enhanced-theme-toggle";
import { Heart, Activity, ShieldCheck, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/10 bg-white/70 dark:bg-[#020202]/80 backdrop-blur-2xl transition-all duration-500">
      {/* Top Accent Line - Matching Login Dialogs */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />
      
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          
          {/* Company info: Using the "Portal Access" Typography Style */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">
              <Activity size={14} className="text-red-600 animate-pulse" /> 
              
            </div>
            <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">
              Thomson <br />
              <span className="outline-text" style={{ WebkitTextStroke: '1px #dc2626', color: 'transparent' }}>Support</span>
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 max-w-xs leading-relaxed border-l border-red-600/50 pl-4">
              Your comprehensive resource center for hardware and software support. 
              Encrypted access to technical documentation and driver repositories.
            </p>
          </div>
          
          {/* Status / Contact Section */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System Status</label>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Operational</span>
              </div>
            </div>
            
            <a href="mailto:Operateur.sav.5@groupsfit.eu" className="group flex items-center gap-3 text-slate-400 hover:text-red-600 transition-all">
              <div className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-red-500/50 group-hover:bg-red-500/5 transition-all">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Support Email:</span>
                <span className="text-[10px] font-mono lowercase">Contact Support</span>
              </div>
            </a>
          </div>
          
          {/* Preferences & Identity */}
          <div className="flex flex-col md:items-end space-y-6">
            <div className="text-left md:text-right space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block">Interface Preferences</label>
              <div className="flex items-center md:justify-end space-x-3">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Visual Mode</span>
                <EnhancedThemeToggle />
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5 text-left md:text-right">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                © {new Date().getFullYear()} Thomson_Support
              </p>
			  <div className="flex items-center text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
            <span>Made it by</span>
            <Heart className="h-3 w-3 mx-2 text-red-600 animate-pulse" />
            <span>Tech Support Team</span>
          </div>
            </div>
          </div>
        </div>
        
     
      </div>

      <style>{`
        .outline-text { -webkit-text-stroke: 1px #dc2626; color: transparent; }
      `}</style>
    </footer>
  );
}