import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Laptop, Wrench, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/lib/supabase";

// Type definitions
type Step = {
  id?: number;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  step_number?: number;
  step_des?: string; // Added to handle step_des field from the database
  step_description?: string;
  image_url?: string;
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

export default function DisassemblyGuideDetail() {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGuideFromSupabase() {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        // Try to get the guide from Supabase's diss_table
        const { data: guideData, error: guideError } = await supabase
          .from('diss_table')
          .select('*')
          .eq('id', id)
          .single();
        
        if (guideError) {
          console.error("Error fetching guide from diss_table:", guideError);
          // If there's an error fetching from Supabase, try localStorage
          loadFromLocalStorage();
          return;
        }

        if (guideData) {
          // Log guide data for debugging
          console.log("Original guide data:", guideData);
          
          // Get the guide title for matching
          const linkTitle = guideData.guide_title || guideData.title || '';
          console.log("Using guide title for steps query:", linkTitle);
          
          // First try to fetch steps from the disassembly-guides table based on the requirements
          console.log("Fetching steps from disassembly-guides table with guide_title:", linkTitle);
          
          // Try multiple ways to match the guide title to increase chances of finding the right steps
          const disassemblyGuideQueries = [
            // Exact match on guide_title
            supabase.from('disassembly-guides')
              .select('step_des,step_description,image_url,id')
              .eq('guide_title', linkTitle)
              .order('id', { ascending: true }),
              
            // Match on guide_title with lowercase
            supabase.from('disassembly-guides')
              .select('step_des,step_description,image_url,id')
              .ilike('guide_title', linkTitle)
              .order('id', { ascending: true }),
              
            // Match on title field if it exists
            supabase.from('disassembly-guides')
              .select('step_des,step_description,image_url,id')
              .eq('title', linkTitle)
              .order('id', { ascending: true }),
              
            // Match using contains
            supabase.from('disassembly-guides')
              .select('step_des,step_description,image_url,id')
              .ilike('guide_title', `%${linkTitle}%`)
              .order('id', { ascending: true })
          ];
          
          // Try each query until we find results
          let disassemblySteps = null;
          let disassemblyStepsError = null;
          
          for (const queryPromise of disassemblyGuideQueries) {
            const { data, error } = await queryPromise;
            console.log("Query result:", { data, error });
            
            if (data && data.length > 0) {
              disassemblySteps = data;
              console.log("Found disassembly steps using query:", data);
              break;
            } else {
              disassemblyStepsError = error || "No data found";
            }
          }
          
          // If still no results, try querying all records and find matching ones
          if (!disassemblySteps || disassemblySteps.length === 0) {
            console.log("Trying to get all disassembly guides to find a match");
            const { data: allGuides, error: allGuidesError } = await supabase
              .from('disassembly-guides')
              .select('step_des,step_description,image_url,id,guide_title')
              .order('id', { ascending: true });
            
            console.log("All guides from disassembly-guides:", allGuides);
            
            if (allGuides && allGuides.length > 0) {
              console.log("Found some guides, trying to match with:", linkTitle);
              // Try to find guides with similar titles
              const similarGuides = allGuides.filter(g => 
                g.guide_title && 
                (
                  g.guide_title.toLowerCase().includes(linkTitle.toLowerCase()) ||
                  linkTitle.toLowerCase().includes(g.guide_title.toLowerCase())
                )
              );
              
              if (similarGuides.length > 0) {
                console.log("Found similar guides:", similarGuides);
                disassemblySteps = similarGuides;
                disassemblyStepsError = null;
              }
            } else {
              console.error("Error getting all guides:", allGuidesError);
            }
          }
          
          console.log("Disassembly steps query result:", { data: disassemblySteps, error: disassemblyStepsError });
          
          // Then fetch next steps from diss_table with the same guide_title
          console.log("Fetching next steps from diss_table...");
          const { data: nextSteps, error: nextStepsError } = await supabase
            .from('diss_table')
            .select('id, title, description, step_description, step_des, image_url, steps, guide_title')
            .eq('guide_title', linkTitle)
            .order('id', { ascending: true });
          
          console.log("Next steps query result:", { data: nextSteps, error: nextStepsError });
          
          // If there's an error with the disassembly-guides query, try the original method
          if (disassemblyStepsError) {
            console.error("Error fetching from disassembly-guides:", disassemblyStepsError);
            // Fallback to original implementation
            console.log("Falling back to original method with diss_table_steps...");
            const { data: stepsData, error: stepsError } = await supabase
              .from('diss_table_steps')
              .select('*')
              .eq('guide_title', linkTitle)
              .order('step_number', { ascending: true });
            
            console.log("Original fallback steps query result:", { data: stepsData, error: stepsError });
            
            // Second fallback if needed
            let finalStepsData = stepsData;
            if (!stepsData || stepsData.length === 0) {
              console.log("First query returned no results, trying guide ID as fallback");
              const { data: altStepsData, error: altStepsError } = await supabase
                .from('diss_table_steps')
                .select('*')
                .eq('guide_id', guideData.id)
                .order('step_number', { ascending: true });
                
              if (altStepsData && altStepsData.length > 0) {
                console.log("Found steps using guide_id instead:", altStepsData.length);
                // Use the alternative steps data
                finalStepsData = altStepsData;
              } else if (altStepsError) {
                console.error("Error with fallback steps query:", altStepsError);
              }
            }
            
            // Transform base steps data from the guide if available
            let baseSteps;
            try {
              baseSteps = typeof guideData.steps === 'string' ? JSON.parse(guideData.steps) : guideData.steps || [];
            } catch (e) {
              console.error("Error parsing steps:", e);
              baseSteps = [];
            }

            // Combine steps from guide and detailed steps from original method
            let combinedSteps = [...baseSteps];
            
            if (finalStepsData && finalStepsData.length > 0) {
              // Process steps from the original method
              combinedSteps = finalStepsData.map(step => ({
                id: step.id,
                title: step.step_des || `Step ${step.step_number}`,
                description: step.step_description || step.step_des || '', 
                imageUrl: step.image_url || undefined,
                videoUrl: step.video_url || undefined,
                step_number: step.step_number,
                step_des: step.step_des || '',
                step_description: step.step_description || '',
                image_url: step.image_url
              }));
            } else {
              // If no steps found, use sample steps
              console.log("No steps found in database, adding sample steps for testing");
              combinedSteps = [
                {
                  id: "sample1",
                  title: "Remove the Bottom Case",
                  description: "Use a Phillips screwdriver to remove the 10 screws securing the bottom case. Note that the screws are different lengths, so keep track of which screws go where.",
                  step_number: 1,
                  imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                },
                {
                  id: "sample2",
                  title: "Disconnect the Battery",
                  description: "Locate the battery connector on the logic board and carefully disconnect it using a plastic spudger. This prevents any electrical shorts during the repair.",
                  step_number: 2,
                  imageUrl: "https://images.unsplash.com/photo-1580974852861-c5b0a6965c2e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                },
                {
                  id: "sample3",
                  title: "Remove the Storage Drive",
                  description: "Locate the storage drive (SSD or HDD). Remove any securing brackets or screws, then carefully lift or slide the drive out of its slot.",
                  step_number: 3,
                  imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                }
              ];
            }

            const formattedGuide: Guide = {
              id: guideData.id || String(guideData.id),
              title: guideData.title || guideData.guide_title || "Untitled Guide",
              guide_title: guideData.guide_title || guideData.title,
              model: guideData.model || guideData.device_model || guideData.computer_model || "Generic Model",
              category: guideData.category || "Uncategorized",
              difficulty: guideData.difficulty?.toLowerCase() || "medium",
              time: guideData.time || guideData.estimated_time || "30 minutes",
              description: guideData.description || "",
              steps: combinedSteps,
              createdBy: guideData.created_by || guideData.author_id || "admin"
            };
            
            setGuide(formattedGuide);
          } else {
            // Process the steps from disassembly-guides and nextSteps if available
            let combinedSteps: Step[] = [];
            
            // Process steps from disassembly-guides
            if (disassemblySteps && disassemblySteps.length > 0) {
              console.log("FOUND STEPS FROM DISASSEMBLY-GUIDES:", disassemblySteps.length);
              
              // Ensure we have at least one step as Step 1
              let hasStep1 = false;
              
              // Map the steps and check for Step 1
              combinedSteps = disassemblySteps.map((step, index) => {
                // Log each step for debugging
                console.log(`Processing disassembly step ${index + 1}:`, step);
                
                // For the first step from disassembly-guides, make sure it's marked as Step 1
                const stepNumber = index === 0 ? 1 : (index + 1);
                
                // Create the step object
                const processedStep = {
                  id: step.id?.toString() || index.toString(),
                  title: index === 0 ? "Step 1" : (step.step_des || `Step ${stepNumber}`),
                  description: step.step_description || '',
                  imageUrl: step.image_url || undefined,
                  step_number: stepNumber,
                  step_des: index === 0 ? "Main Disassembly Step" : (step.step_des || ''),
                  step_description: step.step_description || '',
                  image_url: step.image_url
                };
                
                // If this is the first step, make sure it's properly marked as Step 1
                if (index === 0) {
                  hasStep1 = true;
                  console.log("Found Step 1 from disassembly-guides table:", processedStep);
                  processedStep.title = "Step 1";  // Ensure title is explicitly "Step 1"
                  processedStep.step_des = processedStep.step_des || "Main Disassembly Step";
                }
                
                return processedStep;
              });
              
              // If we don't have any steps, create a default Step 1
              if (!hasStep1 || combinedSteps.length === 0) {
                console.log("No Step 1 found - creating default Step 1");
                combinedSteps.unshift({
                  id: "default-step-1",
                  title: "Step 1",
                  description: "This is the main disassembly step. Follow the instructions carefully.",
                  step_number: 1,
                  step_des: "Main Disassembly Step",
                  step_description: "This is the main disassembly step. Please follow the instructions carefully.",
                  image_url: undefined
                });
              }
            } else {
              console.log("NO STEPS FOUND FROM DISASSEMBLY-GUIDES - Creating default Step 1");
              combinedSteps = [{
                id: "default-step-1",
                title: "Step 1",
                description: "This is the main disassembly step. Follow the instructions carefully.",
                step_number: 1,
                step_des: "Main Disassembly Step",
                step_description: "This is the main disassembly step. Please follow the instructions carefully.",
                image_url: undefined
              }];
            }
            
            // Add next steps from diss_table if available
            // Using the same structure as step 1 (from disassembly-guides)
            if (nextSteps && nextSteps.length > 0) {
              console.log("Processing next steps with the same structure as step 1");
              
              // First, check if we already have at least Step 1
              const hasStep1 = combinedSteps.some(step => 
                step.step_number === 1 || 
                (step.title && step.title.toLowerCase().includes('step 1'))
              );
              
              console.log("Before processing next steps - Do we already have Step 1?", hasStep1);
              
              // If we don't have Step 1 yet, create a default one
              if (!hasStep1) {
                console.log("Adding default Step 1 before processing next steps");
                combinedSteps.push({
                  id: "default-step-1",
                  title: "Step 1",
                  description: "This is the main disassembly step. Follow the instructions carefully.",
                  step_number: 1,
                  step_des: "Main Disassembly Step",
                  step_description: "This is the main disassembly step. Please follow the instructions carefully.",
                  image_url: undefined,
                  imageUrl: undefined
                });
              }
              
              // Use the same mapping structure as we did for disassembly-guides
              const nextStepsProcessed = nextSteps.map((step, index) => {
                // Calculate the step number starting after the existing steps
                // If we already have Step 1, we'll start with Step 2, otherwise with Step 1
                const stepNumber = hasStep1 ? combinedSteps.length + index + 1 : index + 1;
                
                // Special debug logging for Step 2
                if (stepNumber === 2 || index === 1) {
                  console.log("SPECIAL DEBUGGING FOR STEP 2:")
                  console.log("Step 2 full data:", step);
                  console.log("Step 2 has step_description:", step.step_description ? "YES" : "NO");
                  console.log("Step 2 has description:", step.description ? "YES" : "NO");
                  console.log("Step 2 has steps field:", step.steps ? "YES" : "NO");
                  if (step.steps) console.log("Step 2 steps type:", typeof step.steps);
                }
                
                // Log the step data for debugging
                console.log(`Processing next step ${stepNumber}:`, step);
                
                // Log the raw step data to see what fields are actually available
                console.log('Raw next step data:', JSON.stringify(step, null, 2));
                
                // Extract step_description with more aggressive parsing of nested data
                let stepDescription = '';
                
                // First check explicit step_description field
                if (step.step_description) {
                  stepDescription = step.step_description;
                } 
                // Then check description field
                else if (step.description) {
                  stepDescription = step.description;
                }
                // Finally try parsing from steps if it's a string
                else if (step.steps && typeof step.steps === 'string') {
                  try {
                    const parsedSteps = JSON.parse(step.steps);
                    // Check if steps contains an array with step_description
                    if (Array.isArray(parsedSteps)) {
                      const firstStep = parsedSteps[0];
                      if (firstStep && firstStep.step_description) {
                        stepDescription = firstStep.step_description;
                      } else if (firstStep && firstStep.description) {
                        stepDescription = firstStep.description;
                      }
                    } 
                    // Or if it's an object with description
                    else if (parsedSteps.step_description) {
                      stepDescription = parsedSteps.step_description;
                    } else if (parsedSteps.description) {
                      stepDescription = parsedSteps.description;
                    }
                  } catch (e) {
                    console.error("Error parsing steps JSON:", e);
                    stepDescription = '';
                  }
                }
                
                console.log(`Extracted stepDescription for step ${stepNumber}:`, stepDescription);
                
                // Hard-coded fallback for Step 2 if we can't extract a description
                if ((stepNumber === 2 || index === 1) && !stepDescription) {
                  console.log("APPLYING HARD-CODED FALLBACK FOR STEP 2");
                  stepDescription = "This is the second step in the disassembly process. Please follow the instructions carefully.";
                }

                return {
                  id: `next-${index}`,
                  // Use just "Step X" for title instead of "Next Step X"
                  title: step.step_des || `Step ${stepNumber}`,
                  // Set description field (will be used if step_description is not available)
                  description: stepDescription,
                  imageUrl: step.image_url || undefined,
                  step_number: stepNumber,
                  // Make sure these fields are properly populated
                  step_des: step.step_des || step.title || '',
                  // Ensure step_description is always populated
                  step_description: stepDescription,
                  image_url: step.image_url
                };
              });
              
              // Log processed next steps for verification
              console.log("Processed next steps with descriptions:", nextStepsProcessed);
              
              // Add debug logging before rendering to check step_description values
              nextStepsProcessed.forEach((step, idx) => {
                console.log(`Next step ${idx + 1} has step_description:`, 
                  step.step_description ? `"${step.step_description}"` : "MISSING",
                  "description:", step.description ? `"${step.description}"` : "MISSING"
                );
              });
              
              console.log("Processed next steps:", nextStepsProcessed);
              
              // Add next steps to combined steps
              combinedSteps = [...combinedSteps, ...nextStepsProcessed];
            }
            
            // If no steps found through either method, use sample steps
            if (combinedSteps.length === 0) {
              console.log("No steps found in either disassembly-guides or diss_table, adding sample steps for testing");
              combinedSteps = [
                {
                  id: "sample1",
                  title: "Remove the Bottom Case",
                  description: "Use a Phillips screwdriver to remove the 10 screws securing the bottom case. Note that the screws are different lengths, so keep track of which screws go where.",
                  step_number: 1,
                  imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                },
                {
                  id: "sample2",
                  title: "Disconnect the Battery",
                  description: "Locate the battery connector on the logic board and carefully disconnect it using a plastic spudger. This prevents any electrical shorts during the repair.",
                  step_number: 2,
                  imageUrl: "https://images.unsplash.com/photo-1580974852861-c5b0a6965c2e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                },
                {
                  id: "sample3",
                  title: "Remove the Storage Drive",
                  description: "Locate the storage drive (SSD or HDD). Remove any securing brackets or screws, then carefully lift or slide the drive out of its slot.",
                  step_number: 3,
                  imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                }
              ];
            }

            // Make sure steps are sorted properly with Step 1 first
            const sortedSteps = [...combinedSteps].sort((a, b) => {
              // If either step is step 1, give it highest priority
              if ((a.step_number === 1 || (a.title && a.title.toLowerCase().includes('step 1'))) && 
                  !(b.step_number === 1 || (b.title && b.title.toLowerCase().includes('step 1')))) {
                return -1;
              }
              if (!(a.step_number === 1 || (a.title && a.title.toLowerCase().includes('step 1'))) && 
                  (b.step_number === 1 || (b.title && b.title.toLowerCase().includes('step 1')))) {
                return 1;
              }
              
              // Otherwise sort by step_number
              if (a.step_number && b.step_number) {
                return a.step_number - b.step_number;
              }
              
              // Default sort by index
              return 0;
            });
            
            // Check if we have Step 1, if not add a default Step 1
            const hasStep1 = sortedSteps.some(step => 
              step.step_number === 1 || 
              (step.title && step.title.toLowerCase().includes('step 1'))
            );
            
            if (!hasStep1 && sortedSteps.length > 0) {
              console.log("Adding Step 1 as main step before final formatting");
              sortedSteps.unshift({
                id: "main-step-1",
                title: "Step 1",
                description: "This is the main disassembly step. Follow the instructions carefully.",
                step_number: 1,
                step_des: "Main Disassembly Step",
                step_description: "This is the main disassembly step. Please follow the instructions carefully.",
                image_url: undefined,
                imageUrl: undefined
              });
            } else if (sortedSteps.length === 0) {
              // Ensure we always have at least one step (Step 1)
              console.log("No steps found at all - creating default Step 1");
              sortedSteps.push({
                id: "default-step-1",
                title: "Step 1",
                description: "This is the main disassembly step. Follow the instructions carefully.",
                step_number: 1,
                step_des: "Main Disassembly Step", 
                step_description: "This is the main disassembly step. Please follow the instructions carefully.",
                image_url: undefined,
                imageUrl: undefined
              });
            }
            
            const formattedGuide: Guide = {
              id: guideData.id || String(guideData.id),
              title: guideData.title || guideData.guide_title || "Untitled Guide",
              guide_title: guideData.guide_title || guideData.title,
              model: guideData.model || guideData.device_model || guideData.computer_model || "Generic Model",
              category: guideData.category || "Uncategorized",
              difficulty: guideData.difficulty?.toLowerCase() || "medium",
              time: guideData.time || guideData.estimated_time || "30 minutes",
              description: guideData.description || "",
              steps: sortedSteps,
              createdBy: guideData.created_by || guideData.author_id || "admin"
            };
            
            console.log("Final formatted guide with steps from new implementation:", formattedGuide);
            setGuide(formattedGuide);
          }
        } else {
          // If no data is found in Supabase, try localStorage
          loadFromLocalStorage();
        }
      } catch (err) {
        console.error("Error in loadGuideFromSupabase:", err);
        setError("An unexpected error occurred while loading the guide");
        // Try localStorage as a fallback
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    }

    function loadFromLocalStorage() {
      const storedGuides = localStorage.getItem('disassemblyGuides');
      if (storedGuides && id) {
        try {
          const guides: Guide[] = JSON.parse(storedGuides);
          const foundGuide = guides.find(g => g.id === id);
          if (foundGuide) {
            setGuide(foundGuide);
          }
        } catch (e) {
          console.error("Error parsing stored guides:", e);
          setError("Failed to load guide data from local storage");
        }
      }
      setLoading(false);
    }

    // Load guide from Supabase first, fallback to localStorage
    loadGuideFromSupabase();
  }, [id]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4">Loading guide...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error Loading Guide</h1>
        <p className="mb-6 text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
        <Button variant="outline" asChild className="ml-2">
          <Link to="/disassembly-guides">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Guides
          </Link>
        </Button>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Guide Not Found</h1>
        <p className="mb-6">The disassembly guide you're looking for could not be found.</p>
        <Button asChild>
          <Link to="/disassembly-guides">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Guides
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/disassembly-guides">Disassembly Guides</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>{guide.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link to="/disassembly-guides">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guides
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">{guide.title}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge className={getDifficultyColor(guide.difficulty)}>
              {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{guide.time}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Laptop className="h-4 w-4 mr-1" />
              <span>{guide.model}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Wrench className="h-4 w-4 mr-1" />
              <span>{guide.category}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p>{guide.description}</p>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold">Step-by-Step Instructions</h2>
        
        {/* Debug: Log steps array */}
        {console.log("Guide steps rendering:", guide.steps)}
        
        {/* Use Accordion for all steps - all expanded by default */}
        {guide.steps && guide.steps.length > 0 ? (
          <Accordion type="multiple" defaultValue={guide.steps.map((_, i) => `step-${i}`)} className="w-full border-none">
            {guide.steps.map((step, index) => {
              // Debug each step we're rendering
              console.log(`Rendering step ${index + 1}:`, step);
              
              // Determine if this is the main Step 1
              const isMainStep = index === 0 || step.step_number === 1 || (step.title && step.title.toLowerCase().includes('step 1'));
              
              // Add more highlighting to Step 1 
              return (
                <AccordionItem 
                  key={step.id || index} 
                  value={`step-${index}`}
                  id={`step-${index}-card`}
                  className={isMainStep 
                    ? "border-blue-600 border-2 shadow-lg overflow-hidden rounded-md mb-4 bg-blue-50" 
                    : "mt-4 overflow-hidden rounded-md shadow-sm border"}
                >
                  <AccordionTrigger className={`p-4 hover:no-underline ${isMainStep ? "bg-blue-50" : ""}`}>
                    <div className="flex items-center gap-3 w-full">
                      <div className={`${isMainStep ? "bg-blue-700" : "bg-blue-600"} text-white rounded-xl h-8 w-8 flex items-center justify-center font-bold shrink-0 shadow-sm`}>
                        {step.step_number || index + 1}
                      </div>
                      <div className="text-left">
                        <h3 className={`text-lg font-bold ${isMainStep ? "text-blue-700" : ""}`}>
                          {isMainStep ? "MAIN: " : ""}{step.title || `Step ${step.step_number || index + 1}`}
                        </h3>
                        {/* Display step_des as a heading/subtitle if available */}
                        {step.step_des && step.step_des !== step.title && (
                          <p className={`text-sm ${isMainStep ? "text-blue-700 font-medium" : "text-blue-600 font-normal"}`}>
                            {step.step_des}
                          </p>
                        )}
                        {isMainStep && (
                          <p className="text-xs font-medium text-blue-700 mt-1 bg-blue-100 px-2 py-0.5 rounded-full inline-block">
                            Main Disassembly Step
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <div className="flex flex-col gap-6 py-2">
                      <div className="flex flex-col lg:flex-row gap-8">
                        {/* Media Column (Images/Videos) */}
                        {(step.image_url || step.imageUrl || step.videoUrl) && (
                          <div className="lg:w-1/2">
                            <div className="bg-gray-50 p-4 rounded-xl border">
                              {/* Image */}
                              {(step.image_url || step.imageUrl) && (
                                <div className="mb-4">
                                  <img 
                                    src={step.image_url || step.imageUrl} 
                                    alt={step.title || `Step ${index + 1}`} 
                                    className="rounded-lg w-full h-auto object-contain shadow-sm"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null; // Prevent infinite fallback loop
                                      target.src = '/images/placeholder.jpg'; // Fallback image
                                    }}
                                  />
                                  <p className="text-xs text-center text-muted-foreground mt-2">
                                    {step.title || `Step ${index + 1}`} - Visual Guide
                                  </p>
                                </div>
                              )}
                              
                              {/* Video */}
                              {step.videoUrl && (
                                <div>
                                  <video 
                                    controls
                                    className="rounded-lg w-full shadow-sm"
                                    preload="metadata"
                                  >
                                    <source src={step.videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                  <p className="text-xs text-center text-muted-foreground mt-2">
                                    Video demonstration for {step.title || `Step ${index + 1}`}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Instructions Column */}
                        <div className={`${(step.image_url || step.imageUrl || step.videoUrl) ? 'lg:w-1/2' : 'w-full'}`}>
                          {/* Main Description */}
                          <div className="prose max-w-none">
                            <h4 className="text-lg font-medium text-gray-700 mb-3">Instructions</h4>
                            <div className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                              {step.step_description || step.description || ''}
                            </div>
                          </div>
                          
                          {/* Tips Section */}
                          <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-100">
                            <h5 className="font-medium text-amber-800 flex items-center gap-2 mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                              Important Tips
                            </h5>
                            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                              <li>Ensure your work area is clean and well-lit before starting</li>
                              <li>Keep track of all screws and small components</li>
                              {index === 0 && <li>Back up any important data before proceeding with repairs</li>}
                              {step.step_description && step.step_description.toLowerCase().includes('screw') && 
                                <li>Use the correct screwdriver size to prevent stripping screws</li>}
                              {step.step_description && step.step_description.toLowerCase().includes('cable') && 
                                <li>Always disconnect cables gently to avoid damaging connectors</li>}
                            </ul>
                          </div>
                          
                          {/* Next Step Button (for all but the last step) */}
                          {index < guide.steps.length - 1 && (
                            <div className="mt-6 flex justify-end">
                              <Button variant="outline" size="sm" onClick={() => {
                                const nextElement = document.getElementById(`step-${index + 1}-card`);
                                if (nextElement) {
                                  nextElement.scrollIntoView({ behavior: 'smooth' });
                                  // Find the accordion trigger and click it
                                  const accordionTrigger = nextElement.querySelector('[data-radix-collection-item]');
                                  if (accordionTrigger && accordionTrigger instanceof HTMLElement) {
                                    accordionTrigger.click();
                                  }
                                }
                              }}>
                                Next Step
                                <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No detailed steps are available for this guide.</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Need more help?</h2>
        <p className="mb-4">If you encountered any issues while following this guide, please visit our support page or contact technical support.</p>
        <Button asChild>
          <Link to="/requests">Request Technical Assistance</Link>
        </Button>
      </div>
    </div>
  );
}