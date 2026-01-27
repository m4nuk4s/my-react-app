import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import BackVideo from "@/assets/wtpth/backvi.mp4";

import {
  Form,
  FormControl,
  FormDescription,
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertTriangle, Info, Send, Activity, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Your EmailJS service, template, and user IDs
const SERVICE_ID = "service_3nte2w8";
const TEMPLATE_ID = "template_ynyayik";
const USER_ID = "_FaISaFJ5SBxVUtzl";

const submitButtonStyles = 
  "h-14 px-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 " +
  "hover:from-red-700 hover:to-red-800 text-white font-black " +
  "uppercase tracking-wider text-base shadow-lg hover:shadow-xl " +
  "transition-all duration-300 transform hover:-translate-y-0.5 " +
  "w-full flex items-center justify-center";
  
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  requestType: z.string({ required_error: "Please select a request type." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  deviceModel: z.string().optional(),
  osVersion: z.string().optional(),
});

export default function Requests() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("support");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      requestType: "",
      subject: "",
      message: "",
      deviceModel: "",
      osVersion: "",
    },
  });

  const outlinePillButton =
    "relative rounded-md px-6 py-2 text-sm font-medium " +
    "text-slate-900 dark:text-white bg-transparent " +
    "transition-all duration-300 ease-in-out transform " +
    "hover:bg-slate-100 dark:hover:bg-red-600/20 " +
    "focus:outline-none focus:ring-2 focus:ring-slate-400/40 " +
    "before:absolute before:inset-0 before:rounded-md before:border-2 " +
    "before:border-red-600 dark:before:border-red-600 before:opacity-0 " +
    "hover:before:opacity-100 active:scale-95";

  const requestTypes = {
    support: [
      { value: "technical-issue", label: "Technical Issue" },
      { value: "software-problem", label: "Software Problem" },
      { value: "hardware-problem", label: "Hardware Problem" },
      { value: "windows-installation", label: "Windows Installation Help" },
      { value: "driver-issue", label: "Driver Issue" },
      { value: "other-support", label: "Other Support Request" },
    ],
    driver: [
      { value: "missing-driver", label: "Missing Driver Request" },
      { value: "driver-update", label: "Driver Update Request" },
      { value: "compatibility-issue", label: "Driver Compatibility Issue" },
      { value: "other-driver", label: "Other Driver Request" },
    ],
    guide: [
      { value: "repair-guide", label: "Repair Guide Request" },
      { value: "disassembly-guide", label: "Disassembly Guide Request" },
      { value: "tutorial-request", label: "Tutorial Request" },
      { value: "other-guide", label: "Other Guide Request" },
    ],
  };

  const tileClassName = (index: number) =>
    `group relative overflow-hidden rounded-2xl border p-8 backdrop-blur-md transition-all duration-500
    ${hoveredCard === index
      ? 'translate-x-4 shadow-2xl bg-white dark:bg-zinc-900 border-red-600'
      : 'bg-white/40 border-slate-200/50 dark:bg-white/5 dark:border-white/10'
    }`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Find label for requestType
      const allRequestTypes = [
        ...requestTypes.support,
        ...requestTypes.driver,
        ...requestTypes.guide,
      ];
      const requestTypeLabel =
        allRequestTypes.find((type) => type.value === values.requestType)?.label ||
        values.requestType;

      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          name: values.name,
          email: values.email,
          phone: values.phone || "N/A",
          requestType: requestTypeLabel,
          subject: values.subject,
          message: values.message,
          deviceModel: values.deviceModel || "N/A",
          osVersion: values.osVersion || "N/A",
        },
        USER_ID
      );

      setIsSubmitted(true);
      form.reset();
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to submit request. Please try again later.");
    }
  }

  return (
    <div className="relative min-h-screen transition-colors duration-700 overflow-hidden font-sans bg-[#f8f9fa] dark:bg-[#050505] text-slate-900 dark:text-white">
      {/* BACKGROUND - Matches Windows.tsx exactly */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          className="w-full h-full object-cover transition-opacity duration-1000 grayscale opacity-40 contrast-125 dark:opacity-40"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={BackVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 transition-all duration-700 bg-gradient-to-r from-[#f8f9fa]/60 via-[#f8f9fa]/20 to-transparent dark:from-[#050505] dark:via-[#050505]/80 dark:to-transparent" />
      </div>

      <div className="relative z-10">
        {/* HERO SECTION - Matches Windows.tsx styling */}
        <section className="h-[40vh] flex items-center">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="mb-6 flex items-center gap-4 text-[10px] font-black tracking-[0.3em] uppercase text-slate-600 dark:text-zinc-500">
                <Activity size={14} className="text-red-600 animate-pulse" /> SUPPORT_REQUESTS // TECHNICAL_ASSISTANCE
              </div>

              <h1 className="text-4xl md:text-[5rem] font-black tracking-[-0.05em] uppercase leading-[0.8] text-slate-950 dark:text-white mb-6">
                Support <br />
                <span className="outline-text">Requests</span>
              </h1>

              <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-lg leading-relaxed border-l-2 border-red-600 pl-6 font-medium">
                Submit technical support, driver, and guide requests for Thomson devices.
              </p>
            </motion.div>
          </div>
        </section>

        {/* PAGE CONTENT */}
        <div className="container mx-auto px-6 pb-20">
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className="mb-8 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-600/50 rounded-2xl backdrop-blur-md">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200 font-bold">Success!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300 font-medium">
                  Your request has been submitted. We'll get back to you via email within 24-48 hours.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-2xl border bg-white/40 backdrop-blur-md p-8 border-slate-200/50 dark:bg-white/5 dark:border-white/10 transition-all duration-500"
          >
            {/* Hover aura effect */}
            {hoveredCard === 0 && (
              <motion.div
                className="absolute inset-0 bg-red-600/5 blur-3xl -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`transition-all duration-500 transform ${hoveredCard === 0 ? 'scale-125 text-red-600' : 'text-slate-400 dark:text-slate-500'}`}>
                    <HelpCircle className="h-10 w-10" />
                  </div>
                  <span className="font-mono text-xs font-black text-red-600/60">
                    REQ_FORM
                  </span>
                </div>
              </div>

              <CardHeader className="p-0">
                <CardTitle className="text-3xl font-black uppercase tracking-tighter mb-3 text-slate-950 dark:text-white">
                  Submit a Request
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-zinc-400 font-medium">
                  Fill out the form below to submit your request. We'll respond within 24-48 hours.
                </CardDescription>
              </CardHeader>
            </div>
          </motion.div>

          {/* FORM SECTION */}
          <div className="mt-10">
            <Card className="border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <Tabs
                  defaultValue="support"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  {/* Updated TabsList to match Windows.tsx styling */}
                  <TabsList className="grid grid-cols-3 gap-3 bg-white/40 backdrop-blur-md border border-slate-200/50 dark:bg-white/5 dark:border-white/10 p-1.5 mb-8 rounded-xl h-auto overflow-hidden">
                    <TabsTrigger
                      value="support"
                      className="capitalize transition-all duration-500 rounded-lg py-3 text-sm font-black tracking-tight data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      Technical Support
                    </TabsTrigger>
                    <TabsTrigger
                      value="driver"
                      className="capitalize transition-all duration-500 rounded-lg py-3 text-sm font-black tracking-tight data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      Driver Request
                    </TabsTrigger>
                    <TabsTrigger
                      value="guide"
                      className="capitalize transition-all duration-500 rounded-lg py-3 text-sm font-black tracking-tight data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      Guide Request
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Content Information Panels */}
                  <TabsContent value="support">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-600/50 rounded-2xl p-6 mb-8 backdrop-blur-md"
                    >
                      <div className="flex items-start">
                        <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-1" />
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                          Need technical assistance with your computer? Provide as much detail
                          as possible about the issue you're experiencing, including error messages,
                          when the problem started, and what you've tried so far.
                        </p>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="driver">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-600/50 rounded-2xl p-6 mb-8 backdrop-blur-md"
                    >
                      <div className="flex items-start">
                        <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0 mt-1" />
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                          Can't find a specific driver? Let us know your device details and
                          which driver you need. Include your device model, Windows version,
                          and hardware specifications for faster assistance.
                        </p>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="guide">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-600/50 rounded-2xl p-6 mb-8 backdrop-blur-md"
                    >
                      <div className="flex items-start">
                        <Info className="h-6 w-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-1" />
                        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                          Need a specific repair or disassembly guide? Tell us which device you
                          need help with, what you're trying to accomplish, and your experience level.
                          We'll provide step-by-step instructions tailored to your needs.
                        </p>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-8"
                      noValidate
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold uppercase tracking-wider text-xs text-slate-700 dark:text-zinc-300">
                                Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your full name"
                                  className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 rounded-lg py-6"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs font-medium" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold uppercase tracking-wider text-xs text-slate-700 dark:text-zinc-300">
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="your.email@example.com"
                                  className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 rounded-lg py-6"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                                We'll use this to respond to your request.
                              </FormDescription>
                              <FormMessage className="text-xs font-medium" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold uppercase tracking-wider text-xs text-slate-700 dark:text-zinc-300">
                                Phone (Optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your phone number"
                                  className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 rounded-lg py-6"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs font-medium" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="requestType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold uppercase tracking-wider text-xs text-slate-700 dark:text-zinc-300">
                                Request Type
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 rounded-lg py-6">
                                    <SelectValue placeholder="Select request type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200/50 dark:border-white/10">
                                  {(activeTab === "support"
                                    ? requestTypes.support
                                    : activeTab === "driver"
                                    ? requestTypes.driver
                                    : requestTypes.guide
                                  ).map((type) => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                      className="hover:bg-red-600/10 focus:bg-red-600/10"
                                    >
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs font-medium" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold uppercase tracking-wider text-xs text-slate-700 dark:text-zinc-300">
                              Subject
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Brief subject of your request"
                                className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 rounded-lg py-6"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs font-medium" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold uppercase tracking-wider text-xs text-slate-700 dark:text-zinc-300">
                              Message
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your issue or request in detail. Include any error messages, steps to reproduce, and what you've already tried."
                                className="min-h-40 bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 rounded-lg"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs font-medium" />
                          </FormItem>
                        )}
                      />

                      {/* Additional Information Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md"
                      >
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Additional Information
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium mb-6">
                          Providing these details helps us assist you faster.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="deviceModel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold uppercase tracking-wider text-xs text-slate-700 dark:text-zinc-300">
                                  Device Model (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="E.g., Thomson N17, Roxxor"
                                    className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 rounded-lg py-6"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs font-medium" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="osVersion"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold uppercase tracking-wider text-xs text-slate-700 dark:text-zinc-300">
                                  OS Version (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="E.g., Windows 11 24H2"
                                    className="bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/10 rounded-lg py-6"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs font-medium" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </motion.div>

                     <Button 
  type="submit" 
  className={submitButtonStyles}
>
  <CheckCircle2 className="h-5 w-5 mr-3" />
  Submit Request
</Button>
                    </form>
                  </Form>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t border-slate-200/50 dark:border-white/10 pt-6 text-sm text-slate-500 dark:text-zinc-400 font-medium">
                <p>We typically respond to all requests within 24-48 hours during business days.</p>
              </CardFooter>
            </Card>
          </div>

          {/* Response Time Card */}
          <div className="mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border bg-white/40 backdrop-blur-md p-8 border-slate-200/50 dark:bg-white/5 dark:border-white/10 transition-all duration-500"
            >
              {hoveredCard === 1 && (
                <motion.div
                  className="absolute inset-0 bg-red-600/5 blur-3xl -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}

              <div className="flex items-center justify-between mb-6">
                <div className={`transition-all duration-500 transform ${hoveredCard === 1 ? 'scale-125 text-red-600' : 'text-slate-400 dark:text-slate-500'}`}>
                  <Activity className="h-10 w-10" />
                </div>
                <span className="font-mono text-xs font-black text-red-600/60">
                  RESPONSE_TIME
                </span>
              </div>

              <CardHeader className="p-0">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter mb-4 text-slate-950 dark:text-white">
                  Response Time
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-zinc-400 font-medium">
                  We typically respond to all requests within 24-48 hours during business
                  days. For urgent matters, please include "URGENT" in your subject line.
                </CardDescription>
              </CardHeader>
            </motion.div>
          </div>
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