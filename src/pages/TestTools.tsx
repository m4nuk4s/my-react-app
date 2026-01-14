import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
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
  ShieldCheck
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

export default function TestTools() {
  const { isAuthenticated } = useAuth();

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // 1. Updated the constant to use !important for dark text
  const outlinePillButton =
    "relative rounded-md px-6 py-2 text-sm font-medium " +
    "text-gray-900 dark:!text-white bg-transparent " +
    "transition-all duration-300 ease-in-out transform " +
    "hover:bg-gray-100 dark:hover:bg-red-600/20 " +
    "focus:outline-none focus:ring-2 focus:ring-gray-400/40 focus:ring-offset-2 focus:ring-offset-transparent " +
    "before:absolute before:inset-0 before:rounded-md before:border-2 before:border-red-500 dark:before:border-white before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out " +
    "hover:before:opacity-100 " +
    "active:scale-95";

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
      name: "CrystalDiskMark",
      version: "9.0.1",
      description: "Hard drive and SSD diagnostic tool that monitors health, performs read/write tests, and predicts failures.",
      category: "Storage",
      os: ["windows10", "windows11"],
      size: "28 MB",
      link: "https://crystalmark.info/redirect.php?product=CrystalDiskMark",
      icon: <HardDrive className="h-8 w-8 text-red-600" />
    },
    {
      name: "NetworkAnalyzer",
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
        name: "BatteryInfoView",
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

  return (
    <div className="relative min-h-screen text-foreground bg-[#050505] selection:bg-red-500/30">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video className="w-full h-full object-cover opacity-40 contrast-125 saturate-100" autoPlay loop muted playsInline>
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      <div className="relative z-10">
        <section className="pt-20 pb-12">
          <div className="container mx-auto px-6">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4 text-white">
                Technical <span className="font-bold uppercase text-red-600">Diagnostics</span>
              </h1>
              <p className="text-lg text-zinc-200 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 drop-shadow-md">
                Professional hardware verification suites and performance benchmarking utilities.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-6 space-y-16 pb-32">
          
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp}
            className="group relative overflow-hidden rounded-2xl bg-white/80 p-8 backdrop-blur-xl border border-slate-200 shadow-sm transition-all duration-300 hover:scale-[1.01] dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/20"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-1 group-hover:scale-110 transition-transform duration-300">
                    <img src={WtpthIcon} alt="WTPTH Icon" className="h-16 w-16 object-contain" />
                  </div>
                  <div>
                    <Badge className="bg-red-600 hover:bg-red-700 text-white mb-2">FEATURED TOOL</Badge>
                    <h2 className="text-4xl font-bold text-slate-950 dark:text-white uppercase tracking-tighter transition-colors group-hover:text-red-600">
                        {featuredTool.name}
                    </h2>
                    <p className="text-slate-600 dark:text-zinc-400 font-mono">v{featuredTool.version}</p>
                  </div>
                </div>
                
                <div className="min-w-[220px]">
                  {isAuthenticated ? (
                    <Button asChild variant="outline" className={`${outlinePillButton} dark:!text-white`}>
                      <a href={featuredTool.downloadLink} target="_blank" rel="noreferrer" className="dark:!text-white">
                        <Download className="mr-2 h-5 w-5 dark:!text-white" /> DOWNLOAD NOW
                      </a>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className={`${outlinePillButton} dark:!text-white`}>
                      <Link to="/login" className="dark:!text-white">LOGIN TO DOWNLOAD</Link>
                    </Button>
                  )}
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 mb-8 h-auto flex-wrap justify-start border border-slate-200 dark:border-white/10">
                  {["overview", "features", "screenshots", "requirements", "guides"].map((tab) => (
                    <TabsTrigger 
                      key={tab} value={tab} 
                      className="capitalize py-2 px-6 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:font-bold transition-all"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-white uppercase">System Integrity Check</h3>
                      <p className="text-slate-800 dark:text-zinc-300 leading-relaxed text-lg font-medium dark:font-normal">
                        {featuredTool.description}
                      </p>
                      
                      {/* 2. Admin Privileges: Forced white in dark mode */}
                      <div className="flex items-center gap-2 text-red-600 dark:!text-white font-bold text-sm uppercase tracking-widest">
                        <ShieldCheck className="h-5 w-5 text-red-600" /> Administrator Privileges Required
                      </div>
                    </div>
                    {/* ... (Quick Facts) */}
                    <div className="bg-slate-50/50 dark:bg-black/40 p-6 rounded-xl border border-slate-200 dark:border-white/10">
                      <h4 className="font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                        <Info className="h-4 w-4 text-red-600" /> Quick Facts
                      </h4>
                      <ul className="space-y-4 text-sm">
                        {[
                          "Tests all critical hardware",
                          "Generates detailed PDF reports",
                          "Mainboard Serial Number Replace",
                          "Touchpad & Keyboard verification"
                        ].map((fact, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-zinc-300 font-semibold dark:font-normal">
                            <Check className="h-4 w-4 text-red-600 mt-1 shrink-0" /> {fact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                {/* ... (Features, Screenshots, Requirements, Guides) */}
                <TabsContent value="features">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredTool.features.map((feature, index) => (
                      <div key={index} className="bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl flex items-center gap-4">
                        <CheckCircle2 className="h-5 w-5 text-red-600 shrink-0" />
                        <span className="text-slate-800 dark:text-zinc-200 font-bold dark:font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="screenshots">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {featuredTool.screenshots.map((s, i) => (
                      <div key={i} className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black shadow-lg">
                        <img src={s.path} alt={s.title} className="aspect-video object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{s.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="requirements">
                   <Card className="bg-white/50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-950 dark:text-white">
                    <CardHeader>
                      <CardTitle className="uppercase tracking-widest text-red-600">Technical Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {Object.entries(featuredTool.systemRequirements).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-3 border-b border-slate-200 dark:border-white/5">
                          <span className="text-slate-500 dark:text-zinc-400 uppercase text-xs font-bold">{key}</span>
                          <span className="font-semibold dark:font-normal">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="guides">
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {usageGuides.map((guide, index) => (
                      <AccordionItem key={index} value={`item-${index}`} className="border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 rounded-xl px-4">
                        <AccordionTrigger className="text-slate-900 dark:text-white hover:text-red-600 font-bold uppercase tracking-tight text-left">
                          {guide.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-700 dark:text-zinc-400 pb-6">
                          <ol className="list-decimal list-inside space-y-3">
                            {guide.steps.map((step, sIndex) => (
                              <li key={sIndex} className="pl-2 border-l-2 border-red-600/30 ml-2 font-medium dark:font-normal">{step}</li>
                            ))}
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              </Tabs>
              <div className="mt-6 h-[1px] w-12 bg-slate-300 dark:bg-red-600/50 group-hover:w-full group-hover:bg-red-500 transition-all duration-500" />
            </div>
          </motion.div>

          <section>
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-red-600 pl-4 mb-10">
              Utility <span className="text-red-600">Library</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherTools.map((tool, index) => (
                <div 
                  key={index}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/80 p-10 backdrop-blur-xl border border-slate-200 shadow-sm transition-all duration-300 hover:scale-[1.01] dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/20"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <div className="text-red-600 dark:text-red-500 group-hover:scale-110 transition-transform duration-300 origin-left">
                        {tool.icon}
                      </div>
                      <Badge variant="outline" className="text-red-600 border-red-600/30 uppercase text-[10px] tracking-widest font-bold">
                        {tool.category}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold mb-2 tracking-tight uppercase text-slate-950 dark:text-white group-hover:text-red-600 transition-colors">
                      {tool.name}
                    </h3>
                    
                    <p className="text-sm text-slate-800 dark:text-zinc-100/80 leading-relaxed font-semibold dark:font-medium mb-6">
                      {tool.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                        {/* 3. Utility Download Button: Forced white text using !important logic */}
                        <Button asChild variant="ghost" className="p-0 h-auto text-red-600 dark:!text-white font-bold uppercase tracking-wider text-xs hover:bg-transparent">
                            <a href={tool.link} target="_blank" rel="noreferrer" className="dark:!text-white flex items-center">
                                <Download className="mr-2 h-4 w-4 dark:!text-white" /> Download
                            </a>
                        </Button>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase">{tool.size}</span>
                    </div>
                  </div>
                  <div className="mt-6 h-[1px] w-12 bg-slate-300 dark:bg-red-600/50 group-hover:w-full group-hover:bg-red-500 transition-all duration-500" />
                </div>
              ))}
            </div>
          </section>

          {/* Support Section */}
          <motion.div 
            initial="hidden" whileInView="visible" variants={fadeUp}
            className="bg-red-600/5 dark:bg-red-600/10 border border-red-600/20 rounded-2xl p-12 text-center backdrop-blur-md"
          >
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-slate-950 dark:text-white mb-4 uppercase tracking-tighter">Need Interpretations?</h3>
            <p className="text-slate-800 dark:text-zinc-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed font-medium dark:font-normal">
              If you're experiencing issues with our testing tools or need assistance interpreting results, our technical support team is ready to help.
            </p>
            <Button asChild variant="outline" className={`${outlinePillButton} dark:!text-white w-auto px-12 h-14`}>
              <Link to="/requests" className="dark:!text-white">GET TECHNICAL SUPPORT</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}