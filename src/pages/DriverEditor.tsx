import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Plus, X, ArrowLeft, HardDrive, Save, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from 'uuid';

type DriverFile = {
  name: string;
  version: string;
  date: string;
  size: string;
  link: string;
};

type Driver = {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  image: string;
  os: string[];
  drivers: DriverFile[];
};

const DriverEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const isNew = id === "new" || !id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Form states
  const [driverName, setDriverName] = useState("");
  const [driverCategory, setDriverCategory] = useState("laptops");
  const [driverManufacturer, setDriverManufacturer] = useState("");
  const [driverImage, setDriverImage] = useState("");
  const [driverOs, setDriverOs] = useState<string[]>(["windows11"]);
  const [driverFiles, setDriverFiles] = useState<DriverFile[]>([{
    name: "", 
    version: "", 
    date: new Date().toISOString().split('T')[0], 
    size: "", 
    link: ""
  }]);

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

    // If editing an existing driver, load its data
    if (!isNew && id) {
      loadDriverData(id);
    } else {
      setIsLoading(false);
    }
  }, [user, isAdmin, navigate, isNew, id]);

  const loadDriverData = (driverId: string) => {
    try {
      const storedDrivers = localStorage.getItem('drivers');
      if (storedDrivers) {
        const drivers = JSON.parse(storedDrivers);
        const driver = drivers.find((d: Driver) => d.id === driverId);
        
        if (driver) {
          setDriverName(driver.name);
          setDriverCategory(driver.category || "laptops");
          setDriverManufacturer(driver.manufacturer || "");
          setDriverImage(driver.image || "");
          setDriverOs(driver.os || ["windows11"]);
          setDriverFiles(driver.drivers && driver.drivers.length > 0 
            ? driver.drivers 
            : [{
                name: "", 
                version: "", 
                date: new Date().toISOString().split('T')[0], 
                size: "", 
                link: ""
              }]);
        } else {
          toast.error("Driver not found");
          navigate("/admin");
        }
      }
    } catch (error) {
      console.error("Error loading driver data:", error);
      toast.error("Failed to load driver data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOsToggle = (os: string) => {
    setDriverOs(current => {
      if (current.includes(os)) {
        return current.filter(item => item !== os);
      } else {
        return [...current, os];
      }
    });
  };

  const handleAddDriverFile = () => {
    setDriverFiles([
      ...driverFiles, 
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
    if (driverFiles.length > 1) {
      setDriverFiles(driverFiles.filter((_, i) => i !== index));
    } else {
      toast.error("A driver must have at least one file");
    }
  };

  const handleUpdateDriverFile = (index: number, field: keyof DriverFile, value: string) => {
    const updatedFiles = [...driverFiles];
    updatedFiles[index] = { ...updatedFiles[index], [field]: value };
    setDriverFiles(updatedFiles);
  };

  // Function to sync driver to Supabase app-specific table
  const syncDriverToSupabase = async (driver: Driver) => {
    try {
      setStatusMessage(`Syncing driver "${driver.name}" to Supabase...`);
      
      // Check if the table has the downloads column
      let hasDownloadsColumn = true;
      try {
        // Try to query the schema
        const { error: schemaError } = await supabase
          .from(APP_DRIVERS_TABLE)
          .select('downloads')
          .limit(1);
          
        if (schemaError && schemaError.message.includes('downloads')) {
          hasDownloadsColumn = false;
          console.warn('Downloads column not found in table schema. Using fallback.');
        }
      } catch (e) {
        // If there's an error, assume the column doesn't exist
        hasDownloadsColumn = false;
      }
      
      // Map the driver to the format needed for Supabase app-specific table
      const driverData: any = {
        name: driver.name,
        version: driver.drivers && driver.drivers[0] ? driver.drivers[0].version : '1.0',
        description: driver.drivers && driver.drivers[0] ? driver.drivers[0].name : driver.name,
        os_version: Array.isArray(driver.os) ? driver.os.join(', ') : 'windows11',
        download_url: driver.drivers && driver.drivers[0] ? driver.drivers[0].link : '#',
        image_url: driver.image || '/placeholder-driver.png',
        manufacturer: driver.manufacturer || 'Unknown',
        size: driver.drivers && driver.drivers[0] ? driver.drivers[0].size : 'Unknown',
        category: driver.category || 'laptops',
      };
      
      // Only include downloads field if the column exists
      if (hasDownloadsColumn) {
        driverData.downloads = driver.drivers ? driver.drivers.map(d => ({
          name: d.name,
          version: d.version,
          date: d.date || new Date().toISOString().split('T')[0],
          size: d.size,
          url: d.link
        })) : [];
      }
      
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

  const handleSaveDriver = async () => {
    // Basic validation
    if (!driverName.trim()) {
      toast.error("Driver name is required");
      return;
    }
    
    if (!driverManufacturer.trim()) {
      toast.error("Manufacturer is required");
      return;
    }

    if (driverOs.length === 0) {
      toast.error("Please select at least one operating system");
      return;
    }

    // Validate driver files
    const invalidFile = driverFiles.findIndex(file => !file.name.trim() || !file.version.trim() || !file.link.trim() || !file.size.trim());
    if (invalidFile !== -1) {
      toast.error(`Driver file #${invalidFile + 1} is missing required information`);
      return;
    }

    setIsSaving(true);

    try {
      const storedDrivers = localStorage.getItem('drivers') || '[]';
      const drivers = JSON.parse(storedDrivers);
      
      // Generate ID for new driver or use existing one
      const driverId = isNew ? uuidv4() : id as string;
      
      const newDriver: Driver = {
        id: driverId,
        name: driverName,
        category: driverCategory,
        manufacturer: driverManufacturer,
        image: driverImage,
        os: driverOs,
        drivers: driverFiles
      };
      
      let updatedDrivers;
      if (isNew) {
        updatedDrivers = [...drivers, newDriver];
      } else {
        updatedDrivers = drivers.map((driver: Driver) => 
          driver.id === id ? newDriver : driver
        );
      }
      
      // Save to localStorage
      localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
      
      // Sync to Supabase
      setStatusMessage("Syncing to Supabase...");
      const result = await syncDriverToSupabase(newDriver);
      
      if (result.success) {
        toast.success(`Driver ${isNew ? "created" : "updated"} successfully and synced to Supabase!`);
        navigate("/admin");
      } else {
        toast.error(`Driver saved locally but failed to sync to Supabase: ${result.error?.message}`);
      }
    } catch (error) {
      console.error("Error saving driver:", error);
      toast.error("Failed to save driver");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container py-6">Loading...</div>;
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? "Add New Driver" : "Edit Driver"}</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin")}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveDriver} 
            disabled={isSaving}
            className="flex items-center gap-1"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Driver
              </>
            )}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-2 bg-muted rounded-md text-sm">
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main driver information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details for this driver</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Driver Name*</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Intel Display Driver" 
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="manufacturer">Manufacturer*</Label>
                  <Input 
                    id="manufacturer" 
                    placeholder="e.g., Intel, AMD, Thomson" 
                    value={driverManufacturer}
                    onChange={(e) => setDriverManufacturer(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  className="w-full p-2 border border-input rounded-md"
                  value={driverCategory}
                  onChange={(e) => setDriverCategory(e.target.value)}
                >
                  {driverCategories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input 
                  id="image" 
                  placeholder="https://example.com/driver-image.jpg" 
                  value={driverImage}
                  onChange={(e) => setDriverImage(e.target.value)}
                />
              </div>
              
              <div>
                <Label className="block mb-2">Compatible Operating Systems*</Label>
                <div className="grid grid-cols-2 gap-2">
                  {operatingSystems.map(os => (
                    <div key={os} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`os-${os}`}
                        checked={driverOs.includes(os)}
                        onCheckedChange={() => handleOsToggle(os)}
                      />
                      <label 
                        htmlFor={`os-${os}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {os === "windows10" ? "Windows 10" : "Windows 11"}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview panel */}
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your driver will appear to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded p-4">
                <div className="aspect-video bg-muted mb-4">
                  {driverImage ? (
                    <img 
                      src={driverImage} 
                      alt={driverName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-driver.png';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                      <HardDrive className="h-10 w-10 mr-2" />
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-2">{driverName || "Driver Name"}</h3>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                  <span>{driverManufacturer || "Manufacturer"}</span>
                  <span>•</span>
                  <span className="capitalize">{driverCategory || "Category"}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {driverOs.map(os => (
                    <span key={os} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                      {os === "windows10" ? "Windows 10" : "Windows 11"}
                    </span>
                  ))}
                </div>
                {driverFiles.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Available Downloads:</h4>
                    <ul className="text-sm space-y-1">
                      {driverFiles.map((file, index) => (
                        <li key={index}>
                          {file.name || "File name"} (v{file.version || "1.0"}) - {file.size || "0MB"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Driver Files section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Driver Files</h2>
          <Button onClick={handleAddDriverFile} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add File
          </Button>
        </div>
        
        <div className="space-y-4">
          {driverFiles.map((file, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    File {index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDriverFile(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`file-${index}-name`}>File Name*</Label>
                    <Input 
                      id={`file-${index}-name`} 
                      placeholder="e.g., Intel HD Graphics Driver" 
                      value={file.name}
                      onChange={(e) => handleUpdateDriverFile(index, 'name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`file-${index}-version`}>Version*</Label>
                    <Input 
                      id={`file-${index}-version`} 
                      placeholder="e.g., 27.20.100.9316" 
                      value={file.version}
                      onChange={(e) => handleUpdateDriverFile(index, 'version', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor={`file-${index}-date`}>Release Date</Label>
                    <Input 
                      id={`file-${index}-date`} 
                      type="date"
                      value={file.date}
                      onChange={(e) => handleUpdateDriverFile(index, 'date', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`file-${index}-size`}>File Size*</Label>
                    <Input 
                      id={`file-${index}-size`} 
                      placeholder="e.g., 25MB" 
                      value={file.size}
                      onChange={(e) => handleUpdateDriverFile(index, 'size', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor={`file-${index}-link`}>Download Link*</Label>
                  <Input 
                    id={`file-${index}-link`} 
                    placeholder="https://example.com/driver-download.zip" 
                    value={file.link}
                    onChange={(e) => handleUpdateDriverFile(index, 'link', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverEditor;