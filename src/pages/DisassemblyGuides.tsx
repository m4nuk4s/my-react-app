import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Laptop, Wrench, Clock, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BackVideo from "@/assets/wtpth/backvi.mp4"; // Import the video
import { supabase } from "@/lib/supabase";

// --- STYLING CONSTANTS (Matched from Windows.tsx) ---
const outlinePillButton =
  "relative rounded-md px-6 py-2 text-sm font-medium " +
  "text-gray-900 dark:text-gray-100 bg-transparent " +
  "transition-all duration-300 ease-in-out transform " +
  "hover:bg-gray-100 dark:hover:bg-red-600/20 " +
  "focus:outline-none focus:ring-2 focus:ring-gray-400/40 " +
  "before:absolute before:inset-0 before:rounded-md before:border-2 " +
  "before:border-red-500 dark:before:border-white before:opacity-0 " +
  "hover:before:opacity-100 active:scale-95";

const tileClassName = "group relative  rounded-2xl backdrop-blur-xl border shadow-sm transition-colors duration-300 " + 
                       "bg-white/90 border-slate-200 " + 
                       "dark:bg-zinc-900/90 dark:border-white/10";

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" } 
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

// Type definitions for guides from diss_table
type Step = {
  id?: string;
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
  guide_title: string;
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
const [zoomedImage, setZoomedImage] = useState<string | null>(null);
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
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") setZoomedImage(null);
  };
  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, []);
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
          loadFromLocalStorage();
          return;
        }

        if (data && data.length > 0) {
          const formattedGuides = await Promise.all(data.map(async (item) => {
            // Logic for Step 1 Parsing
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
                firstStep = { ...fallbackStep };
              } else {
                firstStep = fallbackStep;
              }
            } catch (e) {
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
            let { data: allSteps, error: stepsError } = await supabase
              .from('diss_table')
              .select('*')
              .ilike('guide_title', `%${item.guide_title || item.title}%`)
              .order('id', { ascending: true });
            
            // Handle alternative query paths (Original Logic)
            if (stepsError || !allSteps || allSteps.length === 0) {
              const { data: altSteps } = await supabase.from('diss_table').select('*').eq('title', item.guide_title || item.title);
              if (altSteps && altSteps.length > 0) allSteps = altSteps;
            }
            
            let finalSteps: Step[] = [];
            if (firstStep) finalSteps.push(firstStep);

            if (allSteps && allSteps.length > 0) {
              const additionalSteps = allSteps
                .filter((step) => {
                  const isDuplicate = firstStep && (step.step_number === 1 || step.title === firstStep.title || step.step_des === firstStep.step_des);
                  return !isDuplicate;
                })
                .map((step, index) => ({
                  id: step.id || `${item.id}-step-${index + 2}`,
                  title: step.step_des || step.title || `Step ${index + 2}`,
                  description: step.procedure || step.step_description || step.description || '',
                  step_description: step.procedure || step.step_description || step.description || '',
                  procedure: step.procedure || '',
                  imageUrl: step.image_url || undefined,
                  videoUrl: step.video_url || undefined,
                  step_number: step.step_number || index + 2,
                  step_des: step.step_des || step.title || '',
                  image_url: step.image_url
                }));
              finalSteps = [...finalSteps, ...additionalSteps];
            }

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
          const models = [...new Set(formattedGuides.map(guide => guide.model))].filter(Boolean);
          if (models.length > 0) setComputerModels(models);
          localStorage.setItem('disassemblyGuides', JSON.stringify(formattedGuides));
        } else {
          loadFromLocalStorage();
        }
      } catch (err) {
        setError("An unexpected error occurred");
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    }

    function loadFromLocalStorage() {
      const storedGuides = localStorage.getItem('disassemblyGuides');
      if (storedGuides) {
        try {
          const parsed = JSON.parse(storedGuides);
          setGuides(parsed);
          const models = [...new Set(parsed.map((g: Guide) => g.model))].filter(Boolean);
          if (models.length > 0) setComputerModels(models as string[]);
        } catch (e) { initializeWithSampleGuides(); }
      } else { initializeWithSampleGuides(); }
      setLoading(false);
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
          steps: [{ title: "Preparation", description: "Turn off the laptop and remove power.", step_number: 1 }],
          createdBy: "admin",
          guide_title: "ThinkPad T490 Keyboard Replacement"
        }
      ];
      setGuides(initialGuides);
    }

    loadGuidesFromSupabase();
  }, []);

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          guide.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = selectedModel === "all" || guide.model === selectedModel;
    const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
    return matchesSearch && matchesModel && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50';
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
      {/* Background Video Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video className="w-full h-full object-cover opacity-40 contrast-125 saturate-100" autoPlay loop muted playsInline>
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="h-[35vh] flex items-center">
          <div className="container mx-auto px-6">
            <motion.div initial="hidden" animate="visible" variants={cardVariants} className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white mb-4">
                Hardware <span className="font-bold uppercase text-red-600">Disassembly</span>
              </h1>
              <p className="text-lg text-zinc-200 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 drop-shadow-md">
                Step-by-step technical guides for repairing and maintaining Thomson devices.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-6 pb-20 space-y-10">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-red-600" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="bg-red-950/20 border-red-600/50 text-white rounded-xl backdrop-blur-md">
              <AlertTriangle className="h-4 w-4" />
              <CardDescription className="text-white">{error}</CardDescription>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-red-600 text-red-600 hover:bg-red-600 hover:text-white">Try Again</Button>
            </Alert>
          ) : (
            <>
              {/* Filter Bar */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        placeholder="Search guides..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-black/40 border-white/10 text-white focus:ring-red-600"
                      />
                    </div>
                    
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue placeholder="Model" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="all">All Models</SelectItem>
                        {computerModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.filter(c => c !== "All Categories").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              {/* Guides List */}
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {filteredGuides.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                      <Laptop className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold">No guides found</h2>
                    </motion.div>
                  ) : (
                    filteredGuides.map((guide) => (
                      <motion.div
                        key={guide.id}
                        layout
                        initial="hidden" animate="visible" exit="exit"
                        variants={cardVariants}
                        className={tileClassName}
                      >
                       <div className="flex flex-col lg:flex-row items-start relative">
{/* Left Column: Preview Image Container */}
  {guide.steps && guide.steps.length > 0 && (guide.steps[0].image_url || guide.steps[0].imageUrl) && (
    <div className="lg:w-1/4 w-full flex-shrink-0 lg:sticky lg:top-[30vh] p-6 z-20">
      {/* lg:sticky: Makes it follow the scroll.
         lg:top-[30vh]: Positions it toward the center of the screen.
      */}
      <div className="bg-black/40 overflow-hidden rounded-xl border border-white/10 shadow-2xl aspect-video flex items-center justify-center">
        <img
          src={guide.steps[0].image_url || guide.steps[0].imageUrl}
          alt={guide.title}
          /* Removed group-hover:scale-105 to stop zooming. 
             Used object-contain to stop the image from being cut off. 
          */
          className="w-full h-full object-contain p-2" 
        />
      </div>
    </div>
  )}
                          
                          {/* Right Column: Info */}
                         <div className="flex-1 p-8 border-l border-white/5">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                              <div>
                                <h2 className="text-2xl font-bold text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">
                                  {guide.title}
                                </h2>
                                <p className="text-red-500 font-medium text-sm mt-1">{guide.model}</p>
                              </div>
                              <Badge className={`${getDifficultyColor(guide.difficulty)} uppercase text-[10px] tracking-widest px-3`}>
                                {guide.difficulty}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400 mb-6">
                              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-red-500" /> {guide.time}</div>
                              <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-red-500" /> {guide.category}</div>
                            </div>

                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed line-clamp-3">{guide.description}</p>

                            {/* Steps Accordion */}
                            {guide.steps && guide.steps.length > 0 ? (
                              <Accordion type="single" collapsible className="w-full space-y-2">
                                <AccordionItem value="instruction-set" className="border-none">
                                  <AccordionTrigger className={`${outlinePillButton} border border-white/10 hover:no-underline flex justify-center bg-white/5`}>
                                    View Full Instructions ({guide.steps.length} Steps)
                                  </AccordionTrigger>
                                  <AccordionContent className="pt-6 space-y-4">
                                 {guide.steps.map((step, idx) => (
  <div key={idx} className="bg-black/40 border border-white/5 rounded-xl p-6 transition-all hover:border-red-500/30">
    <div className="flex flex-col md:flex-row gap-6 items-start">
      
    {/* STEP IMAGE (LEFT) - Large size with 'Contain' fit */}
{(step.image_url || step.imageUrl) && (
  <div 
    className="w-full md:w-80 h-52 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 cursor-zoom-in group/step relative bg-zinc-900/50"
    onClick={() => setZoomedImage(step.image_url || step.imageUrl || null)}
  >
    <img 
      src={step.image_url || step.imageUrl} 
      className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover/step:scale-105" 
      alt={step.title} 
    />
    {/* Hover Overlay Icon */}
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/step:opacity-100 transition-opacity flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
        <Search className="text-white h-6 w-6" />
      </div>
    </div>
  </div>
)}

      {/* STEP TEXT (RIGHT) */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-tighter">
            STEP {step.step_number || idx + 1}
          </span>
          <h4 className="font-bold text-white uppercase text-sm tracking-wide">
            {step.step_des || step.title}
          </h4>
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line border-l border-red-600/30 pl-4">
          {step.procedure || step.step_description || step.description}
        </p>
      </div>
    </div>
  </div>
))}	
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            ) : (
                              <Button asChild variant="ghost" className={outlinePillButton}>
                                <Link to={`/disassembly/${guide.id}`}>Open Detailed Guide</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
		
		
      </div>
{/* Image Zoom Modal */}
<AnimatePresence>
  {zoomedImage && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setZoomedImage(null)}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
      >
        <img
          src={zoomedImage}
          alt="Zoomed step"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:bg-white/10"
          onClick={() => setZoomedImage(null)}
        >
          <span className="text-2xl">×</span>
        </Button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>	  
    </div>
	
  );
}