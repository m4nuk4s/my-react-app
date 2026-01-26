import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Laptop, Wrench, Clock, Loader2, AlertTriangle, Activity, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BackVideo from "@/assets/wtpth/backvi.mp4";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- STYLING CONSTANTS (Matched from Windows.tsx) ---
const outlinePillButton =
  "relative rounded-md px-6 py-2 text-sm font-medium " +
  "text-slate-900 dark:text-white bg-transparent " +
  "transition-all duration-300 ease-in-out transform " +
  "hover:bg-slate-100 dark:hover:bg-red-600/20 " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400/40 " +
  "before:absolute before:inset-0 before:rounded-md before:border-2 " +
  "before:border-red-600 dark:before:border-red-600 before:opacity-0 " +
  "hover:before:opacity-100 active:scale-95";

const tileClassName = (index: number, hoveredCard: number | null) => 
  `group relative overflow-hidden rounded-2xl border p-8 backdrop-blur-md transition-all duration-500
  ${hoveredCard === index 
    ? 'translate-x-4 shadow-2xl bg-white dark:bg-zinc-900 border-red-600' 
    : 'bg-white/40 border-slate-200/50 dark:bg-white/5 dark:border-white/10'
  }`;

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" } 
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const categoryIcons: Record<string, React.ReactNode> = {
  "Keyboard": <Search className="h-4 w-4" />,
  "Display": <Laptop className="h-4 w-4" />,
  "Battery": <Clock className="h-4 w-4" />,
  "Motherboard": <Wrench className="h-4 w-4" />,
  "Storage": <Download className="h-4 w-4" />,
  "Memory": <Download className="h-4 w-4" />,
  "Full Disassembly": <Wrench className="h-4 w-4" />,
  "All Categories": <Laptop className="h-4 w-4" />
};

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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
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
    async function loadGuidesFromSupabase() {
      setLoading(true);
      try {
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
            
            let { data: allSteps, error: stepsError } = await supabase
              .from('diss_table')
              .select('*')
              .ilike('guide_title', `%${item.guide_title || item.title}%`)
              .order('id', { ascending: true });
            
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
    <div className="relative min-h-screen transition-colors duration-700 overflow-hidden font-sans bg-[#f8f9fa] dark:bg-[#050505] text-slate-900 dark:text-white">
      {/* BACKGROUND - Matches Windows.tsx exactly */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          className="w-full h-full object-cover transition-opacity duration-1000 grayscale opacity-40 contrast-125 dark:opacity-40" 
          autoPlay loop muted playsInline
        >
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 transition-all duration-700 bg-gradient-to-r from-[#f8f9fa]/60 via-[#f8f9fa]/20 to-transparent dark:from-[#050505] dark:via-[#050505]/80 dark:to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Hero Section - Matches Windows.tsx */}
        <section className="h-[40vh] flex items-center">
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="mb-6 flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase text-slate-600 dark:text-zinc-500">
                <Activity size={14} className="text-red-600 animate-pulse" /> DISASSEMBLY // HARDWARE_GUIDES
              </div>
              
              <h1 className="text-4xl md:text-[5rem] font-black tracking-[-0.05em] uppercase leading-[0.8] text-slate-950 dark:text-white mb-6">
                Hardware <br />
                <span className="outline-text">Disassembly</span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 font-medium">
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
            <Alert variant="destructive" className="bg-red-950/20 border-red-600/50 text-white rounded-2xl backdrop-blur-md">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="font-bold">Database Error</AlertTitle>
              <AlertDescription className="font-medium">
                {error}
              </AlertDescription>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase tracking-wider"
              >
                Try Again
              </Button>
            </Alert>
          ) : (
            <>
              {/* Filter Bar - Matched to Windows.tsx tabs styling */}
              <div className="bg-white/40 backdrop-blur-md border border-slate-200/50 dark:bg-white/5 dark:border-white/10 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-zinc-400" />
                    <Input
                      placeholder="Search guides..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-600 dark:placeholder:text-zinc-400 focus:ring-2 focus:ring-red-600/50"
                    />
                  </div>
                  
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600/50">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200/50 dark:border-white/10">
                      <SelectItem value="all" className="hover:bg-red-600/10">
                        <div className="flex items-center gap-2">
                          <Laptop className="h-4 w-4 text-red-600" />
                          <span>All Models</span>
                        </div>
                      </SelectItem>
                      {computerModels.map((m) => (
                        <SelectItem key={m} value={m} className="hover:bg-red-600/10">
                          <div className="flex items-center gap-2">
                            <Laptop className="h-4 w-4 text-red-600" />
                            <span>{m}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-600/50">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200/50 dark:border-white/10">
                      <SelectItem value="all" className="hover:bg-red-600/10">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-red-600" />
                          <span>All Categories</span>
                        </div>
                      </SelectItem>
                      {categories
                        .filter((c) => c !== "All Categories")
                        .map((c) => (
                          <SelectItem key={c} value={c} className="hover:bg-red-600/10">
                            <div className="flex items-center gap-2">
                              <span className="text-red-600">
                                {categoryIcons[c] || <Wrench className="h-4 w-4" />}
                              </span>
                              <span>{c}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Guides List */}
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {filteredGuides.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="text-center py-20 bg-white/40 backdrop-blur-md border border-slate-200/50 dark:bg-white/5 dark:border-white/10 rounded-2xl"
                    >
                      <Laptop className="h-16 w-16 text-slate-600 dark:text-zinc-600 mx-auto mb-4" />
                      <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-2">No guides found</h2>
                      <p className="text-slate-600 dark:text-zinc-400 font-medium">
                        Try adjusting your search criteria
                      </p>
                    </motion.div>
                  ) : (
                    filteredGuides.map((guide, index) => (
                      <motion.div
                        key={guide.id}
                        
                       
                        variants={cardVariants}
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                        whileHover={{ y: -8 }}
                        className={tileClassName(index, hoveredCard)}
                      >
                        {/* Hover aura effect from Windows.tsx */}
                        <AnimatePresence>
                          {hoveredCard === index && (
                            <motion.div 
                              layoutId="hoverAura"
                              className="absolute inset-0 bg-red-600/5 blur-3xl -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            />
                          )}
                        </AnimatePresence>

                        <div className="flex flex-col lg:flex-row items-start relative">
                          {/* Left Column: Preview Image Container */}
                          {guide.steps && guide.steps.length > 0 && (guide.steps[0].image_url || guide.steps[0].imageUrl) && (
                            <div className="lg:w-1/4 w-full flex-shrink-0 lg:sticky lg:top-[30vh] p-6 z-20">
                              <div className="bg-black/40 overflow-hidden rounded-xl border border-white/10 shadow-2xl aspect-video flex items-center justify-center">
                                <img
                                  src={guide.steps[0].image_url || guide.steps[0].imageUrl}
                                  alt={guide.title}
                                  className="w-full h-full object-contain p-2" 
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Right Column: Info */}
                          <div className="flex-1 p-8 border-l border-slate-200/50 dark:border-white/10">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                              <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
                                  {guide.title}
                                </h2>
                                <p className="text-red-600 font-bold text-sm mt-1 font-mono">{guide.model}</p>
                              </div>
                              <Badge className={`${getDifficultyColor(guide.difficulty)} uppercase text-[10px] tracking-widest px-3 font-black`}>
                                {guide.difficulty}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-zinc-400 mb-6 font-bold">
                              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-red-600" /> {guide.time}</div>
                              <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-red-600" /> {guide.category}</div>
                            </div>

                            <p className="text-slate-600 dark:text-zinc-400 text-sm mb-8 leading-relaxed font-medium">
                              {guide.description}
                            </p>

                            {/* Steps Accordion */}
                            {guide.steps && guide.steps.length > 0 ? (
                              <Accordion type="single" collapsible className="w-full space-y-2">
                                <AccordionItem value="instruction-set" className="border-none">
                                  <AccordionTrigger className={`${outlinePillButton} border border-slate-200/50 dark:border-white/10 hover:no-underline flex justify-center bg-white/5 dark:bg-white/5 font-bold uppercase tracking-wider`}>
                                    View Full Instructions ({guide.steps.length} Steps)
                                  </AccordionTrigger>
                                  <AccordionContent className="pt-6 space-y-4">
                                    {guide.steps.map((step, idx) => (
                                      <div key={idx} className="bg-white/40 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 rounded-xl p-6 transition-all hover:border-red-500/30">
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                          {/* STEP IMAGE */}
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
                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/step:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                                                  <Search className="text-white h-6 w-6" />
                                                </div>
                                              </div>
                                            </div>
                                          )}

                                          {/* STEP TEXT */}
                                          <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-tighter">
                                                STEP {step.step_number || idx + 1}
                                              </span>
                                              <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-wide">
                                                {step.step_des || step.title}
                                              </h4>
                                            </div>
                                            <p className="text-slate-700 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line border-l border-red-600/30 pl-4 font-medium">
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
                        
                        <div className="mt-8 h-[1px] w-12 bg-slate-300 dark:bg-red-600/50 group-hover:w-full group-hover:bg-red-500 transition-all duration-500" />
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
            
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
          >
            <motion.div
              
             
              className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
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

      <style>{`
        .outline-text {
          -webkit-text-stroke: 2px #dc2626;
          color: transparent;
        }
        @media (max-width: 1024px) {
          .outline-text { -webkit-text-stroke: 1.5px #dc2626; }
        }
        @media (max-width: 640px) {
          .outline-text { -webkit-text-stroke: 1px #dc2626; }
        }
      `}</style>
    </div>
  );
}