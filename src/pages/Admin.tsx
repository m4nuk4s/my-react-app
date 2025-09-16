import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { toast } from "sonner";
import { Plus, X, UserCircle, Edit, Trash2, CheckCircle, XCircle, Search } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Badge } from "../components/ui/badge";
import * as modelManager from "../utils/modelManager";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Switch } from "../components/ui/switch";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { settings, updateSettings } = useSettings();

  const [activeTab, setActiveTab] = useState("users");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // User management state
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  // Type definition for guides
  type Step = {
    title: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
    step_des?: string; 
    step_description?: string; 
    image_url?: string; 
    step_number?: number; 
    procedure?: string;
  };

  type Guide = {
    id: string;
    title: string;
    guide_title?: string;
    model: string;
    category: string;
    difficulty: string;
    time: string;
    description: string;
    steps: Step[];
    createdBy: string;
  };

  // Guide management state
  const [guides, setGuides] = useState<Guide[]>([]);

  // Driver management state
  const [drivers, setDrivers] = useState([]);
  
  // Models management state
  const [computerModels, setComputerModels] = useState([]);

  // App-specific table name for drivers
  const APP_DRIVERS_TABLE = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers';

  // Settings management
  const [assistantEnabled, setAssistantEnabled] = useState(
    settings?.showGuideAssistant !== undefined ? settings.showGuideAssistant : true
  );
  const [themeButtonEnabled, setThemeButtonEnabled] = useState(
    settings?.showThemeButton !== undefined ? settings.showThemeButton : false
  );

  useEffect(() => {
    // Check if user is admin, if not redirect to home
    if (!user || !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
      return;
    }

    // Load data for the active tab
    loadActiveTabData();
  }, [user, isAdmin, navigate, activeTab]);

  useEffect(() => {
    // Update settings state when settings context changes
    if (settings) {
      setAssistantEnabled(settings.showGuideAssistant);
      setThemeButtonEnabled(settings.showThemeButton);
    }
  }, [settings]);

  const loadActiveTabData = async () => {
    switch(activeTab) {
      case "users":
        loadUsers();
        break;
      case "guides":
        await loadGuides();
        break;
      case "drivers":
        loadDrivers();
        break;
      case "models":
        // Models are loaded with guides
        await loadGuides();
        break;
      case "settings":
        // Settings are loaded from context
        break;
      default:
        break;
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // First try loading from Supabase
      const { data: dbUsers, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        console.error("Error fetching users from Supabase:", error);
        throw error; // This will trigger the fallback
      }

      // Process users from database
      const approved = [];
      const pending = [];
      
      dbUsers.forEach(user => {
        // Skip the password for security
        const { password, ...userWithoutPassword } = user;
        
        // Transform database fields (lowercase) to match our app's structure
        const processedUser = {
          ...userWithoutPassword,
          isAdmin: user.isadmin, // Transform lowercase db field
          isApproved: user.isapproved // Transform lowercase db field
        };
        
        if (!user.isapproved) {
          pending.push(processedUser);
        } else {
          approved.push(processedUser);
        }
      });
      
      console.log(`Loaded ${approved.length} approved users and ${pending.length} pending users from database`);
      setUsers(approved);
      setPendingUsers(pending);
    } catch (error) {
      console.error("Error loading users from database:", error);
      
      // Fallback to localStorage if database access fails
      try {
        console.log("Falling back to localStorage for users");
        const storedUsers = localStorage.getItem('users') || '[]';
        const parsedUsers = JSON.parse(storedUsers);
        
        // Separate users into approved and pending
        const approved = [];
        const pending = [];
        
        parsedUsers.forEach(user => {
          // Skip the password for security
          const { password, ...userWithoutPassword } = user;
          
          if (user.isApproved === false) {
            pending.push(userWithoutPassword);
          } else {
            approved.push(userWithoutPassword);
          }
        });
        
        setUsers(approved);
        setPendingUsers(pending);
        toast.info("Using local user data (database connection unavailable)");
      } catch (localError) {
        console.error("Error loading users from localStorage:", localError);
        toast.error("Failed to load users");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadGuides = async () => {
    setIsLoading(true);
    try {
      // First try to load guides from Supabase
      try {
        // First get unique guides from disassembly-guides table
        const { data, error } = await supabase
          .from('disassembly-guides')
          .select('*');

        if (error) {
          console.error("Error fetching guides from disassembly-guides:", error);
          throw error; // Will trigger fallback to localStorage
        }

        if (data && data.length > 0) {
          console.log("Guides from disassembly-guides table:", data.length);
          
          // Transform data to match Guide type 
          const formattedGuides = data.map(item => {
            return {
              id: item.id || String(item.id),
              title: item.title || item.guide_title || "Untitled Guide",
              guide_title: item.guide_title || item.title,
              model: item.model || item.device_model || item.computer_model || "Generic Model",
              category: item.category || "Uncategorized",
              difficulty: item.difficulty?.toLowerCase() || "medium",
              time: item.time || item.estimated_time || "30 minutes",
              description: item.description || "",
              steps: [], // Steps will be loaded when needed for editing
              createdBy: item.created_by || item.author_id || "admin"
            };
          });
          
          setGuides(formattedGuides);
          
          // Update localStorage with the latest data for offline use
          localStorage.setItem('disassemblyGuides', JSON.stringify(formattedGuides));
        } else {
          // No data found in Supabase, load from localStorage
          console.log("No guides found in Supabase, loading from localStorage");
          const storedGuides = localStorage.getItem('disassemblyGuides') || '[]';
          setGuides(JSON.parse(storedGuides));
        }
      } catch (supabaseError) {
        console.error("Error loading guides from Supabase:", supabaseError);
        // Fallback to localStorage
        const storedGuides = localStorage.getItem('disassemblyGuides') || '[]';
        setGuides(JSON.parse(storedGuides));
      }
      
      // Load computer models using modelManager - now async
      try {
        const models = await modelManager.getAllModels();
        setComputerModels(models);
      } catch (modelError) {
        console.error("Error loading models from Supabase:", modelError);
        // Fallback to local models if Supabase fails
        const localModels = JSON.parse(localStorage.getItem('computerModels') || '[]');
        setComputerModels(localModels);
      }
    } catch (error) {
      console.error("Error loading guides and models:", error);
      toast.error("Failed to load guides and models");
    } finally {
      setIsLoading(false);
    }
  };

const loadDrivers = async () => {
  setIsLoading(true);
  try {
    // Check if the database schema needs to be fixed (missing image column)
    try {
      // First try to add the image column if it doesn't exist
      await supabase.rpc('execute_sql', { 
        sql_query: `
          DO $$
          BEGIN
            -- Add the image column if it doesn't exist
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers' 
              AND column_name = 'image'
            ) THEN
              ALTER TABLE app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers 
              ADD COLUMN image TEXT;
            END IF;
          END
          $$;
        `
      });
      console.log("Checked for image column and added if missing");
    } catch (schemaError) {
      console.warn("Could not verify/fix schema, will try regular load:", schemaError);
    }
    
    // Fetch all drivers from Supabase
    const { data: dbDrivers, error: driversError } = await supabase
      .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
      .select('*')
      .order('name', { ascending: true });

    if (driversError) throw driversError;

    // Fetch additional driver files from the down1 table
    const { data: down1Files, error: down1Error } = await supabase
      .from('down1')
      .select('*');

    if (down1Error) {
      console.warn('Could not fetch additional driver files from down1 table:', down1Error);
    } else {
      console.log('Additional driver files from down1 table:', down1Files);
    }

    // Process and transform the driver data to match the format needed for display
    const processedDrivers = dbDrivers.map(driver => {
      // Create a file entry from the download_url
      const driverFile = {
        name: driver.description || driver.name,
        version: driver.version || "1.0",
        date: driver.release_date || new Date().toISOString().split('T')[0],
        size: driver.size || "Unknown",
        link: driver.download_url || ""
      };

      // Use image column as image_url - handle both fields for backward compatibility
      const imageUrl = driver.image_url || driver.image || '/placeholder-driver.png';
      
      // Parse OS versions from comma-separated string
      const osVersions = driver.os_version 
        ? driver.os_version.split(',').map(os => os.trim().toLowerCase()) 
        : ["windows11"];
      
      // Create driver files array starting with the main driver file
      const files = [driverFile];
      
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
              name: file.file_name || 'Additional Driver File',
              version: file.version || '1.0',
              date: file.release_date || new Date().toISOString().split('T')[0],
              size: file.file_size || 'Unknown',
              link: file.download_link || '#'
            });
          });
        }
      }
      
      // Return the formatted driver object - only storing the URL, not full image data
      return {
        id: driver.id,
        name: driver.name,
        version: driver.version,
        category: driver.category || "laptops",
        manufacturer: driver.manufacturer || "Unknown",
        image: imageUrl, // Use the image URL we determined
        image_url: imageUrl, // Keep for backward compatibility
        os: osVersions,
        os_version: driver.os_version,
        drivers: files,
        size: driver.size,
        release_date: driver.release_date,
        description: driver.description
      };
    });
    
    // Update state and localStorage
    setDrivers(processedDrivers || []);
    localStorage.setItem('drivers', JSON.stringify(processedDrivers || []));
    
    console.log("Drivers loaded successfully:", processedDrivers.length);
  } catch (error) {
    console.error('Error fetching drivers from Supabase:', error);
    toast.error('Failed to load drivers from the database');
    
    // Attempt to load from localStorage as fallback
    const localDrivers = localStorage.getItem('drivers');
    if (localDrivers) {
      setDrivers(JSON.parse(localDrivers));
      console.log("Loaded drivers from localStorage as fallback");
    }
  } finally {
    setIsLoading(false);
  }
};

  // Function to handle approving a pending user
  const handleApproveUser = async (userId) => {
    try {
      // Update user in Supabase first
      const { error } = await supabase
        .from('users')
        .update({ isapproved: true }) // Use lowercase column name
        .eq('id', userId);
      
      if (error) {
        console.error("Error approving user in database:", error);
        throw error; // Will trigger fallback
      }
      
      // Update state
      const approvedUser = pendingUsers.find(user => user.id === userId);
      if (approvedUser) {
        setPendingUsers(pendingUsers.filter(user => user.id !== userId));
        setUsers([...users, { ...approvedUser, isApproved: true }]);
      }
      
      // Also update localStorage as fallback
      try {
        const storedUsers = localStorage.getItem('users') || '[]';
        const parsedUsers = JSON.parse(storedUsers);
        
        const updatedUsers = parsedUsers.map(user => {
          if (user.id === userId) {
            return { ...user, isApproved: true };
          }
          return user;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      } catch (localError) {
        console.warn("Failed to update localStorage after approving user:", localError);
        // Don't stop execution for localStorage errors
      }
      
      toast.success("User approved successfully");
    } catch (error) {
      console.error("Error approving user:", error);
      
      // Fallback to localStorage if database fails
      try {
        const storedUsers = localStorage.getItem('users') || '[]';
        const parsedUsers = JSON.parse(storedUsers);
        
        const updatedUsers = parsedUsers.map(user => {
          if (user.id === userId) {
            return { ...user, isApproved: true };
          }
          return user;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Update state
        const approvedUser = pendingUsers.find(user => user.id === userId);
        if (approvedUser) {
          setPendingUsers(pendingUsers.filter(user => user.id !== userId));
          setUsers([...users, { ...approvedUser, isApproved: true }]);
        }
        
        toast.success("User approved successfully (local only)");
      } catch (fallbackError) {
        console.error("Fallback error approving user:", fallbackError);
        toast.error("Failed to approve user");
      }
    }
  };

  // Function to handle rejecting a pending user
  const handleRejectUser = async (userId) => {
    if (!window.confirm("Are you sure you want to reject this user?")) {
      return;
    }
    
    try {
      // Delete the user from Supabase
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error("Error rejecting user in database:", error);
        throw error; // Will trigger fallback
      }
      
      // Update state
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      
      // Also update localStorage as fallback
      try {
        const storedUsers = localStorage.getItem('users') || '[]';
        const parsedUsers = JSON.parse(storedUsers);
        
        const updatedUsers = parsedUsers.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      } catch (localError) {
        console.warn("Failed to update localStorage after rejecting user:", localError);
        // Don't stop execution for localStorage errors
      }
      
      toast.success("User rejected successfully");
    } catch (error) {
      console.error("Error rejecting user:", error);
      
      // Fallback to localStorage if database fails
      try {
        const storedUsers = localStorage.getItem('users') || '[]';
        const parsedUsers = JSON.parse(storedUsers);
        
        const updatedUsers = parsedUsers.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Update state
        setPendingUsers(pendingUsers.filter(user => user.id !== userId));
        
        toast.success("User rejected successfully (local only)");
      } catch (fallbackError) {
        console.error("Fallback error rejecting user:", fallbackError);
        toast.error("Failed to reject user");
      }
    }
  };

  // Function to toggle the assistant
  const handleToggleAssistant = () => {
    const newValue = !assistantEnabled;
    setAssistantEnabled(newValue);
    
    // Update settings in context
    updateSettings({ showGuideAssistant: newValue });
    
    toast.success(`Assistant ${newValue ? 'enabled' : 'disabled'} successfully`);
  };

  // Function to toggle the theme button
  const handleToggleThemeButton = () => {
    const newValue = !themeButtonEnabled;
    setThemeButtonEnabled(newValue);
    
    // Update settings in context
    updateSettings({ showThemeButton: newValue });
    
    toast.success(`Theme button ${newValue ? 'enabled' : 'disabled'} successfully`);
  };

  // Function to redirect to Add Driver page
  const handleAddDriver = () => {
    toast.info("Redirecting to driver management");
    navigate("/admin/drivers/new");
  };

  // Function to redirect to Edit Driver page
  const handleEditDriver = (driverId) => {
    toast.info("Redirecting to driver editing");
    navigate(`/admin/drivers/edit/${driverId}`);
  };

  // Function to redirect to Add Guide page
  const handleAddGuide = () => {
    toast.info("Redirecting to guide editor");
    navigate("/admin/guides/new");
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => navigate("/")} variant="outline">Return to Home</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Pending Users Section */}
<div className="mt-10">
  <h4 className="text-lg font-medium mb-4 flex items-center gap-2 text-orange-700">
    <UserCircle className="h-5 w-5 text-orange-600" /> Pending Users
  </h4>

  {isLoading ? (
    <p>Loading pending users...</p>
  ) : pendingUsers.length > 0 ? (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pendingUsers.map((user) => (
        <Card
          key={user.id}
          className="hover:shadow-lg hover:scale-[1.02] transition-all rounded-2xl border border-orange-200"
        >
          <CardHeader className="flex flex-row items-center gap-3 bg-blue-50 rounded-t-2xl p-4">
            <UserCircle className="h-10 w-10 text-orange-600" />
            <div>
              <CardTitle className="text-base font-semibold text-orange-700">
                {user.username}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-between items-center p-4">
            <Badge className="bg-orange-600 text-white shadow-sm">
              Pending
            </Badge>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={async () => {
                  try {
                    const { error } = await supabase
                      .from("users")
                      .update({ isApproved: true })
                      .eq("id", user.id);

                    if (error) throw error;

                    setPendingUsers(pendingUsers.filter((u) => u.id !== user.id));
                    setUsers([...users, { ...user, isApproved: true }]);
                    toast.success(`${user.username} approved`);
                  } catch (error) {
                    console.error("Error approving user:", error);
                    toast.error("Failed to approve user");
                  }
                }}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  if (window.confirm(`Reject ${user.username}?`)) {
                    try {
                      const { error } = await supabase
                        .from("users")
                        .delete()
                        .eq("id", user.id);

                      if (error) throw error;

                      setPendingUsers(pendingUsers.filter((u) => u.id !== user.id));
                      toast.success("User rejected");
                    } catch (error) {
                      console.error("Error rejecting user:", error);
                      toast.error("Failed to reject user");
                    }
                  }
                }}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ) : (
    <p className="text-muted-foreground">No pending users</p>
  )}
</div>


              {/* Active Users Section */}
<div>
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-xl font-semibold">Active Users</h3>
    <Button onClick={() => navigate("/admin/users/new")}>
      Add New User
    </Button>
  </div>

  {isLoading ? (
    <p>Loading users...</p>
  ) : users.length > 0 ? (
    <div className="space-y-10">
      {/* Admins Section */}
      <div>
        <h4 className="text-lg font-medium mb-4 flex items-center gap-2 text-green-700">
          <UserCircle className="h-5 w-5 text-green-600" /> Admins
        </h4>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users.filter((u) => u.isAdmin).length > 0 ? (
            users.filter((u) => u.isAdmin).map((user) => (
              <Card
                key={user.id}
                className="hover:shadow-lg hover:scale-[1.02] transition-all rounded-2xl border border-green-200"
              >
                <CardHeader className="flex flex-row items-center gap-3 bg-green-50 rounded-t-2xl p-4">
                  <UserCircle className="h-10 w-10 text-green-600" />
                  <div>
                    <CardTitle className="text-base font-semibold text-green-700">
                      {user.username}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-between items-center p-4">
                  <Badge className="bg-green-600 text-white shadow-sm">
                    Admin
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        window.confirm(`Delete ${user.username}?`) &&
                        setUsers(users.filter((u) => u.id !== user.id))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">No admins found</p>
          )}
        </div>
      </div>

      {/* Users Section */}
      <div>
        <h4 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700">
          <UserCircle className="h-5 w-5 text-blue-600" /> Users
        </h4>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users.filter((u) => !u.isAdmin).length > 0 ? (
            users.filter((u) => !u.isAdmin).map((user) => (
              <Card
                key={user.id}
                className="hover:shadow-lg hover:scale-[1.02] transition-all rounded-2xl border border-blue-200"
              >
                <CardHeader className="flex flex-row items-center gap-3 bg-blue-50 rounded-t-2xl p-4">
                  <UserCircle className="h-10 w-10 text-blue-600" />
                  <div>
                    <CardTitle className="text-base font-semibold text-blue-700">
                      {user.username}
                    </CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-between items-center p-4">
                  <Badge className="bg-blue-600 text-white shadow-sm">
                    User
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        window.confirm(`Delete ${user.username}?`) &&
                        setUsers(users.filter((u) => u.id !== user.id))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">No users found</p>
          )}
        </div>
      </div>
    </div>
  ) : (
    <p className="text-muted-foreground">No users found</p>
  )}
</div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides">
          <Card>
            <CardHeader>
              <CardTitle>Disassembly Guides</CardTitle>
              <CardDescription>Manage repair and disassembly guides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search guides..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddGuide}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Guide
                </Button>
              </div>

              {isLoading ? (
                <p>Loading guides...</p>
              ) : guides.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guides
                      .filter(guide => 
                        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        guide.model.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((guide) => (
                        <TableRow key={guide.id}>
                          <TableCell>{guide.title}</TableCell>
                          <TableCell>{guide.model}</TableCell>
                          <TableCell>{guide.category}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {guide.difficulty === 'easy' ? 'Easy' : 
                               guide.difficulty === 'medium' ? 'Medium' : 'Hard'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => navigate(`/admin/guides/edit/${guide.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={async () => {
                                  if(window.confirm(`Are you sure you want to delete "${guide.title}"?`)) {
                                    try {
                                      // First delete from Supabase
                                      try {
                                        // Delete from disassembly-guides table
                                        const { error: guideError } = await supabase
                                          .from('disassembly-guides')
                                          .delete()
                                          .eq('id', guide.id);
                                        
                                        if (guideError) {
                                          console.error("Error deleting guide from Supabase:", guideError);
                                          // Continue with localStorage deletion even if Supabase fails
                                        } else {
                                          console.log("Guide deleted from Supabase successfully");
                                        }
                                        
                                        // Delete associated steps from diss_table if needed
                                        const { error: stepsError } = await supabase
                                          .from('diss_table')
                                          .delete()
                                          .eq('guide_id', guide.id);
                                        
                                        if (stepsError) {
                                          console.warn("Error deleting associated steps from diss_table:", stepsError);
                                          // Try with guide_title
                                          const { error: titleError } = await supabase
                                            .from('diss_table')
                                            .delete()
                                            .eq('guide_title', guide.guide_title || guide.title);
                                          
                                          if (titleError) {
                                            console.warn("Error deleting steps by guide_title:", titleError);
                                          }
                                        }
                                      } catch (supabaseError) {
                                        console.error("Failed to delete from Supabase:", supabaseError);
                                      }
                                      
                                      // Then update localStorage
                                      const storedGuides = localStorage.getItem('disassemblyGuides') || '[]';
                                      const allGuides = JSON.parse(storedGuides);
                                      
                                      // Filter out the guide to delete
                                      const updatedGuides = allGuides.filter((g) => g.id !== guide.id);
                                      
                                      // Update localStorage
                                      localStorage.setItem('disassemblyGuides', JSON.stringify(updatedGuides));
                                      
                                      // Update state
                                      setGuides(updatedGuides);
                                      toast.success("Guide deleted successfully");
                                    } catch (error) {
                                      console.error("Error deleting guide:", error);
                                      toast.error("Failed to delete guide");
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground mb-4">No guides found</p>
                  <Button onClick={handleAddGuide}>Create your first guide</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Driver Management</CardTitle>
              <CardDescription>Manage device drivers and downloads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search drivers..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddDriver}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Driver
                </Button>
              </div>

              {isLoading ? (
                <p>Loading drivers...</p>
              ) : drivers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drivers
                    .filter(driver => 
                      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      driver.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((driver) => (
                      <Card key={driver.id} className="overflow-hidden flex flex-col">
                        <div className="overflow-hidden bg-white dark:bg-blue-800" style={{ minHeight: "120px" }}>
                          {driver.image || driver.image_url ? (
                            <img
                              src={driver.image || driver.image_url}
                              alt={driver.name}
                              className="w-full h-auto object-contain max-h-48"
                              onError={(e) => {
                                console.error("Image failed to load:", driver.image || driver.image_url);
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
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
                            {driver.drivers && driver.drivers[0] && driver.drivers[0].name ? driver.drivers[0].name : driver.description}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                            <div>
                              <Label className="text-xs text-gray-500 dark:text-gray-400">Operating System</Label>
                              <p className="mt-1">
                                {driver.os && driver.os.map(os => (
                                  <Badge key={os} variant="subtle" className="text-xs bg-blue-500 hover:bg-blue-600 text-white mr-1">
                                    <strong>{os === "windows10" ? "Windows 10" : "Windows 11"}</strong>
                                  </Badge>
                                ))}
                                {driver.os_version && !driver.os && (
                                  <Badge variant="subtle" className="text-xs bg-blue-500 hover:bg-blue-600 text-white">
                                    <strong>{driver.os_version}</strong>
                                  </Badge>
                                )}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 dark:text-gray-400"></Label>
                              {driver.drivers && driver.drivers.length > 0 && (
                                <p className="font-semibold mt-1">Available Files</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditDriver(driver.id)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={async () => {
  if (window.confirm(`Are you sure you want to delete "${driver.name}"?`)) {
    try {
      // Remove from localStorage first
      const storedDrivers = localStorage.getItem('drivers') || '[]';
      const currentDrivers = JSON.parse(storedDrivers);
      const updatedDrivers = currentDrivers.filter(d => d.id !== driver.id);
      localStorage.setItem('drivers', JSON.stringify(updatedDrivers));

      // Delete related entries from down1 table first
      const { error: down1Error } = await supabase
        .from('down1')
        .delete()
        .eq('model', driver.name);

      if (down1Error) {
        console.warn("Warning: Failed to delete related files from down1 table:", down1Error);
        // Continue with main driver deletion even if down1 deletion fails
      } else {
        console.log(`Successfully deleted related files for driver ${driver.name} from down1 table`);
      }

      // Delete from Supabase driver table
      const { data, error } = await supabase
        .from('app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers')
        .delete()
        .eq('id', driver.id);

      if (error) {
        console.error("Supabase deletion error:", error);
        toast.error("Failed to delete from database.");
      } else {
        console.log("Deleted from Supabase:", data);
        toast.success("Driver and associated files deleted successfully.");
        setDrivers(updatedDrivers);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Error deleting driver.");
    }
  }
}}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground mb-4">No drivers found</p>
                  <Button onClick={handleAddDriver}>Add your first driver</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Computer Models Tab */}
        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Computer Models</CardTitle>
              <CardDescription>Manage computer models for guides and drivers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="newModel">New Model Name</Label>
                  <Input 
                    id="newModel" 
                    placeholder="e.g., UA-N15C8SL512" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={async () => {
                  if (!searchTerm.trim()) {
                    toast.error("Please enter a model name");
                    return;
                  }
                  
                  try {
                    // Add the model using our utility - now async
                    await modelManager.addModel(searchTerm.trim());
                    
                    // Reset search term and show success
                    setSearchTerm('');
                    toast.success("Model added successfully to Supabase and local storage");
                    
                    // Reload models to update the UI
                    await loadGuides();
                  } catch (error) {
                    if (error.message === 'Model already exists') {
                      toast.error("Model already exists");
                    } else {
                      console.error("Error adding model:", error);
                      toast.error("Failed to add model");
                    }
                  }
                }}>Add Model</Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model Name</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Use actual models from state instead of hardcoded array */}
                    {(computerModels || ["UKN15I711-8GR512", "UKN15I310-8DG256-IF1599445", "UA-N15C8SL512"]).map((model) => (
                      <TableRow key={model}>
                        <TableCell>{model}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            className="text-destructive hover:text-destructive h-8 w-8"
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete model "${model}"?`)) {
                                try {
                                  // Use the modelManager utility - now async
                                  await modelManager.deleteModel(model);
                                  
                                  // Reload models to update the UI
                                  await loadGuides();
                                  
                                  toast.success("Model deleted successfully from Supabase and local storage");
                                } catch (error) {
                                  console.error("Error deleting model:", error);
                                  toast.error("Failed to delete model");
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>Customize application behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assistant Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Guide Assistant</h3>
                  <p className="text-sm text-muted-foreground">Enable or disable the interactive guide assistant</p>
                </div>
                <Switch
                  checked={assistantEnabled}
                  onCheckedChange={handleToggleAssistant}
                />
              </div>

              {/* Theme Button Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Theme Button</h3>
                  <p className="text-sm text-muted-foreground">Show or hide the theme toggle button in the header</p>
                </div>
                <Switch
                  checked={themeButtonEnabled}
                  onCheckedChange={handleToggleThemeButton}
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">About</h3>
                <p className="text-sm text-muted-foreground">TechSupport App v1.4</p>
                <p className="text-sm text-muted-foreground">© 2025 Thomson Technologies</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;