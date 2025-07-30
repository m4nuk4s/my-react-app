import { Card, CardContent } from "@/components/ui/card";
import { Check, Laptop, Wrench, FileText, Hammer, Cog, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function WelcomePreview() {
  const resources = [
    {
      title: "Windows Support",
      icon: <PanelLeft className="text-blue-500" />,
      features: ["Installation Guides", "System Updates"]
    },
    {
      title: "Drivers",
      icon: <Cog className="text-violet-500" />,
      features: ["Driver Downloads", "Automated Updates"]
    },
    {
      title: "Guides",
      icon: <FileText className="text-emerald-500" />,
      features: ["Hardware Troubleshooting", "Software Solutions"]
    },
    {
      title: "Disassembly Guides",
      icon: <Wrench className="text-amber-500" />,
      features: ["Step-by-step Instructions", "Visual References"]
    },
    {
      title: "Test Tools",
      icon: <Hammer className="text-indigo-500" />,
      features: ["Diagnostic Software", "Performance Testing"]
    },
    {
      title: "Technical Support",
      icon: <Laptop className="text-rose-500" />,
      features: ["Expert Assistance", "Remote Troubleshooting"]
    }
  ];

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary/90 to-purple-600/90 bg-clip-text text-transparent">Welcome to Tech Support</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Your comprehensive tech resource center for hardware and software support.
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="border-primary/10 bg-card/95 backdrop-blur-sm shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 pointer-events-none"></div>
          <CardContent className="pt-6">
            <h3 className="font-bold text-xl mb-6 text-center bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent p-3 border-b border-primary/10">
              Access Our Complete Suite of Resources
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((resource, index) => (
                <motion.div 
                  key={resource.title}
                  variants={itemVariants}
                  className="relative group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className={cn(
                    "p-4 rounded-lg border border-primary/10",
                    "bg-gradient-to-br from-background/80 to-background",
                    "hover:shadow-md transition-all duration-300"
                  )}>
                    <div className="flex items-center mb-3">
                      <div className="p-2 rounded-full bg-background/80 border border-primary/10 mr-3">
                        {resource.icon}
                      </div>
                      <h4 className="font-medium">{resource.title}</h4>
                    </div>
                    <ul className="space-y-2 pl-2">
                      {resource.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check size={14} className="text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}