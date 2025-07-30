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
import { ChevronDown, ChevronRight, Download, Package } from 'lucide-react';
import Panel from "@/assets/wtpth/panel.jpg";

// Import Accordion components
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

const categories = ['all', 'laptops', 'desktops', 'AIO', 'monitors', 'peripherals'];

export function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchDriversWithFiles = async () => {
      setLoading(true);
      try {
        // Fetch main driver records from the app drivers table
        const { data: dbDrivers, error: driversError } = await supabase.from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
          .select('*');

        // Fetch additional driver files from the down1 table
        const { data: down1Files, error: down1Error } = await supabase
          .from('down1')
          .select('*');

        if (driversError) {
          console.error('Supabase fetch error (drivers):', driversError);
          toast.error('Database fetch failed. Check your Supabase connection and permissions.');
          setDrivers([]);
          setLoading(false);
          return;
        }

        if (!dbDrivers || dbDrivers.length === 0) {
          toast.error('No driver data found in Supabase. Check your database content and permissions.');
          setDrivers([]);
          setLoading(false);
          return;
        }

        // Process and log the down1 files if available
        if (down1Error) {
          console.warn('Could not fetch additional driver files from down1 table:', down1Error);
        } else {
          console.log('Additional driver files from down1 table:', down1Files);
        }

        const driversData: Driver[] = dbDrivers.map(driver => {
          // Create file entries from download_url
          const files: DriverFile[] = [];
          
          // Add main driver file
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
          
          // Add additional files from down1 table
          if (down1Files && down1Files.length > 0) {
            // Find files that match this driver by name
            const additionalFiles = down1Files.filter(file => 
              file.model && file.model.toLowerCase() === driver.name.toLowerCase()
            );
            
            if (additionalFiles.length > 0) {
              console.log(`Found ${additionalFiles.length} additional files for ${driver.name}`);
              
              // Add each additional file to the files array
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
          }
          
          // Ensure we have a valid image URL with absolute path
          let imageUrl = '/placeholder-driver.png';
          
          // Process image URL with thorough validation
          if (driver.image_url && 
              driver.image_url !== 'null' && 
              driver.image_url !== 'undefined' && 
              driver.image_url.trim() !== '') {
            
            // If it's a relative URL, make it absolute
            if (driver.image_url.startsWith('/')) {
              const baseUrl = window.location.origin;
              imageUrl = `${baseUrl}${driver.image_url}`;
            } else if (driver.image_url.startsWith('http')) {
              // It's already absolute
              imageUrl = driver.image_url;
            } else {
              // Add leading slash if missing
              const baseUrl = window.location.origin;
              imageUrl = `${baseUrl}/${driver.image_url}`;
            }
          } 
          // Try image field as fallback
          else if (driver.image && 
                  driver.image !== 'null' && 
                  driver.image !== 'undefined' && 
                  driver.image.trim() !== '') {
            
            // Same processing for image field
            if (driver.image.startsWith('/')) {
              const baseUrl = window.location.origin;
              imageUrl = `${baseUrl}${driver.image}`;
            } else if (driver.image.startsWith('http')) {
              imageUrl = driver.image;
            } else {
              const baseUrl = window.location.origin;
              imageUrl = `${baseUrl}/${driver.image}`;
            }
          }
          
          console.log(`Driver ${driver.id}: Using image URL:`, imageUrl);
          
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
      } catch (error) {
        console.error('Unexpected error loading drivers:', error);
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
  }, [searchQuery, activeTab, drivers]);

  return (
    <div className="container py-6">
      <div className="text-center">
        <div className="relative rounded overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 mix-blend-multiply" />
            <img 
              src={Panel} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover object-center opacity-60" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          <div className="relative z-10 px-4 py-16">
            <h1 className="text-4xl font-bold text-white mb-2">
              Drivers/Recovery Images/Firmware
              <p className="text-xl text-blue-50 mb-4 max-w-2xl text-center mx-auto drop-shadow">
                Find and download the latest drivers/firmwares for your devices
              </p>
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-6">
          <div className="flex-1">
            <Input
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {filteredDrivers.map((driver) => (
                  <Card key={driver.id} className="overflow-hidden flex flex-col">
                    <div className="overflow-hidden bg-white dark:bg-blue-800" style={{ minHeight: "120px" }}>
                      {driver.image_url ? (
                        <img
                          src={driver.image_url}
                          alt={driver.name}
                          className="w-full h-auto object-contain max-h-48"
                          onError={(e) => {
                            console.error("Image failed to load:", driver.image_url);
                            (e.target as HTMLImageElement).src = '/placeholder-driver.png';
                            console.log("Fallback image applied");
                          }}
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
                              <AccordionTrigger className="text-sm font-medium py-2 px-2 bg-blue-100 dark:bg-blue-900/30 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/50 flex items-center">
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
                                          className="flex items-center gap-1 w-full text-ellipsis overflow-hidden bg-gradient-to-r from-primary/10 to-purple-600/10 hover:from-primary/20 hover:to-purple-600/20 transition-all duration-300"
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Drivers;
