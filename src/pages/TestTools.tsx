import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  Check, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  MemoryStick, 
  HardDrive, 
  Network, 
  Thermometer, 
  Battery,
  ShieldCheck,
  Activity
} from "lucide-react";
import Home from "@/assets/wtpth/Home.jpg";
import maininf from "@/assets/wtpth/maininf.jpg";
import final from "@/assets/wtpth/final.jpg";
import tp from "@/assets/wtpth/tp.jpg";
import kbc from "@/assets/wtpth/kbc.jpg";
import Serial from "@/assets/wtpth/Serial.jpg";
import sound from "@/assets/wtpth/sound.jpg";
import WtpthIcon from "@/assets/wtpth/wtpth.png";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import BackVideo from "@/assets/wtpth/backvi.mp4";
import { useState } from "react"; // Added missing import

export default function TestTools() {
  const { isAuthenticated } = useAuth();

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" } 
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  // Updated to match Windows.tsx button styling
  const outlinePillButton =
    "relative rounded-md px-6 py-2 text-sm font-medium " +
    "text-slate-900 dark:text-white bg-transparent " +
    "transition-all duration-300 ease-in-out transform " +
    "hover:bg-slate-100 dark:hover:bg-red-600/20 " +
    "focus:outline-none focus:ring-2 focus:ring-slate-400/40 " +
    "before:absolute before:inset-0 before:rounded-md before:border-2 " +
    "before:border-red-600 dark:before:border-red-600 before:opacity-0 " +
    "hover:before:opacity-100 active:scale-95";

  // Updated tile class to match Windows.tsx
  const tileClassName = (hovered: boolean) => 
    `group relative overflow-hidden rounded-2xl border p-8 backdrop-blur-md transition-all duration-500
    ${hovered 
      ? 'translate-x-4 shadow-2xl bg-white dark:bg-zinc-900 border-red-600' 
      : 'bg-white/40 border-slate-200/50 dark:bg-white/5 dark:border-white/10'
    }`;

  const featuredTool = {
    name: "WTPTH",
    version: "2.5.1",
    description: "Windows Test Powered Tool for Hardware (WTPTH) is a comprehensive diagnostic tool that tests all major hardware components of your computer.",
    features: [
      "Computer specifications check",
      "RAM capacity",
      "Storage check",
      "Keyboard test",
      "Network connection testing and speed measurement",
      "System information gathering and reporting"
    ],
    screenshots: [
      { title: "Main Window", path: Home },
      { title: "Serial Replace", path: Serial },
      { title: "Computer Info", path: maininf },
      { title: "Keyboard Test", path: kbc },
      { title: "Speakers test", path: sound },
      { title: "Touchpad Test", path: tp },
      { title: "Final Results", path: final }
    ],
    systemRequirements: {
      os: "Windows 10/11 (64-bit)",
      cpu: "Any modern dual-core processor",
      ram: "2 GB minimum, 4 GB recommended",
      storage: "200 MB free space",
      other: "Administrator privileges required"
    },
    downloadLink: "https://drive.google.com/file/d/1bEBVk9Wgd9DK9xHH_Kwy_vCBbmH7frLg/view?usp=sharing"
  };

  const otherTools = [
    {
      name: "Memtest86",
      version: "11.3",
      description: "Advanced memory testing tool to identify RAM issues and instabilities.",
      category: "Hardware",
      os: ["windows10", "windows11"],
      size: "15 MB",
      link: "https://www.memtest86.com/downloads/memtest86-usb.zip",
      icon: <MemoryStick className="h-8 w-8 text-red-600" />
    },
    {
      name: "Crystal Disk Mark",
      version: "9.0.1",
      description: "Hard drive and SSD diagnostic tool that monitors health, performs read/write tests, and predicts failures.",
      category: "Storage",
      os: ["windows10", "windows11"],
      size: "28 MB",
      link: "https://crystalmark.info/redirect.php?product=CrystalDiskMark",
      icon: <HardDrive className="h-8 w-8 text-red-600" />
    },
    {
      name: "Network Analyzer",
      version: "12.8",
      description: "Network diagnostic utility that tests connection speed, latency, and identifies connectivity issues.",
      category: "Network",
      os: ["windows10", "windows11"],
      size: "257 MB",
      link: "https://www.manageengine.com/products/netflow/2028821/ManageEngine_NetFlowAnalyzer_64bit.exe",
      icon: <Network className="h-8 w-8 text-red-600" />
    },
    {
      name: "Core Temp",
      version: "1.18.1",
      description: "Temperature monitoring tool that tracks CPU, GPU, and other component temperatures over time.",
      category: "Hardware",
      os: ["windows10"],
      size: "18 MB",
      link: "https://www.alcpu.com/CoreTemp/Core-Temp-setup-v1.18.1.0.exe",
      icon: <Thermometer className="h-8 w-8 text-red-600" />
    },
    {
      name: "Battery Info View",
      version: "1.26",
      description: "Laptop battery tool that check capacity, discharge rate, and estimates remaining battery life.",
      category: "Hardware",
      os: ["windows10", "windows11"],
      size: "12 MB",
      link: "https://www.nirsoft.net/utils/batteryinfoview-x64.zip",
      icon: <Battery className="h-8 w-8 text-red-600" />
    }
  ];

  const usageGuides = [
    {
      title: "How to run a full system diagnostic",
      steps: [
        "Download and install WTPTH from the download link below",
        "Launch the application with administrator privileges",
        "Click 'Start' and add the RMA and wait for the load",
        "Run each different test",
        "You can export the test results to PDF file",
      ]
    },
    {
      title: "Understanding test results",
      steps: [
        "Green checkmarks indicate passed tests with no issues detected",
        "Orange alerts indicate critical issues that need immediate attention",
        "Please check for every Orange alert for a Software or Hardware issue like a Keyboard faulty key",
        "Use the 'Export Report' button to save a copy of the results for future reference"
      ]
    }
  ];

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen transition-colors duration-700 overflow-hidden font-sans bg-[#f8f9fa] dark:bg-[#050505] text-slate-900 dark:text-white">
      {/* BACKGROUND - Matches Windows.tsx exactly */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          className="w-full h-full object-cover transition-opacity duration-1000 grayscale opacity-40 contrast-125 dark:opacity-40" 
          autoPlay loop muted playsInline
        >
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 transition-all duration-700 bg-gradient-to-r from-[#f8f9fa]/60 via-[#f8f9fa]/20 to-transparent dark:from-[#050505] dark:via-[#050505]/80 dark:to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Hero Section - Matches Windows.tsx */}
        <section className="h-[40vh] flex items-center">
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="mb-6 flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase text-slate-600 dark:text-zinc-500">
                <Activity size={14} className="text-red-600 animate-pulse" /> DIAGNOSTICS // TEST_TOOLS
              </div>
              
              <h1 className="text-4xl md:text-[5rem] font-black tracking-[-0.05em] uppercase leading-[0.8] text-slate-950 dark:text-white mb-6">
                Technical <br />
                <span className="outline-text">Diagnostics</span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 font-medium">
                Professional hardware verification suites and performance benchmarking utilities.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-6 pb-20 space-y-16">
          {/* Featured Tool Section */}
          <motion.div 
            
            variants={cardVariants}
           
            
            className={tileClassName(hoveredCard === 0)}
          >
            {/* Hover aura effect from Windows.tsx */}
            <AnimatePresence>
              {hoveredCard === 0 && (
                <motion.div 
                  layoutId="hoverAura"
                  className="absolute inset-0 bg-red-600/5 blur-3xl -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
                <div className="flex items-center gap-6">
                  <div className={`transition-all duration-500 transform 
                    ${hoveredCard === 0 ? 'scale-125 text-red-600' : 'text-slate-400 dark:text-slate-500'}`}>
                    <img src={WtpthIcon} alt="WTPTH Icon" className="h-16 w-16 object-contain" />
                  </div>
                  <div>
                    <Badge className="bg-red-600 hover:bg-red-700 text-white mb-2 font-black uppercase text-[10px] tracking-widest">
                      FEATURED TOOL
                    </Badge>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950 dark:text-white transition-colors group-hover:text-red-600">
                      {featuredTool.name}
                    </h2>
                    <p className="text-red-600 font-mono font-bold">v{featuredTool.version}</p>
                  </div>
                </div>
                
                <div className="min-w-[220px]">
                  {isAuthenticated ? (
                    <Button asChild 
    className="h-14 px-12 rounded-xl font-black uppercase tracking-wider 
      bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
      text-white shadow-lg hover:shadow-red-500/20
      transition-all duration-300 transform hover:-translate-y-0.5"
  >
    <a href={featuredTool.downloadLink} target="_blank" rel="noreferrer" className="flex items-center justify-center">
      <Download className="mr-3 h-5 w-5" /> 
      DOWNLOAD NOW
    </a>
  </Button>
                  ) : (
                    <Button asChild 
    className="h-14 px-12 rounded-xl font-black uppercase tracking-wider 
      bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
      text-white shadow-lg hover:shadow-red-500/20
      transition-all duration-300 transform hover:-translate-y-0.5"
  >
    <Link to="/login" className="flex items-center justify-center">
      LOGIN TO DOWNLOAD
    </Link>
  </Button>
                  )}
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                {/* Updated TabsList to match Windows.tsx styling */}
                <TabsList className="grid grid-cols-5 gap-3 bg-white/40 backdrop-blur-md border border-slate-200/50 dark:bg-white/5 dark:border-white/10 p-1.5 mb-8 rounded-xl h-auto overflow-hidden">
                  {["overview", "features", "screenshots", "requirements", "guides"].map((tab) => (
                    <TabsTrigger 
                      key={tab} 
                      value={tab} 
                      className="capitalize transition-all duration-500 rounded-lg py-2 text-sm font-black tracking-tight data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="overview" key="overview" className="space-y-8 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-4">
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-950 dark:text-white">
                          System Integrity Check
                        </h3>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-lg font-medium">
                          {featuredTool.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-red-600 font-bold text-sm uppercase tracking-widest">
                          <ShieldCheck className="h-5 w-5 text-red-600" /> Administrator Privileges Required
                        </div>
                      </div>
                      
                      <div className="bg-white/40 dark:bg-white/5 p-6 rounded-xl border border-slate-200/50 dark:border-white/10">
                        <h4 className="font-black uppercase text-xs tracking-widest text-slate-950 dark:text-white mb-4 flex items-center gap-2">
                          <Info className="h-4 w-4 text-red-600" /> Quick Facts
                        </h4>
                        <ul className="space-y-4 text-sm">
                          {[
                            "Tests all critical hardware",
                            "Generates detailed PDF reports",
                            "Mainboard Serial Number Replace",
                            "Touchpad & Keyboard verification"
                          ].map((fact, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-zinc-400 font-medium">
                              <Check className="h-4 w-4 text-red-600 mt-1 shrink-0" /> {fact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" key="features" className="space-y-8 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {featuredTool.features.map((feature, index) => (
                        <div key={index} className="bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 p-4 rounded-xl flex items-center gap-4">
                          <CheckCircle2 className="h-5 w-5 text-red-600 shrink-0" />
                          <span className="text-slate-600 dark:text-zinc-400 font-bold">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="screenshots" key="screenshots" className="space-y-8 outline-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {featuredTool.screenshots.map((s, i) => (
                        <div key={i} className="group relative rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/10 bg-black">
                          <img 
                            src={s.path} 
                            alt={s.title} 
                            className="aspect-video object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" 
                          />
                          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{s.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="requirements" key="requirements" className="space-y-8 outline-none">
                    <Card className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10">
                      <CardHeader>
                        <CardTitle className="uppercase tracking-widest text-red-600 font-black">Technical Specifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {Object.entries(featuredTool.systemRequirements).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-3 border-b border-slate-200/50 dark:border-white/5">
                            <span className="text-slate-600 dark:text-zinc-400 uppercase text-xs font-black">{key}</span>
                            <span className="text-slate-900 dark:text-white font-medium">{value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="guides" key="guides" className="space-y-8 outline-none">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                      {usageGuides.map((guide, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-white/5 rounded-xl px-4">
                          <AccordionTrigger className="text-slate-900 dark:text-white hover:text-red-600 font-black uppercase tracking-tight text-left py-6">
                            {guide.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-600 dark:text-zinc-400 pb-6 font-medium">
                            <ol className="list-decimal list-inside space-y-3">
                              {guide.steps.map((step, sIndex) => (
                                <li key={sIndex} className="pl-2 border-l-2 border-red-600/30 ml-2">{step}</li>
                              ))}
                            </ol>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
              
              <div className="mt-8 h-[1px] w-12 bg-slate-300 dark:bg-red-600/50 group-hover:w-full group-hover:bg-red-500 transition-all duration-500" />
            </div>
          </motion.div>

          {/* Utility Library Section */}
          <section>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 text-slate-950 dark:text-white border-l-4 border-red-600 pl-4">
              Utility <span className="outline-text">Library</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherTools.map((tool, index) => (
                <motion.div
                  key={index}
                  
                  variants={cardVariants}
                 
                
                  className={tileClassName(hoveredTool === index)}
                >
                  <AnimatePresence>
                    {hoveredTool === index && (
                      <motion.div 
                        layoutId="hoverAura"
                        className="absolute inset-0 bg-red-600/5 blur-3xl -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <div className={`transition-all duration-500 transform 
                        ${hoveredTool === index ? 'scale-125 text-red-600' : 'text-slate-400 dark:text-slate-500'}`}>
                        {tool.icon}
                      </div>
                      <Badge variant="outline" className="text-red-600 border-red-600/30 uppercase text-[10px] tracking-widest font-black">
                        {tool.category}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-slate-950 dark:text-white group-hover:text-red-600 transition-colors">
                      {tool.name}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium mb-6 flex-grow">
                      {tool.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between">
                      <Button asChild 
  className="h-10 px-6 rounded-xl font-bold uppercase tracking-wider text-xs
    bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
    text-white shadow-md hover:shadow-lg 
    transition-all duration-300"
>
  <a href={tool.link} target="_blank" rel="noreferrer" className="flex items-center">
    <Download className="mr-2 h-4 w-4" /> Download
  </a>
</Button>
                      <span className="text-[10px] font-mono text-slate-600 dark:text-zinc-500 uppercase font-bold">{tool.size}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 h-[1px] w-12 bg-slate-300 dark:bg-red-600/50 group-hover:w-full group-hover:bg-red-500 transition-all duration-500" />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Support Section */}
          
        </div>
      </div>

      <style>{`
        .outline-text {
          -webkit-text-stroke: 2px #dc2626;
          color: transparent;
        }
        @media (max-width: 1024px) {
          .outline-text { -webkit-text-stroke: 1.5px #dc2626; }
        }
        @media (max-width: 640px) {
          .outline-text { -webkit-text-stroke: 1px #dc2626; }
        }
      `}</style>
    </div>
  );
}