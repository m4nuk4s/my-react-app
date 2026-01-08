import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Download, Package } from 'lucide-react';
import BackVideo from "@/assets/wtpth/backvi.mp4";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  version: string;
  description: string;
  os_version: string;
  device_model?: string;
  files: DriverFile[];
  image_url?: string;
  image?: string;
  manufacturer: string;
  size: string;
  category: string;
  drivers?: DriverFile[];
  release_date?: string;
  created?: string;
}

const outlinePillButton =
  "relative rounded-md px-6 py-2 text-sm font-medium " +
  "text-gray-900 dark:text-gray-100 bg-transparent " +
  "transition-all duration-300 ease-in-out transform " +
  "hover:bg-gray-100 dark:hover:bg-red-600/20 " +
  "focus:outline-none focus:ring-2 focus:ring-gray-400/40 focus:ring-offset-2 focus:ring-offset-transparent " +
  "before:absolute before:inset-0 before:rounded-md before:border-2 before:border-red-500 dark:before:border-white before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out " +
  "hover:before:opacity-100 " +
  "active:scale-95";

const categories = ['all', 'laptops', 'desktops', 'AIO', 'monitors', 'storage'];

export function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // ✅ NEW: visible drivers limit
  const [visibleDrivers, setVisibleDrivers] = useState(8);

  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const toggleShowMore = (driverId: string) => {
    setExpandedDrivers(prev => ({
      ...prev,
      [driverId]: !prev[driverId],
    }));
  };

  const [expandedDrivers, setExpandedDrivers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchDriversWithFiles = async () => {
      setLoading(true);
      try {
        const { data: dbDrivers, error: driversError } = await supabase
          .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
          .select('*');

        const { data: down1Files } = await supabase.from('down1').select('*');

        if (driversError || !dbDrivers) {
          toast.error('Database fetch failed.');
          setDrivers([]);
          return;
        }

        const driversData: Driver[] = dbDrivers.map(driver => {
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
              release_date: driver.release_date || driver.date || driver.created || new Date().toISOString()
            });
          }

          if (down1Files && down1Files.length > 0) {
            const additionalFiles = down1Files.filter(file =>
              file.model && file.model.toLowerCase() === driver.name.toLowerCase()
            );
            additionalFiles.forEach(file => {
              files.push({
                id: file.id,
                driver_id: driver.id,
                name: file.file_name || 'Additional Driver File',
                url: file.download_link || '#',
                size: file.file_size || 'Unknown',
                type: 'additional',
                version: file.version,
                release_date: file.release_date
              });
            });
          }

          let imageUrl = '/placeholder-driver.png';
          if (driver.image_url && driver.image_url.trim() !== '' && driver.image_url !== 'null' && driver.image_url !== 'undefined') {
            if (driver.image_url.startsWith('/')) {
              imageUrl = `${window.location.origin}${driver.image_url}`;
            } else if (driver.image_url.startsWith('http')) {
              imageUrl = driver.image_url;
            } else {
              imageUrl = `${window.location.origin}/${driver.image_url}`;
            }
          } else if (driver.image && driver.image.trim() !== '' && driver.image !== 'null' && driver.image !== 'undefined') {
            if (driver.image.startsWith('/')) {
              imageUrl = `${window.location.origin}${driver.image}`;
            } else if (driver.image.startsWith('http')) {
              imageUrl = driver.image;
            } else {
              imageUrl = `${window.location.origin}/${driver.image}`;
            }
          }

          return {
            ...driver,
            image_url: imageUrl,
            os_version: driver.os_version || driver.os || 'Unknown',
            size: driver.size || driver.total_size || 'Unknown',
            release_date: driver.release_date || driver.date || driver.created || 'Unknown',
            files
          };
        });

        localStorage.setItem('drivers', JSON.stringify(driversData));
        setDrivers(driversData);
      } catch {
        toast.error('Unexpected error loading drivers.');
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDriversWithFiles();
  }, []);

  useEffect(() => {
    let result = [...drivers];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        driver =>
          driver.name.toLowerCase().includes(query) ||
          driver.description?.toLowerCase().includes(query) ||
          driver.manufacturer?.toLowerCase().includes(query)
      );
    }
    if (activeTab !== 'all') {
      result = result.filter(driver => driver.category === activeTab);
    }
    setFilteredDrivers(result);
    setVisibleDrivers(8); // reset visible drivers when filters/search change
  }, [searchQuery, activeTab, drivers]);

  return (
    <div className="w-full">
      {/* 🔹 Full-width Hero with video background */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={BackVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 px-4 py-16 text-center">
          <h1 className="text-5xl font-bold text-white mb-2">
            Drivers/Recovery Images/Firmware
          </h1>
          <p className="text-xl text-blue-50 mb-4 max-w-2xl text-center mx-auto drop-shadow">
            Find and download the latest drivers/firmwares for your devices
          </p>
        </div>
      </div>

      {/* 🔹 Page content below */}
      <div className="container py-6">
        <div className="flex items-center space-x-4 mt-6">
          <div className="flex-1">
            <Input
              placeholder="🔎 Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full !border !border-red-500 !focus:border-blue-50 !focus:ring-2"
            />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin w-6 h-6 border-t-2 border-blue-500 rounded-full mx-auto mb-4"></div>
                <p>Loading drivers...</p>
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="text-center py-10">
                <p>No drivers found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {filteredDrivers.slice(0, visibleDrivers).map((driver) => (
                    <Card key={driver.id} className="overflow-hidden flex flex-col">
                      <div className="overflow-hidden bg-white dark:bg-blue-800" style={{ minHeight: "120px" }}>
                        {driver.image_url ? (
                          <img
                            src={driver.image_url}
                            alt={driver.name}
                            className="w-full h-auto object-contain max-h-48"
                            onError={(e) => {(e.target as HTMLImageElement).src = '/placeholder-driver.png';}}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-muted-foreground">No Image Available</span>
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl font-bold">{driver.name}</CardTitle>
                        </div>
                        <CardDescription>
                          {driver.manufacturer} • {driver.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400">Operating System</Label>
                            <p className="mt-1">
                              <Badge variant="subtle" className="text-xs bg-blue-500 hover:bg-blue-600 text-white">
                                <strong>{driver.os_version}</strong>
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 dark:text-gray-400"></Label>
                            <p className="font-semibold mt-1">Available Files</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          {driver.files && driver.files.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="driver-files">
                                <AccordionTrigger className={`w-full ${outlinePillButton}`}>
                                  <Package className="h-4 w-4 mr-2" />
                                  <span>{driver.files.length} Driver Files Available</span>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2 mt-2">
                                    {driver.files.map((file) => (
                                      <div key={file.id} className="border rounded-md p-2 bg-slate-50 dark:bg-slate-900">
                                        <div className="flex justify-between items-center mb-2">
                                          <div className="text-xs text-muted-foreground">File Info</div>
                                          {file.version && (
                                            <Badge variant="outline" className="text-xs">v{file.version}</Badge>
                                          )}
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                                          <div>{file.size}</div>
                                          {file.release_date && (
                                            <div>Released: {new Date(file.release_date).toLocaleDateString()}</div>
                                          )}
                                        </div>
                                        <div className="mt-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className={`w-full ${outlinePillButton}`}
                                            onClick={() => window.open(file.url, '_blank')}
                                            title={`Download ${file.name}`}
                                          >
                                            <Download className="h-3 w-3 flex-shrink-0" /> 
                                            <span className="truncate">{file.name}</span>
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          ) : (
                            <p className="text-sm text-muted-foreground">No files available for download</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* ✅ SHOW MORE DRIVERS */}
                {filteredDrivers.length > visibleDrivers && (
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleDrivers((prev) => prev + 8)}
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

export default Drivers;
