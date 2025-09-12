import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, Shield, Rocket, Code } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnimatedWelcome({ onContinue }: { onContinue: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  
  // This function is called automatically after the last slide is shown.
  const handleContinue = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    onContinue();
  };

  // This effect hook controls the automatic progression through the slides.
  useEffect(() => {
    // Set a timer to advance to the next slide after 3 seconds.
    const timer = setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // If on the last slide, wait 3 seconds then proceed.
        handleContinue();
      }
    }, 3000);
    
    // Cleanup function to clear the timer if the component unmounts.
    return () => clearTimeout(timer);
  }, [currentStep, totalSteps]);

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
      description: "You will be redirected momentarily...",
      icon: <Rocket className="h-16 w-16 text-white" />,
      color: "from-purple-500 to-pink-600",
      accent: "bg-purple-500"
    }
  ];

  const currentSlide = slides[currentStep];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-none z-50 flex items-center justify-center p-4"
      onClick={handleContinue}
    >
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          className="bg-card rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden border border-primary/20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", currentSlide.color)}></div>
          <div className={cn("h-2 w-full", currentSlide.accent)}></div>
          
          <div className="p-8">
            <motion.div 
              className="flex justify-center mb-8"
              variants={iconVariants}
            >
              <div className={cn("w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg", currentSlide.color)}>
                {currentSlide.icon}
              </div>
            </motion.div>
            
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
            
            <div className="flex justify-center pt-2 pb-4">
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
            
            <div className="flex justify-center">
              <button 
                onClick={handleContinue}
                className="mt-4 px-6 py-2 rounded-full text-sm font-semibold text-white bg-black/50 backdrop-blur-md hover:bg-black/70 transition-colors duration-300"
              >
                Skip
              </button>
            </div>
            
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}