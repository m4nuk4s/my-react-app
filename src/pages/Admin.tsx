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

  // Guide management state
  const [guides, setGuides] = useState([]);

  // Driver management state
  const [drivers, setDrivers] = useState([]);
  
  // Models management state
  const [computerModels, setComputerModels] = useState([]);

  // App-specific table name for drivers
  const APP_DRIVERS_TABLE = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_drivers';

  // Settings management
  const [assistantEnabled, setAssistantEnabled] = useState(
    settings?.assistantEnabled !== undefined ? settings.assistantEnabled : true
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
    // Update assistant enabled state when settings change
    if (settings) {
      setAssistantEnabled(settings.assistantEnabled !== undefined ? settings.assistantEnabled : true);
    }
  }, [settings]);

  const loadActiveTabData = () => {
    switch(activeTab) {
      case "users":
        loadUsers();
        break;
      case "guides":
        loadGuides();
        break;
      case "drivers":
        loadDrivers();
        break;
      case "models":
        // Models are loaded with guides
        loadGuides();
        break;
      case "settings":
        // Settings are loaded from context
        break;
      default:
        break;
    }
  };

  const loadUsers = () => {
    setIsLoading(true);
    try {
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
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const loadGuides = () => {
    setIsLoading(true);
    try {
      // Load guides
      const storedGuides = localStorage.getItem('disassemblyGuides') || '[]';
      setGuides(JSON.parse(storedGuides));
      
      // Load computer models using modelManager
      const models = modelManager.getAllModels();
      setComputerModels(models);
    } catch (error) {
      console.error("Error loading guides and models:", error);
      toast.error("Failed to load guides and models");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDrivers = () => {
    setIsLoading(true);
    try {
      const storedDrivers = localStorage.getItem('drivers') || '[]';
      setDrivers(JSON.parse(storedDrivers));
    } catch (error) {
      console.error("Error loading drivers:", error);
      toast.error("Failed to load drivers");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle approving a pending user
  const handleApproveUser = (userId) => {
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
      
      toast.success("User approved successfully");
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    }
  };

  // Function to handle rejecting a pending user
  const handleRejectUser = (userId) => {
    if (!window.confirm("Are you sure you want to reject this user?")) {
      return;
    }
    
    try {
      const storedUsers = localStorage.getItem('users') || '[]';
      const parsedUsers = JSON.parse(storedUsers);
      
      const updatedUsers = parsedUsers.filter(user => user.id !== userId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Update state
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      
      toast.success("User rejected successfully");
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    }
  };

  // Function to toggle the assistant
  const handleToggleAssistant = () => {
    const newValue = !assistantEnabled;
    setAssistantEnabled(newValue);
    
    // Update settings in context
    updateSettings({ ...settings, assistantEnabled: newValue });
    
    // Save to localStorage
    const storedSettings = localStorage.getItem('settings') || '{}';
    const parsedSettings = JSON.parse(storedSettings);
    localStorage.setItem('settings', JSON.stringify({
      ...parsedSettings,
      assistantEnabled: newValue
    }));
    
    toast.success(`Assistant ${newValue ? 'enabled' : 'disabled'} successfully`);
  };

  // Function to redirect to Add Driver page
  const handleAddDriver = () => {
    toast.info("Redirecting to driver management");
    navigate("/admin/drivers/new");
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
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Pending Approval Requests</h3>
                {isLoading ? (
                  <p>Loading pending users...</p>
                ) : pendingUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={() => handleApproveUser(user.id)}
                              >
                                <CheckCircle className="h-4 w-4" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="flex items-center gap-1"
                                onClick={() => handleRejectUser(user.id)}
                              >
                                <XCircle className="h-4 w-4" /> Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No pending approval requests</p>
                )}
              </div>

              {/* Active Users Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Active Users</h3>
                  <Button onClick={() => navigate("/admin/users/new")}>Add New User</Button>
                </div>
                
                {isLoading ? (
                  <p>Loading users...</p>
                ) : users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.isAdmin ? "default" : "outline"}>
                              {user.isAdmin ? "Admin" : "User"}
                            </Badge>
                          </TableCell>
                          <TableCell>
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
                                onClick={() => {
                                  if(window.confirm(`Are you sure you want to delete ${user.username}?`)) {
                                    try {
                                      // Get existing users
                                      const storedUsers = localStorage.getItem('users') || '[]';
                                      const allUsers = JSON.parse(storedUsers);
                                      
                                      // Filter out the user to delete
                                      const updatedUsers = allUsers.filter((u) => u.id !== user.id);
                                      
                                      // Update localStorage
                                      localStorage.setItem('users', JSON.stringify(updatedUsers));
                                      
                                      // Update state
                                      setUsers(users.filter(u => u.id !== user.id));
                                      toast.success("User deleted successfully");
                                    } catch (error) {
                                      console.error("Error deleting user:", error);
                                      toast.error("Failed to delete user");
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
                                onClick={() => {
                                  if(window.confirm(`Are you sure you want to delete "${guide.title}"?`)) {
                                    try {
                                      // Get existing guides
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
                      <Card key={driver.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted relative">
                          {driver.image ? (
                            <img 
                              src={driver.image} 
                              alt={driver.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-driver.png';
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
                          <CardDescription>
                            {driver.manufacturer} • {driver.category}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {driver.os && driver.os.map(os => (
                              <Badge key={os} variant="outline">{os}</Badge>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate(`/admin/drivers/edit/${driver.id}`)}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                if(window.confirm(`Are you sure you want to delete "${driver.name}"?`)) {
                                  try {
                                    // First try to get existing drivers
                                    const storedDrivers = localStorage.getItem('drivers') || '[]';
                                    const currentDrivers = JSON.parse(storedDrivers);
                                    
                                    // Filter out the driver to delete
                                    const updatedDrivers = currentDrivers.filter(d => d.id !== driver.id);
                                    
                                    // Update localStorage
                                    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
                                    
                                    // Try to delete from Supabase as well
                                    const deleteFromSupabase = async (id: string) => {
                                      await supabase
                                        .from(APP_DRIVERS_TABLE)
                                        .delete()
                                        .eq('id', id);
                                    };
                                    
                                    deleteFromSupabase(driver.id);
                                    
                                    // Update the UI
                                    setDrivers(updatedDrivers);
                                    toast.success("Driver deleted successfully");
                                  } catch (error) {
                                    console.error("Error deleting driver:", error);
                                    toast.error("Failed to delete driver");
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
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
                <Button onClick={() => {
                  if (!searchTerm.trim()) {
                    toast.error("Please enter a model name");
                    return;
                  }
                  
                  try {
                    // Import is at the top of the file
                    import('../utils/modelManager').then(({ addModel }) => {
                      try {
                        // Add the model using our utility
                        addModel(searchTerm.trim());
                        
                        // Reset search term and show success
                        setSearchTerm('');
                        toast.success("Model added successfully");
                        
                        // Reload models to update the UI
                        loadGuides();
                      } catch (error) {
                        if (error.message === 'Model already exists') {
                          toast.error("Model already exists");
                        } else {
                          toast.error("Failed to add model");
                        }
                      }
                    });
                  } catch (error) {
                    console.error("Error importing modelManager:", error);
                    toast.error("Failed to add model");
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
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete model "${model}"?`)) {
                                try {
                                  // Use the modelManager utility
                                  modelManager.deleteModel(model);
                                  
                                  // Reload models to update the UI
                                  loadGuides();
                                  
                                  toast.success("Model deleted successfully");
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