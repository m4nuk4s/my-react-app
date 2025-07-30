import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import GuideAssistant from "@/components/GuideAssistant";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Animation variants for page transitions
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    out: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          className="flex-1"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <GuideAssistant />
    </div>
  );
}