import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle, Edit, Trash2, Search, Plus, CheckCircle, XCircle, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Panel from "@/assets/wtpth/panel.jpg"

// Type definitions
type User = {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
};

type UserWithPassword = User & {
  password: string;
};

type Step = {
  title: string;
  description: string;
  imageUrl?: string;
};

type Guide = {
  id: string;
  title: string;
  model: string;
  category: string;
  difficulty: string;
  time: string;
  description: string;
  steps: Step[];
  createdBy: string;
};

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

type TestTool = {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  os: string[];
  size: string;
  link: string;
};

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [users, setUsers] = useState<User[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [testTools, setTestTools] = useState<TestTool[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingGuide, setIsEditingGuide] = useState(false);
  const [isEditingDriver, setIsEditingDriver] = useState(false);
  const [isEditingTool, setIsEditingTool] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedTool, setSelectedTool] = useState<TestTool | null>(null);

  // Form states for user management
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  // Form states for guide management
  const [editGuideTitle, setEditGuideTitle] = useState("");
  const [editGuideModel, setEditGuideModel] = useState("");
  const [editGuideCategory, setEditGuideCategory] = useState("");
  const [editGuideDifficulty, setEditGuideDifficulty] = useState("easy");
  const [editGuideTime, setEditGuideTime] = useState("");
  const [editGuideDescription, setEditGuideDescription] = useState("");
  const [editGuideSteps, setEditGuideSteps] = useState<Step[]>([]);
  
  // Form states for driver management
  const [editDriverName, setEditDriverName] = useState("");
  const [editDriverCategory, setEditDriverCategory] = useState("");
  const [editDriverManufacturer, setEditDriverManufacturer] = useState("");
  const [editDriverOs, setEditDriverOs] = useState<string[]>([]);
  const [editDriverImage, setEditDriverImage] = useState("");
  const [editDriverFiles, setEditDriverFiles] = useState<DriverFile[]>([]);
  
  // Form states for test tool management
  const [editToolName, setEditToolName] = useState("");
  const [editToolVersion, setEditToolVersion] = useState("");
  const [editToolDescription, setEditToolDescription] = useState("");
  const [editToolCategory, setEditToolCategory] = useState("");
  const [editToolOs, setEditToolOs] = useState<string[]>([]);
  const [editToolSize, setEditToolSize] = useState("");
  const [editToolLink, setEditToolLink] = useState("");
  
  // Computer models state
  const [computerModels, setComputerModels] = useState<string[]>([]);
  const [newModelName, setNewModelName] = useState("");
  
  // Load computer models from localStorage
  useEffect(() => {
    const storedModels = localStorage.getItem('computerModels');
    if (storedModels) {
      try {
        setComputerModels(JSON.parse(storedModels));
      } catch (error) {
        console.error("Error parsing computer models:", error);
        const defaultModels = [
          "UKN15I711-8GR512",
          "UKN15I310-8DG256-IF1599445",
          "UA-N15C8SL512",
        ];
        setComputerModels(defaultModels);
        localStorage.setItem('computerModels', JSON.stringify(defaultModels));
      }
    } else {
      // Initialize with default models if none exist
      const defaultModels = [
        "UKN15I711-8GR512",
        "UKN15I310-8DG256-IF1599445",
        "UA-N15C8SL512",
      ];
      setComputerModels(defaultModels);
      localStorage.setItem('computerModels', JSON.stringify(defaultModels));
    }
  }, []);

  // Categories
  const categories = [
    "Keyboard",
    "Display",
    "Battery",
    "Motherboard",
    "Storage",
    "Memory",
    "Full Disassembly",
  ];

  // Driver Categories
  const driverCategories = [
    "laptops",
    "desktops",
    "printers",
    "monitors",
    "storage",
  ];

  // Tool Categories
  const toolCategories = [
    "Hardware",
    "Storage",
    "Network",
    "System",
    "Diagnostic",
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

    loadUsers();
    loadGuides();
    loadDrivers();
    loadTestTools();
  }, [user, isAdmin, navigate]);

  const loadUsers = () => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const parsedUsers: UserWithPassword[] = JSON.parse(storedUsers);
      // Remove passwords from the user objects for security
      const usersWithoutPasswords: User[] = parsedUsers.map(
        ({ password, ...rest }) => rest
      );
      setUsers(usersWithoutPasswords);
    }
  };

  const loadGuides = () => {
    console.log("Loading guides for Admin panel");
    
    try {
      // Load existing guides from localStorage first
      let allGuides: Guide[] = [];
      const storedDisassemblyGuides = localStorage.getItem('disassemblyGuides');
      
      if (storedDisassemblyGuides) {
        try {
          const parsedDisassemblyGuides = JSON.parse(storedDisassemblyGuides);
          console.log("Found disassembly guides:", parsedDisassemblyGuides.length);
          allGuides = [...parsedDisassemblyGuides];
        } catch (error) {
          console.error("Error parsing disassembly guides:", error);
        }
      }
      
      // If we have no guides yet, initialize from sample data
      if (allGuides.length === 0) {
        console.log("No guides found, initializing from sample data");
        import('@/utils/sampleData').then(module => {
          module.initializeSampleData();
          
          // After initialization, load guides from localStorage
          const refreshedGuides = localStorage.getItem('disassemblyGuides');
          if (refreshedGuides) {
            setGuides(JSON.parse(refreshedGuides));
            console.log("Guides initialized from sample data");
          }
        });
      } else {
        // We already have guides, just use them
        setGuides(allGuides);
        console.log("Using existing guides from localStorage:", allGuides.length);
      }
    } catch (error) {
      console.error("Error in loadGuides:", error);
      
      // Fallback to default guide if everything fails
      const defaultGuide: Guide = {
        id: "guide-default",
        title: "Default Guide",
        model: "Generic Model",
        category: "Display",
        difficulty: "easy",
        time: "15 minutes",
        description: "A basic guide to get started",
        steps: [{title: "Step 1", description: "Begin by powering off the device"}],
        createdBy: "system"
      };
      
      setGuides([defaultGuide]);
      localStorage.setItem('disassemblyGuides', JSON.stringify([defaultGuide]));
    }
  };

  const loadDrivers = () => {
    console.log("Loading drivers for Admin panel");
    try {
      // Always try to get the drivers from localStorage first
      const storedDrivers = localStorage.getItem('drivers');
      
      if (storedDrivers) {
        try {
          const parsedDrivers = JSON.parse(storedDrivers);
          console.log("Found drivers in localStorage:", parsedDrivers.length);
          
          // Use the existing drivers data regardless of count
          setDrivers(parsedDrivers);
          console.log("Using existing drivers from localStorage");
        } catch (error) {
          console.error("Error parsing drivers:", error);
          initializeDefaultDrivers();
        }
      } else {
        // No drivers found, initialize from sample data
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
    import('@/utils/sampleData').then(module => {
      module.initializeSampleData();
      // Reload drivers after initialization
      const refreshedDrivers = localStorage.getItem('drivers');
      if (refreshedDrivers) {
        setDrivers(JSON.parse(refreshedDrivers));
      } else {
        // Create a default driver as fallback
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
      
      // Create a fallback driver if module import fails
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

  const loadTestTools = () => {
    const storedTools = localStorage.getItem('testTools');
    if (storedTools) {
      setTestTools(JSON.parse(storedTools));
    } else {
      // Initialize with empty array if not exists
      localStorage.setItem('testTools', JSON.stringify([]));
      setTestTools([]);
    }
  };

  const handleApproveUser = (userId: string) => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const parsedUsers: UserWithPassword[] = JSON.parse(storedUsers);
      const updatedUsers = parsedUsers.map((u) => {
        if (u.id === userId) {
          return { ...u, isApproved: true };
        }
        return u;
      });
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(users.map(u => u.id === userId ? { ...u, isApproved: true } : u));
      toast.success("User approved successfully! They can now log in.");
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const parsedUsers: UserWithPassword[] = JSON.parse(storedUsers);
        const updatedUsers = parsedUsers.filter((u) => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setUsers(users.filter(u => u.id !== userId));
        toast.success("User deleted successfully");
      }
    }
  };

  // Function to add a new computer model
  const handleAddModel = () => {
    if (!newModelName.trim()) {
      toast.error("Model name cannot be empty");
      return;
    }

    if (computerModels.includes(newModelName.trim())) {
      toast.error("This model already exists");
      return;
    }

    const updatedModels = [...computerModels, newModelName.trim()];
    setComputerModels(updatedModels);
    localStorage.setItem('computerModels', JSON.stringify(updatedModels));
    setNewModelName("");
    toast.success("Computer model added successfully");
  };

  // Function to delete a computer model
  const handleDeleteModel = (modelToDelete: string) => {
    if (window.confirm("Are you sure you want to delete this computer model?")) {
      const updatedModels = computerModels.filter(model => model !== modelToDelete);
      setComputerModels(updatedModels);
      localStorage.setItem('computerModels', JSON.stringify(updatedModels));
      toast.success("Computer model removed successfully");
    }
  };

  const handleDeleteGuide = (guideId: string) => {
    if (window.confirm("Are you sure you want to delete this guide?")) {
      const storedGuides = localStorage.getItem('disassemblyGuides');
      if (storedGuides) {
        const parsedGuides = JSON.parse(storedGuides);
        const updatedGuides = parsedGuides.filter((g: Guide) => g.id !== guideId);
        localStorage.setItem('disassemblyGuides', JSON.stringify(updatedGuides));
        setGuides(guides.filter(g => g.id !== guideId));
        toast.success("Guide deleted successfully");
      }
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditPassword("");
    setEditIsAdmin(user.isAdmin);
    setIsEditingUser(true);
  };

  const handleEditGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    setEditGuideTitle(guide.title);
    setEditGuideModel(guide.model);
    setEditGuideCategory(guide.category);
    setEditGuideDifficulty(guide.difficulty);
    setEditGuideTime(guide.time);
    setEditGuideDescription(guide.description);
    setEditGuideSteps([...guide.steps]);
    setIsEditingGuide(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;

    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const parsedUsers: UserWithPassword[] = JSON.parse(storedUsers);
      
      // Check if this is a new user or editing an existing one
      if (!selectedUser.id) {
        // Create a new user
        const newUser: UserWithPassword = {
          id: Date.now().toString(),
          username: editUsername,
          email: editEmail,
          isAdmin: editIsAdmin,
          password: "password123" // Default password that user can change later
        };
        
        const updatedUsers = [...parsedUsers, newUser];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Update local state (without password)
        const { password, ...userWithoutPassword } = newUser;
        setUsers([...users, userWithoutPassword]);
        
        setIsEditingUser(false);
        setSelectedUser(null);
        toast.success("New user created successfully");
      } else {
        // Update existing user
        const updatedUsers = parsedUsers.map((u) => {
          if (u.id === selectedUser.id) {
            return {
              ...u,
              username: editUsername,
              email: editEmail,
              isAdmin: editIsAdmin,
              ...(editPassword && { password: editPassword }) // Only update password if provided
            };
          }
          return u;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Update the local state
        const updatedLocalUsers = users.map(u => {
          if (u.id === selectedUser.id) {
            return {
              ...u,
              username: editUsername,
              email: editEmail,
              isAdmin: editIsAdmin
            };
          }
          return u;
        });
        
        setUsers(updatedLocalUsers);
        setIsEditingUser(false);
        setSelectedUser(null);
        toast.success("User updated successfully");
      }
    } else {
      // No users exist yet, create the first one
      const newUser: UserWithPassword = {
        id: Date.now().toString(),
        username: editUsername,
        email: editEmail,
        isAdmin: editIsAdmin,
        password: "password123" // Default password
      };
      
      localStorage.setItem('users', JSON.stringify([newUser]));
      
      // Update local state (without password)
      const { password, ...userWithoutPassword } = newUser;
      setUsers([userWithoutPassword]);
      
      setIsEditingUser(false);
      setSelectedUser(null);
      toast.success("New user created successfully");
    }
  };

  const handleSaveGuide = () => {
    if (!selectedGuide) return;
    
    const updatedGuide: Guide = {
      id: selectedGuide.id,
      title: editGuideTitle,
      model: editGuideModel,
      category: editGuideCategory,
      difficulty: editGuideDifficulty,
      time: editGuideTime,
      description: editGuideDescription,
      steps: editGuideSteps,
      createdBy: user?.username || "admin"
    };
    
    const storedGuides = localStorage.getItem('disassemblyGuides');
    if (storedGuides) {
      const parsedGuides = JSON.parse(storedGuides);
      let updatedGuides;
      
      if (selectedGuide.id === "new") {
        // Creating a new guide
        updatedGuide.id = Date.now().toString();
        updatedGuides = [...parsedGuides, updatedGuide];
      } else {
        // Updating an existing guide
        updatedGuides = parsedGuides.map((g: Guide) => {
          if (g.id === selectedGuide.id) {
            return updatedGuide;
          }
          return g;
        });
      }
      
      localStorage.setItem('disassemblyGuides', JSON.stringify(updatedGuides));
      setGuides(updatedGuides);  // Update state directly instead of reloading
      setIsEditingGuide(false);
      setSelectedGuide(null);
      toast.success(selectedGuide.id === "new" ? "Guide created successfully" : "Guide updated successfully");
    }
  };

  const handleAddNewGuide = () => {
    const newGuide: Guide = {
      id: "new",
      title: "",
      model: "",
      category: "",
      difficulty: "easy",
      time: "",
      description: "",
      steps: [{ title: "Step 1", description: "", imageUrl: "" }],
      createdBy: user?.username || "admin"
    };
    
    setSelectedGuide(newGuide);
    setEditGuideTitle("");
    setEditGuideModel("");
    setEditGuideCategory("");
    setEditGuideDifficulty("easy");
    setEditGuideTime("");
    setEditGuideDescription("");
    setEditGuideSteps([{ title: "Step 1", description: "", imageUrl: "" }]);
    setIsEditingGuide(true);
  };

  const handleAddStep = () => {
    setEditGuideSteps([
      ...editGuideSteps,
      { 
        title: `Step ${editGuideSteps.length + 1}`,
        description: "",
        imageUrl: ""
      }
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setEditGuideSteps(editGuideSteps.filter((_, i) => i !== index));
  };

  const handleUpdateStep = (index: number, field: 'title' | 'description' | 'imageUrl', value: string) => {
    const updatedSteps = [...editGuideSteps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setEditGuideSteps(updatedSteps);
  };
  
  // Driver management handlers
  const handleAddNewDriver = () => {
    // Get next available numeric ID
    const getNextDriverId = (): string => {
      const storedDrivers = localStorage.getItem('drivers');
      
      if (storedDrivers) {
        const drivers = JSON.parse(storedDrivers);
        const maxId = Math.max(...drivers.map((d: Driver) => parseInt(d.id) || 0));
        return (maxId + 1).toString();
      }
      
      // If no stored drivers, start from 25 (after existing 24 drivers)
      return "25";
    };

    const newDriver: Driver = {
      id: "new",
      name: "",
      category: "laptops", // Default to laptops like your existing data
      manufacturer: "Thomson", // Default to Thomson like your existing data
      image: "",
      os: ["windows11"], // Default to Windows 11 like most of your drivers
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

  const handleOsToggle = (os: string) => {
    if (editDriverOs.includes(os)) {
      setEditDriverOs(editDriverOs.filter(item => item !== os));
    } else {
      setEditDriverOs([...editDriverOs, os]);
    }
  };

  const handleToolOsToggle = (os: string) => {
    if (editToolOs.includes(os)) {
      setEditToolOs(editToolOs.filter(item => item !== os));
    } else {
      setEditToolOs([...editToolOs, os]);
    }
  };

  const handleAddDriverFile = () => {
    setEditDriverFiles([
      ...editDriverFiles, 
      { 
        name: "", 
        version: "", 
        date: "", 
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

  const handleSaveDriver = () => {
    if (!selectedDriver) return;
    
    // Generate next incremental ID for new drivers
    const getNextDriverId = (): string => {
      const storedDrivers = localStorage.getItem('drivers');
      
      if (storedDrivers) {
        const drivers = JSON.parse(storedDrivers);
        const maxId = Math.max(...drivers.map((d: Driver) => parseInt(d.id) || 0));
        return (maxId + 1).toString();
      }
      
      return "25"; // Start from 25 if no drivers exist
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
    
    const storedDrivers = localStorage.getItem('drivers');
    let updatedDrivers = [];
    
    if (storedDrivers) {
      const parsedDrivers: Driver[] = JSON.parse(storedDrivers);
      
      if (selectedDriver.id === "new") {
        updatedDrivers = [...parsedDrivers, updatedDriver];
      } else {
        updatedDrivers = parsedDrivers.map(d => d.id === selectedDriver.id ? updatedDriver : d);
      }
    } else {
      updatedDrivers = [updatedDriver];
    }
    
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
    setDrivers(updatedDrivers);
    setIsEditingDriver(false);
    setSelectedDriver(null);
    toast.success(selectedDriver.id === "new" ? "Driver created successfully" : "Driver updated successfully");
  };

  const handleDeleteDriver = (driverId: string) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      const storedDrivers = localStorage.getItem('drivers');
      if (storedDrivers) {
        const parsedDrivers = JSON.parse(storedDrivers);
        const updatedDrivers = parsedDrivers.filter((d: Driver) => d.id !== driverId);
        localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
        setDrivers(updatedDrivers);
        toast.success("Driver deleted successfully");
      }
    }
  };

  // Test tool management handlers
  const handleAddNewTool = () => {
    const newTool: TestTool = {
      id: "new",
      name: "",
      version: "",
      description: "",
      category: "",
      os: [],
      size: "",
      link: ""
    };
    
    setSelectedTool(newTool);
    setEditToolName("");
    setEditToolVersion("");
    setEditToolDescription("");
    setEditToolCategory("");
    setEditToolOs([]);
    setEditToolSize("");
    setEditToolLink("");
    setIsEditingTool(true);
  };

  const handleEditTool = (tool: TestTool) => {
    setSelectedTool(tool);
    setEditToolName(tool.name);
    setEditToolVersion(tool.version);
    setEditToolDescription(tool.description);
    setEditToolCategory(tool.category);
    setEditToolOs([...tool.os]);
    setEditToolSize(tool.size);
    setEditToolLink(tool.link);
    setIsEditingTool(true);
  };

  const handleSaveTool = () => {
    if (!selectedTool) return;
    
    const updatedTool: TestTool = {
      id: selectedTool.id === "new" ? Date.now().toString() : selectedTool.id,
      name: editToolName,
      version: editToolVersion,
      description: editToolDescription,
      category: editToolCategory,
      os: editToolOs,
      size: editToolSize,
      link: editToolLink
    };
    
    const storedTools = localStorage.getItem('testTools');
    let updatedTools = [];
    
    if (storedTools) {
      const parsedTools: TestTool[] = JSON.parse(storedTools);
      
      if (selectedTool.id === "new") {
        updatedTools = [...parsedTools, updatedTool];
      } else {
        updatedTools = parsedTools.map(t => t.id === selectedTool.id ? updatedTool : t);
      }
    } else {
      updatedTools = [updatedTool];
    }
    
    localStorage.setItem('testTools', JSON.stringify(updatedTools));
    setTestTools(updatedTools);
    setIsEditingTool(false);
    setSelectedTool(null);
    toast.success(selectedTool.id === "new" ? "Test tool created successfully" : "Test tool updated successfully");
  };

  const handleDeleteTool = (toolId: string) => {
    if (window.confirm("Are you sure you want to delete this test tool?")) {
      const storedTools = localStorage.getItem('testTools');
      if (storedTools) {
        const parsedTools = JSON.parse(storedTools);
        const updatedTools = parsedTools.filter((t: TestTool) => t.id !== toolId);
        localStorage.setItem('testTools', JSON.stringify(updatedTools));
        setTestTools(updatedTools);
        toast.success("Test tool deleted successfully");
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGuides = guides.filter(guide => 
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    guide.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    guide.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    driver.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    driver.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTestTools = testTools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    
	
	
	<div className="container mx-auto py-8">
      
	  
	    <h1
          className="text-4xl font-bold text-white mb-0 px-4 py-20 rounded bg-cover bg-center"
          style={{ backgroundImage: `url(${Panel})`, display: 'block' }}
        >
         Admin Dashboard
		   
        </h1>
      
      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="guides">Guide Management</TabsTrigger>
          <TabsTrigger value="models">Computer Models</TabsTrigger>
          <TabsTrigger value="drivers">Driver Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* User Management Tab */}
        <TabsContent value="users">
          {isEditingUser ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedUser?.id ? "Edit User" : "Add New User"}</CardTitle>
                <CardDescription>Update user information</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password (leave blank to keep current)"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isAdmin"
                      checked={editIsAdmin}
                      onChange={(e) => setEditIsAdmin(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isAdmin">Admin privileges</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditingUser(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveUser}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={() => {
                  setSelectedUser({ id: "", email: "", username: "", isAdmin: false });
                  setEditUsername("");
                  setEditEmail("");
                  setEditIsAdmin(false);
                  setIsEditingUser(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add New User
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <span className="flex items-center text-red-600 font-medium">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Admin
                              </span>
                            ) : user.isApproved ? (
                              <span className="flex items-center text-green-600 font-medium">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approved User
                              </span>
                            ) : (
                              <span className="flex items-center text-orange-600 font-medium">
                                <UserCircle className="h-4 w-4 mr-1" />
                                Pending Approval
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {!user.isApproved && !user.isAdmin && (
                              <Button variant="default" size="sm" onClick={() => handleApproveUser(user.id)}>
                                Approve
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6">
                            <p className="text-muted-foreground">No users found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        {/* Guide Management Tab */}
        <TabsContent value="guides">
          {isEditingGuide ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedGuide?.id === "new" ? "Add New Guide" : "Edit Guide"}</CardTitle>
                <CardDescription>Create or update disassembly guides</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="guide-title">Title</Label>
                    <Input
                      id="guide-title"
                      value={editGuideTitle}
                      onChange={(e) => setEditGuideTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guide-model">Computer Model</Label>
                      <Select 
                        value={editGuideModel} 
                        onValueChange={setEditGuideModel}
                      >
                        <SelectTrigger id="guide-model">
                          <SelectValue placeholder="Select computer model" />
                        </SelectTrigger>
                        <SelectContent>
                          {computerModels.map((model, index) => (
                            <SelectItem key={index} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="guide-category">Category</Label>
                      <Select 
                        value={editGuideCategory} 
                        onValueChange={setEditGuideCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="guide-difficulty">Difficulty</Label>
                      <Select 
                        value={editGuideDifficulty} 
                        onValueChange={setEditGuideDifficulty}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="guide-time">Estimated Time</Label>
                      <Input
                        id="guide-time"
                        value={editGuideTime}
                        onChange={(e) => setEditGuideTime(e.target.value)}
                        placeholder="e.g., 20 minutes"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="guide-description">Description</Label>
                    <Textarea
                      id="guide-description"
                      value={editGuideDescription}
                      onChange={(e) => setEditGuideDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Steps</Label>
                      <Button type="button" size="sm" variant="outline" onClick={handleAddStep}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Step
                      </Button>
                    </div>
                    
                    {editGuideSteps.map((step, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <Input
                            value={step.title}
                            onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                            className="w-full max-w-xs"
                            placeholder={`Step ${index + 1} title`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveStep(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <Textarea
                          value={step.description}
                          onChange={(e) => handleUpdateStep(index, 'description', e.target.value)}
                          placeholder="Step description..."
                          rows={2}
                        />
                        <div className="mt-3">
                          <Label htmlFor={`step-media-${index}`}>Image/Video URL (Optional)</Label>
                          <Input
                            id={`step-media-${index}`}
                            value={step.imageUrl || ''}
                            onChange={(e) => handleUpdateStep(index, 'imageUrl', e.target.value)}
                            placeholder="URL to image or video (e.g., '/assets/images/step1.jpg' or 'https://youtube.com/embed/...')"
                            className="mt-1"
                          />
                          {step.imageUrl && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                              Preview: {step.imageUrl}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {
                      setIsEditingGuide(false);
                      setSelectedGuide(null);
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveGuide}>
                      {selectedGuide?.id === "new" ? "Create Guide" : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search guides..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddNewGuide}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Guide
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGuides.map((guide) => (
                        <TableRow key={guide.id}>
                          <TableCell className="font-medium">{guide.title}</TableCell>
                          <TableCell>{guide.model}</TableCell>
                          <TableCell>{guide.category}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              guide.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              guide.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {guide.difficulty}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditGuide(guide)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteGuide(guide.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredGuides.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            <p className="text-muted-foreground">No guides found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        {/* Computer Models Management Tab */}
        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Computer Model Management</CardTitle>
              <CardDescription>Add or remove computer models for disassembly guides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter new computer model name"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddModel}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Model
                  </Button>
                </div>
                
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model Name</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {computerModels.map((model, index) => (
                        <TableRow key={index}>
                          <TableCell>{model}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteModel(model)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {computerModels.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                            No computer models available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Driver Management Tab */}
        <TabsContent value="drivers">
          {isEditingDriver ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedDriver?.id === "new" ? "Add New Driver" : "Edit Driver"}</CardTitle>
                <CardDescription>Create or update driver information</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="driver-name">Driver Name</Label>
                    <Input
                      id="driver-name"
                      value={editDriverName}
                      onChange={(e) => setEditDriverName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driver-category">Category</Label>
                      <Select 
                        value={editDriverCategory} 
                        onValueChange={setEditDriverCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {driverCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="driver-manufacturer">Manufacturer</Label>
                      <Input
                        id="driver-manufacturer"
                        value={editDriverManufacturer}
                        onChange={(e) => setEditDriverManufacturer(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="driver-image">Image URL</Label>
                    <Input
                      id="driver-image"
                      placeholder="Path to image (e.g., '/assets/images/driver.jpg')"
                      value={editDriverImage}
                      onChange={(e) => setEditDriverImage(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Compatible Operating Systems</Label>
                    <div className="flex flex-wrap gap-4 pt-2">
                      {operatingSystems.map((os) => (
                        <div key={os} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`os-${os}`}
                            checked={editDriverOs.includes(os)}
                            onChange={() => handleOsToggle(os)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`os-${os}`}>{os === "windows10" ? "Windows 10" : "Windows 11"}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Driver Files</Label>
                      <Button type="button" size="sm" variant="outline" onClick={handleAddDriverFile}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add File
                      </Button>
                    </div>
                    
                    {editDriverFiles.map((file, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`file-name-${index}`}>File Name</Label>
                            <Input
                              id={`file-name-${index}`}
                              value={file.name}
                              onChange={(e) => handleUpdateDriverFile(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`file-version-${index}`}>Version</Label>
                            <Input
                              id={`file-version-${index}`}
                              value={file.version}
                              onChange={(e) => handleUpdateDriverFile(index, 'version', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`file-date-${index}`}>Release Date</Label>
                            <Input
                              id={`file-date-${index}`}
                              type="date"
                              value={file.date}
                              onChange={(e) => handleUpdateDriverFile(index, 'date', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`file-size-${index}`}>File Size</Label>
                            <Input
                              id={`file-size-${index}`}
                              value={file.size}
                              placeholder="e.g. 1.5 GB"
                              onChange={(e) => handleUpdateDriverFile(index, 'size', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-end">
                          <div className="w-full space-y-2">
                            <Label htmlFor={`file-link-${index}`}>Download Link</Label>
                            <Input
                              id={`file-link-${index}`}
                              value={file.link}
                              placeholder="URL to download the file"
                              onChange={(e) => handleUpdateDriverFile(index, 'link', e.target.value)}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="ml-2 mt-8"
                            onClick={() => handleRemoveDriverFile(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => {
                      setIsEditingDriver(false);
                      setSelectedDriver(null);
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveDriver}>
                      {selectedDriver?.id === "new" ? "Create Driver" : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search drivers..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddNewDriver}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Driver
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>OS Compatibility</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDrivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell className="font-medium">{driver.name}</TableCell>
                          <TableCell>{driver.manufacturer}</TableCell>
                          <TableCell>{driver.category}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {driver.os.includes("windows10") && (
                                <Badge variant="outline">Windows 10</Badge>
                              )}
                              {driver.os.includes("windows11") && (
                                <Badge variant="outline">Windows 11</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditDriver(driver)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteDriver(driver.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredDrivers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            <p className="text-muted-foreground">No drivers found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>Configure global application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">User Interface</h3>
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="guideAssistant">Guide Assistant</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => {
                            updateSettings({ showGuideAssistant: true });
                            toast.success("Guide Assistant enabled");
                          }}
                          variant="outline"
                          className="w-28"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Enable
                        </Button>
                        <Button
                          onClick={() => {
                            updateSettings({ showGuideAssistant: false });
                            toast.success("Guide Assistant disabled");
                          }}
                          variant="outline"
                          className="w-28"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Disable
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Toggle the Guide Assistant chatbot visibility across the application. When disabled, users won't see the chat icon.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* End of tabs content */}
      </Tabs>
    </div>
  );
}