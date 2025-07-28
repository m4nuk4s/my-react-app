import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Laptop, Wrench, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import Panel from "@/assets/wtpth/panel.jpg";
import { supabase } from "@/lib/supabase";

// Type definitions for guides from diss_table
type Step = {
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  step_des?: string; // Added to handle step_des field from the database
  step_description?: string; // For backward compatibility
  image_url?: string; // For backward compatibility
  step_number?: number; // For ordering steps
  procedure?: string; // ✅ NEW
};

type Guide = {
  id: string;
  title: string;
  guide_title: string; // Added to store the guide_title for proper linking
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
  const [computerModels, setComputerModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    // Load guides from Supabase's diss_table
    async function loadGuidesFromSupabase() {
      setLoading(true);
      try {
        // First get unique guides from disassembly-guides table
        const { data, error } = await supabase
          .from('disassembly-guides')
          .select('*');

        if (error) {
          console.error("Error fetching guides from disassembly-guides:", error);
          setError("Failed to fetch guides from database");
          // Fallback to localStorage
          loadFromLocalStorage();
          return;
        }

        if (data && data.length > 0) {
          console.log("Guides from disassembly-guides table:", data.map(d => ({ id: d.id, title: d.title, guide_title: d.guide_title })));
          
          // Get a sample of all data from diss_table to understand structure
          const { data: sampleDissTable } = await supabase
            .from('diss_table')
            .select('*')
            .limit(5);
          console.log("Sample data from diss_table:", sampleDissTable);
          
          // Transform data to match our Guide type and fetch all steps from diss_table
          const formattedGuides = await Promise.all(data.map(async (item) => {
            console.log("Processing guide:", item.guide_title || item.title);
            
            // Get the first step from this guide (current disassembly-guides entry)
 let firstStep = null;

try {
  const parsedSteps = typeof item.steps === 'string'
    ? JSON.parse(item.steps)
    : Array.isArray(item.steps)
      ? item.steps
      : [];

  const fallbackStep = {
    id: `${item.id}-first`,
  title: item.title || "Step 1",
  description: item.procedure || item.description || "Start disassembly.",
  imageUrl: item.image_url || undefined,
  videoUrl: undefined,
  step_number: 1,
  step_description: item.procedure || item.description || "Start disassembly.",
  step_des: item.title || "Step 1",
  image_url: item.image_url || undefined,
  procedure: item.procedure || item.description || "Start disassembly."
  };

  if (parsedSteps.length > 0 && parsedSteps[0]) {
    const step = parsedSteps[0];
    firstStep = {
    id: `${item.id}-first`,
  title: item.title || "Step 1",
  description: item.procedure || item.description || "Start disassembly.",
  imageUrl: item.image_url || undefined,
  videoUrl: undefined,
  step_number: 1,
  step_description: item.procedure || item.description || "Start disassembly.",
  step_des: item.title || "Step 1",
  image_url: item.image_url || undefined,
  procedure: item.procedure || item.description || "Start disassembly."
    };
  } else {
    // Use fallback if steps are empty
    firstStep = fallbackStep;
  }
} catch (e) {
  console.warn("Failed to parse item.steps, using fallback Step 1.");
  firstStep = {
    id: `${item.id}-first`,
    title: item.title || "Step 1",
    description: item.procedure || item.description || "Start disassembly.",
    imageUrl: item.image_url || undefined,
    videoUrl: undefined,
    step_number: 1,
	procedure: item.procedure || item.description || "Start disassembly.",
    step_description: item.procedure || item.description || "Start disassembly.",
    step_des: item.title || "Step 1",
    image_url: item.image_url || undefined
  };
}
            
            // Fetch all related steps from diss_table using guide_title
            console.log("Fetching steps for guide_title:", item.guide_title || item.title);
           let { data: allSteps, error: stepsError } = await supabase
  .from('diss_table')
  .select('*')
  .ilike('guide_title', `%${item.guide_title || item.title}%`)
  .order('id', { ascending: true });
            
            console.log("Steps query result:", { data: allSteps, error: stepsError });
            
            if (stepsError) {
              console.error("Error fetching steps for guide", item.guide_title, ":", stepsError);
              
              // Try alternative approach with different column names
              console.log("Trying alternative query methods...");
              const { data: altSteps1, error: altError1 } = await supabase
                .from('diss_table')
                .select('*')
                .eq('title', item.guide_title || item.title)
                .order('id', { ascending: true });
              
              console.log("Alternative query 1 (title):", { data: altSteps1, error: altError1 });
              
              if (altSteps1 && altSteps1.length > 0) {
                allSteps = altSteps1;
                stepsError = null;
              } else {
                // Try with guide_id if available
                const { data: altSteps2, error: altError2 } = await supabase
                  .from('diss_table')
                  .select('*')
                  .eq('guide_id', item.id)
                  .order('id', { ascending: true });
                
                console.log("Alternative query 2 (guide_id):", { data: altSteps2, error: altError2 });
                
                if (altSteps2 && altSteps2.length > 0) {
                  allSteps = altSteps2;
                  stepsError = null;
                }
              }
            }
            
            // If still no steps found, try a broader search
            if (!allSteps || allSteps.length === 0) {
              console.log("No steps found with standard queries, trying broader search...");
              const { data: broadSearch, error: broadError } = await supabase
                .from('diss_table')
                .select('*')
                .order('id', { ascending: true });
                
              console.log("Broad search result:", { data: broadSearch, error: broadError, count: broadSearch?.length });
              
              if (broadSearch && broadSearch.length > 0) {
                console.log("All available guide_titles in diss_table:", [...new Set(broadSearch.map(s => s.guide_title))]);
                console.log("Looking for guide_title:", item.guide_title || item.title);
                
                // Filter steps that might match this guide
                const matchingSteps = broadSearch.filter(step => 
                  step.guide_title === (item.guide_title || item.title) ||
                  step.title === (item.guide_title || item.title) ||
                  step.guide_id === item.id ||
                  (step.guide_title && (item.guide_title || item.title) && 
                   step.guide_title.toLowerCase().includes((item.guide_title || item.title).toLowerCase())) ||
                  (step.title && (item.guide_title || item.title) && 
                   step.title.toLowerCase().includes((item.guide_title || item.title).toLowerCase()))
                );
                console.log("Matching steps found:", matchingSteps.length, matchingSteps.map(s => ({ id: s.id, guide_title: s.guide_title, title: s.title })));
                if (matchingSteps.length > 0) {
                  allSteps = matchingSteps;
                }
              }
            }
            
            // Combine first step with all steps from diss_table
       // Combine first step with all steps from diss_table
let finalSteps: Step[] = [];

// Add the first step from disassembly-guides
if (firstStep) {
  finalSteps.push(firstStep);
}

// Add all unique steps from diss_table (skip duplicates of Step 1)
if (allSteps && allSteps.length > 0) {
  const additionalSteps = allSteps
    .filter((step, index) => {
  // Only skip the first step if it's obviously duplicated
  const isDuplicate = firstStep &&
    (step.step_number === 1 || 
     step.title === firstStep.title ||
     step.step_des === firstStep.step_des);

  return !isDuplicate;
})
    .map((step, index) => {
      return {
        id: step.id || `${item.id}-step-${index + 2}`,
        title: step.step_des || step.title || `Step ${index + 2}`,
        description: step.procedure || step.step_description || step.description || '',
		step_description: step.procedure || step.step_description || step.description || '',
procedure: step.procedure || '', // ✅ explicitly store procedure
        imageUrl: step.image_url || undefined,
        videoUrl: step.video_url || undefined,
        step_number: step.step_number || index + 2,
        step_description: step.step_description || step.description || '',
        step_des: step.step_des || step.title || '',
        image_url: step.image_url
      };
    });

  finalSteps = [...finalSteps, ...additionalSteps];
}

// Sort by step number
finalSteps.sort((a, b) => (a.step_number || 0) - (b.step_number || 0));
            return {
              id: item.id || String(item.id),
              title: item.title || item.guide_title || "Untitled Guide",
              guide_title: item.guide_title || item.title,
              model: item.model || item.device_model || item.computer_model || "Generic Model",
              category: item.category || "Uncategorized",
              difficulty: item.difficulty?.toLowerCase() || "medium",
              time: item.time || item.estimated_time || "30 minutes",
              description: item.description || "",
              steps: finalSteps,
              createdBy: item.created_by || item.author_id || "admin"
            };
          }));
          
          setGuides(formattedGuides);

          // Extract unique models from guides
          const models = [...new Set(formattedGuides.map(guide => guide.model))].filter(Boolean);
          if (models.length > 0) {
            setComputerModels(models);
          } else {
            // Load models from localStorage as fallback
            loadModelsFromLocalStorage();
          }

          // Update localStorage with the latest data for offline use
          localStorage.setItem('disassemblyGuides', JSON.stringify(formattedGuides));
        } else {
          // No data found in Supabase, load from localStorage
          loadFromLocalStorage();
        }
      } catch (err) {
        console.error("Error in loadGuidesFromSupabase:", err);
        setError("An unexpected error occurred while loading guides");
        // Fallback to localStorage
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    }

    function loadFromLocalStorage() {
      // Load guides from localStorage
      const storedGuides = localStorage.getItem('disassemblyGuides');
      
      if (storedGuides) {
        try {
          const parsedGuides = JSON.parse(storedGuides);
          setGuides(parsedGuides);
          
          // Extract unique models
          const models = [...new Set(parsedGuides.map((guide: Guide) => guide.model))].filter(Boolean);
          if (models.length > 0) {
            setComputerModels(models);
          } else {
            loadModelsFromLocalStorage();
          }
        } catch (e) {
          console.error("Error parsing stored guides:", e);
          initializeWithSampleGuides();
        }
      } else {
        // Initialize with sample guides if none exist
        initializeWithSampleGuides();
      }
      setLoading(false);
    }

    function loadModelsFromLocalStorage() {
      // Load computer models from localStorage if available
      const storedModels = localStorage.getItem('computerModels');
      if (storedModels) {
        try {
          const models = JSON.parse(storedModels);
          if (Array.isArray(models) && models.length > 0) {
            setComputerModels(models);
          } else {
            setComputerModels([
              "ThinkPad T490",
              "ThinkPad X1 Carbon",
              "HP EliteBook 840",
              "Dell XPS 13",
              "MacBook Pro 13",
              "Asus ZenBook",
              "Surface Pro 7",
            ]);
          }
        } catch (error) {
          console.error("Error parsing computer models:", error);
          setComputerModels([
            "ThinkPad T490",
            "ThinkPad X1 Carbon",
            "HP EliteBook 840",
            "Dell XPS 13",
            "MacBook Pro 13",
            "Asus ZenBook",
            "Surface Pro 7",
          ]);
        }
      } else {
        setComputerModels([
          "ThinkPad T490",
          "ThinkPad X1 Carbon",
          "HP EliteBook 840",
          "Dell XPS 13",
          "MacBook Pro 13",
          "Asus ZenBook",
          "Surface Pro 7",
        ]);
      }
    }

    function initializeWithSampleGuides() {
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

    // Load guides from Supabase first, fallback to localStorage
    loadGuidesFromSupabase();
  }, []);

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          guide.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          guide.model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModel = selectedModel === "all" || guide.model === selectedModel;
    const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
    
    return matchesSearch && matchesModel && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
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

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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
            <div className="space-y-6">
              {filteredGuides.map((guide) => (
                <Card key={guide.id} className="border border-blue-200 shadow-sm rounded-xl overflow-hidden bg-white">
  <div className="flex flex-col md:flex-row">
    {/* Preview Image Column */}
    {guide.steps && guide.steps.length > 0 && (guide.steps[0].image_url || guide.steps[0].imageUrl) && (
      <div className="md:w-1/3 bg-gray-50 flex items-center justify-center overflow-hidden border-r border-blue-200">
        <img
          src={guide.steps[0].image_url || guide.steps[0].imageUrl}
          alt={`Preview of ${guide.title}`}
              className="w-full h-full object-cover max-h-80 md:max-h-[300px]" // 🔧 Add max height
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/images/placeholder.jpg';
          }}
        />
      </div>
    )}
    
    {/* Guide Information Column */}
    <div className={`${guide.steps && guide.steps.length > 0 && (guide.steps[0].image_url || guide.steps[0].imageUrl) ? 'md:w-2/3' : 'w-full'}`}>
      <CardHeader className="bg-blue-50 px-6 py-4 border-b border-blue-200">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-blue-900">{guide.title}</CardTitle>
            <CardDescription className="text-blue-700 mt-1">{guide.model}</CardDescription>
          </div>
          <Badge className={`text-xs ${getDifficultyColor(guide.difficulty)} border`}>
            {guide.difficulty}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-blue-600 mt-2 space-x-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{guide.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Laptop className="h-4 w-4" />
            <span>{guide.model}</span>
          </div>
          <div className="flex items-center gap-1">
            <Wrench className="h-4 w-4" />
            <span>{guide.category}</span>
          </div>
        </div>
        <p className="text-sm text-blue-700 mt-2">{guide.description}</p>
      </CardHeader>

      <CardContent className="p-6 bg-blue-25">
        {guide.steps && guide.steps.length > 0 ? (
          <>
            <h4 className="font-semibold mb-4 text-blue-900 text-lg">Steps ({guide.steps.length})</h4>
            <Accordion type="single" collapsible={true} className="w-full">
              {guide.steps.map((step, index) => (
                <AccordionItem key={step.id || index} value={`step-${index}`}>
                  <AccordionTrigger className="text-left bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-md">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 flex-1">
                        <Badge variant="outline" className="text-xs bg-white text-blue-800 border-blue-300">
                          Step {step.step_number || index + 1}
                        </Badge>
                        {/* Display the title/description only if it's not a generic "Step X" title */}
                        {(!/^step\s*\d+$/i.test(step.step_des || step.title || '')) && (
                          <div className="text-sm font-semibold text-blue-900">
                            {step.step_des || step.title || step.step_description || step.description}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-blue-600 font-medium px-2 py-1 bg-white/50 rounded whitespace-nowrap ml-3">Show more</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-white px-4 py-4 rounded-b-lg border border-t-0 border-blue-100">
                    <div className="flex flex-col md:flex-row gap-6">
                      {(step.image_url || step.imageUrl || step.videoUrl) && (
                        <div className="w-full md:w-1/2">
                          {(step.image_url || step.imageUrl) && (
                            <div className="rounded-lg overflow-hidden border shadow-sm mb-4">
                              <img
                                src={step.image_url || step.imageUrl}
                                alt={step.title || `Step ${index + 1}`}
                                className="w-full h-auto object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = '/images/placeholder.jpg';
                                }}
                              />
                            </div>
                          )}

                          {step.videoUrl && (
                            <div className="rounded-lg overflow-hidden border shadow-sm">
                              <video controls className="w-full h-auto" preload="metadata">
                                <source src={step.videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}
                        </div>
                      )}

                      <div className={(step.image_url || step.imageUrl || step.videoUrl) ? 'md:w-1/2' : 'w-full'}>
                        <div className="text-blue-800 text-base leading-relaxed whitespace-pre-line">
  {step.procedure || step.step_description || step.description}
</div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        ) : (
          <div className="text-center py-8 text-blue-600">
            <p>No steps available for this guide</p>
            <Button asChild className="mt-4">
              <Link to={`/disassembly/${guide.id}`}>View Full Guide</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </div>
  </div>
</Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}