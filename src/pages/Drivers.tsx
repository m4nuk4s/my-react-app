import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, Laptop, Monitor, HardDrive, Printer, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Panel from "@/assets/wtpth/panel.jpg"
import N15Grey from "@/assets/wtpth/PC/N15Grey.jpg"
import N15C8SL512 from "@/assets/wtpth/PC/N15C8SL512.jpg"
import TH17V2 from "@/assets/wtpth/PC/TH17V2.jpg"
import n14c4 from "@/assets/wtpth/PC/n14c4.jpg"
import n14128 from "@/assets/wtpth/PC/n14128.jpg"
import N17V2C4WH128 from "@/assets/wtpth/PC/N17V2C4WH128.jpg"
import n17i712img from "@/assets/wtpth/PC/N17I712.jpg"
import N17I5108SLIMG from "@/assets/wtpth/PC/N17I5108SL.jpg"
import N15C12SL512IMG from "@/assets/wtpth/PC/N15C12SL512.jpg"
import N14C4BK128IMG from "@/assets/wtpth/PC/N14C4BK128.jpg"
import K14C4T128IMG from "@/assets/wtpth/PC/K14C4T128.jpg"
import HUN14C4BK128IMG from "@/assets/wtpth/PC/HUN14C4BK128.jpg"
import PX14C4SL128IMG from "@/assets/wtpth/PC/PX14C4SL128.jpg"

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  interface DriverType {
    id: number;
    name: string;
    category: string;
    manufacturer: string;
    image: string;
    os: string[];
    drivers: {
      name: string;
      version: string;
      date: string;
      size: string;
      link: string;
    }[];
  }
  
  const [drivers, setDrivers] = useState<DriverType[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<DriverType[]>([]);

  // Load drivers from Supabase or localStorage
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        // Import necessary modules
        const { supabase } = await import('@/lib/supabase');
        const sampleDataModule = await import('@/utils/sampleData');
        
        // Try to fetch from Supabase first
        const { data: supabaseDrivers, error } = await supabase
          .from('drivers')
          .select('*');
        
        if (supabaseDrivers && supabaseDrivers.length > 0 && !error) {
          console.log('Loaded drivers from Supabase:', supabaseDrivers.length);
          
          // Convert Supabase format to the format needed by the UI
          const convertedDrivers = supabaseDrivers.map(driver => {
            // Parse OS version string into array
            const osList = driver.os_version.split(', ').map(os => os.trim().toLowerCase());
            
            // Create manufacturer from name if not available
            const manufacturer = driver.manufacturer || driver.name.split(' ')[0];
            
            return {
              id: driver.id,
              name: driver.name,
              category: driver.device_model || "laptops",
              manufacturer: manufacturer,
              image: '/assets/images/driver-placeholder.jpg', // Default image
              os: osList,
              drivers: [{
                name: driver.description || "Driver Package",
                version: driver.version,
                date: new Date(driver.created_at).toISOString().split('T')[0],
                size: driver.size || "1.0 GB",
                link: driver.download_url
              }]
            };
          });
          
          setDrivers(convertedDrivers);
        } else {
          // Fallback to localStorage if Supabase fails
          const storedDrivers = localStorage.getItem('drivers');
          if (storedDrivers) {
            const parsedDrivers = JSON.parse(storedDrivers);
            // Convert admin format to drivers page format
            const convertedDrivers = parsedDrivers.map((driver: DriverType) => ({
              id: parseInt(driver.id) || driver.id,
              name: driver.name,
              category: driver.category,
              manufacturer: driver.manufacturer,
              image: driver.image,
              os: driver.os,
              drivers: driver.drivers
            }));
            setDrivers(convertedDrivers);
          } else {
            // Initialize with sample data if no stored drivers
            sampleDataModule.initializeSampleData();
            // Reload after initialization
            const refreshedDrivers = localStorage.getItem('drivers');
            if (refreshedDrivers) {
              const parsedDrivers = JSON.parse(refreshedDrivers);
              const convertedDrivers = parsedDrivers.map((driver: DriverType) => ({
                id: parseInt(driver.id) || driver.id,
                name: driver.name,
                category: driver.category,
                manufacturer: driver.manufacturer,
                image: driver.image,
                os: driver.os,
                drivers: driver.drivers
              }));
              setDrivers(convertedDrivers);
            } else {
              // Last resort - use static data
              setDrivers(staticDrivers);
            }
          }
        }
      } catch (error) {
        console.error("Error loading drivers:", error);
        setDrivers(staticDrivers); // Fallback to static data
      }
    };

    loadDrivers();
  }, []);

  // Static driver data as fallback
  const staticDrivers = [
    {
      id: 1,
      name: "UKN15I711-8GR512",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N15Grey,
      drivers: [
        { name: "Driver Package", version: "1.1", date: "2025-05-15", size: "1.98 GB", link: "http://gofile.me/5wnJP/Gne50FQ5q" }
      ]
    },
    {
      id: 2,
      name: "UKN15I310-8DG256-IF1599445",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N15Grey,
      drivers: [
        { name: "Driver Package", version: "1.1", date: "2025-06-02", size: "2.30 GB", link: "http://gofile.me/5wnJP/YTr0V82x9" }
      ]
    },
    {
      id: 3,
      name: "UA-N15C8SL512",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N15C8SL512,
      drivers: [
        { name: "Driver Package", version: "30.0.15.1179", date: "2023-06-10", size: "1.67 GB", link: "http://gofile.me/5wnJP/nb3OCv4AB" }
      ]
    },
    {
      id: 4,
      name: "TH17V2C4WH128-OR155481",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows10", "windows11"],
      image: TH17V2,
      drivers: [
        { name: "Driver Package", version: "531.61", date: "2023-04-25", size: "1.05 GB", link: "http://gofile.me/5wnJP/f32DlaHd6" }
      ]
    },
    {
      id: 5,
      name: "TH15I510-16SL512-SH1589355",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows10", "windows11"],
      image: N15Grey,
      drivers: [
        { name: "Driver Package", version: "27.20.100.9749", date: "2023-05-10", size: "3.37 GB", link: "http://gofile.me/5wnJP/S425TxWSf" }
      ]
    },
    {
      id: 6,
      name: "SPN14C4128.OR15451",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows10"],
      image: n14c4,
      drivers: [
        { name: "Driver Package", version: "49.5.4851", date: "2023-06-01", size: "1.73 GB", link: "http://gofile.me/5wnJP/7NrLvcDIK" }
      ]
    },
    {
      id: 7,
      name: "SPK14C4BK128-OR146563",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows10", "windows11"],
      image: n14128,
      drivers: [
        { name: "Driver Package", version: "2.1.5", date: "2023-03-18", size: "1.67 GB", link: "http://gofile.me/5wnJP/lS0M39Hol" }
      ]
    },
    {
      id: 8,
      name: "N17V2C4WH128",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows10", "windows11"],
      image: N17V2C4WH128,
      drivers: [
        { name: "Driver Package", version: "3.3.1.2", date: "2023-04-02", size: "1.05 GB", link: "http://gofile.me/5wnJP/N8ELay1Zl" }
      ]
    },
    {
      id: 9,
      name: "N17V2C4WH128",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows10", "windows11"],
      image: N17V2C4WH128,
      drivers: [
        { name: "Driver Package", version: "3.3.1", date: "2023-04-02", size: "1.05 GB", link: "http://gofile.me/5wnJP/N8ELay1Zl" }
      ]
    },
    {
      id: 10,
      name: "N17I712GENI3",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows10", "windows11"],
      image: n17i712img,
      drivers: [
        { name: "Driver Package", version: "3.1.2", date: "2023-04-02", size: "1.05 GB", link: "http://gofile.me/5wnJP/QIeryHJyn" }
      ]
    },
    {
      id: 11,
      name: "N17I510.8SL512",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows10", "windows11"],
      image: N17I5108SLIMG,
      drivers: [
        { name: "Driver Package", version: "3.3.2", date: "2023-04-02", size: "1.99 GB", link: "http://gofile.me/5wnJP/jP6rtMtmr" }
      ]
    },
    {
      id: 12,
      name: "N17I310-16BK512-IP1613462",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows10", "windows11"],
      image: n17i712img,
      drivers: [
        { name: "Driver Package", version: "3.3.", date: "2023-07-02", size: "1.45 GB", link: "http://gofile.me/5wnJP/XTcV9qP0b" }
      ]
    },
    {
      id: 13,
      name: "N15I310.8GR256",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N15Grey,
      drivers: [
        { name: "Driver Package", version: "3.3.1.2", date: "2024-04-02", size: "1.70 GB", link: "http://gofile.me/5wnJP/gVyNA0jEW" }
      ]
    },
    {
      id: 14,
      name: "N15C12SL512-OR146041",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N15C12SL512IMG,
      drivers: [
        { name: "Driver Package", version: "3.3.1.2", date: "2023-04-02", size: "1.05 GB", link: "http://gofile.me/5wnJP/MLLrAa6ba" }
      ]
    },
    {
      id: 15,
      name: "N15C4SL128.OR14411",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N15C12SL512IMG,
      drivers: [
        { name: "Driver Package", version: "3.3", date: "2023-04-02", size: "1.66 GB", link: "http://gofile.me/5wnJP/HnvTTH4GL" }
      ]
    },
    {
      id: 16,
      name: "N14C.4BK128.YU156608",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N14C4BK128IMG,
      drivers: [
        { name: "Driver Package", version: "3.3.1.2", date: "2023-04-02", size: "1.79 GB", link: "http://gofile.me/5wnJP/MLLrAa6ba" }
      ]
    },
    {
      id: 17,
      name: "K14C4T128.OR146569",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: K14C4T128IMG,
      drivers: [
        { name: "Driver Package", version: "1.2", date: "2023-04-02", size: "1.79 GB", link: "http://gofile.me/5wnJP/onDTRKk9N" }
      ]
    },
    {
      id: 18,
      name: "HUN14C.4BK128",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: HUN14C4BK128IMG,
      drivers: [
        { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.55 GB", link: "http://gofile.me/5wnJP/eGwd0juwK" }
      ]
    },
    {
      id: 19,
      name: "N15I712-16GR512",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N15Grey,
      drivers: [
        { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.62 GB", link: "http://gofile.me/5wnJP/5RHrCzNdP" },
        { name: "Touchpad Firmware", version: "2", date: "2025-04-02", size: "243 KB", link: "http://gofile.me/5wnJP/WgsCE7qRn" }
      ]
    },
    {
      id: 20,
      name: "N15I512-16GR512",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N15Grey,
      drivers: [
        { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.62 GB", link: "http://gofile.me/5wnJP/v4H5rm6e2" },
        { name: "Touchpad Firmware", version: "2", date: "2025-04-02", size: "243 KB", link: "http://gofile.me/5wnJP/WgsCE7qRn" }
      ]
    },
    {
      id: 21,
      name: "N15I512-8GR512",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N15Grey,
      drivers: [
        { name: "Driver Package", version: "1.7", date: "2025-04-02", size: "1.62 GB", link: "http://gofile.me/5wnJP/mdv9h5t1K" }
      ]
    },
    {
      id: 22,
      name: "N15I312-8GR512",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N15Grey,
      drivers: [
        { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.54 GB", link: "http://gofile.me/5wnJP/3J0lwLQMO" }
      ]
    },
    {
      id: 23,
      name: "N15I312-8GR256",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: N15Grey,
      drivers: [
        { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.55 GB", link: "http://gofile.me/5wnJP/rWjfXLPvD" }
      ]
    },
    {
      id: 24,
      name: "IN-PX14C4SL128",
      category: "laptops",
      manufacturer: "Thomson",
      os: ["windows11"],
      image: PX14C4SL128IMG,
      drivers: [
        { name: "Driver Package", version: "1.2", date: "2024-04-02", size: "1.25 GB", link: "http://gofile.me/5wnJP/eCriymvL3" }
      ]
    }
  ];

  // Filter drivers based on search term and category
  useEffect(() => {
    const filtered = drivers.filter((driver) => {
      const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            driver.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || driver.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredDrivers(filtered);
  }, [searchTerm, selectedCategory, drivers]);

  const categories = [
    { value: "all", label: "All Categories", icon: <Search className="h-4 w-4" /> },
    { value: "laptops", label: "Laptops", icon: <Laptop className="h-4 w-4" /> },
    { value: "desktops", label: "Desktops", icon: <Cpu className="h-4 w-4" /> },
    { value: "printers", label: "Printers", icon: <Printer className="h-4 w-4" /> },
    { value: "monitors", label: "Monitors", icon: <Monitor className="h-4 w-4" /> },
    { value: "storage", label: "Storage", icon: <HardDrive className="h-4 w-4" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <div className="text-center">
        <h1
          className="text-4xl font-bold text-white mb-0 px-6 py-20 rounded bg-cover bg-center"
          style={{ backgroundImage: `url(${Panel})`, display: 'block' }}
        >
          Driver Downloads
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto p-4 rounded">
          Find and download the latest drivers for your computer hardware
        </p>
      </div>
    
   {/* Search and Filter Section */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div className="md:col-span-3">
    <div className="relative">
      <div className="absolute inset-y-0 left 3 flex items-center text-blue-600">
        <Search className="h-4 w-4" />
      </div>
      <Input
        placeholder="Search by device name or manufacturer..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  </div>
  <div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value} className="flex items-center">
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Driver Results */}
      <div>
        {filteredDrivers.length > 0 ? (
          <div className="grid grid-cols-2 gap-1">
            {filteredDrivers.map((device) => (
              <Card key={device.id}>
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img 
                        src={device.image} 
                        alt={device.name}
                        className="w-24 h-18 object-cover rounded-md border"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA1MEgxMjBWMTAwSDgwVjUwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNODUgNjVIMTE1Vjc1SDg1VjY1WiIgZmlsbD0iIzYzNzdEOSIvPgo8L3N2Zz4=';
                        }}
                      />
                    </div>
                    <div className="flex-grow flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{device.name}</CardTitle>
                        <CardDescription>Manufacturer: {device.manufacturer}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        {device.os.includes("windows10") && (
                          <Badge variant="outline">Windows 10</Badge>
                        )}
                        {device.os.includes("windows11") && (
                          <Badge variant="outline">Windows 11</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="0">
                    <TabsList>
  <TabsTrigger
    value="drivers"
    className="bg-blue-600 text-white data-[state=active]:bg-blue-200 data-[state=inactive]:text-blac-500 hover:bg-blue-700 transition px-4 py-2 rounded"
  >
    Downloads
  </TabsTrigger>
</TabsList>
                    <TabsContent value="drivers">
                      <div className="space-y-4 mt-4">
                        {device.drivers.map((driver, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-100 rounded-md">
                            <div>
                              <h4 className="font-medium">{driver.name}</h4>
                              <div className="text-sm text-blac-500">
                                Version: {driver.version} | Released: {driver.date} | Size: {driver.size}
                              </div>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <a href={driver.link} download>
                                <Download className="mr-2 h-4 w-4" /> Download
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Can't find what you're looking for?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            If you can't find the driver for your specific device, you can submit a driver request or contact our support team.
          </p>
          <Button asChild>
            <a href="/requests">Request Driver</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}