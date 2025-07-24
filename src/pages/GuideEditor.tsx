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
      // First try to get unique models from down1 table
      const { data: down1Models, error: down1Error } = await supabase
        .from('down1')
        .select('model')
        .order('model');
      
      // Then try to get models from the models table
      const { data: supabaseModels, error } = await supabase
        .from(APP_MODELS_TABLE)
        .select('model_name');
      
      let allModels: string[] = [];
      
      // Process models from down1 table
      if (!down1Error && down1Models && down1Models.length > 0) {
        console.log("Found models in down1 table:", down1Models);
        // Get unique models from down1 table
        const down1ModelNames = [...new Set(down1Models.map(item => item.model))];
        allModels = [...down1ModelNames];
      }
      
      // Add models from models table if available
      if (!error && supabaseModels && supabaseModels.length > 0) {
        const modelNames = supabaseModels.map(item => item.model_name);
        // Add models that aren't already in the list
        modelNames.forEach(model => {
          if (!allModels.includes(model)) {
            allModels.push(model);
          }
        });
      }
      
      if (allModels.length > 0) {
        // Sort alphabetically
        allModels.sort();
        setComputerModels(allModels);
        // Also update localStorage for offline access
        localStorage.setItem('computerModels', JSON.stringify(allModels));
      } else {
        // No models found in either table, try local storage
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
      console.log("Loading guide data for ID:", id);
      
      // First try to get the main guide from disassembly-guides table
      const { data: mainGuideData, error: mainGuideError } = await supabase
        .from('disassembly-guides')
        .select('*')
        .eq('id', id);
      
      if (mainGuideError) {
        console.error("Error fetching guide from disassembly-guides:", mainGuideError);
        // Try old format as fallback
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
        return;
      }
      
      if (mainGuideData && mainGuideData.length > 0) {
        // Guide found in disassembly-guides
        const mainGuide = mainGuideData[0];
        console.log("Found main guide in disassembly-guides:", mainGuide);
        
        // Set main guide details
        setGuideTitle(mainGuide.guide_title || mainGuide.title || "");
        setGuideModel(mainGuide.computer_model || mainGuide.model || "");
        setGuideCategory(mainGuide.category || "");
        setGuideDifficulty(mainGuide.difficulty?.toLowerCase() || "easy");
        setGuideTime(mainGuide.estimated_time || mainGuide.time || "");
        setGuideDescription(mainGuide.description || "");
        
        // Create step 1 from the main guide data
        const step1 = {
          title: mainGuide.step_des || "Step 1",
          description: mainGuide.procedure || mainGuide.step_description || mainGuide.description || "",
          imageUrl: mainGuide.image_url || ""
        };
        
        // Now fetch additional steps from diss_table using guide_title
        const { data: additionalSteps, error: stepsError } = await supabase
          .from('diss_table')
          .select('*')
          .ilike('guide_title', `%${mainGuide.guide_title}%`)
          .order('id', { ascending: true });
        
        console.log("Additional steps query result:", { data: additionalSteps, error: stepsError });
        
        let allSteps = [step1];
        
        if (!stepsError && additionalSteps && additionalSteps.length > 0) {
          // Convert additional steps to match our Step format
          const formattedAdditionalSteps = additionalSteps.map((step) => ({
            title: step.step_des || `Step ${allSteps.length + 1}`,
            description: step.procedure || step.step_description || "",
            imageUrl: step.image_url || ""
          }));
          
          allSteps = [...allSteps, ...formattedAdditionalSteps];
        }
        
        setGuideSteps(allSteps);
        setIsLoading(false);
      } else {
        // No guide found in disassembly-guides, try local storage
        console.log("No guide found in disassembly-guides, falling back to localStorage");
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error("Error loading guide data:", error);
      toast.error("Failed to load guide data");
      loadFromLocalStorage();
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
      
      // First, save to disassembly-guides table (step 1)
      const mainGuideData = {
        guide_title: guideTitle,
        computer_model: guideModel,
        category: guideCategory,
        difficulty: guideDifficulty,
        estimated_time: guideTime,
        description: guideDescription,
        // First step details
        step_des: guideSteps[0]?.title || "Step 1",
        step_description: guideSteps[0]?.description || "",
        procedure: guideSteps[0]?.description || "",
        image_url: guideSteps[0]?.imageUrl || "",
      };

      console.log("Saving main guide data:", mainGuideData);
      
      let mainGuideId;
      
      if (isNew) {
        // Insert new guide
        const { data: newGuideData, error: insertError } = await supabase
          .from('disassembly-guides')
          .insert(mainGuideData)
          .select();
          
        if (insertError) {
          console.error("Error inserting guide to disassembly-guides:", insertError);
          throw insertError;
        }
        
        mainGuideId = newGuideData?.[0]?.id;
        console.log("Created new guide with ID:", mainGuideId);
      } else {
        // Update existing guide
        const { error: updateError } = await supabase
          .from('disassembly-guides')
          .update(mainGuideData)
          .eq('id', id);
          
        if (updateError) {
          console.error("Error updating guide in disassembly-guides:", updateError);
          throw updateError;
        }
        
        mainGuideId = id;
        console.log("Updated existing guide with ID:", mainGuideId);
      }

      // Delete any existing additional steps for this guide
      const { error: deleteError } = await supabase
        .from('diss_table')
        .delete()
        .eq('guide_title', guideTitle);
        
      if (deleteError) {
        console.warn("Error deleting existing steps from diss_table:", deleteError);
        // Continue anyway since this might be a new guide
      }
      
      // Add all additional steps to diss_table (step 2+)
      if (guideSteps.length > 1) {
        const additionalSteps = guideSteps.slice(1).map((step, index) => ({
          guide_title: guideTitle,
          step_des: step.title || `Step ${index + 2}`,
          step_description: step.description,
          procedure: step.description,
          image_url: step.imageUrl || "",
        }));
        
        console.log("Saving additional steps:", additionalSteps);
        
        const { error: stepsError } = await supabase
          .from('diss_table')
          .insert(additionalSteps);
          
        if (stepsError) {
          console.error("Error inserting steps to diss_table:", stepsError);
          throw stepsError;
        }
      }
      
      // Also maintain compatibility with the old system
      const storedGuides = localStorage.getItem('disassemblyGuides') || '[]';
      const guides = JSON.parse(storedGuides);
      
      const newGuide: Guide = {
        id: isNew ? (mainGuideId?.toString() || uuidv4()) : id as string,
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
      
      // Save to localStorage for backwards compatibility
      localStorage.setItem('disassemblyGuides', JSON.stringify(updatedGuides));
      
      // For legacy app_guides table compatibility
      const result = await saveGuideToSupabase(newGuide);
      
      toast.success(`Guide ${isNew ? "created" : "updated"} successfully!`);
      navigate("/admin");
    } catch (error) {
      console.error("Error saving guide:", error);
      toast.error(`Failed to save guide: ${error.message || 'Unknown error'}`);
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
                  <div className="flex gap-2">
                    <div className="flex-grow">
                      <Input 
                        id="model" 
                        placeholder="Type or select a model name" 
                        value={guideModel}
                        onChange={(e) => setGuideModel(e.target.value)}
                      />
                    </div>
                    <div className="flex-shrink-0">
                      <Select onValueChange={(value) => setGuideModel(value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {computerModels.map((model) => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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