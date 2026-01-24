import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Laptop, Cog, FileText, Wrench, Settings, 
  FileQuestion, ArrowRight, Activity 
} from "lucide-react";
import logo from "@/assets/wtpth/Thomson-Logo.png";
import BackVideo from "@/assets/wtpth/backvi.mp4";

export default function Home() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const serviceCards = [
    { title: "Windows Images", desc: "Deployment & Recovery Images", link: "/windows", icon: <Laptop />, tag: "SYS_CORE" },
    { title: "Drivers", desc: "Verified Hardware Stack", link: "/drivers", icon: <Cog />, tag: "IO_SYNC" },
    { title: "Docs", desc: "Technical Manuals & Guides", link: "/docs", icon: <FileText />, tag: "DOC_LIB" },
    { title: "Disassembly Guides", desc: "Disassembly & Maintenance", link: "/disassembly-guides", icon: <Wrench />, tag: "HW_MAINT" },
    { title: "Diagnostic Tools", desc: "Stress Test & Validation", link: "/test-tools", icon: <Settings />, tag: "VAL_LAB" },
    { title: "Support", desc: "Priority Technical Request", link: "/requests", icon: <FileQuestion />, tag: "SOS_LINE" }
  ];

  return (
    <div className="relative min-h-screen transition-colors duration-700 overflow-hidden font-sans bg-[#f8f9fa] dark:bg-[#050505] text-slate-900 dark:text-white">
      
      {/* BACKGROUND - High Visibility */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          className="w-full h-full object-cover transition-opacity duration-1000 grayscale opacity-40 contrast-125 dark:opacity-40" 
          autoPlay loop muted playsInline
        >
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 transition-all duration-700 bg-gradient-to-r from-[#f8f9fa]/60 via-[#f8f9fa]/20 to-transparent dark:from-[#050505] dark:via-[#050505]/80 dark:to-transparent" />
      </div>

      <main className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        
        {/* LEFT SECTION: BRANDING (Upper Logo) */}
        <section className="w-full lg:w-1/2 flex flex-col p-8 lg:p-20 lg:sticky lg:top-0 h-[45vh] lg:h-screen">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-auto"
          >
            <img 
              src={logo} 
              alt="Thomson" 
              className="h-20 lg:h-24 object-contain w-fit dark:brightness-200" 
            />
          </motion.div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="relative">
              <motion.div animate={{ opacity: hoveredIndex !== null ? 0.05 : 1 }}>
                <h1 className="text-6xl lg:text-[9rem] font-black tracking-[-0.05em] uppercase leading-[0.8] text-slate-950 dark:text-white">
                  TECH <br /> 
                  <span className="outline-text">PORTAL</span>
                </h1>
              </motion.div>

              <AnimatePresence>
                {hoveredIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 flex flex-col justify-center pointer-events-none"
                  >
                    <span className="text-red-600 font-mono text-2xl mb-2 font-black tracking-widest uppercase italic">
                      // {serviceCards[hoveredIndex].tag}
                    </span>
                    <h2 className="text-5xl lg:text-8xl font-black uppercase italic tracking-tighter text-slate-950 dark:text-white">
                      {serviceCards[hoveredIndex].title}
                    </h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-10 flex items-center gap-6 text-[10px] font-black tracking-[0.3em] uppercase text-slate-600 dark:text-zinc-500">
              <Activity size={14} className="text-red-600 animate-pulse" /> SYSTEM_LIVE
            </div>
          </div>
        </section>

        {/* RIGHT SECTION: MENU (Red Text on Hover) */}
        <section className="w-full lg:w-1/2 p-6 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-xl space-y-4">
            {serviceCards.map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative block"
              >
                <div className={`relative z-10 transition-all duration-500 rounded-2xl border p-8
                  ${hoveredIndex === idx 
                    ? 'translate-x-4 shadow-2xl bg-white dark:bg-zinc-900 border-red-600' 
                    : 'bg-white/40 border-slate-200/50 backdrop-blur-md dark:bg-white/5 dark:border-white/10'}
                `}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <span className={`font-mono text-xs font-black transition-colors 
                        ${hoveredIndex === idx ? 'text-red-600' : 'text-slate-500'}`}>
                        0{idx + 1}
                      </span>
                      
                      <div className={`transition-all duration-500 transform 
                        ${hoveredIndex === idx ? 'scale-125 text-red-600' : 'text-slate-400 dark:text-slate-500'}`}>
                        {item.icon}
                      </div>

                      <div>
                        {/* TITULO FICA VERMELHO NO HOVER */}
                        <h2 className={`text-2xl font-black uppercase tracking-tighter transition-colors
                          ${hoveredIndex === idx ? 'text-red-600' : 'text-slate-900 dark:text-white'}
                        `}>
                          {item.title}
                        </h2>
                        {/* DESCRIÇÃO FICA VERMELHO (com opacidade) NO HOVER */}
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 transition-colors
                          ${hoveredIndex === idx ? 'text-red-600/80' : 'text-slate-500 dark:text-slate-400 opacity-60'}
                        `}>
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className={`transition-all duration-500 
                      ${hoveredIndex === idx ? 'opacity-100 translate-x-0 text-red-600' : 'opacity-0 -translate-x-4'}`} 
                    />
                  </div>
                </div>

                {/* Efeito de brilho vermelho por trás do card selecionado */}
                <AnimatePresence>
                  {hoveredIndex === idx && (
                    <motion.div 
                      layoutId="hoverAura"
                      className="absolute inset-0 bg-red-600/5 blur-3xl -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <style>{`
        .outline-text {
          -webkit-text-stroke: 1.5px #dc2626;
          color: transparent;
        }
        @media (max-width: 1024px) {
          .outline-text { -webkit-text-stroke: 1px #dc2626; }
        }
      `}</style>
    </div>
  );
}