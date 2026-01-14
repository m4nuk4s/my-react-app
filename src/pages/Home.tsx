import { Link } from "react-router-dom";
import logo from "@/assets/wtpth/Thomson-Logo.png";
import { motion } from "framer-motion";
import { ArrowRight, Laptop, Cog, FileText, Wrench, Settings, FileQuestion } from "lucide-react";
import BackVideo from "@/assets/wtpth/backvi.mp4";

export default function Home() {
  const serviceCards = [
    {
      title: "Windows Support",
      description: "Instalation support for Windows 10 & 11",
      link: "/windows",
      icon: <Laptop className="h-8 w-8" />,
    },
    {
      title: "Drivers",
      description: "Find and download drivers for your computer model",
      link: "/drivers",
      icon: <Cog className="h-8 w-8" />,
    },
    {
      title: "Guides",
      description: "Troubleshooting Guides",
      link: "/guides",
      icon: <FileText className="h-8 w-8" />,
    },
    {
      title: "Disassembly",
      description: "Repair & Disassembly guides",
      link: "/disassembly-guides",
      icon: <Wrench className="h-8 w-8" />,
    },
    {
      title: "Test Tools",
      description: "Diagnostic utilities",
      link: "/test-tools",
      icon: <Settings className="h-8 w-8" />,
    },
    {
      title: "Support",
      description: "Submit a request for technical support",
      link: "/requests",
      icon: <FileQuestion className="h-8 w-8" />,
    }
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="relative min-h-screen text-foreground selection:bg-red-500/30 bg-[#050505]">
      
      {/* FIXED VIDEO BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          className="w-full h-full object-cover opacity-40 contrast-125 saturate-100" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src={BackVideo} type="video/mp4" />
        </video>
        {/* Subtle dark overlay to make white text and tiles pop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* SCROLLABLE CONTENT LAYER */}
      <div className="relative z-10">
        
   {/* Hero Section */}
{/* Reduced section height from 60vh to 40vh or 50vh to bring content up */}
<section className="h-[45vh] flex items-center">
  <div className="container mx-auto px-6">
    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-4xl">
      {/* Logo: h-16 as requested, mb-4 to tighten gap with text */}
      <img src={logo} alt="Thomson" className="h-16 mb-4 object-contain" />
      
      {/* Title: mb-2 to pull the description closer */}
      <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-2 text-white">
        Technical <span className="font-bold uppercase text-red-600">Support</span>
      </h1>
      
      <p className="text-lg text-zinc-200 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 drop-shadow-md">
        Simplified access to drivers, manuals, and diagnostic tools.
      </p>
    </motion.div>
  </div>
</section>

        {/* Frosted Light Tiles Section */}
        <section className="pb-32">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCards.map((service, index) => (
                <Link 
                  key={index}
                  to={service.link} 
                  /* UPDATED: Increased light-mode opacity (bg-white/80) and added shadow for depth */
                  className="group relative overflow-hidden rounded-2xl bg-white/80 p-10 backdrop-blur-xl border border-slate-200 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:bg-white/95 hover:border-red-600/40 dark:bg-white/10 dark:border-white/20 dark:shadow-none dark:hover:bg-white/20"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    {/* RED ICON */}
                    <div className="mb-8 text-red-600 dark:text-red-500 group-hover:scale-110 transition-transform duration-300 origin-left">
                      {service.icon}
                    </div>

                    <div className="mt-auto">
                      {/* Title - Strong Slate-950 for light mode visibility */}
                      <h3 className="text-xl font-bold mb-2 tracking-tight uppercase text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                        {service.title}
                      </h3>
                      
                      {/* Description - UPDATED to text-slate-800 for high readability in light mode */}
                      <p className="text-sm text-slate-800 dark:text-zinc-100/80 leading-relaxed font-semibold dark:font-medium">
                        {service.description}
                      </p>

                      {/* Accent line */}
                      <div className="mt-6 h-[1px] w-12 bg-slate-300 dark:bg-red-600/50 group-hover:w-full group-hover:bg-red-500 transition-all duration-500" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}