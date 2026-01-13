import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Download, Package, Monitor, Copy, Calendar, HardDrive, Check } from 'lucide-react';
import BackVideo from "@/assets/wtpth/backvi.mp4";

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
  "text-gray-900 dark:text-gray-100 bg-transparent " +
  "transition-all duration-300 ease-in-out transform " +
  "hover:bg-gray-100 dark:hover:bg-red-600/20 " +
  "focus:outline-none focus:ring-2 focus:ring-gray-400/40 " +
  "before:absolute before:inset-0 before:rounded-md before:border-2 " +
  "before:border-red-500 dark:before:border-white before:opacity-0 " +
  "hover:before:opacity-100 active:scale-95";

/* ---------------- HELPERS ---------------- */

function highlightText(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');

  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="bg-red-500/90 text-white px-1.5 py-0.5 rounded-md font-semibold"
      >
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
    driver.files.some(file =>
      `${file.name} ${file.version} ${file.size}`
        .toLowerCase()
        .includes(q)
    )
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
  
  // Track which file link was just copied for visual feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-Identify Logic (Handles URL search params)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const snParam = params.get('search');
    
    if (snParam) {
      setSearchQuery(snParam);
      window.history.replaceState({}, '', window.location.pathname);
      toast.success("Device Identified", {
        description: `Searching for Serial: ${snParam}`
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
    toast.info("Tool Downloaded", { description: "Run the file to auto-search your drivers." });
  };

  const copyCommand = () => {
    const cmd = "wmic csproduct get name, identifyingnumber";
    navigator.clipboard.writeText(cmd);
    toast.success("Command copied!", {
      description: "Paste it into Command Prompt to see Model & Serial."
    });
  };

  const copyFileUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copied!", {
      description: "URL saved to clipboard.",
      duration: 2000,
    });
    
    // Reset the icon back to 'Copy' after 2 seconds
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    const fetchDriversWithFiles = async () => {
      setLoading(true);
      try {
        const { data: dbDrivers, error } = await supabase
          .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
          .select('*');

        const { data: down1Files } = await supabase
          .from('down1')
          .select('*');

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

  /* ---------------- FILTER ---------------- */

  useEffect(() => {
    let result = [...drivers];
    if (searchQuery) result = result.filter(d => matchesSearch(d, searchQuery));
    if (activeTab !== 'all') result = result.filter(d => d.category === activeTab);
    setFilteredDrivers(result);
    setVisibleDrivers(8);
  }, [drivers, searchQuery, activeTab]);

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full">
      {/* HERO SEARCH */}
      <div className="relative overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <video
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
            autoPlay loop muted playsInline
          >
            <source src={BackVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-5xl font-bold text-white">Drivers, Firmware, Recovery Image</h1>
          <p className="text-xl text-blue-50 mt-2 max-w-2xl text-center mx-auto drop-shadow">
            Find and download the latest drivers for your devices
          </p>

          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <Input
                placeholder="🔎 Search drivers, files, versions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-6 pr-44 text-lg bg-white shadow-xl border-2 border-red-500 dark:border-white text-black rounded-none"
              />
              <div className="absolute right-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost"
                      className={`${outlinePillButton} h-12 rounded-none flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-black dark:text-black border-l border-slate-200`}
                    >
                      <Monitor className="h-4 w-4" />
                      <span className="hidden sm:inline">Identify Device</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Find Model & Serial Number</DialogTitle>
                      <DialogDescription>Get hardware details automatically or manually.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          <span className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                          Automatic Search (Recommended)
                        </h4>
                        <p className="text-xs text-muted-foreground">Download and run this tool to auto-fill the search box with your Serial Number.</p>
                        <Button 
                          onClick={downloadAutoTool}
                          variant="ghost"
                          className={`${outlinePillButton} w-full flex items-center justify-center gap-2`}
                        >
                          <Download className="h-4 w-4" />
                          Identify & Search Automatically
                        </Button>
                      </div>

                      <div className="space-y-3 pt-2 border-t">
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          <span className="bg-slate-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                          Windows Command
                        </h4>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-3 rounded border">
                          <code className="text-[10px] md:text-xs flex-1 font-mono">wmic csproduct get name, identifyingnumber</code>
                          <Button size="icon" variant="ghost" onClick={copyCommand} className="h-8 w-8">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t">
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          <span className="bg-slate-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span>
                          Bottom Sticker
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-900 p-3 rounded italic text-center">
                          <div className="border-r">Model: NEO14-v2...</div>
                          <div>S/N: TH8234...</div>
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

      {/* CONTENT */}
      <div className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 bg-slate-100 dark:bg-slate-800 p-1">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize transition-all data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-10">Loading drivers…</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredDrivers.slice(0, visibleDrivers).map(driver => (
                    <Card key={driver.id} className={`overflow-hidden ${matchesSearch(driver, searchQuery) ? 'border-2 border-red-500 shadow-red-500/20 shadow-lg' : ''}`}>
                      <img src={driver.image_url} className="w-full h-40 object-contain bg-white" alt={driver.name} />
                      <CardHeader>
                        <CardTitle>{highlightText(driver.name, searchQuery)}</CardTitle>
                        <CardDescription>{highlightText(driver.manufacturer, searchQuery)} • {driver.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge>{driver.os_version}</Badge>
                        <Accordion type="single" collapsible className="mt-4">
                          <AccordionItem value="files">
                            <AccordionTrigger className={outlinePillButton}>
                              <Package className="h-4 w-4 mr-2" />
                              {driver.files.length} Driver Files Available
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-6">
                              {driver.files.map((file, idx) => (
                                <div key={file.id} className={`space-y-3 ${idx !== 0 ? 'pt-6 border-t border-dashed' : ''}`}>
                                  {/* Minimalist File Header */}
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-sm font-bold truncate max-w-[70%]">
                                      {highlightText(file.name, searchQuery)}
                                    </h5>
                                    {file.version && (
                                      <Badge className="bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 text-[10px] h-5 px-1.5 font-mono border-none">
                                        v{highlightText(file.version, searchQuery)}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* ROW-BASED SPECS */}
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <HardDrive className="h-3 w-3" />
                                      <span>{highlightText(file.size, searchQuery)}</span>
                                    </div>
                                    {file.release_date && file.release_date !== 'Unknown' && (
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(file.release_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* ACTION BUTTONS */}
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className={`${outlinePillButton} flex-1 h-9 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700`}
                                      onClick={() => window.open(file.url, '_blank')}
                                    >
                                      <Download className="h-3 w-3" />
                                      Download
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      title="Copy Download Link"
                                      className={`${outlinePillButton} w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-700 ${copiedId === file.id ? 'text-green-600 border-green-500' : ''}`}
                                      onClick={() => copyFileUrl(file.url, file.id)}
                                    >
                                      {copiedId === file.id ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* SHOW MORE DRIVERS BUTTON */}
                {filteredDrivers.length > visibleDrivers && (
                  <div className="flex justify-center mt-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => setVisibleDrivers((prev) => prev + 8)} 
                      className={outlinePillButton}
                    >
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
  );
}