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
import Panel from "@/assets/wtpth/panel.jpg";

interface DriverFile {
  id: string;
  driver_id: string;
  name: string;
  url: string;
  size: string;
  type: string;
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
        const { data: dbDrivers, error: driversError } = await supabase.from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
          .select('*');

        const { data: dbFiles, error: driverFilesError } = await supabase
          .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
          .select('*');

        if (driversError || driverFilesError) {
          console.error('Supabase fetch error:', { driversError, driverFilesError });
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

        const driversData: Driver[] = dbDrivers.map(driver => {
          // Create file entries from download_url
          const files: DriverFile[] = [];
          
          if (driver.download_url && driver.download_url !== '#') {
            files.push({
              id: `file-${driver.id}`,
              driver_id: driver.id,
              name: driver.description || driver.name,
              url: driver.download_url,
              size: driver.size || 'Unknown',
              type: 'driver'
            });
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
        <div>
          <h1
            className="text-4xl font-bold text-white mb-0 px-4 py-20 rounded bg-cover bg-center"
            style={{ backgroundImage: `url(${Panel})`, display: 'block' }}
          >
            Drivers/Recovery Images/Firmware
            <p className="text-xl text-blue-100 mb-8">
              Find and download the latest drivers/firmwares for your devices
            </p>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
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
                        {driver.version && (
                          <Badge variant="outline" className="text-sm font-semibold">Version {driver.version}</Badge>
                        )}
                      </div>
                      <CardDescription>
                        {driver.manufacturer} • {driver.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">{driver.description}</p>
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
                          driver.files.map((file) => (
                            <Button
                              key={file.id}
                              variant="default"
                              className="w-full justify-between bg-blue-500 hover:bg-blue-600 text-white transition-colors font-bold"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              <span>{file.name}</span>
                              <span className="text-xs text-white/80">{file.size}</span>
                            </Button>
                          ))
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
