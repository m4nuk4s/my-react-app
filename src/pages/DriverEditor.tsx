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
import { forceSchemaRefresh } from "../lib/schemaFix";
import { fixDriversTableSchema, fixDown1TableSchema } from "../lib/databaseFixes";
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
  image_url?: string; // ✅ add this
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

  const loadDriverData = async (driverId: string) => {
    try {
      // Try to fetch the driver directly from Supabase first
      const { data: driverFromDB, error: fetchError } = await supabase
        .from(APP_DRIVERS_TABLE)
        .select('*')
        .eq('id', driverId)
        .single();
      
      if (fetchError || !driverFromDB) {
        console.error("Error fetching driver from database:", fetchError);
        toast.error("Could not load driver from database, trying local storage");
        
        // Fallback to localStorage if database fetch fails
        const storedDrivers = localStorage.getItem('drivers');
        if (storedDrivers) {
          const drivers = JSON.parse(storedDrivers);
          const driver = drivers.find((d: Driver) => d.id === driverId);
          
          if (driver) {
            setDriverName(driver.name);
            setDriverCategory(driver.category || "laptops");
            setDriverManufacturer(driver.manufacturer || "");
            setDriverImage(driver.image || driver.image_url || "");
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
            return;
          } else {
            toast.error("Driver not found in local storage");
            navigate("/admin");
            return;
          }
        } else {
          toast.error("No drivers found in local storage");
          navigate("/admin");
          return;
        }
      }
      
      // Process the driver data from the database
      setDriverName(driverFromDB.name);
      setDriverCategory(driverFromDB.category || "laptops");
      setDriverManufacturer(driverFromDB.manufacturer || "");
      
      // Make sure we're correctly handling image URL with thorough validation
      console.log("Driver data from DB:", driverFromDB);
      
      // Use image field or image_url as the image URL with validation
      let imageUrl = "";
      if (driverFromDB.image_url && driverFromDB.image_url.trim() !== '') {
        imageUrl = driverFromDB.image_url.trim();
      } else if (driverFromDB.image && driverFromDB.image.trim() !== '') {
        imageUrl = driverFromDB.image.trim();
      }
      setDriverImage(imageUrl);
      console.log("Final image URL set to:", imageUrl);
      
      // Handle OS version - split the string if it contains commas
      const osVersions = driverFromDB.os_version 
        ? driverFromDB.os_version.split(',').map((os: string) => os.trim().toLowerCase()) 
        : ["windows11"];
      console.log("Loading OS versions from DB:", driverFromDB.os_version, "Parsed to array:", osVersions);
      setDriverOs(osVersions);
      
      // Handle release_date safely - if it doesn't exist or is invalid, use current date
      let releaseDate = new Date().toISOString().split('T')[0];
      if (driverFromDB.release_date) {
        try {
          const parsedDate = new Date(driverFromDB.release_date);
          if (!isNaN(parsedDate.getTime())) {
            releaseDate = parsedDate.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn("Failed to parse release_date, using current date:", e);
        }
      }
      
      // Create a driver file entry from the download_url
      const driverFile = {
        name: driverFromDB.description || driverFromDB.name,
        version: driverFromDB.version || "1.0",
        date: releaseDate,
        size: driverFromDB.size || "Unknown",
        link: driverFromDB.download_url || ""
      };
      
      // Start with the main driver file
      const driverFiles = [driverFile];
      
      // Fetch additional driver files from the down1 table
      try {
        setStatusMessage("Loading additional driver files from down1 table...");
        
        const { data: down1Files, error: down1Error } = await supabase
          .from('down1')
          .select('*')
          .eq('model', driverFromDB.name); // Match by driver name
        
        if (down1Error) {
          console.warn("Could not fetch additional driver files:", down1Error);
        } else if (down1Files && down1Files.length > 0) {
          console.log(`Found ${down1Files.length} additional files for ${driverFromDB.name}:`, down1Files);
          
          // Add each additional file
          down1Files.forEach(file => {
            driverFiles.push({
              name: file.file_name || 'Additional Driver File',
              version: file.version || '1.0',
              date: file.release_date || new Date().toISOString().split('T')[0],
              size: file.file_size || 'Unknown',
              link: file.download_link || '#'
            });
          });
          
          setStatusMessage(`Loaded driver with ${driverFiles.length - 1} additional files`);
        } else {
          console.log("No additional files found in down1 table for this driver");
        }
      } catch (downError) {
        console.error("Error fetching down1 files:", downError);
      }
      
      // Set all the driver files (main + additional)
      setDriverFiles(driverFiles);
      
    } catch (error) {
      console.error("Error loading driver data:", error);
      toast.error("Failed to load driver data");
      navigate("/admin");
    } finally {
      setIsLoading(false);
      setStatusMessage("");
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
    console.log("syncDriverToSupabase called with driver:", driver);
    
    try {
      setStatusMessage(`Syncing driver "${driver.name}" to Supabase...`);
      
      // Run schema fix to ensure required columns exist
      try {
        setStatusMessage(`Running schema fixes for database...`);
        await fixDriversTableSchema();
        await fixDown1TableSchema(); // Add this to fix down1 table schema
        await forceSchemaRefresh();
        console.log("Schema fixes applied");
      } catch (schemaError) {
        console.warn("Schema fix error:", schemaError);
      }
      
      // Ensure we have a valid image URL
let imageUrl = '';

if (driver.image_url && driver.image_url.trim() !== '') {
  imageUrl = driver.image_url.trim();
}

console.log(`Setting driver image_url to: ${imageUrl}`);
      
      // Prepare release date
      let releaseDate = new Date().toISOString();
      try {
        if (driver.drivers && driver.drivers[0] && driver.drivers[0].date) {
          const date = new Date(driver.drivers[0].date);
          if (!isNaN(date.getTime())) {
            releaseDate = date.toISOString();
          }
        }
      } catch (dateError) {
        console.error("Error parsing date:", dateError);
      }
      
      // Prepare driver data object for database
      const driverData = {
        name: driver.name,
        manufacturer: driver.manufacturer || 'Unknown',
        category: driver.category || 'laptops',
        os_version: Array.isArray(driver.os) ? driver.os.join(', ') : 'windows11',
        version: driver.drivers && driver.drivers[0] ? driver.drivers[0].version : '1.0',
        description: driver.drivers && driver.drivers[0] ? driver.drivers[0].name : driver.name,
        download_url: driver.drivers && driver.drivers[0] ? driver.drivers[0].link : '#',
        size: driver.drivers && driver.drivers[0] ? driver.drivers[0].size : 'Unknown',
        image_url: imageUrl,
        // Don't set image field directly since it might not exist in the schema
        // We'll let the database fixers handle this
        release_date: releaseDate
      };
      
      console.log("OS version being set in driver data:", driverData.os_version);
      
      console.log("OS version being set in driver data:", driverData.os_version);
      
      console.log("Driver data to save with image_url:", imageUrl);
      
      // Try to run schema fixes first before saving
      try {
        await fixDriversTableSchema();
        await forceSchemaRefresh();
      } catch (schemaError) {
        console.warn("Schema fix attempt failed:", schemaError);
      }
      
      console.log("Driver data to save:", driverData);
      
      // Create function to get authorization headers from Supabase client
      const getHeaders = () => {
        const headers = new Headers();
        headers.append('apikey', supabase.supabaseKey);
        headers.append('Authorization', `Bearer ${supabase.supabaseKey}`);
        headers.append('Content-Type', 'application/json');
        headers.append('Prefer', 'return=representation');
        return headers;
      };
      
      // Get the base URL for REST API calls
      const apiUrl = `${supabase.supabaseUrl}/rest/v1/${APP_DRIVERS_TABLE}`;
      const down1ApiUrl = `${supabase.supabaseUrl}/rest/v1/down1`;
      
      // Check if the driver exists
      let driverExists = false;
      if (!isNew) {
        try {
          console.log("Checking if driver exists with ID:", driver.id);
          const checkResponse = await fetch(`${apiUrl}?id=eq.${driver.id}&select=id`, {
            method: 'GET',
            headers: getHeaders()
          });
          
          const checkData = await checkResponse.json();
          console.log("Check result:", checkData);
          driverExists = checkData && checkData.length > 0;
        } catch (checkError) {
          console.error("Error checking if driver exists:", checkError);
        }
      }
      
      console.log(`Driver ${driverExists ? 'exists' : 'does not exist'} in database`);
      
      // Insert or update based on existence check
      let result;
      let driverRecordId;
      
      if (!driverExists) {
        // New driver - insert
        setStatusMessage("Creating new driver in database...");
        console.log("Inserting new driver record");
        
        try {
          // First try using the Supabase client for insertion
          const driverDataWithId = isNew ? driverData : { ...driverData, id: driver.id };
          console.log("Inserting with Supabase client:", driverDataWithId);
          
          const { data: insertData, error: insertError } = await supabase
            .from(APP_DRIVERS_TABLE)
            .insert(driverDataWithId)
            .select();
            
          if (insertError) {
            console.error("Insert failed with Supabase client:", insertError);
            
            // Fallback to direct fetch API
            console.log("Falling back to direct fetch API for insert");
            const insertResponse = await fetch(apiUrl, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({ 
                ...driverData, 
                id: isNew ? undefined : driver.id 
              })
            });
            
            if (!insertResponse.ok) {
              const errorText = await insertResponse.text();
              console.error("Insert failed with status:", insertResponse.status, errorText);
              
              // Try a simplified insert with required fields as fallback
              console.log("Trying simplified insert as fallback");
              const simplifiedData = {
                id: isNew ? undefined : driver.id,
                name: driver.name,
                manufacturer: driver.manufacturer || 'Unknown',
                category: driver.category || 'laptops',
                os_version: Array.isArray(driver.os) ? driver.os.join(', ') : 'windows11', // Ensure proper OS formatting
                version: driver.drivers && driver.drivers[0] ? driver.drivers[0].version : '1.0',
                description: driver.drivers && driver.drivers[0] ? driver.drivers[0].name : driver.name,
                download_url: driver.drivers && driver.drivers[0] ? driver.drivers[0].link : '#',
                size: driver.drivers && driver.drivers[0] ? driver.drivers[0].size : 'Unknown',
                image_url: imageUrl
              };
              
              console.log("OS version being saved:", simplifiedData.os_version);
              
              console.log("Using simplified insert data with image_url:", imageUrl);
              
              const fallbackResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(simplifiedData)
              });
              
              if (!fallbackResponse.ok) {
                throw new Error(`Fallback insert failed: ${await fallbackResponse.text()}`);
              }
              
              const fallbackData = await fallbackResponse.json();
              console.log("Fallback insert succeeded:", fallbackData);
              
              driverRecordId = fallbackData[0]?.id || driver.id;
              result = { data: fallbackData, error: null };
              setStatusMessage(`Added basic driver info to database`);
            } else {
              const fetchInsertData = await insertResponse.json();
              console.log("Insert successful with fetch API:", fetchInsertData);
              driverRecordId = fetchInsertData[0]?.id || driver.id;
              result = { data: fetchInsertData, error: null };
              setStatusMessage(`Added driver "${driver.name}" to database`);
            }
          } else {
            console.log("Insert successful with Supabase client:", insertData);
            driverRecordId = insertData[0]?.id || driver.id;
            result = { data: insertData, error: null };
            setStatusMessage(`Added driver "${driver.name}" to database`);
          }
        } catch (insertError) {
          console.error("All insert attempts failed:", insertError);
          throw insertError;
        }
      } else {
        // Existing driver - update
        setStatusMessage("Updating existing driver...");
        console.log("Updating driver with direct fetch API:", driver.id);
        driverRecordId = driver.id;
        
        try {
          // First, try using the Supabase client for the update
          const { data: updateData, error: updateError } = await supabase
            .from(APP_DRIVERS_TABLE)
            .update(driverData)
            .eq('id', driver.id)
            .select();
            
          if (updateError) {
            console.error("Update failed with Supabase client:", updateError);
            
            // Fallback to direct fetch API if Supabase client fails
            console.log("Falling back to direct fetch API for update");
            const updateResponse = await fetch(`${apiUrl}?id=eq.${driver.id}`, {
              method: 'PATCH',
              headers: getHeaders(),
              body: JSON.stringify(driverData)
            });
            
            if (!updateResponse.ok) {
              const errorText = await updateResponse.text();
              console.error("Update failed with status:", updateResponse.status, errorText);
              
              // Try updating just the basic fields
              console.log("Trying simplified update with basic fields");
              const basicUpdateResponse = await fetch(`${apiUrl}?id=eq.${driver.id}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({
                  name: driver.name,
                  manufacturer: driver.manufacturer || 'Unknown',
                  version: driver.drivers && driver.drivers[0] ? driver.drivers[0].version : '1.0',
                  description: driver.drivers && driver.drivers[0] ? driver.drivers[0].name : driver.name,
                  download_url: driver.drivers && driver.drivers[0] ? driver.drivers[0].link : '#',
                  size: driver.drivers && driver.drivers[0] ? driver.drivers[0].size : 'Unknown',
                  image_url: imageUrl, // Only use image_url field, not image
                  os_version: Array.isArray(driver.os) ? driver.os.join(', ') : 'windows11' // Ensure OS version is included
                })
              });
              
              console.log("Using basic update with image_url:", imageUrl);
              
              if (!basicUpdateResponse.ok) {
                throw new Error(`Even basic update failed: ${await basicUpdateResponse.text()}`);
              }
              
              console.log("Basic update succeeded");
              result = { data: [{id: driver.id, ...driverData}], error: null };
            } else {
              const fetchUpdateData = await updateResponse.json();
              console.log("Update successful with fetch API:", fetchUpdateData);
              result = { data: fetchUpdateData, error: null };
            }
          } else {
            console.log("Update successful with Supabase client:", updateData);
            result = { data: updateData, error: null };
          }
        } catch (updateError) {
          console.error("Error during update:", updateError);
          throw updateError;
        }
      }
      
      // DO NOT save file 1 to down1 table, ONLY save additional files (file 2, file 3, etc.)
      console.log("Processing driver files:", driver.drivers?.length || 0, "files found");
      
      // Explicitly mark the first file as the main driver file (should NEVER be saved to down1)
      if (driver.drivers && driver.drivers.length > 0) {
        driver.drivers[0] = { ...driver.drivers[0], _isMainDriverFile: true };
        console.log("Marked first file as main driver file (will NOT be saved to down1)");
      }
      
      // Only proceed if there are more than 1 file (to skip file 1)
      if (driver.drivers && driver.drivers.length > 1) { 
        try {
          // Get only additional files (file 2, file 3, etc.) - skip the first file
          // Also filter out any empty files (those with no name or download link)
          const additionalFiles = driver.drivers.slice(1).filter(file => 
            (file.name && file.name.trim() !== '') && 
            (file.link && file.link.trim() !== '' && file.link !== '#')
          ).map((file, idx) => {
            // Mark these as additional files (not the main driver file)
            return { ...file, _isAdditionalFile: true, _additionalFileIndex: idx + 1 };
          });
          
          console.log(`Found ${additionalFiles.length} valid additional files to save to down1 table`);
          
          // Double check we don't have any main files in additionalFiles
          const safeAdditionalFiles = additionalFiles.filter(file => !file._isMainDriverFile);
          
          // Only proceed if there are valid additional files
          if (safeAdditionalFiles.length > 0) {
            // Import the helper function for saving files to down1 table
            const { saveDriverFilesToDown1Table } = await import('../lib/fixDriver.js');
            
            console.log("DEBUG: About to call saveDriverFilesToDown1Table with:", { 
              driverName: driver.name,
              driverFiles: safeAdditionalFiles // Only the valid additional files, not the main one
            });
            
            // Force clear any cached data in Supabase
            try {
              await supabase.rpc('execute_sql', { 
                sql_query: 'SELECT 1' 
              });
            } catch (e) {
              console.log("DEBUG: Cache clear ping:", e);
            }
            
            // Use the helper function to handle all the saving logic - always use driver.name as model
            const saveResult = await saveDriverFilesToDown1Table(driver.name, safeAdditionalFiles, setStatusMessage);
            
            if (saveResult.success) {
              console.log(`Successfully saved ${saveResult.savedCount} of ${saveResult.totalFiles} additional driver files to down1 table`);
            } else {
              console.error("Error in saveDriverFilesToDown1Table:", saveResult.error);
            }
          } else {
            console.log("No valid additional files to save to down1 table");
            // Delete existing files since we have no valid files to save
            try {
              const { error: deleteError } = await supabase
                .from('down1')
                .delete()
                .eq('model', driver.name);
                
              if (deleteError) {
                console.warn("Error deleting existing down1 records:", deleteError);
              } else {
                console.log("Successfully cleared down1 table for this driver");
              }
            } catch (error) {
              console.warn("Error during down1 cleanup:", error);
            }
          }
        } catch (filesError) {
          console.error("Error importing or running saveDriverFilesToDown1Table:", filesError);
          setStatusMessage(`Error saving additional driver files: ${filesError.message || 'Unknown error'}`);
          
          // Fallback to original method if the helper function fails
          try {
            setStatusMessage("Falling back to direct method for saving files...");
            await fixDown1TableSchema(); // Ensure table exists
            
            // Delete existing files first
            try {
              const { error: deleteError } = await supabase
                .from('down1')
                .delete()
                .eq('model', driver.name);
                
              if (deleteError) {
                console.warn("Fallback: Error deleting existing down1 records:", deleteError);
              }
            } catch (error) {
              console.warn("Fallback: Error during down1 cleanup:", error);
            }
            
            // CRITICAL: Insert ONLY valid additional files (skip the first one), always using driver.name as model
            console.log("FALLBACK: Using direct insertion method, skipping file 1");
            let successCount = 0;
            // Start from index 1 to skip the first file (NEVER save file 1)
            for (let i = 1; i < driver.drivers.length; i++) {
              const file = driver.drivers[i];
              
              // Skip empty files
              if (!file.name || file.name.trim() === '' || !file.link || file.link.trim() === '' || file.link === '#') {
                console.log(`Skipping empty file at index ${i}`);
                continue;
              }
              
              try {
                const { error } = await supabase
                  .from('down1')
                  .insert({
                    file_name: file.name,
                    version: file.version || "1.0",
                    release_date: file.date || new Date().toISOString().split('T')[0],
                    file_size: file.size || "Unknown",
                    download_link: file.link,
                    model: driver.name // Always use driver.name as model to relate files to driver
                  });
                
                if (!error) {
                  successCount++;
                  console.log(`Successfully saved file ${i} (${file.name}) to down1 table`);
                }
              } catch (e) {
                console.error(`Fallback: Error saving additional file ${i}:`, e);
              }
            }
            
            const validFileCount = driver.drivers.slice(1).filter(f => 
              f.name && f.name.trim() !== '' && f.link && f.link.trim() !== '' && f.link !== '#'
            ).length;
            
            setStatusMessage(`Fallback method: Saved ${successCount} of ${validFileCount} additional files to down1 table`);
          } catch (fallbackError) {
            console.error("Even fallback method failed:", fallbackError);
          }
        }
      } else {
        console.log("No additional files to save (only main file exists)");
        
        // Delete any existing files in down1 table for this driver
        try {
          const { error: deleteError } = await supabase
            .from('down1')
            .delete()
            .eq('model', driver.name);
            
          if (deleteError) {
            console.warn("Error deleting existing down1 records:", deleteError);
          } else {
            console.log("Successfully cleared down1 table for this driver");
          }
        } catch (error) {
          console.warn("Error during down1 cleanup:", error);
        }
      }
      
      return { success: true, action: driverExists ? 'updated' : 'inserted', data: result.data };
    } catch (error) {
      console.error('Error syncing driver to Supabase:', error);
      setStatusMessage(`Error syncing driver "${driver.name}": ${error.message || 'Unknown error'}`);
      
      // Always update localStorage even if database sync fails
      try {
        const storedDrivers = localStorage.getItem('drivers') || '[]';
        const drivers = JSON.parse(storedDrivers);
        
        // Make sure the driver exists in local storage
        const existingIndex = drivers.findIndex((d: Driver) => d.id === driver.id);
        if (existingIndex >= 0) {
          drivers[existingIndex] = driver;
        } else {
          drivers.push(driver);
        }
        
        localStorage.setItem('drivers', JSON.stringify(drivers));
        console.log("Driver saved to localStorage as fallback");
      } catch (localError) {
        console.error("Error saving to localStorage:", localError);
      }
      
      return { success: false, error };
    }
  };

  const handleSaveDriverClick = async () => {
    try {
      console.log("Starting driver save process...");
      console.log("Driver data before save:", {
        name: driverName,
        manufacturer: driverManufacturer,
        category: driverCategory,
        os: driverOs,
		image_url: driverImage.trim(),
        files: driverFiles
      });
      
      const result = await handleSaveDriver();
      console.log("handleSaveDriver result:", result);
      
      if (result && result.success) {
        toast.success(`Driver ${result.action === 'inserted' ? 'created' : 'updated'} successfully!`);
      } else {
        toast.error("Failed to save driver");
      }
      
      // Reset status after short delay
      setTimeout(() => {
        setStatusMessage("");
        setIsSaving(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving driver:", error);
      setStatusMessage(`Error: ${error.message || 'Unknown error'}`);
      setIsSaving(false);
      toast.error(`Error: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSaveDriver = async () => {
    // Basic validation
    if (!driverName.trim()) {
      toast.error("Driver name is required");
      return { success: false, error: "Driver name is required" };
    }
    
    if (!driverManufacturer.trim()) {
      toast.error("Manufacturer is required");
      return { success: false, error: "Manufacturer is required" };
    }

    if (driverOs.length === 0) {
      toast.error("Please select at least one operating system");
      return { success: false, error: "No operating system selected" };
    }

    // Validate driver files
    const invalidFile = driverFiles.findIndex(file => !file.name.trim() || !file.version.trim() || !file.link.trim() || !file.size.trim());
    if (invalidFile !== -1) {
      toast.error(`Driver file #${invalidFile + 1} is missing required information`);
      return { success: false, error: "Driver file missing information" };
    }

    setIsSaving(true);
    
    try {
      // Fix database schema before proceeding
      setStatusMessage("Fixing database schema to ensure release_date column exists...");
      
      // Apply both schema fixes
      const fixResult = await fixDriversTableSchema();
      const schemaRefreshResult = await forceSchemaRefresh();
      
      if (!fixResult.success) {
        console.warn("Schema fix attempted but may have had issues:", fixResult.error);
        setStatusMessage("Schema fix attempted. Continuing with save operation...");
      } else {
        setStatusMessage("Database schema fixed. Continuing with save operation...");
      }
    } catch (schemaError) {
      console.warn("Error during schema fix:", schemaError);
      setStatusMessage("Schema fix encountered an error. Will attempt to continue anyway...");
    }

    try {
      // Generate ID for new driver or use existing one
      const driverId = isNew ? uuidv4() : id as string;
      console.log("Driver ID for save operation:", driverId);
      
      // Create the driver object that will be saved both locally and to Supabase
const newDriver = {
  id: driverId,
  name: driverName,
  category: driverCategory,
  manufacturer: driverManufacturer,
  image_url: driverImage.trim(), // ✅ correct field
  os: driverOs,
  drivers: driverFiles
}; 
      console.log("Full driver object to be saved:", newDriver);
      
      // First sync to Supabase - do this before local storage to ensure database consistency
      setStatusMessage("Syncing to Supabase database...");
      const result = await syncDriverToSupabase(newDriver);
      
      if (!result.success) {
        throw new Error(`Failed to sync with Supabase: ${result.error?.message || 'Unknown error'}`);
      }
      
      console.log("Supabase sync result:", result);
      
      // Update the image URL if it was returned from Supabase
      if (result.data && result.data[0] && result.data[0].image) {
        newDriver.image = result.data[0].image;
      }
      
      // Now update localStorage as a backup
      const storedDrivers = localStorage.getItem('drivers') || '[]';
      const drivers = JSON.parse(storedDrivers);
      
      let updatedDrivers;
      if (isNew) {
        // For new drivers, add to the array
        updatedDrivers = [...drivers, newDriver];
      } else {
        // For existing drivers, update or add if not found
        const existingIndex = drivers.findIndex((driver: Driver) => driver.id === driverId);
        
        if (existingIndex >= 0) {
          // Update existing driver
          updatedDrivers = [...drivers];
          updatedDrivers[existingIndex] = newDriver;
        } else {
          // Driver not found in local storage (might exist only in database)
          updatedDrivers = [...drivers, newDriver];
        }
      }
      
      localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
      
      // Show success message and redirect
      toast.success(`Driver ${isNew ? "created" : "updated"} successfully and synced to database!`);
      
      // Give time for toast to be visible before navigating
      setTimeout(() => {
        navigate("/admin"); // Redirect to admin dashboard to see the changes
      }, 1000);
      
    } catch (error) {
      console.error("Error saving driver:", error);
      toast.error(`Failed to save driver: ${error.message || 'Unknown error'}`);
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
            onClick={handleSaveDriverClick} 
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
                <Label htmlFor="image">Image URL</Label>
<Input
  id="image"
  type="text"
  value={driverImage}
  onChange={(e) => setDriverImage(e.target.value)}
  placeholder="https://example.com/image.jpg"
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