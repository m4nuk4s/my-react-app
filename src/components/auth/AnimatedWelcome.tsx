import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, Shield, Rocket, Code, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AnimatedWelcome({ onContinue }: { onContinue: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  
  const handleContinueClick = () => {
    // Force direct DOM manipulation to ensure localStorage is set
    localStorage.setItem('hasSeenWelcome', 'true');
    // Force a manual callback
    window.setTimeout(() => {
      onContinue();
    }, 100);
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleContinueClick();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // On the last slide, automatically continue to login after a delay
        setTimeout(() => {
          handleContinueClick();
        }, 3000);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [currentStep]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.3,
        duration: 0.5
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.5 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.8
      }
    }
  };

  const slides = [
    {
      title: "Welcome to Tech Support",
      description: "Your comprehensive resource for hardware and software support",
      icon: <Laptop className="h-16 w-16 text-white" />,
      color: "from-blue-500 to-indigo-600",
      accent: "bg-blue-500"
    },
    {
      title: "Secure Access",
      description: "Login to unlock our full suite of technical resources and tools",
      icon: <Shield className="h-16 w-16 text-white" />,
      color: "from-emerald-500 to-green-600",
      accent: "bg-emerald-500"
    },
    {
      title: "Advanced Tools",
      description: "Diagnostic software, disassembly guides, and driver repositories",
      icon: <Code className="h-16 w-16 text-white" />,
      color: "from-amber-500 to-yellow-600",
      accent: "bg-amber-500"
    },
    {
      title: "Ready to Start?",
      description: "Login or register to begin your tech support journey",
      icon: <Rocket className="h-16 w-16 text-white" />,
      color: "from-purple-500 to-pink-600",
      accent: "bg-purple-500"
    }
  ];

  const currentSlide = slides[currentStep];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          className="bg-card rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden border border-primary/20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Gradient background */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-20",
            currentSlide.color
          )}></div>
          
          {/* Top colored band */}
          <div className={cn(
            "h-2 w-full",
            currentSlide.accent
          )}></div>
          
          <div className="p-8">
            {/* Icon */}
            <motion.div 
              className="flex justify-center mb-8"
              variants={iconVariants}
            >
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg",
                currentSlide.color
              )}>
                {currentSlide.icon}
              </div>
            </motion.div>
            
            {/* Content */}
            <motion.h2 
              className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              {currentSlide.title}
            </motion.h2>
            
            <motion.p 
              className="text-center text-muted-foreground mb-8"
              variants={itemVariants}
            >
              {currentSlide.description}
            </motion.p>
            
            {/* Progress indicators */}
            <div className="flex justify-center mb-6">
              {slides.map((_, index) => (
                <motion.div 
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full mx-1 transition-all duration-300",
                    index === currentStep 
                      ? cn("bg-primary w-8", currentSlide.accent) 
                      : "bg-muted w-4"
                  )}
                  initial={{ scale: index === currentStep ? 0 : 1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
            
            {/* Controls */}
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleContinueClick}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>
              
              <Button 
                onClick={handleNextStep}
                className={cn(
                  "rounded-full group",
                  "bg-gradient-to-r from-primary to-purple-600",
                  "hover:from-purple-600 hover:to-primary"
                )}
              >
                {currentStep < totalSteps - 1 ? (
                  <>
                    Next
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                ) : "Get Started"}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}