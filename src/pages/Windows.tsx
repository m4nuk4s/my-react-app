import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, AlertTriangle, Laptop, Send, FileText, Download } from "lucide-react";
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
  "text-gray-900 dark:text-gray-100 bg-transparent " +
  "transition-all duration-300 ease-in-out transform " +
  "hover:bg-gray-100 dark:hover:bg-red-600/20 " +
  "focus:outline-none focus:ring-2 focus:ring-gray-400/40 " +
  "before:absolute before:inset-0 before:rounded-md before:border-2 " +
  "before:border-red-500 dark:before:border-white before:opacity-0 " +
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

  // Combined class for tiles to ensure they aren't transparent in dark mode
  const tileClassName = "group relative overflow-hidden rounded-2xl p-8 backdrop-blur-xl border shadow-sm transition-colors duration-300 " + 
                       "bg-white/90 border-slate-200 " + // Light Mode
                       "dark:bg-zinc-900/90 dark:border-white/10"; // Dark Mode Fix

  return (
    <div className="relative min-h-screen bg-[#050505] text-foreground selection:bg-red-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video className="w-full h-full object-cover opacity-40 contrast-125 saturate-100" autoPlay loop muted playsInline>
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      <div className="relative z-10">
        <section className="h-[40vh] flex items-center">
          <div className="container mx-auto px-6">
            <motion.div initial="hidden" animate="visible" variants={cardVariants} className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white mb-4">
                Windows <span className="font-bold uppercase text-red-600">OS Support</span>
              </h1>
              <p className="text-lg text-zinc-200 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 drop-shadow-md">
                Official ISO downloads and deployment guides for Thomson devices.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-6 pb-20">
          <Tabs defaultValue="win11" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 gap-2 bg-white/10 p-1 mb-8 rounded-xl backdrop-blur-md border border-white/10 h-auto overflow-hidden">
              <TabsTrigger value="win11" className="capitalize transition-all duration-200 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:font-bold rounded-lg py-2.5">
                Windows 11
              </TabsTrigger>
              <TabsTrigger value="win10" className="capitalize transition-all duration-200 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:font-bold rounded-lg py-2.5">
                Windows 10
              </TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <TabsContent value="win11" key="win11" className="space-y-8 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {win11IsoDetails.map((iso, index) => (
                    <motion.div 
                      key={`win11-iso-${index}`}
                      layout
                      initial="hidden" 
                      animate="visible"
                      exit="exit"
                      whileHover={{ y: -5 }}
                      variants={cardVariants}
                      className={tileClassName}
                    >
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-6 text-red-600 dark:text-red-500 transition-transform group-hover:scale-110 origin-left">
                          <Download className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-1 uppercase text-slate-950 dark:text-white group-hover:text-red-600 transition-colors">
                          {iso.name}
                        </h3>
                        <p className="text-sm text-slate-800 dark:text-zinc-100/80 mb-6 font-semibold">
                          Version {iso.version} • {iso.size}
                        </p>
                        
                        <div className="mt-auto space-y-3">
                          <Button asChild variant="ghost" className={`${outlinePillButton} w-full border border-slate-200 dark:border-white/10`}>
                            <a href={iso.link} target="_blank" rel="noreferrer">Download ISO</a>
                          </Button>
                          {iso.sop && (
                            <Button asChild variant="ghost" className={`${outlinePillButton} w-full border border-slate-200 dark:border-white/10`}>
                              <a href={iso.sop} target="_blank" rel="noreferrer">SOP Guide</a>
                            </Button>
                          )}
                        </div>
                        <div className="mt-6 h-[1px] w-12 bg-slate-300 dark:bg-red-600/50 group-hover:w-full group-hover:bg-red-500 transition-all duration-500" />
                      </div>
                    </motion.div>
                  ))}

                  <motion.div 
                    layout
                    initial="hidden" animate="visible" exit="exit"
                    whileHover={{ y: -5 }}
                    variants={cardVariants} 
                    className={tileClassName}
                  >
                    <div className="mb-6 text-red-600 dark:text-red-500"><Laptop className="h-8 w-8" /></div>
                    <h3 className="text-xl font-bold mb-4 uppercase text-slate-950 dark:text-white">Requirements</h3>
                    <ul className="text-xs space-y-2 text-slate-800 dark:text-zinc-100/80 font-semibold">
                      {requirements.map((r, i) => (
                        <li key={i} className="flex justify-between border-b border-slate-200 dark:border-white/10 pb-1">
                          <span>{r.name}:</span> <span>{r.spec}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">Common Questions</h2>
                  <Accordion type="single" collapsible className="w-full bg-white/80 dark:bg-zinc-900/90 rounded-2xl p-6 border border-slate-200 dark:border-white/10 backdrop-blur-xl">
                    {faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`item-${i}`} className="border-b border-slate-200 dark:border-white/10">
                        <AccordionTrigger className="text-slate-950 dark:text-white hover:text-red-600 dark:hover:text-red-500">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-slate-800 dark:text-zinc-400 font-medium">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="win10" key="win10" className="space-y-6 outline-none">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Alert variant="destructive" className="bg-red-950/20 border-red-600/50 text-white rounded-xl backdrop-blur-md mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Support Advisory</AlertTitle>
                    <AlertDescription>
                      Windows 10 support ended on October 2025. Upgrade to Windows 11 for continued security updates.
                    </AlertDescription>
                  </Alert>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {win10IsoDetails.map((iso, index) => (
                    <motion.div 
                      key={`win10-iso-${index}`}
                      layout
                      initial="hidden" animate="visible" exit="exit"
                      whileHover={{ y: -5 }}
                      variants={cardVariants} 
                      className={tileClassName}
                    >
                       <div className="mb-6 text-red-600 dark:text-red-500"><FileText className="h-8 w-8" /></div>
                       <h3 className="text-xl font-bold mb-1 uppercase text-slate-950 dark:text-white">{iso.name}</h3>
                       <p className="text-sm text-slate-800 dark:text-zinc-100/80 mb-6 font-semibold">Version {iso.version} • {iso.size}</p>
                       
                       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className={`${outlinePillButton} w-full border border-slate-200 dark:border-white/10`}>
                            Request Link
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 text-white backdrop-blur-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-red-600 uppercase font-bold">Request {iso.name}</DialogTitle>
                            <DialogDescription className="text-zinc-400">Our support team will send the link to your email.</DialogDescription>
                          </DialogHeader>
                          {requestSubmitted ? (
                            <div className="py-6 text-center space-y-4">
                              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                              <h3 className="text-xl font-medium">Request Sent Successfully</h3>
                            </div>
                          ) : (
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} className="bg-zinc-800 border-zinc-700" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} className="bg-zinc-800 border-zinc-700" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="windowsVersion" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Windows Edition</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl><SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                      <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                        {windowsVersions.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="deviceModel" render={({ field }) => (
                                  <FormItem><FormLabel>Device Model</FormLabel><FormControl><Input placeholder="e.g. Thomson N17" {...field} className="bg-zinc-800 border-zinc-700" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="message" render={({ field }) => (
                                  <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} className="bg-zinc-800 border-zinc-700" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <DialogFooter><Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">Submit Request</Button></DialogFooter>
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
    </div>
  );
}