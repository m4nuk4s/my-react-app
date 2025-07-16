import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Download } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { existingDrivers } from '../utils/existingDrivers';
import { useAuth } from '../contexts/AuthContext';

interface Driver {
  id: string;
  name: string;
  version: string;
  description: string;
  os_version: string;
  device_model?: string;
  download_url: string;
  image_url?: string;
  manufacturer: string;
  size: string;
  category: string;
}

const categories = ['all', 'laptops', 'desktops', 'servers', 'monitors', 'peripherals'];

const localDrivers: Driver[] = existingDrivers.map(driver => ({
  id: driver.id.toString(),
  name: driver.name,
  version: driver.drivers[0].version,
  description: driver.drivers[0].name,
  os_version: driver.os.join(', '),
  download_url: driver.drivers[0].link,
  image_url: typeof driver.image === 'string' ? driver.image : '',
  manufacturer: driver.manufacturer,
  size: driver.drivers[0].size,
  category: driver.category
}));

export function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);

        const { data: appDrivers, error: appError } = await supabase
          .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
          .select('*');

        if (appError || !appDrivers || appDrivers.length === 0) {
          console.warn('App-specific drivers empty or error, falling back to main drivers table');

          const { data: mainDrivers, error: mainError } = await supabase
            .from('drivers')
            .select('*');

          if (mainError || !mainDrivers || mainDrivers.length === 0) {
            console.warn('Main drivers table empty or error, using local fallback');
            setDrivers(localDrivers);
          } else {
            console.log(`Loaded ${mainDrivers.length} drivers from main table`);
            setDrivers(mainDrivers as Driver[]);
          }
        } else {
          console.log(`Loaded ${appDrivers.length} drivers from app-specific table`);
          setDrivers(appDrivers as Driver[]);
        }
      } catch (error) {
        console.error('Unexpected error loading drivers:', error);
        setDrivers(localDrivers);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
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

  const handleDownload = (driver: Driver) => {
    window.open(driver.download_url, '_blank');
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Driver Downloads</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Find and download the latest drivers for your devices
          </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrivers.map((driver) => (
                  <Card key={driver.id} className="overflow-hidden flex flex-col">
                    {driver.image_url && (
                      <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={driver.image_url}
                          alt={driver.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-driver.png';
                          }}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{driver.name}</CardTitle>
                        <Badge variant="outline">{driver.version}</Badge>
                      </div>
                      <CardDescription>
                        {driver.manufacturer} • {driver.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{driver.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                        <div>
                          <Label className="text-xs text-gray-500 dark:text-gray-400">OS Version</Label>
                          <p>{driver.os_version}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 dark:text-gray-400">Size</Label>
                          <p>{driver.size}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      <Button onClick={() => handleDownload(driver)} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </CardFooter>
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
