import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Download, Package, Monitor, Copy, Calendar, HardDrive, Check } from 'lucide-react';
import BackVideo from "@/assets/wtpth/backvi.mp4";
import logo from "@/assets/wtpth/Thomson-Logo.png";

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

const categories = ['all', 'laptops', 'desktops', 'AIO', 'monitors', 'storage'];

const outlinePillButton =
  "relative rounded-md px-6 py-2 text-sm font-medium " +
  "transition-all duration-300 ease-in-out transform " +
  "hover:bg-gray-100 dark:hover:bg-red-600/20 " +
  "focus:outline-none focus:ring-2 focus:ring-gray-400/40 " +
  "before:absolute before:inset-0 before:rounded-md before:border-2 " +
  "before:border-red-500 dark:before:border-white before:opacity-0 " +
  "hover:before:opacity-100 active:scale-95";

/* ---------------- HELPERS ---------------- */

function highlightText(text: string, query: string) {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query})`, 'gi');

  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-red-500/90 text-white px-1 py-0.5 rounded-sm font-bold">
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const snParam = params.get('search');
    if (snParam) {
      setSearchQuery(snParam);
      window.history.replaceState({}, '', window.location.pathname);
      toast.success("Device Identified", { description: `Searching for Serial: ${snParam}` });
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
    toast.info("Tool Downloaded");
  };

  const copyCommand = () => {
    const cmd = "wmic csproduct get name, identifyingnumber";
    navigator.clipboard.writeText(cmd);
    toast.success("Command copied!");
  };

  const copyFileUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copied!");
    setTimeout(() => setCopiedId(null), 2000);
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
        toast.error('Failed to load drivers');
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

  return (
    <div className="relative min-h-screen text-foreground bg-[#050505] selection:bg-red-500/30">
      
      {/* BACKGROUND VIDEO LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video className="w-full h-full object-cover opacity-40 contrast-125 saturate-100" autoPlay loop muted playsInline>
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-20 pb-12">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              
              <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4 text-white">
                Drivers & <span className="font-bold uppercase text-red-600">Recovery</span>
              </h1>
              <p className="text-lg text-zinc-200 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 drop-shadow-md">
                Find and download official software updates for your hardware.
              </p>

              <div className="mt-10 max-w-3xl">
                <div className="relative flex items-center shadow-2xl">
                  <Input
                    placeholder="🔎 Search by model, serial, or file name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-6 pr-44 text-lg bg-white/90 backdrop-blur-md border-none text-slate-950 rounded-xl focus-visible:ring-red-600"
                  />
                  <div className="absolute right-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className={`${outlinePillButton} h-12 rounded-lg text-slate-950 border border-slate-200 bg-white hover:bg-slate-100 shadow-sm`}
                        >
                          <Monitor className="h-4 w-4 mr-2" />
                          <span className="font-bold uppercase text-xs">Identify Device</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg bg-[#1a232e] text-white border-none shadow-2xl rounded-xl">
                        <DialogHeader className="text-center">
                          <DialogTitle className="text-2xl font-bold">Find Model & Serial Number</DialogTitle>
                          <DialogDescription className="text-zinc-400">Get hardware details automatically or manually.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-8 py-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold">1</span>
                              <h4 className="font-bold">Automatic Search (Recommended)</h4>
                            </div>
                            <p className="text-sm text-zinc-400 pl-9">Download and run this tool to auto-fill the search box with your Serial Number.</p>
                            <div className="pl-9">
                              <Button 
                                onClick={downloadAutoTool} 
                                variant="ghost"
                                className={`${outlinePillButton} w-full py-8 border border-white/20 text-white bg-red-600 hover:bg-red-700 font-bold text-base flex items-center justify-center gap-2`}
                              >
                                <Download className="h-5 w-5" /> 
                                Identify & Search Automatically
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-xs font-bold">2</span>
                              <h4 className="font-bold">Windows Command</h4>
                            </div>
                            <div className="pl-9">
                              <div className="flex items-center justify-between bg-[#111821] p-4 rounded-lg border border-white/5">
                                <code className="text-xs text-pink-400 font-mono">wmic csproduct get name, identifyingnumber</code>
                                <Button size="icon" variant="ghost" onClick={copyCommand} className="text-zinc-400 hover:text-white">
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-xs font-bold">3</span>
                              <h4 className="font-bold">Bottom Sticker</h4>
                            </div>
                            <div className="pl-9">
                              <div className="flex items-center justify-around bg-[#111821] py-4 rounded-lg border border-white/5 text-[10px] uppercase tracking-widest font-bold text-zinc-300">
                                <div className="flex gap-2"><span className="italic text-zinc-500">Model:</span> NEO14-v2...</div>
                                <div className="h-4 w-[1px] bg-white/10" />
                                <div className="flex gap-2"><span className="italic text-zinc-500">S/N:</span> TH8234...</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DRIVERS CONTENT */}
        <div className="container mx-auto px-6 pb-32">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 bg-slate-100 dark:bg-slate-800 p-1">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="capitalize transition-all data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-12">
              {loading ? (
                <div className="text-center py-20 text-white animate-pulse uppercase tracking-widest">Scanning Repository...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                    {filteredDrivers.slice(0, visibleDrivers).map(driver => (
                      <div 
                        key={driver.id} 
                        className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border transition-all duration-300 h-fit 
                          ${matchesSearch(driver, searchQuery) 
                            ? 'border-red-600 dark:border-white ring-4 ring-red-600/30 dark:ring-white/40 shadow-[0_0_30px_rgba(255,255,255,0.2)] dark:shadow-[0_0_40px_rgba(255,255,255,0.3)] z-20 scale-[1.04] !opacity-100' 
                            : 'border-slate-200 dark:border-white/20 opacity-90'
                          }`}
                      >
                        <div className="bg-white p-4 flex justify-center border-b border-slate-100">
                           <img src={driver.image_url} className="h-32 object-contain group-hover:scale-110 transition-transform duration-500" alt={driver.name} />
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-1 tracking-tight uppercase text-slate-950 dark:text-white">{highlightText(driver.name, searchQuery)}</h3>
                          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100/80 mb-4">{highlightText(driver.manufacturer, searchQuery)} • {driver.category}</p>
                          <Badge 
                            className={`mb-6 border-none flex items-center gap-1.5 w-fit ${
                              driver.os_version.toLowerCase().includes('windows') 
                                ? 'bg-[#0078d4] hover:bg-[#005a9e] text-white' 
                                : 'bg-slate-200 dark:bg-red-600/50 text-slate-900 dark:text-white'
                            }`}
                          >
                            {driver.os_version.toLowerCase().includes('windows') && (
                              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 3.449L9.75 2.1V11.4h-9.75zM0 12.6h9.75v9.3L0 20.551zM11.25 2.1L24 0v11.4h-12.75zM11.25 12.6H24V24l-12.75-2.1z" />
                              </svg>
                            )}
                            {driver.os_version}
                          </Badge>
                          <Accordion type="single" collapsible className="mt-2 w-full">
                            <AccordionItem value="files" className="border-none">
                              <AccordionTrigger className={`${outlinePillButton} text-slate-900 dark:text-white border border-slate-200 dark:border-white/10`}>
                                <Package className="h-4 w-4 mr-2" /> {driver.files.length} Files Available
                              </AccordionTrigger>
                              <AccordionContent className="pt-4 space-y-6">
                                {driver.files.map((file, idx) => (
                                  <div key={file.id} className={`space-y-3 ${idx !== 0 ? 'pt-6 border-t border-dashed border-slate-300 dark:border-white/10' : ''}`}>
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-sm font-bold text-slate-950 dark:text-white truncate max-w-[70%]">{highlightText(file.name, searchQuery)}</h5>
                                      {file.version && <Badge className="bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-[10px] h-5 px-1.5 font-mono border-none">v{highlightText(file.version, searchQuery)}</Badge>}
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-zinc-400 font-bold uppercase">
                                      <div className="flex items-center gap-2"><HardDrive className="h-3 w-3" /><span>{highlightText(file.size, searchQuery)}</span></div>
                                      {file.release_date && <div className="flex items-center gap-2"><Calendar className="h-3 w-3" /><span>{highlightText(new Date(file.release_date).toLocaleDateString(), searchQuery)}</span></div>}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="ghost" className={`${outlinePillButton} flex-1 h-9 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10`} onClick={() => window.open(file.url, '_blank')}><Download className="h-3 w-3" /> Download</Button>
                                      <Button size="icon" variant="ghost" className={`${outlinePillButton} w-9 h-9 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 ${copiedId === file.id ? 'text-green-600 border-green-500' : ''}`} onClick={() => copyFileUrl(file.url, file.id)}>{copiedId === file.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}</Button>
                                    </div>
                                  </div>
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                        <div className="mt-auto h-[1px] w-12 bg-slate-300 dark:bg-red-600/50 group-hover:w-full group-hover:bg-red-500 transition-all duration-500" />
                      </div>
                    ))}
                  </div>

                  {filteredDrivers.length > visibleDrivers && (
                    <div className="flex justify-center mt-16">
                      <Button 
                        variant="ghost" 
                        onClick={() => setVisibleDrivers((prev) => prev + 8)} 
                        className={`${outlinePillButton} border border-white/20 text-white bg-red-600 hover:bg-red-700 px-12 h-14`}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Show more drivers
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}