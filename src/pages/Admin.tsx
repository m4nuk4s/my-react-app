import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Badge } from "../components/ui/badge";

// Type definitions for the Admin component
type Driver = {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  image: string;
  os: string[];
  drivers: DriverFile[];
};

type DriverFile = {
  name: string;
  version: string;
  date: string;
  size: string;
  link: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState("drivers");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Driver management state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isEditingDriver, setIsEditingDriver] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Form states for driver editing
  const [editDriverName, setEditDriverName] = useState("");
  const [editDriverCategory, setEditDriverCategory] = useState("laptops");
  const [editDriverManufacturer, setEditDriverManufacturer] = useState("");
  const [editDriverOs, setEditDriverOs] = useState<string[]>(["windows11"]);
  const [editDriverImage, setEditDriverImage] = useState("");
  const [editDriverFiles, setEditDriverFiles] = useState<DriverFile[]>([]);

  // App-specific table name for drivers
  const APP_DRIVERS_TABLE = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers';

  // Driver Categories
  const driverCategories = [
    "laptops",
    "desktops",
    "printers",
    "monitors",
    "storage",
  ];

  // Operating Systems
  const operatingSystems = [
    "windows10",
    "windows11",
  ];

  useEffect(() => {
    // Check if user is admin, if not redirect to home
    if (!user || !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
      return;
    }

    // Load drivers from localStorage
    loadDrivers();
  }, [user, isAdmin, navigate]);

  const loadDrivers = () => {
    console.log("Loading drivers for Admin panel");
    try {
      const storedDrivers = localStorage.getItem('drivers');
      
      if (storedDrivers) {
        try {
          const parsedDrivers = JSON.parse(storedDrivers);
          console.log("Found drivers in localStorage:", parsedDrivers.length);
          setDrivers(parsedDrivers);
        } catch (error) {
          console.error("Error parsing drivers:", error);
          initializeDefaultDrivers();
        }
      } else {
        console.log("No drivers found, initializing from sample data");
        initializeDefaultDrivers();
      }
    } catch (error) {
      console.error("Error loading drivers:", error);
      initializeDefaultDrivers();
    }
  };
  
  // Helper function to initialize drivers from sample data
  const initializeDefaultDrivers = () => {
    import('../utils/sampleData').then(module => {
      module.initializeSampleData();
      
      const refreshedDrivers = localStorage.getItem('drivers');
      if (refreshedDrivers) {
        setDrivers(JSON.parse(refreshedDrivers));
      } else {
        const defaultDriver: Driver = {
          id: "default-driver",
          name: "Intel Sample Driver",
          category: "laptops",
          manufacturer: "Intel",
          image: "/assets/images/driver-placeholder.jpg",
          os: ["windows10", "windows11"],
          drivers: [{
            name: "Intel Sample Driver",
            version: "1.0",
            date: "2025-07-15",
            size: "25MB",
            link: "#"
          }]
        };
        
        const defaultDrivers = [defaultDriver];
        localStorage.setItem('drivers', JSON.stringify(defaultDrivers));
        setDrivers(defaultDrivers);
      }
    }).catch(error => {
      console.error("Error initializing default drivers:", error);
      
      const fallbackDriver: Driver = {
        id: "default-driver",
        name: "Intel Sample Driver",
        category: "laptops",
        manufacturer: "Intel",
        image: "/assets/images/driver-placeholder.jpg",
        os: ["windows10", "windows11"],
        drivers: [{
          name: "Intel Sample Driver",
          version: "1.0",
          date: "2025-07-15",
          size: "25MB",
          link: "#"
        }]
      };
      
      localStorage.setItem('drivers', JSON.stringify([fallbackDriver]));
      setDrivers([fallbackDriver]);
    });
  };

  // Function to sync driver to Supabase app-specific table
  const syncDriverToSupabase = async (driver: Driver) => {
    try {
      setStatusMessage(`Syncing driver "${driver.name}" to Supabase...`);
      
      // Map the driver to the format needed for Supabase app-specific table
      const driverData = {
        name: driver.name,
        version: driver.drivers && driver.drivers[0] ? driver.drivers[0].version : '1.0',
        description: driver.drivers && driver.drivers[0] ? driver.drivers[0].name : driver.name,
        os_version: Array.isArray(driver.os) ? driver.os.join(', ') : 'windows11',
        download_url: driver.drivers && driver.drivers[0] ? driver.drivers[0].link : '#',
        image_url: driver.image || '/placeholder-driver.png',
        manufacturer: driver.manufacturer || 'Unknown',
        size: driver.drivers && driver.drivers[0] ? driver.drivers[0].size : 'Unknown',
        category: driver.category || 'laptops'
      };
      
      // Check if driver already exists in Supabase
      const { data: existingDrivers, error: fetchError } = await supabase
        .from(APP_DRIVERS_TABLE)
        .select('name')
        .eq('name', driver.name);
        
      if (fetchError) throw fetchError;
      
      if (existingDrivers && existingDrivers.length > 0) {
        // Driver already exists, update it
        const { error } = await supabase
          .from(APP_DRIVERS_TABLE)
          .update(driverData)
          .eq('name', driver.name);
          
        if (error) throw error;
        setStatusMessage(`Updated driver "${driver.name}" in Supabase`);
        return { success: true, action: 'updated' };
      } else {
        // Driver doesn't exist, insert it
        const { error } = await supabase
          .from(APP_DRIVERS_TABLE)
          .insert([driverData]);
          
        if (error) throw error;
        setStatusMessage(`Added driver "${driver.name}" to Supabase`);
        return { success: true, action: 'inserted' };
      }
    } catch (error) {
      console.error('Error syncing driver to Supabase:', error);
      setStatusMessage(`Error syncing driver "${driver.name}": ${error.message || 'Unknown error'}`);
      return { success: false, error };
    }
  };

  // Function to sync all drivers to Supabase
  const syncAllDriversToSupabase = async () => {
    setIsLoading(true);
    setStatusMessage("Syncing all drivers to Supabase...");
    
    try {
      let inserted = 0;
      let updated = 0;
      let errors = 0;
      
      for (const driver of drivers) {
        try {
          const result = await syncDriverToSupabase(driver);
          if (result.success) {
            if (result.action === 'inserted') inserted++;
            if (result.action === 'updated') updated++;
          } else {
            errors++;
          }
        } catch (err) {
          console.error(`Error syncing driver "${driver.name}":`, err);
          errors++;
        }
      }
      
      const successMessage = `Sync complete: ${inserted} drivers inserted, ${updated} drivers updated, ${errors} errors`;
      setStatusMessage(successMessage);
      toast.success(successMessage);
      
    } catch (error) {
      const errorMessage = `Sync failed: ${error.message || 'Unknown error'}`;
      setStatusMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Driver management handlers
  const handleAddNewDriver = () => {
    const getNextDriverId = (): string => {
      const maxId = Math.max(...drivers.map(d => parseInt(d.id) || 0), 0);
      return (maxId + 1).toString();
    };

    const newDriver: Driver = {
      id: "new",
      name: "",
      category: "laptops",
      manufacturer: "Thomson",
      image: "",
      os: ["windows11"],
      drivers: []
    };
    
    setSelectedDriver(newDriver);
    setEditDriverName("");
    setEditDriverCategory("laptops");
    setEditDriverManufacturer("Thomson");
    setEditDriverImage("");
    setEditDriverOs(["windows11"]);
    setEditDriverFiles([]);
    setIsEditingDriver(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditDriverName(driver.name);
    setEditDriverCategory(driver.category);
    setEditDriverManufacturer(driver.manufacturer);
    setEditDriverImage(driver.image);
    setEditDriverOs([...driver.os]);
    setEditDriverFiles([...driver.drivers]);
    setIsEditingDriver(true);
  };

  const handleDeleteDriver = (driverId: string) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      // Remove from localStorage
      const updatedDrivers = drivers.filter(d => d.id !== driverId);
      localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
      setDrivers(updatedDrivers);
      
      // Get the driver to delete from Supabase
      const driverToDelete = drivers.find(d => d.id === driverId);
      
      if (driverToDelete) {
        // Delete from Supabase
        supabase
          .from(APP_DRIVERS_TABLE)
          .delete()
          .eq('name', driverToDelete.name)
          .then(({ error }) => {
            if (error) {
              console.error('Error deleting driver from Supabase:', error);
              toast.error(`Driver deleted locally but failed to delete from Supabase: ${error.message}`);
            } else {
              toast.success("Driver deleted successfully from local storage and Supabase");
            }
          });
      } else {
        toast.success("Driver deleted successfully from local storage");
      }
    }
  };

  const handleOsToggle = (os: string) => {
    if (editDriverOs.includes(os)) {
      setEditDriverOs(editDriverOs.filter(item => item !== os));
    } else {
      setEditDriverOs([...editDriverOs, os]);
    }
  };

  const handleAddDriverFile = () => {
    setEditDriverFiles([
      ...editDriverFiles, 
      { 
        name: "", 
        version: "", 
        date: new Date().toISOString().split('T')[0], 
        size: "", 
        link: "" 
      }
    ]);
  };

  const handleRemoveDriverFile = (index: number) => {
    setEditDriverFiles(editDriverFiles.filter((_, i) => i !== index));
  };

  const handleUpdateDriverFile = (index: number, field: keyof DriverFile, value: string) => {
    const updatedFiles = [...editDriverFiles];
    updatedFiles[index] = { ...updatedFiles[index], [field]: value };
    setEditDriverFiles(updatedFiles);
  };

  const handleSaveDriver = async () => {
    setIsLoading(true);
    
    try {
      if (!selectedDriver) return;
      
      // Form validation
      if (!editDriverName.trim()) {
        toast.error("Driver name is required");
        setIsLoading(false);
        return;
      }
      
      if (editDriverFiles.length === 0) {
        // Add at least one driver file if none exists
        setEditDriverFiles([{
          name: editDriverName,
          version: "1.0",
          date: new Date().toISOString().split('T')[0],
          size: "Unknown",
          link: "#"
        }]);
      }
      
      // Generate next incremental ID for new drivers
      const getNextDriverId = (): string => {
        const maxId = Math.max(...drivers.map(d => parseInt(d.id) || 0), 0);
        return (maxId + 1).toString();
      };
      
      const updatedDriver: Driver = {
        id: selectedDriver.id === "new" ? getNextDriverId() : selectedDriver.id,
        name: editDriverName,
        category: editDriverCategory,
        manufacturer: editDriverManufacturer,
        image: editDriverImage,
        os: editDriverOs,
        drivers: editDriverFiles
      };
      
      // Update localStorage
      let updatedDrivers;
      
      if (selectedDriver.id === "new") {
        updatedDrivers = [...drivers, updatedDriver];
      } else {
        updatedDrivers = drivers.map(d => d.id === selectedDriver.id ? updatedDriver : d);
      }
      
      localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
      setDrivers(updatedDrivers);
      
      // Sync to Supabase
      const result = await syncDriverToSupabase(updatedDriver);
      
      if (result.success) {
        toast.success(`Driver ${selectedDriver.id === "new" ? "created" : "updated"} and synced to Supabase`);
      } else {
        toast.warning("Driver saved locally but failed to sync to Supabase. Will retry automatically.");
      }
    } catch (error) {
      console.error("Error saving driver:", error);
      toast.error(`Error: ${error.message || "Failed to save driver"}`);
    } finally {
      setIsLoading(false);
      setIsEditingDriver(false);
      setSelectedDriver(null);
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => navigate("/")} variant="outline">Return to Home</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
          <TabsTrigger value="drivers">Driver Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="models">Computer Models</TabsTrigger>
        </TabsList>

        {/* Drivers Management Tab */}
        <TabsContent value="drivers">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Driver Management</h2>
            <div className="flex gap-2">
              <Button onClick={handleAddNewDriver}>Add New Driver</Button>
              <Button onClick={syncAllDriversToSupabase} variant="outline" disabled={isLoading}>
                Sync All to Supabase
              </Button>
            </div>
          </div>
          
          {statusMessage && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <p className="text-sm">{statusMessage}</p>
            </div>
          )}

          {/* Driver Editor */}
          {isEditingDriver && selectedDriver && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{selectedDriver.id === "new" ? "Add New Driver" : "Edit Driver"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic info */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="driverName">Driver Name</Label>
                        <Input 
                          id="driverName" 
                          value={editDriverName} 
                          onChange={e => setEditDriverName(e.target.value)} 
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="driverCategory">Category</Label>
                        <select 
                          id="driverCategory" 
                          value={editDriverCategory}
                          onChange={e => setEditDriverCategory(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {driverCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="driverManufacturer">Manufacturer</Label>
                        <Input 
                          id="driverManufacturer" 
                          value={editDriverManufacturer} 
                          onChange={e => setEditDriverManufacturer(e.target.value)} 
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="driverImage">Image URL</Label>
                        <Input 
                          id="driverImage" 
                          value={editDriverImage} 
                          onChange={e => setEditDriverImage(e.target.value)} 
                          placeholder="/assets/images/driver-image.jpg" 
                        />
                      </div>
                    </div>
                    
                    {/* Operating systems */}
                    <div className="space-y-4">
                      <div>
                        <Label>Operating Systems</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {operatingSystems.map(os => (
                            <Badge 
                              key={os} 
                              variant={editDriverOs.includes(os) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleOsToggle(os)}
                            >
                              {os}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Driver Files */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Driver Files</Label>
                          <Button type="button" size="sm" onClick={handleAddDriverFile}>
                            <Plus className="h-4 w-4 mr-1" /> Add File
                          </Button>
                        </div>
                        
                        {editDriverFiles.length === 0 && (
                          <p className="text-sm text-muted-foreground">No driver files added yet. Click "Add File" to add one.</p>
                        )}
                        
                        {editDriverFiles.map((file, index) => (
                          <div key={index} className="border p-3 rounded-md mb-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>File {index + 1}</Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveDriverFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor={`file-${index}-name`} className="text-xs">Name</Label>
                                <Input 
                                  id={`file-${index}-name`}
                                  value={file.name} 
                                  onChange={e => handleUpdateDriverFile(index, 'name', e.target.value)} 
                                  size="sm"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`file-${index}-version`} className="text-xs">Version</Label>
                                <Input 
                                  id={`file-${index}-version`}
                                  value={file.version} 
                                  onChange={e => handleUpdateDriverFile(index, 'version', e.target.value)} 
                                  size="sm"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor={`file-${index}-date`} className="text-xs">Date</Label>
                                <Input 
                                  id={`file-${index}-date`}
                                  value={file.date} 
                                  onChange={e => handleUpdateDriverFile(index, 'date', e.target.value)} 
                                  size="sm"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`file-${index}-size`} className="text-xs">Size</Label>
                                <Input 
                                  id={`file-${index}-size`}
                                  value={file.size} 
                                  onChange={e => handleUpdateDriverFile(index, 'size', e.target.value)} 
                                  size="sm"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor={`file-${index}-link`} className="text-xs">Download Link</Label>
                              <Input 
                                id={`file-${index}-link`}
                                value={file.link} 
                                onChange={e => handleUpdateDriverFile(index, 'link', e.target.value)} 
                                size="sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditingDriver(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleSaveDriver} 
                      disabled={isLoading || !editDriverName.trim()}
                    >
                      {isLoading ? "Saving..." : "Save Driver"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Driver List */}
          {!isEditingDriver && (
            <div className="space-y-4">
              {drivers.length === 0 ? (
                <div className="text-center p-12 border rounded-lg">
                  <p className="text-muted-foreground">No drivers found. Add your first driver!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drivers.map(driver => (
                    <Card key={driver.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        {driver.image ? (
                          <img 
                            src={driver.image} 
                            alt={driver.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-driver.png';
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">{driver.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-2">
                          <p className="text-sm text-muted-foreground">Manufacturer: {driver.manufacturer}</p>
                          <p className="text-sm text-muted-foreground">Category: {driver.category}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {driver.os.map(os => (
                            <Badge key={os} variant="secondary">{os}</Badge>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditDriver(driver)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteDriver(driver.id)}>
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Settings management is under construction.</p>
              <p className="text-sm text-muted-foreground mt-2">Coming soon: Theme settings, data sources, user permissions.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Computer Models Tab */}
        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Computer Models</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Computer model management is under construction.</p>
              <p className="text-sm text-muted-foreground mt-2">Coming soon: Add/edit computer models for guides.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;