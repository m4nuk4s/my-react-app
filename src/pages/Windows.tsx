import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, CheckCircle2, AlertTriangle, Laptop, Info, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Panel from "@/assets/wtpth/panel.jpg";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import * as z from "zod";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// Your EmailJS service, template, and user IDs (same as used in Requests page)
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
  
  // Set the active tab based on location state if available
  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  const form = useForm<z.infer<typeof windowsRequestSchema>>({
    resolver: zodResolver(windowsRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      windowsVersion: "",
      deviceModel: "",
      message: "",
    },
  });

  const windowsVersions = [
    { value: "win11-24h2", label: "Windows 11 24H2" },
    { value: "win11-23h2", label: "Windows 11 23H2" },
    { value: "win10-22h2", label: "Windows 10 22H2" },
    { value: "win10-21h2", label: "Windows 10 21H2" },
  ];

  async function onSubmit(values: z.infer<typeof windowsRequestSchema>) {
    try {
      // Find the label for the selected Windows version
      const versionLabel = windowsVersions.find(
        (version) => version.value === values.windowsVersion
      )?.label || values.windowsVersion;

      // Send email using EmailJS
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          name: values.name,
          email: values.email,
          phone: values.phone || "N/A",
          requestType: "Windows ISO Request", // Specific type for Windows requests
          subject: `Windows ISO Request: ${versionLabel}`,
          message: values.message,
          deviceModel: values.deviceModel || "N/A",
          osVersion: versionLabel,
        },
        USER_ID
      );

      // Show success state
      toast.success("Windows ISO request submitted successfully!");
      setRequestSubmitted(true);
      form.reset();
      
      // Close dialog after a delay
      setTimeout(() => {
        setDialogOpen(false);
        setRequestSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to submit request. Please try again later.");
    }
  }

  const win10IsoDetails = [
    {
      name: "Windows 10 Home + Office 365",
      version: "22H2",
      size: "16.1 GB",
    },
    {
      name: "WINDOWS 10 Pro + Office 365",
      version: "22H2",
      size: "15 GB",
    }
  ];

  const win11IsoDetails = [
    {
      name: "Windows 11 Home + Office 365",
      version: "24H2",
      size: "22 GB",
    }
  ];

  const essentialDrivers = [
    {
      name: "Coming soon",
      version: "Coming soon",
      date: "Coming soon",
      description: "Coming soon",
    }
  ];

  const supportTools = [
    {
      name: "Media Creation Tool",
      description: "Create installation media for Windows",
      link: "https://support.microsoft.com/en-us/windows/create-installation-media-for-windows-99a58364-8c02-206f-aa6f-40c3b507420d"
    }
  ];

  const requirements = [
    { name: "Processor", spec: "1 GHz or faster with 2 or more cores" },
    { name: "RAM", spec: "4 GB or greater" },
    { name: "Storage", spec: "64 GB or greater storage device" },
    { name: "System firmware", spec: "UEFI, Secure Boot capable" },
    { name: "TPM", spec: "Trusted Platform Module (TPM) version 2.0" },
    { name: "Graphics card", spec: "DirectX 12 compatible graphics / WDDM 2.0 driver" },
    { name: "Display", spec: "9\" with HD resolution (720p)" }
  ];

  const faqs = [
    {
      question: "Can I upgrade my Windows 10 PC to Windows 11?",
      answer: "You can upgrade to Windows 11 if your PC meets the minimum system requirements. Microsoft provides the PC Health Check app to verify compatibility."
    },
    {
      question: "Is Windows 11 free?",
      answer: "Windows 11 is free to upgrade from Windows 10 if you have a valid Windows 10 license and your PC meets the system requirements."
    },
    {
      question: "What are the main features of Windows 11?",
      answer: "Windows 11 includes a redesigned interface with a centered Start menu, improved performance, better virtual desktop support, Microsoft Teams integration, and enhanced gaming features with DirectX 12 Ultimate and Auto HDR."
    },
    {
      question: "What if my PC doesn't meet the requirements?",
      answer: "If your PC doesn't meet the Windows 11 requirements, you can continue using Windows 10, which will be supported until October 14, 2025. Alternatively, there are unofficial methods to install Windows 11 on unsupported hardware, but these aren't recommended for security and stability reasons."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <div className="text-center">
        <div className="relative rounded overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 mix-blend-multiply" />
            <img 
              src={Panel} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover object-center opacity-60" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          <div className="relative z-10 px-6 py-20">
            <h1 className="text-4xl font-bold text-white mb-0">
              Windows Operating Systems
              <p className="text-xl text-blue-50 mb-8 max-w-2xl text-center mx-auto drop-shadow">
                Find everything you need for Windows - installation files, drivers, and support tools.
              </p>
            </h1>
          </div>
        </div>
      </div>

      <Tabs defaultValue="win11" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="win11">Windows 11</TabsTrigger>
          <TabsTrigger value="win10">Windows 10</TabsTrigger>
        </TabsList>
        
        {/* Windows 11 Content */}
        <TabsContent value="win11" className="pt-6 space-y-8">
          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Latest Version</AlertTitle>
            <AlertDescription className="text-blue-700">
              Windows 11 version 24H2 is now available with new features including tabs in File Explorer, improved touch gestures, and enhanced security.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="iso" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="iso">ISO Downloads</TabsTrigger>
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="requirements">System Requirements</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="iso" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {win11IsoDetails.map((iso, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{iso.name}</CardTitle>
                      <CardDescription>Version: {iso.version}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4">Size: {iso.size}</p>
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Send className="mr-2 h-4 w-4" /> Request Windows
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Request Windows 11 ISO</DialogTitle>
                            <DialogDescription>
                              Fill out this form to request the Windows 11 installation files. We'll send you download instructions via email.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {requestSubmitted ? (
                            <div className="py-6 text-center space-y-4">
                              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                              <h3 className="text-xl font-medium text-green-800">Request Submitted</h3>
                              <p className="text-gray-600">
                                We've received your request. Check your email for further instructions.
                              </p>
                            </div>
                          ) : (
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Your Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Full name" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                        <Input type="email" placeholder="you@example.com" {...field} />
                                      </FormControl>
                                      <FormDescription>We'll send download instructions to this email.</FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Phone (Optional)</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Your phone number" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="windowsVersion"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Windows Version</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select Windows version" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {windowsVersions.map((version) => (
                                            <SelectItem key={version.value} value={version.value}>
                                              {version.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="deviceModel"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Device Model</FormLabel>
                                      <FormControl>
                                        <Input placeholder="E.g., Thomson N17, Roxxor" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="message"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Additional Information</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Any specific requirements or questions?"
                                          className="min-h-24"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <DialogFooter className="mt-6">
                                  <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button type="submit">Submit Request</Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          )}
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8 bg-amber-50 p-6 rounded-lg border border-amber-200">
                <div className="flex items-start">
                  <AlertTriangle className="text-amber-500 mr-4 mt-1 h-5 w-5" />
                  <div>
                    <h3 className="text-lg font-medium text-amber-800 mb-2">Important Note</h3>
                    <p className="text-gray-700">
                      Before installing Windows 11, please check if your computer meets the minimum system requirements. 
                      You can use the PC Health Check app from Microsoft to verify compatibility.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="drivers" className="pt-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Windows 11 Optimized Drivers</h2>
                <p className="text-gray-600 mb-6">
                  These drivers are specifically optimized for Windows 11 performance and features.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {essentialDrivers.map((driver, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{driver.name}</CardTitle>
                      <CardDescription>Version: {driver.version} ({driver.date})</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4">{driver.description}</p>
                      <Button asChild variant="outline" className="w-full">
                        <a href="/requests?type=driver">
                          <Send className="mr-2 h-4 w-4" /> Request Driver
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Driver Update Recommendations</CardTitle>
                    <CardDescription>Best practices for updating drivers on Windows 11</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="text-green-500 mr-2 h-4 w-4 mt-1" />
                        <span>Always back up your system before major driver updates</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="text-green-500 mr-2 h-4 w-4 mt-1" />
                        <span>Update one driver at a time to isolate potential issues</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="text-green-500 mr-2 h-4 w-4 mt-1" />
                        <span>Create a restore point before updating critical drivers</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="text-green-500 mr-2 h-4 w-4 mt-1" />
                        <span>Consider using Windows Update for driver updates when possible</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="requirements" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Laptop className="mr-2 h-5 w-5" />
                    Windows 11 System Requirements
                  </CardTitle>
                  <CardDescription>
                    Check if your computer meets these minimum requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requirements.map((req, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b last:border-0">
                        <div className="font-medium">{req.name}</div>
                        <div className="md:col-span-2 text-gray-600">{req.spec}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <p className="text-sm text-gray-600">
                    For detailed information, visit the <a href="https://www.microsoft.com/en-us/windows/windows-11-specifications" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">official Windows 11 requirements page</a>.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq" className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Still have questions?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      If you have specific questions about Windows 11 compatibility or installation for your computer,
                      please submit a support request.
                    </p>
                    <Button asChild>
                      <a href="/requests">Contact Support</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Windows 10 Content */}
        <TabsContent value="win10" className="pt-6 space-y-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>⚠️ Important</AlertTitle>
            <AlertDescription>
              Windows 10 will reach end of support on October 14, 2025. Make sure to plan your upgrade to Windows 11 if your hardware supports it.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="iso" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="iso">ISO Downloads</TabsTrigger>
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="tools">Support Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="iso" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {win10IsoDetails.map((iso, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{iso.name}</CardTitle>
                      <CardDescription>Version: {iso.version}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4">Size: {iso.size}</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Send className="mr-2 h-4 w-4" /> Request Windows
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Request Windows 10 ISO</DialogTitle>
                            <DialogDescription>
                              Fill out this form to request the Windows 10 installation files. We'll send you download instructions via email.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {requestSubmitted ? (
                            <div className="py-6 text-center space-y-4">
                              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                              <h3 className="text-xl font-medium text-green-800">Request Submitted</h3>
                              <p className="text-gray-600">
                                We've received your request. Check your email for further instructions.
                              </p>
                            </div>
                          ) : (
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Your Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="you@example.com" {...field} />
                                    </FormControl>
                                    <FormDescription>We'll send download instructions to this email.</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="windowsVersion"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Windows Version</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select Windows version" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {windowsVersions.map((version) => (
                                          <SelectItem key={version.value} value={version.value}>
                                            {version.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="deviceModel"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Device Model</FormLabel>
                                    <FormControl>
                                      <Input placeholder="E.g., Thomson N17, Roxxor" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Additional Information</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Any specific requirements or questions?"
                                        className="min-h-24"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <DialogFooter className="mt-6">
                                <DialogClose asChild>
                                  <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Submit Request</Button>
                              </DialogFooter>
                            </form>
                          </Form>
                          )}
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-2">How to create bootable Windows 10 media</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Request your preferred Windows 10 ISO file</li>
                  <li>Download the Media Creation Tool from Microsoft</li>
                  <li>Run the Media Creation Tool and select "Create installation media"</li>
                  <li>Follow the on-screen instructions to create a bootable USB drive</li>
                </ol>
              </div>
            </TabsContent>
            
            <TabsContent value="drivers" className="pt-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Essential Windows 10 Drivers</h2>
                <p className="text-gray-600 mb-6">
                  These are the most commonly needed drivers for Windows 10. For specific hardware drivers, please use the search tool on our Drivers page.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {essentialDrivers.map((driver, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{driver.name}</CardTitle>
                      <CardDescription>Version: {driver.version} ({driver.date})</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4">{driver.description}</p>
                      <Button asChild variant="outline" className="w-full">
                        <a href="/requests?type=driver">
                          <Send className="mr-2 h-4 w-4" /> Request Driver
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="tools" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {supportTools.map((tool, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{tool.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4">{tool.description}</p>
                      <Button asChild className="w-full">
                        <a href={tool.link} target="_blank" rel="noopener noreferrer">
                          Visit Official Site
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="mr-2 h-5 w-5" />
                      Troubleshooting Common Windows 10 Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Windows 10 Update Problems</h4>
                        <p className="text-sm text-gray-600">
                          Run the Windows Update Troubleshooter from Settings &gt; Update &amp; Security &gt; Troubleshoot
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Blue Screen Errors</h4>
                        <p className="text-sm text-gray-600">
                          Update all drivers, run SFC /scannow in Command Prompt, check for hardware issues
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Performance Issues</h4>
                        <p className="text-sm text-gray-600">
                          Disable startup programs, run Disk Cleanup, check for malware, consider adding more RAM
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}