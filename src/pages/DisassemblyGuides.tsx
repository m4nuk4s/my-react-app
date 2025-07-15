import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Laptop, Computer, Wrench, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import Panel from "@/assets/wtpth/panel.jpg";

// Type definitions
type Step = {
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
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

export default function DisassemblyGuides() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [computerModels, setComputerModels] = useState<string[]>([
    "ThinkPad T490",
    "ThinkPad X1 Carbon",
    "HP EliteBook 840",
    "Dell XPS 13",
    "MacBook Pro 13",
    "Asus ZenBook",
    "Surface Pro 7",
  ]);
  const { isAuthenticated } = useAuth();

  // Categories
  const categories = [
    "Keyboard",
    "Display",
    "Battery",
    "Motherboard",
    "Storage",
    "Memory",
    "Full Disassembly",
    "All Categories"
  ];

  useEffect(() => {
    // Load guides from localStorage
    const storedGuides = localStorage.getItem('disassemblyGuides');
    
    if (storedGuides) {
      setGuides(JSON.parse(storedGuides));
    } else {
      // Initialize with sample guides if none exist
      const initialGuides: Guide[] = [
        {
          id: "1",
          title: "ThinkPad T490 Keyboard Replacement",
          model: "ThinkPad T490",
          category: "Keyboard",
          difficulty: "easy",
          time: "20 minutes",
          description: "Complete guide to replacing the keyboard on a ThinkPad T490 laptop.",
          steps: [
            {
              title: "Preparation",
              description: "Turn off the laptop, unplug it, and remove the battery if possible.",
              imageUrl: "/assets/disassembly-guides/thinkpad/keyboard-removal.svg"
            },
            {
              title: "Remove keyboard screws",
              description: "Turn the laptop over and locate the keyboard retention screws (usually marked with a keyboard symbol).",
              imageUrl: "/assets/disassembly-guides/thinkpad/keyboard-removal.svg"
            },
            {
              title: "Release keyboard",
              description: "Flip the laptop over, open the display, and gently pry up the keyboard from the top edge.",
              imageUrl: "/assets/disassembly-guides/thinkpad/keyboard-removal.svg"
            },
            {
              title: "Disconnect keyboard cable",
              description: "Carefully lift the keyboard and disconnect the ribbon cable from the motherboard connector.",
              imageUrl: "/assets/disassembly-guides/thinkpad/keyboard-removal.svg"
            },
            {
              title: "Install new keyboard",
              description: "Connect the new keyboard's ribbon cable to the motherboard and carefully position the keyboard. Watch the video for detailed instructions.",
              imageUrl: "/assets/disassembly-guides/thinkpad/keyboard-removal.svg",
              videoUrl: "/assets/videos/samples/keyboard_removal.mp4"
            },
            {
              title: "Secure keyboard",
              description: "Press down around the edges of the keyboard until it clicks into place.",
              imageUrl: "/assets/disassembly-guides/thinkpad/keyboard-removal.svg"
            },
            {
              title: "Replace screws",
              description: "Turn the laptop over and replace the keyboard retention screws.",
              imageUrl: "/assets/disassembly-guides/thinkpad/keyboard-removal.svg"
            },
          ],
          createdBy: "admin"
        },
        {
          id: "2",
          title: "Dell XPS 13 Battery Replacement",
          model: "Dell XPS 13",
          category: "Battery",
          difficulty: "medium",
          time: "30 minutes",
          description: "Step-by-step guide to replacing the battery in a Dell XPS 13 laptop.",
          steps: [
            {
              title: "Preparation",
              description: "Turn off the laptop and unplug all cables.",
              imageUrl: "/assets/disassembly-guides/dell/battery-removal.svg"
            },
            {
              title: "Remove bottom panel",
              description: "Remove the Torx T5 screws from the bottom panel and carefully pry off the panel.",
              imageUrl: "/assets/disassembly-guides/dell/battery-removal.svg"
            },
            {
              title: "Disconnect the battery",
              description: "Locate the battery connector on the motherboard and carefully disconnect it.",
              imageUrl: "/assets/disassembly-guides/dell/battery-removal.svg"
            },
            {
              title: "Remove battery screws",
              description: "Remove the screws securing the battery to the chassis.",
              imageUrl: "/assets/disassembly-guides/dell/battery-removal.svg"
            },
            {
              title: "Remove battery",
              description: "Carefully lift the battery out of the laptop.",
              imageUrl: "/assets/disassembly-guides/dell/battery-removal.svg"
            },
            {
              title: "Install new battery",
              description: "Place the new battery in the chassis and secure with screws. See the video for detailed positioning.",
              imageUrl: "/assets/disassembly-guides/dell/battery-removal.svg",
              videoUrl: "/assets/videos/samples/battery_replacement.mp4"
            },
            {
              title: "Connect battery",
              description: "Connect the battery cable to the motherboard connector.",
              imageUrl: "/assets/disassembly-guides/dell/battery-removal.svg"
            },
            {
              title: "Replace bottom panel",
              description: "Align and press the bottom panel into place, then secure with screws.",
              imageUrl: "/assets/disassembly-guides/dell/battery-removal.svg"
            },
          ],
          createdBy: "admin"
        },
        {
          id: "3",
          title: "MacBook Pro 13 Display Assembly Replacement",
          model: "MacBook Pro 13",
          category: "Display",
          difficulty: "hard",
          time: "45 minutes",
          description: "Complete guide for replacing the display assembly on a MacBook Pro 13.",
          steps: [
            {
              title: "Preparation",
              description: "Turn off the MacBook and unplug all cables.",
              imageUrl: "/assets/disassembly-guides/macbook/display-assembly.svg"
            },
            {
              title: "Remove bottom case",
              description: "Remove the 10 pentalobe screws securing the bottom case and remove it.",
              imageUrl: "/assets/disassembly-guides/macbook/display-assembly.svg"
            },
            {
              title: "Disconnect battery",
              description: "Locate the battery connector and disconnect it from the logic board.",
              imageUrl: "/assets/disassembly-guides/macbook/display-assembly.svg"
            },
            {
              title: "Disconnect display cables",
              description: "Carefully disconnect the display data cable, backlight cable, and camera cable from the logic board.",
              imageUrl: "/assets/disassembly-guides/macbook/display-assembly.svg"
            },
            {
              title: "Remove hinge screws",
              description: "Remove the screws securing the display hinges to the lower case.",
              imageUrl: "/assets/disassembly-guides/macbook/display-assembly.svg"
            },
            {
              title: "Separate display assembly",
              description: "Carefully lift and separate the display assembly from the lower case.",
              imageUrl: "/assets/disassembly-guides/macbook/display-assembly.svg"
            },
            {
              title: "Install new display assembly",
              description: "Align the new display assembly with the lower case and secure with hinge screws.",
              imageUrl: "/assets/disassembly-guides/macbook/display-assembly.svg"
            },
            {
              title: "Connect display cables",
              description: "Connect the display data cable, backlight cable, and camera cable to the logic board.",
              imageUrl: "/assets/disassembly-guides/macbook/display-assembly.svg"
            },
            {
              title: "Connect battery",
              description: "Reconnect the battery to the logic board. Watch the video for a detailed demonstration.",
              imageUrl: "/assets/disassembly-guides/macbook/display-assembly.svg",
              videoUrl: "/assets/videos/samples/display_assembly.mp4"
            },
            {
              title: "Replace bottom case",
              description: "Position the bottom case and secure with pentalobe screws.",
              imageUrl: "/assets/disassembly-guides/macbook/display-assembly.svg"
            },
          ],
          createdBy: "admin"
        }
      ];

      setGuides(initialGuides);
      localStorage.setItem('disassemblyGuides', JSON.stringify(initialGuides));
    }
    
    // Load computer models from localStorage if available
    const storedModels = localStorage.getItem('computerModels');
    if (storedModels) {
      try {
        const models = JSON.parse(storedModels);
        if (Array.isArray(models) && models.length > 0) {
          setComputerModels(models);
        }
      } catch (error) {
        console.error("Error parsing computer models:", error);
      }
    }
  }, []);

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          guide.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModel = selectedModel === "all" || guide.model === selectedModel;
    const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
    
    return matchesSearch && matchesModel && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <div className="text-center">
        <div>
		
		
		  <h1
          className="text-4xl font-bold text-white mb-0 px-4 py-20 rounded bg-cover bg-center"
          style={{ backgroundImage: `url(${Panel})`, display: 'block' }}
        >
         Disassembly Guides
		   <p className="text-xl text-blue-100 mb-8">
       Step-by-step guides for disassembling and repairing common computer models
    </p>
        </h1>
       
		
		
		
		
		
		
		
		
        </div>
        {isAuthenticated && (
          <Button asChild className="mt-4 md:mt-0">
            <Link to="/admin/guides">Manage Guides</Link>
          </Button>
        )}
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search guides..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value === "All Models" ? "all" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {computerModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value === "All Categories" ? "all" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(cat => cat !== "All Categories").map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {filteredGuides.length === 0 ? (
        <div className="text-center py-10">
          <Laptop className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No guides found</h2>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <Card key={guide.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <CardDescription className="mt-1">{guide.model}</CardDescription>
                  </div>
                  <Badge className={getDifficultyColor(guide.difficulty)}>
                    {guide.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {guide.steps && guide.steps[0]?.imageUrl && (
                  <div className="mb-4 h-[150px] overflow-hidden rounded-md flex justify-center items-center bg-muted">
                    <img 
                      src={guide.steps[0].imageUrl} 
                      alt={guide.title} 
                      className="h-auto max-h-[150px] w-auto max-w-full object-contain"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{guide.time}</span>
                  <Laptop className="h-4 w-4 ml-4 mr-1" />
                  <span>{guide.model}</span>
                  <Wrench className="h-4 w-4 ml-4 mr-1" />
                  <span>{guide.category}</span>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 bg-muted/50">
                <Button asChild className="w-full">
                  <Link to={`/disassembly/${guide.id}`}>View Guide</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}