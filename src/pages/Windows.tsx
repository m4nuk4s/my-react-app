import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, Laptop, Send, FileText, Download, Activity } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import * as z from "zod";
import BackVideo from "@/assets/wtpth/backvi.mp4";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const outlinePillButton =
  "relative rounded-md px-6 py-2 text-sm font-medium " +
  "text-slate-900 dark:text-white bg-transparent " +
  "transition-all duration-300 ease-in-out transform " +
  "hover:bg-slate-100 dark:hover:bg-red-600/20 " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400/40 " +
  "before:absolute before:inset-0 before:rounded-md before:border-2 " +
  "before:border-red-600 dark:before:border-red-600 before:opacity-0 " +
  "hover:before:opacity-100 active:scale-95";

const SERVICE_ID = "service_3nte2w8";
const TEMPLATE_ID = "template_ynyayik"; 
const USER_ID = "_FaISaFJ5SBxVUtzl";

const windowsRequestSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  windowsVersion: z.string({ required_error: "Please select Windows version." }),
  deviceModel: z.string().min(2, { message: "Device model must be at least 2 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export default function Windows() {
  const [activeTab, setActiveTab] = useState("win11");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const location = useLocation();
  
  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  const form = useForm<z.infer<typeof windowsRequestSchema>>({
    resolver: zodResolver(windowsRequestSchema),
    defaultValues: { name: "", email: "", phone: "", windowsVersion: "", deviceModel: "", message: "" },
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" } 
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const windowsVersions = [
    { value: "win11-24h2", label: "Windows 11 24H2" },
    { value: "win11-23h2", label: "Windows 11 23H2" },
    { value: "win10-22h2", label: "Windows 10 22H2" },
  ];

  async function onSubmit(values: z.infer<typeof windowsRequestSchema>) {
    try {
      const versionLabel = windowsVersions.find(v => v.value === values.windowsVersion)?.label || values.windowsVersion;
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        name: values.name, email: values.email, phone: values.phone || "N/A",
        requestType: "Windows ISO Request", subject: `Windows ISO Request: ${versionLabel}`,
        message: values.message, deviceModel: values.deviceModel || "N/A", osVersion: versionLabel,
      }, USER_ID);

      toast.success("Windows ISO request submitted successfully!");
      setRequestSubmitted(true);
      form.reset();
      setTimeout(() => { setDialogOpen(false); setRequestSubmitted(false); }, 3000);
    } catch (error) {
      toast.error("Failed to submit request.");
    }
  }

  const win11IsoDetails = [
    { name: "Windows 11 Home 🇪🇺", version: "24H2", size: "22 GB", link: "http://gofile.me/5wnJP/iR1i1ILRr" },
    { name: "WINDOWS 11 INDIA 🇮🇳 ", version: "25H2", size: "13 GB", link: "https://drive.google.com/drive/folders/1_2DXWl5a29hMFTSCH2azKMjpOYfEV_Mj?usp=sharing", sop: "https://drive.google.com/file/d/1u7iLDuNWE3CiWY1-TloEOzrozojTCgCl/view?usp=sharing" }
  ];

  const win10IsoDetails = [
    { name: "Windows 10 Home + Office 365", version: "22H2", size: "16.1 GB" },
    { name: "WINDOWS 10 Pro + Office 365", version: "22H2", size: "15 GB" }
  ];

  const requirements = [
    { name: "Processor", spec: "1 GHz or faster" },
    { name: "RAM", spec: "4 GB or greater" },
    { name: "Storage", spec: "64 GB or greater" },
    { name: "TPM", spec: "TPM 2.0" }
  ];

  const faqs = [
    { question: "Can I upgrade my Windows 10 PC to Windows 11?", answer: "You can upgrade to Windows 11 if your PC meets the minimum system requirements via the PC Health Check app." },
    { question: "Is Windows 11 free?", answer: "Windows 11 is a free upgrade for valid Windows 10 licenses on compatible hardware." },
    { question: "What if my PC doesn't meet the requirements?", answer: "Windows 10 is supported until Oct 2025. Unofficial bypass methods exist but are not recommended." }
  ];

  // Updated tile class to match Home.tsx styling
  const tileClassName = (index: number) => 
    `group relative overflow-hidden rounded-2xl border p-8 backdrop-blur-md transition-all duration-500
    ${hoveredCard === index 
      ? 'translate-x-4 shadow-2xl bg-white dark:bg-zinc-900 border-red-600' 
      : 'bg-white/40 border-slate-200/50 dark:bg-white/5 dark:border-white/10'
    }`;

	  return (
		<div className="relative min-h-screen transition-colors duration-700 overflow-hidden font-sans bg-[#f8f9fa] dark:bg-[#050505] text-slate-900 dark:text-white">
		  {/* BACKGROUND - Matches Home.tsx exactly */}
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
			<section className="h-[40vh] flex items-center">
			  <div className="container mx-auto px-6">
				<motion.div 
				  initial={{ opacity: 0, y: -20 }} 
				  animate={{ opacity: 1, y: 0 }}
				  className="max-w-4xl"
				>
				  <div className="mb-6 flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase text-slate-600 dark:text-zinc-500">
					<Activity size={14} className="text-red-600 animate-pulse" /> WINDOWS_OS // ISO_DEPLOYMENT
				  </div>
				  
				  <h1 className="text-4xl md:text-[5rem] font-black tracking-[-0.05em] uppercase leading-[0.8] text-slate-950 dark:text-white mb-6">
					Windows <br />
					<span className="outline-text">OS Support</span>
				  </h1>
				  
				  <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 font-medium">
					Official ISO downloads and deployment guides for Thomson devices.
				  </p>
				</motion.div>
			  </div>
			</section>

        <div className="container mx-auto px-6 pb-20">
       <Tabs defaultValue="win11" value={activeTab} onValueChange={setActiveTab} className="w-full">
  {/* Keeps full width but reduces height (h-auto) and internal padding (p-1.5) */}
  <TabsList className="grid grid-cols-2 gap-3 bg-white/40 backdrop-blur-md border border-slate-200/50 dark:bg-white/5 dark:border-white/10 p-1.5 mb-10 rounded-xl h-auto overflow-hidden">
    <TabsTrigger 
      value="win11" 
      /* Reduced vertical padding (py-2) and font size (text-sm) while keeping it bold */
      className="capitalize transition-all duration-500 rounded-lg py-2 text-sm font-black tracking-tight data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
    >
      Windows 11
    </TabsTrigger>
    <TabsTrigger 
      value="win10" 
      className="capitalize transition-all duration-500 rounded-lg py-2 text-sm font-black tracking-tight data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
    >
      Windows 10
    </TabsTrigger>
  </TabsList>
            
            <AnimatePresence mode="wait">
              <TabsContent value="win11" key="win11" className="space-y-12 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {win11IsoDetails.map((iso, index) => (
                    <motion.div 
                      key={`win11-iso-${index}`}
                      layout
                     
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                      whileHover={{ y: -8 }}
                      variants={cardVariants}
                      className={tileClassName(index)}
                    >
                      {/* Hover aura effect from Home.tsx */}
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

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                          <div className={`transition-all duration-500 transform 
                            ${hoveredCard === index ? 'scale-125 text-red-600' : 'text-slate-400 dark:text-slate-500'}`}>
                            <Download className="h-10 w-10" />
                          </div>
                          <span className="font-mono text-xs font-black text-red-600/60">
                            DL_{index + 1}
                          </span>
                        </div>
                        
                        <h3 className={`text-2xl font-black uppercase tracking-tighter mb-3 transition-colors
                          ${hoveredCard === index ? 'text-red-600' : 'text-slate-900 dark:text-white'}
                        `}>
                          {iso.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-8 font-semibold">
                          Version {iso.version} • {iso.size}
                        </p>
                        
                        <div className="mt-auto space-y-3">
                          <Button asChild variant="ghost" className={`${outlinePillButton} w-full border border-slate-200/50 dark:border-white/10`}>
                            <a href={iso.link} target="_blank" rel="noreferrer" className="font-bold uppercase tracking-wider">
                              <Download size={16} />
							  Download ISO
                            </a>
                          </Button>
                          {iso.sop && (
                            <Button asChild variant="ghost" className={`${outlinePillButton} w-full border border-slate-200/50 dark:border-white/10`}>
                              <a href={iso.sop} target="_blank" rel="noreferrer" className="font-bold uppercase tracking-wider">
                                <Send size={16} />
								SOP Guide
                              </a>
                            </Button>
                          )}
                        </div>
                        
                        <div className="mt-8 h-[1px] w-12 bg-slate-300 dark:bg-red-600/50 group-hover:w-full group-hover:bg-red-500 transition-all duration-500" />
                      </div>
                    </motion.div>
                  ))}

                  <motion.div 
                    layout
                  
                    onMouseEnter={() => setHoveredCard(win11IsoDetails.length)}
                    onMouseLeave={() => setHoveredCard(null)}
                    whileHover={{ y: -8 }}
                    variants={cardVariants} 
                    className={tileClassName(win11IsoDetails.length)}
                  >
                    <AnimatePresence>
                      {hoveredCard === win11IsoDetails.length && (
                        <motion.div 
                          layoutId="hoverAura"
                          className="absolute inset-0 bg-red-600/5 blur-3xl -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between mb-6">
                      <div className={`transition-all duration-500 transform 
                        ${hoveredCard === win11IsoDetails.length ? 'scale-125 text-red-600' : 'text-slate-400 dark:text-slate-500'}`}>
                        <Laptop className="h-10 w-10" />
                      </div>
                      <span className="font-mono text-xs font-black text-red-600/60">
                        REQ_SPEC
                      </span>
                    </div>
                    
                    <h3 className={`text-2xl font-black uppercase tracking-tighter mb-6 transition-colors
                      ${hoveredCard === win11IsoDetails.length ? 'text-red-600' : 'text-slate-900 dark:text-white'}
                    `}>
                      System Requirements
                    </h3>
                    
                    <ul className="space-y-4 text-sm text-slate-600 dark:text-zinc-400 font-medium">
                      {requirements.map((r, i) => (
                        <li key={i} className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/10 pb-3">
                          <span className="font-bold uppercase tracking-wider text-xs">{r.name}</span>
                          <span className="font-mono text-red-600/80">{r.spec}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                <div className="mt-12">
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-slate-950 dark:text-white">
                    Common Questions
                  </h2>
                  <Accordion type="single" collapsible className="w-full bg-white/40 backdrop-blur-md rounded-2xl p-8 border border-slate-200/50 dark:bg-white/5 dark:border-white/10">
                    {faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`item-${i}`} className="border-b border-slate-200/50 dark:border-white/10">
                        <AccordionTrigger className="text-lg font-bold text-slate-950 dark:text-white hover:text-red-600 dark:hover:text-red-600 py-6">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-zinc-400 font-medium pb-6">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="win10" key="win10" className="space-y-8 outline-none">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Alert variant="destructive" className="bg-red-950/20 border-red-600/50 text-white rounded-2xl backdrop-blur-md mb-8">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle className="font-bold">Support Advisory</AlertTitle>
                    <AlertDescription className="font-medium">
                      Windows 10 support ended on October 2025. Upgrade to Windows 11 for continued security updates.
                    </AlertDescription>
                  </Alert>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {win10IsoDetails.map((iso, index) => (
                    <motion.div 
                      key={`win10-iso-${index}`}
                      layout
                      
                      onMouseEnter={() => setHoveredCard(index + 100)}
                      onMouseLeave={() => setHoveredCard(null)}
                      whileHover={{ y: -8 }}
                      variants={cardVariants} 
                      className={tileClassName(index + 100)}
                    >
                      <AnimatePresence>
                        {hoveredCard === index + 100 && (
                          <motion.div 
                            layoutId="hoverAura"
                            className="absolute inset-0 bg-red-600/5 blur-3xl -z-10"
                            
                          />
                        )}
                      </AnimatePresence>

                      <div className="flex items-center justify-between mb-6">
                        <div className={`transition-all duration-500 transform 
                          ${hoveredCard === index + 100 ? 'scale-125 text-red-600' : 'text-slate-400 dark:text-slate-500'}`}>
                          <FileText className="h-10 w-10" />
                        </div>
                        <span className="font-mono text-xs font-black text-red-600/60">
                          REQ_{index + 1}
                        </span>
                      </div>
                      
                      <h3 className={`text-2xl font-black uppercase tracking-tighter mb-3 transition-colors
                        ${hoveredCard === index + 100 ? 'text-red-600' : 'text-slate-900 dark:text-white'}
                      `}>
                        {iso.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 mb-8 font-semibold">
                        Version {iso.version} • {iso.size}
                      </p>
                      
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className={`${outlinePillButton} w-full border border-slate-200/50 dark:border-white/10 font-bold uppercase tracking-wider`}>
                            <Send size={16} />
							Request Link
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900 border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white backdrop-blur-xl">
                          <DialogHeader>
                            <DialogTitle className="text-red-600 uppercase font-black text-2xl">Request {iso.name}</DialogTitle>
                            <DialogDescription className="text-slate-600 dark:text-zinc-400 font-medium">
                              Our support team will send the link to your email.
                            </DialogDescription>
                          </DialogHeader>
                          {requestSubmitted ? (
                            <div className="py-8 text-center space-y-6">
                              <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                              <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white">Request Sent Successfully</h3>
                              <p className="text-slate-600 dark:text-zinc-400 font-medium">
                                You will receive the download link via email shortly.
                              </p>
                            </div>
                          ) : (
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-bold uppercase tracking-wider text-xs">Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-bold uppercase tracking-wider text-xs">Email</FormLabel>
                                    <FormControl>
                                      <Input type="email" {...field} className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="windowsVersion" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-bold uppercase tracking-wider text-xs">Windows Edition</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10">
                                          <SelectValue placeholder="Select Version" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200/50 dark:border-white/10">
                                        {windowsVersions.map(v => (
                                          <SelectItem key={v.value} value={v.value} className="hover:bg-red-600/10">
                                            {v.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="deviceModel" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-bold uppercase tracking-wider text-xs">Device Model</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g. Thomson N17" {...field} className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="message" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-bold uppercase tracking-wider text-xs">Notes</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <DialogFooter>
                                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider py-6">
                                    Submit Request
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          )}
                        </DialogContent>
                      </Dialog>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>

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