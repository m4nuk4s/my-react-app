import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Plus, X, ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "../lib/supabase";

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

const GuideEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const isNew = id === "new" || !id;

  const [isLoading, setIsLoading] = useState(true);
  const [guideTitle, setGuideTitle] = useState("");
  const [guideModel, setGuideModel] = useState("");
  const [guideCategory, setGuideCategory] = useState("");
  const [guideDifficulty, setGuideDifficulty] = useState("easy");
  const [guideTime, setGuideTime] = useState("");
  const [guideDescription, setGuideDescription] = useState("");
  const [guideSteps, setGuideSteps] = useState<Step[]>([{ title: "Step 1", description: "", imageUrl: "" }]);
  const [computerModels, setComputerModels] = useState<string[]>([]);

  // Categories for guides
  const categories = [
    "Keyboard",
    "Display",
    "Battery",
    "Motherboard",
    "Storage",
    "Memory",
    "Full Disassembly",
  ];

  useEffect(() => {
    // Check if user is admin, if not redirect to home
    if (!user || !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
      return;
    }

    loadComputerModels();

    // If editing an existing guide, load its data
    if (!isNew) {
      loadGuideData();
    } else {
      setIsLoading(false);
    }
  }, [user, isAdmin, navigate, isNew, id]);

  // App-specific table name for computer models
  const APP_MODELS_TABLE = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_models';
  
  const loadComputerModels = async () => {
    try {
      // First try to get models from Supabase
      const { data: supabaseModels, error } = await supabase
        .from(APP_MODELS_TABLE)
        .select('model_name');
      
      if (error) {
        console.error("Error fetching models from Supabase:", error);
        // Fallback to local storage if Supabase fails
        loadModelsFromLocalStorage();
      } else if (supabaseModels && supabaseModels.length > 0) {
        // Models found in Supabase
        const modelNames = supabaseModels.map(item => item.model_name);
        setComputerModels(modelNames);
        // Also update localStorage for offline access
        localStorage.setItem('computerModels', JSON.stringify(modelNames));
      } else {
        // No models found in Supabase, try local storage
        loadModelsFromLocalStorage();
      }
    } catch (error) {
      console.error("Error loading computer models:", error);
      toast.error("Failed to load computer models");
      loadModelsFromLocalStorage();
    }
  };
  
  const loadModelsFromLocalStorage = () => {
    try {
      const storedModels = localStorage.getItem('computerModels');
      if (storedModels) {
        setComputerModels(JSON.parse(storedModels));
      } else {
        const defaultModels = [
          "UKN15I711-8GR512",
          "UKN15I310-8DG256-IF1599445",
          "UA-N15C8SL512",
        ];
        setComputerModels(defaultModels);
        localStorage.setItem('computerModels', JSON.stringify(defaultModels));
      }
    } catch (error) {
      console.error("Error loading computer models from localStorage:", error);
      toast.error("Failed to load computer models");
    }
  };

  const loadGuideData = async () => {
    try {
      // First try to get the guide from Supabase
      const { data: supabaseGuides, error } = await supabase
        .from(APP_GUIDES_TABLE)
        .select('*')
        .eq('id', id);
      
      if (error) {
        console.error("Error fetching guide from Supabase:", error);
        // Fallback to local storage if Supabase fails
        loadFromLocalStorage();
      } else if (supabaseGuides && supabaseGuides.length > 0) {
        // Guide found in Supabase
        const guide = supabaseGuides[0];
        setGuideTitle(guide.title);
        setGuideModel(guide.model);
        setGuideCategory(guide.category);
        setGuideDifficulty(guide.difficulty);
        setGuideTime(guide.time);
        setGuideDescription(guide.description);
        setGuideSteps(guide.steps || [{ title: "Step 1", description: "", imageUrl: "" }]);
        setIsLoading(false);
      } else {
        // Guide not found in Supabase, try local storage
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error("Error loading guide data:", error);
      toast.error("Failed to load guide data");
      setIsLoading(false);
    }
  };
  
  const loadFromLocalStorage = () => {
    try {
      const storedGuides = localStorage.getItem('disassemblyGuides');
      if (storedGuides) {
        const guides = JSON.parse(storedGuides);
        const guide = guides.find((g: Guide) => g.id === id);
        
        if (guide) {
          setGuideTitle(guide.title);
          setGuideModel(guide.model);
          setGuideCategory(guide.category);
          setGuideDifficulty(guide.difficulty);
          setGuideTime(guide.time);
          setGuideDescription(guide.description);
          setGuideSteps(guide.steps || [{ title: "Step 1", description: "", imageUrl: "" }]);
        } else {
          toast.error("Guide not found");
          navigate("/admin");
        }
      }
    } catch (error) {
      console.error("Error loading guide data from localStorage:", error);
      toast.error("Failed to load guide data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStep = () => {
    setGuideSteps([
      ...guideSteps,
      { 
        title: `Step ${guideSteps.length + 1}`,
        description: "",
        imageUrl: ""
      }
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (guideSteps.length > 1) {
      const updatedSteps = guideSteps.filter((_, i) => i !== index);
      // Rename steps to keep them sequential
      const renamedSteps = updatedSteps.map((step, i) => ({
        ...step,
        title: `Step ${i + 1}`
      }));
      setGuideSteps(renamedSteps);
    } else {
      toast.error("A guide must have at least one step");
    }
  };

  const handleUpdateStep = (index: number, field: 'title' | 'description' | 'imageUrl', value: string) => {
    const updatedSteps = [...guideSteps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setGuideSteps(updatedSteps);
  };

  // App-specific table name for guides
  const APP_GUIDES_TABLE = 'app_8e3e8a4d8d0e442280110fd6f6c2cd95_guides';
  
  const saveGuideToSupabase = async (guide: Guide) => {
    try {
      // Check if the guide exists in Supabase
      const { data: existingGuides, error: fetchError } = await supabase
        .from(APP_GUIDES_TABLE)
        .select('*')
        .eq('id', guide.id);
      
      if (fetchError) throw fetchError;
      
      if (existingGuides && existingGuides.length > 0) {
        // Update existing guide
        const { error } = await supabase
          .from(APP_GUIDES_TABLE)
          .update(guide)
          .eq('id', guide.id);
          
        if (error) throw error;
        return { success: true, action: 'updated' };
      } else {
        // Insert new guide
        const { error } = await supabase
          .from(APP_GUIDES_TABLE)
          .insert([guide]);
          
        if (error) throw error;
        return { success: true, action: 'inserted' };
      }
    } catch (error) {
      console.error('Error saving guide to Supabase:', error);
      return { success: false, error };
    }
  };

  const handleSaveGuide = async () => {
    // Basic validation
    if (!guideTitle.trim()) {
      toast.error("Guide title is required");
      return;
    }
    
    if (!guideModel) {
      toast.error("Please select a computer model");
      return;
    }
    
    if (!guideCategory) {
      toast.error("Please select a category");
      return;
    }

    if (!guideTime.trim()) {
      toast.error("Estimated time is required");
      return;
    }

    if (!guideDescription.trim()) {
      toast.error("Guide description is required");
      return;
    }

    // Validate steps
    const invalidStep = guideSteps.findIndex(step => !step.description.trim());
    if (invalidStep !== -1) {
      toast.error(`Step ${invalidStep + 1} is missing a description`);
      return;
    }

    try {
      setIsLoading(true);
      const storedGuides = localStorage.getItem('disassemblyGuides') || '[]';
      const guides = JSON.parse(storedGuides);
      
      const newGuide: Guide = {
        id: isNew ? uuidv4() : id as string,
        title: guideTitle,
        model: guideModel,
        category: guideCategory,
        difficulty: guideDifficulty,
        time: guideTime,
        description: guideDescription,
        steps: guideSteps,
        createdBy: user?.username || "admin"
      };
      
      let updatedGuides;
      if (isNew) {
        updatedGuides = [...guides, newGuide];
      } else {
        updatedGuides = guides.map((guide: Guide) => 
          guide.id === id ? newGuide : guide
        );
      }
      
      // Save to localStorage
      localStorage.setItem('disassemblyGuides', JSON.stringify(updatedGuides));
      
      // Save to Supabase
      const result = await saveGuideToSupabase(newGuide);
      
      if (result.success) {
        toast.success(`Guide ${isNew ? "created" : "updated"} successfully and saved to Supabase!`);
        navigate("/admin");
      } else {
        toast.warning(`Guide saved locally but failed to sync with Supabase: ${result.error?.message || 'Unknown error'}`);
        navigate("/admin");
      }
    } catch (error) {
      console.error("Error saving guide:", error);
      toast.error("Failed to save guide");
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold">{isNew ? "Create New Guide" : "Edit Guide"}</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin")}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveGuide}>Save Guide</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main guide information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Guide Information</CardTitle>
              <CardDescription>Enter the basic information for this guide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Guide Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., How to Replace the Keyboard" 
                  value={guideTitle}
                  onChange={(e) => setGuideTitle(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model">Computer Model</Label>
                  <Select value={guideModel} onValueChange={setGuideModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {computerModels.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={guideCategory} onValueChange={setGuideCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={guideDifficulty} onValueChange={setGuideDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="time">Estimated Time</Label>
                  <Input 
                    id="time" 
                    placeholder="e.g., 15 minutes" 
                    value={guideTime}
                    onChange={(e) => setGuideTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide a brief overview of this guide" 
                  rows={3}
                  value={guideDescription}
                  onChange={(e) => setGuideDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview panel - can be expanded later */}
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your guide will appear to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded p-4">
                <h3 className="font-bold text-lg mb-2">{guideTitle || "Guide Title"}</h3>
                <div className="flex gap-2 text-sm text-muted-foreground mb-2">
                  <span>{guideModel || "Model"}</span>
                  <span>•</span>
                  <span>{guideCategory || "Category"}</span>
                  <span>•</span>
                  <span>{guideDifficulty === "easy" ? "Easy" : guideDifficulty === "medium" ? "Medium" : "Hard"}</span>
                  <span>•</span>
                  <span>{guideTime || "Time"}</span>
                </div>
                <p className="text-sm mb-4">{guideDescription || "Guide description will appear here"}</p>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Steps:</h4>
                  <ol className="list-decimal list-inside text-sm">
                    {guideSteps.map((step, index) => (
                      <li key={index} className="mb-1">
                        {step.title}: {step.description.substring(0, 60)}{step.description.length > 60 ? "..." : ""}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Steps section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Guide Steps</h2>
          <Button onClick={handleAddStep} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Step
          </Button>
        </div>
        
        <div className="space-y-4">
          {guideSteps.map((step, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Step {index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveStep(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`step-${index}-description`}>Step Description</Label>
                  <Textarea 
                    id={`step-${index}-description`} 
                    placeholder="Describe what to do in this step" 
                    value={step.description}
                    onChange={(e) => handleUpdateStep(index, 'description', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`step-${index}-image`}>Image URL (Optional)</Label>
                  <Input 
                    id={`step-${index}-image`} 
                    placeholder="https://example.com/image.jpg" 
                    value={step.imageUrl || ""}
                    onChange={(e) => handleUpdateStep(index, 'imageUrl', e.target.value)}
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

export default GuideEditor;