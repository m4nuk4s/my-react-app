import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Panel from "@/assets/wtpth/panel.jpg";
import logo from "@/assets/wtpth/Thomson-Logo.png";
import { motion } from "framer-motion";
import { ArrowRight, Laptop, Cog, FileText, Wrench, Settings, FileQuestion, Shield, Zap, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import BackVideo from "@/assets/wtpth/backvi.mp4";
import { useTranslation } from "react-i18next";

export default function Home() {
  const serviceCards = [
    {
      title: "Windows Support",
      description: "Drivers and support for Windows 10 & 11",
      link: "/windows",
      icon: <Laptop className="h-5 w-5" />,
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Drivers",
      description: "Find and download drivers for your computer model",
      link: "/drivers",
      icon: <Cog className="h-5 w-5" />,
      color: "from-purple-500 to-violet-400"
    },
    {
      title: "Guides",
      description: "Computer repair and troubleshooting guides",
      link: "/guides",
      icon: <FileText className="h-5 w-5" />,
      color: "from-green-500 to-emerald-400"
    },
    {
      title: "Disassembly Guides",
      description: "Step-by-step guides for computer disassembly and repair",
      link: "/disassembly-guides",
      icon: <Wrench className="h-5 w-5" />,
      color: "from-amber-500 to-yellow-400"
    },
    {
      title: "Test Tools",
      description: "Testing utilities for your computer",
      link: "/test-tools",
      icon: <Settings className="h-5 w-5" />,
      color: "from-indigo-500 to-blue-400"
    },
    {
      title: "Support Requests",
      description: "Submit a request for technical support",
      link: "/requests",
      icon: <FileQuestion className="h-5 w-5" />,
      color: "from-rose-500 to-pink-400"
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
const outlinePillButton =
  "relative rounded-md px-6 py-2 text-sm font-medium " +
  "text-gray-900 dark:text-gray-100 bg-transparent " +
  "transition-all duration-300 ease-in-out transform " +
  "hover:bg-gray-100 dark:hover:bg-red-600/20 " + // background hover effect
  "focus:outline-none focus:ring-2 focus:ring-gray-400/40 focus:ring-offset-2 focus:ring-offset-transparent " +
  // animated border pseudo-element
  "before:absolute before:inset-0 before:rounded-md before:border-2 before:border-red-500 dark:before:border-white before:opacity-0 before:transition-opacity before:duration-300 before:ease-in-out " +
  "hover:before:opacity-100 " +
  "active:scale-95";

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    },
  };

  // Features section has been removed

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-background to-background/90"
    >
      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="relative py-24 sm:py-32 overflow-hidden"
      >
       <div className="absolute inset-0 z-0">
  <video
    className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
    autoPlay
    loop
    muted
    playsInline
  >
    <source src={BackVideo} type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 mix-blend-multiply" />
  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
</div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <motion.div 
              whileHover={{ rotate: 0, scale: 1.1 }}
              transition={{ type: "mass", stiffness: 0, damping: 0 }}
              className="mb-6"
            >
              <img
                src={logo}
                alt="Tech Support Logo"
                className="h-70 w-199 md:h-30 md:w-50 drop-shadow-x9"
              />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 text-center drop-shadow-md">
              Support Center
            </h1>
            <p className="text-xl text-blue-50 mb-10 max-w-2xl text-center drop-shadow">
              Usefull tools and software and Windows installation
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button
  asChild
  variant="outline"
  size="lg"
 className={outlinePillButton}
              >
                <Link to="/guides">🗒Guides</Link>
              </Button>
             <Button
  asChild
  variant="outline"
  size="lg"
  className={outlinePillButton}
              >
                <Link to="/requests">❓Get Support</Link>
              </Button>
			  
			   <Button
  asChild
  variant="outline"
  size="lg"
 className={outlinePillButton}
              >
                <Link to="/docs">📜Documents</Link>
              </Button>
			  
            </div>
			

          </motion.div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section 
        variants={itemVariants}
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent inline-block"
          >
            System Tools & Software
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-muted-foreground mt-4 max-w-2xl mx-auto"
          >
            Access support tools, guides, and resources to keep your systems running smoothly
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {serviceCards.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Card className="h-full border-primary/10 overflow-hidden backdrop-blur-sm bg-card/95 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 pointer-events-none"></div>
                <CardHeader>
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                    `bg-gradient-to-br ${service.color} text-white`
                  )}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{service.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    asChild 
                    variant="ghost" 
                    className={outlinePillButton}
                  >
                    <Link to={service.link}>
                      <span>Learn More</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* This section has been removed as requested */}

      {/* Call to Action */}
      <motion.section
        variants={itemVariants} 
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center"
      >
        <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 p-8 sm:p-12 rounded-xl border border-primary/20 backdrop-blur-sm">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access technical support tools and resources today.
          </p>
         <Button
  asChild
  variant="outline"
  size="lg"
  className={outlinePillButton}
          >
            <Link to="/drivers">Explore Resources</Link>
          </Button>
        </div>
      </motion.section>
    </motion.div>
  );
}