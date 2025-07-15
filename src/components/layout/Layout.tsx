import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import GuideAssistant from "@/components/GuideAssistant";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <GuideAssistant />
    </div>
  );
}