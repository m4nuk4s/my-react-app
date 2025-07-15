import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Laptop, Wrench, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";

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

export default function DisassemblyGuideDetail() {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGuide = () => {
      const storedGuides = localStorage.getItem('disassemblyGuides');
      if (storedGuides && id) {
        const guides: Guide[] = JSON.parse(storedGuides);
        const foundGuide = guides.find(g => g.id === id);
        if (foundGuide) {
          setGuide(foundGuide);
        }
      }
      setLoading(false);
    };

    loadGuide();
  }, [id]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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
              {guide.difficulty}
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
        
        {guide.steps.map((step, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center font-bold shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {step.imageUrl && (
                    <div className="mt-4">
                      <img 
                        src={step.imageUrl} 
                        alt={step.title} 
                        className="rounded-lg max-h-[300px] object-contain"
                      />
                    </div>
                  )}
                  {step.videoUrl && (
                    <div className="mt-4">
                      <video 
                        src={step.videoUrl}
                        controls
                        className="rounded-lg max-h-[300px] w-full"
                        preload="metadata"
                        type="video/mp4"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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