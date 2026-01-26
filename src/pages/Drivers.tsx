import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Download, Package, Monitor, Copy, Calendar, HardDrive, Check, Activity, ArrowRight, Search, Cpu, X, ChevronDown, Filter } from 'lucide-react';
import BackVideo from "@/assets/wtpth/backvi.mp4";
import { motion, AnimatePresence } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/* ---------------- TYPES ---------------- */

interface DriverFile {
  id: string;
  driver_id: string;
  name: string;
  url: string;
  size: string;
  type: string;
  version?: string;
  release_date?: string;
}

interface Driver {
  id: string;
  name: string;
  description: string;
  os_version: string;
  manufacturer: string;
  category: string;
  image_url?: string;
  files: DriverFile[];
}

/* ---------------- CONSTANTS ---------------- */

const categories = [
  { value: 'all', label: 'All Devices' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'desktops', label: 'Desktops' },
  { value: 'AIO', label: 'All-in-One' },
  { value: 'monitors', label: 'Monitors' },
  { value: 'storage', label: 'Storage' }
];

/* ---------------- HELPERS ---------------- */

function highlightText(text: string, query: string) {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query})`, 'gi');

  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-red-600 text-white dark:text-white px-1.5 py-0.5 rounded font-bold">
  {part}
</mark>
    ) : (
      part
    )
  );
}

function matchesSearch(driver: Driver, query: string) {
  if (!query) return false;
  const q = query.toLowerCase();
  return (
    driver.name.toLowerCase().includes(q) ||
    driver.manufacturer.toLowerCase().includes(q) ||
    driver.files.some(file => `${file.name} ${file.version} ${file.size}`.toLowerCase().includes(q))
  );
}

/* ---------------- COMPONENT ---------------- */

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [visibleDrivers, setVisibleDrivers] = useState(8);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabTriggersRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const snParam = params.get('search');
    if (snParam) {
      setSearchQuery(snParam);
      window.history.replaceState({}, '', window.location.pathname);
      toast.success("Device Identified", { 
        description: `Searching for Serial: ${snParam}`,
        duration: 3000 
      });
    }
  }, []);

  const downloadAutoTool = () => {
    const currentUrl = window.location.origin + window.location.pathname;
    const script = `@echo off\nsetlocal enabledelayedexpansion\necho Extracting Serial Number...\nfor /f "tokens=2 delims==" %%I in ('wmic csproduct get identifyingnumber /value') do (set \"sn=%%I\")\necho Opening drivers page for !sn!...\nstart \"\" \"${currentUrl}?search=!sn!\"\nexit`;
    const blob = new Blob([script], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Identify_Device.bat';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.info("Tool Downloaded", { 
      description: "Run Identify_Device.bat to auto-detect your device",
      duration: 3000 
    });
  };

  const copyCommand = () => {
    const cmd = "wmic csproduct get name, identifyingnumber";
    navigator.clipboard.writeText(cmd);
    toast.success("Command copied!", { duration: 2000 });
  };

  const copyFileUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copied!", { duration: 2000 });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  useEffect(() => {
    const fetchDriversWithFiles = async () => {
      setLoading(true);
      try {
        const { data: dbDrivers, error } = await supabase.from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers').select('*');
        const { data: down1Files } = await supabase.from('down1').select('*');
        if (error || !dbDrivers) throw error;

        const mapped: Driver[] = dbDrivers.map(driver => {
          const files: DriverFile[] = [];
          if (driver.download_url && driver.download_url !== '#') {
            files.push({
              id: `file-${driver.id}`,
              driver_id: driver.id,
              name: driver.description || driver.name,
              url: driver.download_url,
              size: driver.size || 'Unknown',
              type: 'driver',
              version: driver.version,
              release_date: driver.release_date || driver.created || new Date().toISOString(),
            });
          }
          down1Files?.forEach(file => {
            if (file.model?.toLowerCase() === driver.name.toLowerCase()) {
              files.push({
                id: file.id,
                driver_id: driver.id,
                name: file.file_name || 'Additional Driver File',
                url: file.download_link || '#',
                size: file.file_size || 'Unknown',
                type: 'additional',
                version: file.version,
                release_date: file.release_date || file.created_at,
              });
            }
          });
          return {
            id: driver.id,
            name: driver.name,
            description: driver.description,
            os_version: driver.os_version || driver.os || 'Unknown',
            manufacturer: driver.manufacturer,
            category: driver.category,
            image_url: driver.image_url || driver.image || '/placeholder-driver.png',
            files,
          };
        });
        setDrivers(mapped);
      } catch {
        toast.error('Failed to load drivers', { 
          description: 'Please check your connection and try again',
          duration: 4000 
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDriversWithFiles();
  }, []);

  useEffect(() => {
    let result = [...drivers];
    if (searchQuery) result = result.filter(d => matchesSearch(d, searchQuery));
    if (activeTab !== 'all') result = result.filter(d => d.category === activeTab);
    setFilteredDrivers(result);
    setVisibleDrivers(8);
  }, [drivers, searchQuery, activeTab]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4, 
        delay: i * 0.05,
        ease: "easeOut" 
      } 
    }),
    hover: {
      y: -4,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="relative min-h-screen transition-colors duration-700 overflow-hidden font-sans bg-[#f8f9fa] dark:bg-[#050505] text-slate-900 dark:text-white">
      {/* BACKGROUND - Consistent with Home.tsx */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          className="w-full h-full object-cover transition-opacity duration-1000 grayscale opacity-30 contrast-125 dark:opacity-30" 
          autoPlay loop muted playsInline
        >
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 transition-all duration-700 bg-gradient-to-b from-[#f8f9fa]/40 via-transparent to-[#f8f9fa]/20 dark:from-[#050505] dark:via-[#050505]/80 dark:to-[#050505]/60" />
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-16 pb-8 md:pt-20 md:pb-12 px-4">
          <div className="container mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl"
            >
              <div className="mb-4 md:mb-6 flex items-center gap-3 text-[10px] md:text-xs font-black tracking-[0.3em] uppercase text-slate-600 dark:text-zinc-500">
                <Activity size={12} className="text-red-600 animate-pulse" /> 
                DRIVERS_OS // HARDWARE_STACK
              </div>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 md:mb-12">
                <div>
                  <h1 className="text-4xl md:text-[4rem] lg:text-[5rem] font-black tracking-[-0.05em] uppercase leading-[0.85] text-slate-950 dark:text-white mb-4">
                    Drivers & <br />
                    <span className="outline-text">Recovery</span>
                  </h1>
                  
                  <p className="text-base md:text-lg text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed border-l-2 border-red-600 pl-4 md:pl-6 font-medium">
                    Find and download official software updates for your hardware.
                  </p>
                </div>

                {/* IMPROVED SEARCH BAR */}
                <div className="w-full md:w-1/2 lg:w-1/2"> {/* Expanded container width */}
                  <motion.div 
                    className="relative"
                    animate={{
                      scale: searchFocused ? 1.01 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-zinc-400" />
                      <Input
                        placeholder="Search by model, serial, or file name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="h-14 md:h-16 pl-12 pr-14 text-base md:text-lg rounded-2xl 
                          bg-white/80 dark:bg-zinc-900/80 text-slate-950 dark:text-white
                          border-2 border-slate-300 dark:border-zinc-700
                          focus:border-red-500 focus:ring-2 focus:ring-red-500/20
                          transition-all duration-300
                          placeholder:text-slate-500/80 dark:placeholder:text-zinc-400/80
                          shadow-lg backdrop-blur-sm"
                      />
                      <AnimatePresence>
                        {searchQuery && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={clearSearch}
                            className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-full 
                              hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <X size={16} className="text-slate-500 dark:text-zinc-400" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Dialog>
                         <DialogTrigger asChild>
      <Button 
        className="h-10 md:h-12 rounded-xl font-black uppercase tracking-wider 
          bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
          text-white shadow-lg hover:shadow-red-500/20
          transition-all duration-300 px-4 md:px-6"
      >
        <Monitor size={16} className="mr-2" />
        <span className="hidden sm:inline">Identify Device</span>
        <span className="sm:hidden">Identify</span>
      </Button>
    </DialogTrigger>
                          <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700">
                            <DialogHeader className="p-6 border-b border-slate-300 dark:border-zinc-700">
                              <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-950 dark:text-white">
                                Find Model & Serial Number
                              </DialogTitle>
                              <DialogDescription className="text-slate-600 dark:text-zinc-400 font-medium">
                                Get hardware details automatically or manually.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="p-6 space-y-6">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                                    1
                                  </div>
                                  <h4 className="font-black uppercase tracking-tighter text-slate-950 dark:text-white">
                                    Automatic Search
                                  </h4>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-zinc-400 pl-11 font-medium">
                                  Download and run this tool to auto-fill the search box.
                                </p>
                                <Button 
                                  onClick={downloadAutoTool} 
                                  className="w-full h-14 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                                    text-white font-black uppercase tracking-wider text-base 
                                    transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                  <Download className="h-5 w-5 mr-3" /> 
                                  Identify & Search Automatically
                                </Button>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-800 text-sm font-bold">
                                    2
                                  </div>
                                  <h4 className="font-black uppercase tracking-tighter text-slate-950 dark:text-white">
                                    Windows Command
                                  </h4>
                                </div>
                                <div className="flex items-center justify-between bg-white/40 dark:bg-white/5 p-4 rounded-xl border-2 border-slate-300 dark:border-zinc-700">
                                  <code className="text-sm text-red-600 font-mono font-bold">
                                    wmic csproduct get name, identifyingnumber
                                  </code>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={copyCommand} 
                                    className="h-10 w-10 text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-600 hover:bg-red-600/10"
                                  >
                                    <Copy size={16} />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-800 text-sm font-bold">
                                    3
                                  </div>
                                  <h4 className="font-black uppercase tracking-tighter text-slate-950 dark:text-white">
                                    Bottom Sticker
                                  </h4>
                                </div>
                                <div className="flex items-center justify-around bg-white/40 dark:bg-white/5 py-4 rounded-xl border-2 border-slate-300 dark:border-zinc-700 text-sm uppercase tracking-wider font-black">
                                  <div className="text-center">
                                    <div className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Model</div>
                                    <div className="font-mono text-red-600">NEO14-v2...</div>
                                  </div>
                                  <div className="h-6 w-[1px] bg-slate-300 dark:bg-white/10" />
                                  <div className="text-center">
                                    <div className="text-xs text-slate-500 dark:text-zinc-500 mb-1">S/N</div>
                                    <div className="font-mono text-red-600">TH8234...</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    {searchQuery && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 font-medium pl-2">
                        Found {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''} for "{searchQuery}"
                      </p>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

    {/* DRIVERS CONTENT */}
<div className="container mx-auto px-4 pb-20">
  {/* FIXED CATEGORY TABS - Size matched to layout */}
  <div className="mb-10 flex justify-center md:justify-start" ref={tabContainerRef}>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-8xl">
      <TabsList className="relative w-full grid grid-cols-3 sm:grid-cols-6 gap-2 p-1.5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border-2 border-slate-300 dark:border-zinc-700 rounded-2xl h-auto">
        {categories.map((cat, index) => (
          <TabsTrigger
            key={cat.value}
            value={cat.value}
            ref={(el) => {
              tabTriggersRef.current[index] = el;
            }}
            className={`
              relative z-10 py-2.5 md:py-3 text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest 
              rounded-xl transition-all duration-300
              ${activeTab === cat.value 
                ? 'text-white bg-gradient-to-r from-red-600 to-red-700 shadow-lg' 
                : 'text-slate-700 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/60'
              }
            `}
          >
            <span className="hidden sm:inline">{cat.label}</span>
            <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  </div>

          {/* DRIVER CARDS - No loading animations */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <Cpu className="h-16 w-16 text-slate-300 dark:text-zinc-700 animate-pulse mb-6" />
                <div className="absolute inset-0 bg-red-600/10 blur-xl" />
              </div>
              <p className="text-lg font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 animate-pulse">
                SCANNING REPOSITORY...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                {filteredDrivers.slice(0, visibleDrivers).map((driver, index) => {
                  const isHighlighted = matchesSearch(driver, searchQuery);
                  
                  return (
                    <div 
                      key={driver.id}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                    className={`
  group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-300 ease-out h-fit
  ${hoveredCard === index || isHighlighted
    ? 'bg-white dark:bg-zinc-900 border-red-500 shadow-2xl -translate-y-1 z-20' 
    : 'bg-white/40 dark:bg-zinc-900/40 border-transparent dark:border-zinc-800 hover:border-slate-300 shadow-sm'
  }
`}
                    >
                      {/* Hover aura effect */}
                      {hoveredCard === index && (
                        <div className="absolute inset-0 bg-red-600/10 blur-2xl -z-10" />
                      )}

                      {/* Driver Image */}
                      <div className="p-6 flex justify-center items-center h-48 border-b-2 border-slate-300 dark:border-zinc-700 bg-gradient-to-b from-white/60 to-transparent dark:from-zinc-900/40 dark:to-transparent">
                        <div className="relative">
                          <img 
                            src={driver.image_url} 
                            className="h-32 object-contain group-hover:scale-110 transition-transform duration-300" 
                            alt={driver.name} 
                          />
                        </div>
                      </div>
                      
{/* Driver Info */}
<div className="p-6 flex flex-col flex-1">
  <div className="flex items-start justify-between mb-3">
    <Badge 
      className={`flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-wider px-2 py-1 border-none
        ${driver.os_version.toLowerCase().includes('windows') 
          ? 'bg-[#0078d4] text-white' 
          : 'bg-slate-200 dark:bg-red-600/30 text-slate-900 dark:text-white'
        }`}
    >
      {/* ADDED: Windows Logo Logic */}
      {driver.os_version.toLowerCase().includes('windows') && (
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="h-3 w-3"
          aria-hidden="true"
        >
          <path d="M0 3.449L9.75 2.1V11.7H0V3.449zm0 17.1L9.75 21.9v-9.6H0v8.249zM10.5 2V11.7H24V0L10.5 2zm0 19.9l13.5 2V12.3H10.5v9.6z" />
        </svg>
      )}
      {driver.os_version}
    </Badge>
                          {(hoveredCard === index || isHighlighted) && (
                            <ArrowRight className="h-5 w-5 text-red-600 transition-all duration-300" />
                          )}
                        </div>

                       <h3 className={`text-xl font-black uppercase tracking-tighter mb-2 transition-colors
  ${hoveredCard === index || isHighlighted 
    ? 'text-red-600 dark:text-white' // Stays white in dark mode, red in light mode
    : 'text-slate-950 dark:text-zinc-100'}
`}>
  {highlightText(driver.name, searchQuery)}
</h3>
                        
                        <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 mb-4 flex-1">
                          {highlightText(driver.manufacturer, searchQuery)} • {driver.category}
                        </p>
                        
                        {/* Files Accordion */}
                        <Accordion type="single" collapsible className="w-full mt-auto">
                          <AccordionItem value="files" className="border-none">
                            <AccordionTrigger className={`w-full py-3 px-4 rounded-xl border-2 border-slate-300 dark:border-zinc-700
                              ${hoveredCard === index || isHighlighted 
                                ? 'bg-red-500/10 text-red-600 border-red-500/30' 
                                : 'bg-white/40 dark:bg-zinc-800/40'
                              } font-bold uppercase tracking-wider text-sm transition-all duration-300`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  <span>{driver.files.length} Files</span>
                                </div>
                                <span className="text-xs font-mono">{driver.files.length}↓</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                              {driver.files.map((file, idx) => (
                                <div key={file.id} className={`space-y-3 ${idx !== 0 ? 'pt-4 border-t border-dashed border-slate-300/50 dark:border-white/10' : ''}`}>
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-sm font-bold text-slate-950 dark:text-white truncate max-w-[65%]">
                                      {highlightText(file.name, searchQuery)}
                                    </h5>
                                    {file.version && (
                                      <Badge className="bg-white/40 dark:bg-zinc-800/40 text-slate-900 dark:text-white text-xs font-mono border-none px-2 py-1">
                                        v{highlightText(file.version, searchQuery)}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 font-bold uppercase">
                                    <div className="flex items-center gap-2">
                                      <HardDrive className="h-3 w-3" />
                                      <span>{highlightText(file.size, searchQuery)}</span>
                                    </div>
                                    {file.release_date && (
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{highlightText(new Date(file.release_date).toLocaleDateString(), searchQuery)}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      className="flex-1 h-9 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                                        text-white font-bold uppercase tracking-wider text-xs shadow-md hover:shadow-lg transition-all duration-300"
                                      onClick={() => window.open(file.url, '_blank')}
                                    >
                                      <Download className="h-3 w-3 mr-1" /> 
                                      Download
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className={`h-9 w-9 rounded-lg border-2 border-slate-300 dark:border-zinc-700
                                        ${copiedId === file.id ? 'text-green-600 border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`} 
                                      onClick={() => copyFileUrl(file.url, file.id)}
                                    >
                                      {copiedId === file.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      
                      {/* Bottom accent line */}
                      <div className="h-1 w-12 mx-6 mb-4 bg-red-600/50 group-hover:w-full transition-all duration-500" />
                    </div>
                  );
                })}
              </div>

              {/* LOAD MORE BUTTON */}
              {filteredDrivers.length > visibleDrivers && (
                <div className="flex justify-center mt-12">
                  <Button 
                    onClick={() => setVisibleDrivers((prev) => prev + 8)} 
                    className="h-14 px-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                      text-white font-black uppercase tracking-wider text-base shadow-lg hover:shadow-xl 
                      transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <Package className="h-5 w-5 mr-3" />
                    Load More Drivers
                  </Button>
                </div>
              )}

              {/* EMPTY STATE */}
              {filteredDrivers.length === 0 && !loading && (
                <div className="text-center py-32">
                  <div className="inline-block p-6 rounded-2xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border-2 border-slate-300 dark:border-zinc-700 mb-6">
                    <Package className="h-16 w-16 text-slate-300 dark:text-zinc-600 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-400 dark:text-zinc-500 mb-3">
                    No Drivers Found
                  </h3>
                  <p className="text-slate-500 dark:text-zinc-600 font-medium max-w-md mx-auto mb-8">
                    Try searching with a different term or select another category.
                  </p>
                  <Button 
  onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
  /* Changed to matching height, gradient, and shadow classes */
  className="h-14 px-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
    text-white font-black uppercase tracking-wider text-base shadow-lg hover:shadow-xl 
    transition-all duration-300 transform hover:-translate-y-0.5"
>
  {/* Added X icon to maintain the look */}
  <X className="h-5 w-5 mr-3" />
  Clear Filters
</Button>
                </div>
              )}
            </>
          )}
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