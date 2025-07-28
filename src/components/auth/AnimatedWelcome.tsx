import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, Shield, Rocket, Code } from "lucide-react";

export default function AnimatedWelcome({ onContinue }: { onContinue: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  
  const handleContinueClick = () => {
    console.log("handleContinueClick executed");
    // Force direct DOM manipulation to ensure localStorage is set
    localStorage.setItem('hasSeenWelcome', 'true');
    // Force a manual callback
    window.setTimeout(() => {
      console.log("Forcing onContinue via setTimeout");
      onContinue();
    }, 100);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // On the last slide, automatically continue to login after a delay
        setTimeout(() => {
          console.log("Auto-continuing to login after final slide");
          handleContinueClick();
        }, 2000);
      }
    }, 2000);
    
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
      title: "Welcome to TechSupport",
      description: "Your comprehensive resource for hardware and software support",
      icon: <Laptop size={48} className="text-primary" />,
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "Secure Access",
      description: "Login to unlock our full suite of technical resources and tools",
      icon: <Shield size={48} className="text-primary" />,
      color: "from-green-500 to-blue-600"
    },
    {
      title: "Advanced Tools",
      description: "Diagnostic software, disassembly guides, and driver repositories",
      icon: <Code size={48} className="text-primary" />,
      color: "from-yellow-500 to-red-600"
    },
    {
      title: "Ready to Start?",
      description: "Login or register to begin your tech support journey",
      icon: <Rocket size={48} className="text-primary" />,
      color: "from-purple-500 to-pink-600"
    }
  ];

  const currentSlide = slides[currentStep];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          className="bg-card rounded-xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ pointerEvents: 'auto' }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.color} opacity-10`}></div>
          
          <motion.div 
            className="flex justify-center mb-6"
            variants={iconVariants}
          >
            {currentSlide.icon}
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold text-center mb-4"
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
          
          <div className="flex justify-center mb-6">
            {slides.map((_, index) => (
              <motion.div 
                key={index}
                className={`h-2 w-2 rounded-full mx-1 ${index === currentStep ? 'bg-primary' : 'bg-muted'}`}
                initial={{ scale: index === currentStep ? 0 : 1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          
          {/* Skip button has been removed completely */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}